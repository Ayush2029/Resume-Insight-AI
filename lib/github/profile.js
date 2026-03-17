/**
 * lib/github/profile.js
 * Assembles the full profile payload used by /api/github-profile.
 */

import {
  getUser, getUserRepos, getSocials,
  getContributors, getCommits, fetchReadmeRaw,
} from './client';

/**
 * Returns { profile, repos } for a given GitHub username.
 * repos are sorted: most user-commits first, then by stars.
 */
export async function buildProfilePayload(username) {
  const user = await getUser(username);
  if (!user) return null;

  // Fetch user-level data in parallel
  const [socials, repos] = await Promise.all([
    getSocials(username),
    getUserRepos(username),
  ]);

  const profile = {
    name:         user.name || user.login,
    username:     user.login,
    bio:          user.bio          ?? null,
    avatar_url:   user.avatar_url,
    url:          user.html_url,
    public_repos: user.public_repos ?? 0,
    followers:    user.followers    ?? 0,
    following:    user.following    ?? 0,
    company:      user.company      ?? null,
    blog:         user.blog         ?? null,
    twitter:      user.twitter_username ?? null,
    socials:      Array.isArray(socials) ? socials : [],
    created_at:   user.created_at,
  };

  if (!repos || !Array.isArray(repos)) {
    return { profile, repos: [] };
  }

  // Skip the special profile-readme repo (username/username)
  const filtered = repos.filter(
    r => r.name.toLowerCase() !== username.toLowerCase()
  );

  // Fetch per-repo stats in parallel (commits + readme)
  const repoList = await Promise.all(
    filtered.map(repo => buildRepoEntry(repo, username))
  );

  repoList.sort((a, b) => b.userCommits - a.userCommits || b.stars - a.stars);

  return { profile, repos: repoList };
}

/**
 * Builds a single repo entry object.
 */
async function buildRepoEntry(repo, username) {
  const [contributors, lastCommitArr, readmeRaw] = await Promise.all([
    getContributors(repo.full_name),
    getCommits(repo.full_name),
    fetchReadmeRaw(repo.full_name),
  ]);

  // User's commit count from contributor list
  let userCommits = 0;
  if (Array.isArray(contributors)) {
    const found = contributors.find(
      c => c.login.toLowerCase() === username.toLowerCase()
    );
    userCommits = found?.contributions ?? 0;
  }

  // Last commit date from the single-commit fetch
  const lastCommitDate =
    Array.isArray(lastCommitArr) && lastCommitArr[0]
      ? lastCommitArr[0].commit?.committer?.date ?? null
      : null;

  return {
    id:             repo.id,
    name:           repo.name,
    full_name:      repo.full_name,
    url:            repo.html_url,
    description:    repo.description ?? null,
    language:       repo.language    ?? null,
    stars:          repo.stargazers_count ?? 0,
    forks:          repo.forks_count      ?? 0,
    default_branch: repo.default_branch   ?? 'main',
    userCommits,
    lastCommitDate,
    hasReadme:      !!readmeRaw,
    readmeRaw:      readmeRaw ?? null,
  };
}

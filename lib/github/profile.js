import {
  getUser, getUserRepos, getSocials,
  getContributors, getCommits, fetchReadmeRaw,
} from './client';

const CONCURRENCY = 8; 

async function batchedMap(items, fn, limit) {
  const results = [];
  for (let i = 0; i < items.length; i += limit) {
    const chunk  = items.slice(i, i + limit);
    const chunk_results = await Promise.all(chunk.map(fn));
    results.push(...chunk_results);
  }
  return results;
}

export async function buildProfilePayload(username) {
  const user = await getUser(username);
  if (!user) return null;
  const [socials, repos] = await Promise.all([
    getSocials(username),
    getUserRepos(username),
  ]);
  const profile = {
    name:         user.name || user.login,
    username:     user.login,
    bio:          user.bio              ?? null,
    avatar_url:   user.avatar_url,
    url:          user.html_url,
    public_repos: user.public_repos     ?? 0,
    followers:    user.followers        ?? 0,
    following:    user.following        ?? 0,
    company:      user.company          ?? null,
    blog:         user.blog             ?? null,
    twitter:      user.twitter_username ?? null,
    socials:      Array.isArray(socials) ? socials : [],
    created_at:   user.created_at,
  };
  if (!repos || !Array.isArray(repos)) {
    return { profile, repos: [] };
  }
  const filtered = repos.filter(
    r => r.name.toLowerCase() !== username.toLowerCase()
  );
  const repoList = await batchedMap(
    filtered,
    repo => buildRepoEntry(repo, username),
    CONCURRENCY
  );
  repoList.sort((a, b) => b.userCommits - a.userCommits || b.stars - a.stars);
  return { profile, repos: repoList };
}

async function buildRepoEntry(repo, username) {
  const [contributors, lastCommitArr, readmeRaw] = await Promise.all([
    getContributors(repo.full_name),
    getCommits(repo.full_name),
    fetchReadmeRaw(repo.full_name),
  ]);

  let userCommits = 0;
  if (Array.isArray(contributors)) {
    const found = contributors.find(
      c => c.login?.toLowerCase() === username.toLowerCase()
    );
    userCommits = found?.contributions ?? 0;
  }

  const lastCommitDate =
    Array.isArray(lastCommitArr) && lastCommitArr[0]
      ? lastCommitArr[0].commit?.committer?.date ?? null
      : null;

  return {
    id:             repo.id,
    name:           repo.name,
    full_name:      repo.full_name,
    url:            repo.html_url,
    description:    repo.description    ?? null,
    language:       repo.language       ?? null,
    stars:          repo.stargazers_count ?? 0,
    forks:          repo.forks_count      ?? 0,
    default_branch: repo.default_branch   ?? 'main',
    userCommits,
    lastCommitDate,
    hasReadme:  !!readmeRaw,
    readmeRaw:  readmeRaw ?? null,
  };
}

import '../styles/globals.css';
import { Fira_Code, DM_Sans } from 'next/font/google';

/* Monospace display — gives the terminal/code aesthetic */
const firaCode = Fira_Code({
  subsets:  ['latin'],
  variable: '--font-display',
  weight:   ['400', '500', '600', '700'],
  display:  'swap',
});

/* Clean sans for body copy */
const dmSans = DM_Sans({
  subsets:  ['latin'],
  variable: '--font-body',
  display:  'swap',
});

/* Mono for code snippets (reuse Fira Code) */
const monoVar = Fira_Code({
  subsets:  ['latin'],
  variable: '--font-mono',
  weight:   ['400', '500'],
  display:  'swap',
});

export default function App({ Component, pageProps }) {
  return (
    <div className={`${firaCode.variable} ${dmSans.variable} ${monoVar.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}

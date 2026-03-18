import '../styles/globals.css';
import Head from 'next/head';
import { Fira_Code, DM_Sans } from 'next/font/google';

const firaCode = Fira_Code({
  subsets:  ['latin'],
  variable: '--font-display',
  weight:   ['400', '500', '600', '700'],
  display:  'swap',
});

const dmSans = DM_Sans({
  subsets:  ['latin'],
  variable: '--font-body',
  display:  'swap',
});

const monoVar = Fira_Code({
  subsets:  ['latin'],
  variable: '--font-mono',
  weight:   ['400', '500'],
  display:  'swap',
});

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#0a0c10" />
        <title>Resume Insight AI</title>
      </Head>
      <div className={`${firaCode.variable} ${dmSans.variable} ${monoVar.variable}`}>
        <Component {...pageProps} />
      </div>
    </>
  );
}

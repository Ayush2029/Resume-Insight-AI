import '../styles/globals.css';
import Head             from 'next/head';
import { Fira_Code, DM_Sans } from 'next/font/google';
const firaCode = Fira_Code({
  subsets:  ['latin'],
  variable: '--font-display',
  weight:   ['400', '500', '600', '700'],
  display:  'swap',
  preload:  true,
});
const dmSans = DM_Sans({
  subsets:  ['latin'],
  variable: '--font-body',
  display:  'swap',
  preload:  true,
});
const firaCodeMono = Fira_Code({
  subsets:  ['latin'],
  variable: '--font-mono',
  weight:   ['400', '500'],
  display:  'swap',
  preload:  false,
});
export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Responsive viewport — critical for mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0a0c10" />
        <meta name="description" content="Upload a resume PDF and get AI-powered insights into GitHub repositories." />
        <title>ResumeInsight AI</title>
      </Head>

      <div className={`${firaCode.variable} ${dmSans.variable} ${firaCodeMono.variable}`}>
        <Component {...pageProps} />
      </div>
    </>
  );
}

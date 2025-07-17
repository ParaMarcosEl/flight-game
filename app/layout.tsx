// app/layout.tsx
import Head from 'next/head';
import './globals.css';

export const metadata = {
  title: 'Nebula GP',
  description: 'Anti-Gravity Racing',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Head>
        <title>Nebula GP</title>
        <meta name="description" content="Anti-Gravity Racing" />
        <meta property="og:title" content="Nebula GP" />
        <meta property="og:description" content="Anti-Gravity Racing" />
        <meta property="og:url" content="https://flight-game-lake.vercel.app" />
        <meta property="og:type" content="website" />
      </Head>
      <body>
        {/* <TransitionLayout > */}
        {children}
        {/* </TransitionLayout> */}
      </body>
    </html>
  );
}

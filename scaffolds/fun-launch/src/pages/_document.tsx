import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/curvelab-logo.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/curvelab-logo.jpg" />
        <meta name="theme-color" content="#0a0a0c" />
        {/* Jupiter Plugin, see https://dev.jup.ag/docs/tool-kits/plugin */}
        <script src="https://plugin.jup.ag/plugin-v1.js" data-preload defer />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

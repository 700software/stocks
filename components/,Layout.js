import Head from 'next/head'

export default function Layout({ children }) {
  var gfonts = 'https://fonts.googleapis.com/css2?display=block'
    + '&family=Roboto:ital,wght@0,300;0,400;0,500;1,400'
    + '&family=Roboto+Slab'
    + '&family=Roboto+Condensed'
    + '&family=Cinzel'
    + '&family=Inter:wght@300;400'
  return <>
    <Head>
      <link href={gfonts} rel="stylesheet" />
      <meta name="viewport" content="initial-scale=1, minimum-scale=1, width=device-width" />
      <link rel="icon" href="/favicon.ico" />
      <meta property="og:image" content="/_next/image?url=/favisplash.png&w=1920&q=75" />
    </Head>
    {children}
  </>
}

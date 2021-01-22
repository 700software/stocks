import Head from 'next/head'

export default function Layout({ children }): JSX.Element {
  var gfonts = 'https://fonts.googleapis.com/css2?display=block'
    + '&family=Roboto:ital,wght@0,400;0,500'
    + '&family=Roboto+Slab'
    + '&family=Roboto+Mono'
    + '&family=Roboto+Condensed'
    + '&family=Cinzel'
  return <>
    <Head>
      <link href={gfonts} rel="stylesheet" />
      <meta name="viewport" content="initial-scale=1, minimum-scale=1, width=device-width" />
      <link rel="icon" href="/favicon.ico" />
      <meta property="og:image" content="/_next/image?url=/favisplash.png&w=1920&q=75" />
    </Head>
    <header>
      <div className="the-width">
        <img src="/_next/image?url=https://700software.com/bryan.jpg&w=640&q=75" id="head-me-circle" />
        <h1>stocks</h1>
        <p>{process.env['NEXT_PUBLIC_BRAND']} Sample project</p>
      </div>
    </header>
    {children}
    <footer>
      <a href="https://github.com/700software/" target="_blank">
        <span className="material-icons">code</span>
        <span> </span>
        Source
        </a>
      <>       </>
      <a href="https://700software.com" target="_blank">
        <span className="material-icons">home</span>
        <span> </span>
        Resume
      </a>
      <>       </>
      <span className="ib">
        <span className="material-icons">phone</span>
        <> </>
        423-802-8971
      </span>
    </footer>
  </>
}

import Router from 'next/router'
import NProgress from 'nprogress' // nprogress module
import 'nprogress/nprogress.css' // styles of nprogress
import '../styles/base.css'
import '../styles/main.css'
import '../styles/SearchDropdown.css'
import '../styles/util.css'

Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp

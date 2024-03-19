import '@/styles/globals.css'

import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import Layout from '../components/layout'
import localFont from 'next/font/local'
import Head from 'next/head'

const CASINO = localFont({
  src: [
    {
      path: '../public/fonts/casino_filled.ttf',
      weight: '400'
    },
  ],
  variable: '--font-casino'
})

const CASINO_FILLED = localFont({
  src: [
    {
      path: '../public/fonts/casino_filled.ttf',
      weight: '400'
    },
  ],
  variable: '--font-casino-filled'
})


function NoSSRApp({ Component, pageProps }: AppProps) {

  return( 
    <html 
   // onClick={ e => e.preventDefault()}
    onDrag={ e => e.preventDefault()}
    onDragStart={ e => e.preventDefault()}
    onDragEnd={ e => e.preventDefault()}
    onContextMenu={ e=> e.preventDefault()}
    lang="en" className={`${CASINO.variable} ${CASINO_FILLED.variable}`} >

    <Head>
      <link rel="shortcut icon" href="/images/logo.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/images/roundedspade.png" />
    </Head>

    <Layout>
      <Component {...pageProps} />
    </Layout>

    </html>
  )
}


const App = dynamic(() => Promise.resolve(NoSSRApp), {
  ssr: false,
})

export default App;
import Head from 'next/head'
import { useState } from 'react'
import Layout from '../components/Layout'
import SearchInput from '../components/SearchDropdown'
import { noAction } from '../lib/util'

export default function Home() {

  const [symbols, setSymbols] = useState(['GOOG', 'AAPL'])

  return <Layout>
    <Head>
      <title>stocks.700software.com</title>
    </Head>
    <main className="the-width">
      <p>Enter up to three stocks or company names to compare stock prices.</p>
      <form ref={noAction}>
        <SearchInput
          placeholder="Stock Symbol or Company Name"
          whenValue={symbol => {
            if (!symbol)
              return ''
            // if (symbol == 'FB') // TODO what we actually want to check for is duplicates
            //   return 'Test a rejection'
            setSymbols([...symbols, symbol])
          }} />
      </form>
      Symbols: {symbols.toString()}
    </main>
  </Layout>
}

import Head from 'next/head'
import { useState } from 'react'
import useSWR from 'swr'
import Layout from '../components/Layout'
import SearchInput from '../components/SearchDropdown'
import { noAction, paramE } from '../lib/util'

export default function Home() {

  const [symbols, setSymbols] = useState(['IBM'])

  return <Layout>
    <Head>
      <title>stocks.700software.com</title>
    </Head>
    <main className="the-width">
      <p>Enter up to three stocks or company names to compare stock prices.</p>
      <form ref={noAction}>
        <SearchInput
          placeholder="Stock Symbol or Company Name"
          whenValue={(symbol) => {
            if (!symbol)
              return ''

            for (var i = 0; i < symbols.length; i++)
              if (symbols[i] == symbol)
                return // already added

            setSymbols([...symbols, symbol])
          }} />
      </form>
      Symbols: {symbols.toString()}

      <div id="side-by-side-symbols">
        {symbols.length == 0
          ? null
          : symbols.map(symbol => <SymbolSection symbol={symbol} key={symbol} />)}
      </div>

    </main>
  </Layout>
}

function SymbolSection({ symbol }) {
  const { data, error } = useSWR(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${paramE(symbol)}&apikey=${process.env.NEXT_PUBLIC_API_KEY}`, url => fetch(url).then(_ => _.json())
    // { suspense: true }
  )


  return <>
    <article>
      <h2>
        {symbol}<br />
      </h2>
      {error
        ? <p className="red">Sorry, there was an error.</p>
        : !data
          ? <p className="gray">Loading...</p>
          : <>
            {JSON.stringify(data, { indent: 2})}
          </>
      }
    </article>
  </>
}
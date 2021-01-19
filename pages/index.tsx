import Head from 'next/head'
import { useRef, useState } from 'react'
import useSWR from 'swr'
import Layout from '../components/Layout'
import SearchInput from '../components/SearchDropdown'
import jsonFetch from '../lib/jsonFetch'
import { noAction, noHref, paramE, roundC } from '../lib/util'

/**
 * Increasing this limit past 3 would require layout considerations
 * and, more needfully, a higher rate limit from our API
 **/
const COMPARISON_COUNT_LIMIT = 3

export default function Home() {

  const [symbols, setSymbols] = useState(['IBM'])
  const symbolsRef = useRef<string[]>()
  symbolsRef.current = symbols

  return <Layout>
    <Head>
      <title>stocks.700software.com</title>
    </Head>
    <main className="the-width">
      <p>Enter up to three stocks or company names to compare stock prices.</p>
      <form ref={noAction}>
        <SearchInput
          placeholder="Stock Symbol or Company Name"
          whenValue={(symbol, text, span) => {
            if (!symbol)
              return ''

            var symbols = symbolsRef.current

            for (var i = 0; i < symbols.length; i++)
              if (symbols[i] == symbol)
                var alreadyAdded = true

            var [hidden, input] = span.querySelectorAll('input')

            if (symbols.length >= COMPARISON_COUNT_LIMIT && !alreadyAdded) {
              alert('Sorry, limit of 3 in the comparison.')
              input.value = hidden.value
              input.oninput()
              return
            }

            // blank out the search value
            input.value = ''
            input.oninput()

            for (var i = 0; i < symbols.length; i++)
              if (symbols[i] == symbol)
                return // already added

            setSymbols([...symbols, symbol])
          }} />
      </form>

      <div id="side-by-side-symbols">
        {symbols.length == 0
          ? <p className="gray">
            No symbols selected.
          </p>
          : symbols.map((symbol, i) => <SymbolSection symbol={symbol} key={symbol} whenRemove={function () {
            var copy = [...symbols]
            copy.splice(i, 1)
            setSymbols(copy)
          }} />)}
      </div>

    </main>
  </Layout>
}

function SymbolSection({ symbol, whenRemove }: { symbol: string, whenRemove: (event: any) => void }): JSX.Element {

  const { data, error } = useSWR<any>(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${paramE(symbol)}&apikey=${process.env.NEXT_PUBLIC_API_KEY}`, jsonFetch.then(json => {
    if (json.Information) throw json.Information
    else if (json.Note) throw json.Note
    else return json
  }), { revalidateOnFocus: false })

  const { data: dataQuote, error: errorQuote } = useSWR<any>(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${paramE(symbol)}&apikey=${process.env.NEXT_PUBLIC_API_KEY}`, jsonFetch.then(json => {
    if (json.Information) throw json.Information
    else if (json.Note) throw json.Note
    else return json['Global Quote']
  }), { revalidateOnFocus: false, refreshInterval: 1000 * 60 * 5 })

  return <>
    <article>
      <a ref={noHref} className="material-icons" onClick={whenRemove} style={{ float: 'right' }}>clear</a>
      <h2>
        {symbol}<br />
        {data ? data.Name : '...'}
      </h2>
      {error
        ? <p className="red">Sorry, there was an error. {'' + error}</p>
        : !data
          ? null // Loading... is below
          : <>
          </>
      }

      {!data && !error || !dataQuote && !errorQuote
        ? <p className="gray">Loading...</p>
        : null}

      {errorQuote
        ? error
          ? <p className="red">{'' + errorQuote}</p>
          : <p className="red">Sorry, there was an error. {'' + errorQuote}</p>
        : !dataQuote
          ? null // Loading... is above
          : (function (): JSX.Element {
            const changePercent = dataQuote['10. change percent'].replace('%', '')
            const changePercentPositive = changePercent < 0 ? -changePercent : changePercent
            return <>
              <div>
                ${roundC(dataQuote['05. price'], 6, 2)}
                <br />

                <span className={changePercent < 0 ? 'red' : changePercent > 0 ? 'green' : 'gray'}>
                  {changePercent < 0 ? '−' : changePercent > 0 ? '+' : '±'}
                  {roundC(changePercentPositive, 4, 4)}%
                </span>
              </div>
            </>
          }())
      }

    </article>
  </>
}

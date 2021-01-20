import Head from 'next/head'
import { useRef, useState } from 'react'
import useSWR from 'swr'
import Layout from '../components/Layout'
import SearchInput from '../components/SearchDropdown'
import jsonFetch from '../lib/jsonFetch'
import { noAction, noHref, paramE, roundC } from '../lib/util'

const h2HeightThreeLines = '4.12em'
const SUPPRESS_NETWORK_ERRORS = false

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

      <div id="side-by-side-symbols" className="extend-right-edge">
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

  var { data, error } = useSWR<any>(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${paramE(symbol)}&apikey=${process.env.NEXT_PUBLIC_API_KEY}`, jsonFetch.then(json => {
    if (json.Information) throw json.Information
    else if (json.Note) throw json.Note
    else return json
  }), { revalidateOnFocus: false })

  var { data: dataQuote, error: errorQuote } = useSWR<any>(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${paramE(symbol)}&apikey=${process.env.NEXT_PUBLIC_API_KEY}`, jsonFetch.then(json => {
    if (json.Information) throw json.Information
    else if (json.Note) throw json.Note
    else return json['Global Quote']
  }), { revalidateOnFocus: false, refreshInterval: 1000 * 60 * 5 })

  if (data && !data.Name && JSON.stringify(data) == '{}') {
    data = null
    if (!error)
    error = 'Empty response {} from API provided. Try another symbol to see more details.'
  }

  if (SUPPRESS_NETWORK_ERRORS) {
    error = null
    errorQuote = null
  }

  return <>
    <article style={{ minHeight: '33em' }}>
      <a ref={noHref} className="material-icons" onClick={whenRemove} style={{ float: 'right', marginRight: '.2em' }}>clear</a>
      <h2 style={{ minHeight: h2HeightThreeLines }}>
        <div className="mono">{symbol}</div>
        {data ? data.Name : '...'}
      </h2>
      {error && !data
        ? <p className="red">Sorry, there was an error. {'' + error}</p>
        : null}

      {!dataQuote && errorQuote
        ? error && !data
          ? <p className="red">{'' + errorQuote}</p>
          : <p className="red">Sorry, there was an error. {'' + errorQuote}</p>
        : (function (): JSX.Element {
          const changePercent = dataQuote ? dataQuote['10. change percent'].replace('%', '') : null
          const changePercentPositive = changePercent < 0 ? -changePercent : changePercent
          const color = changePercent < 0 ? 'red' : changePercent > 0 ? 'green' : 'gray'
          const icon = changePercent < 0 ? 'arrow_downward' : changePercent > 0 ? 'arrow_upward' : ''
          return <div style={{ minHeight: '15em' }}>

            <div style={{ fontSize: '1.2em' }}>

              <div className="label fleft">Current: </div>
              <div style={{ float: 'left', fontSize: '2em', top: '-.1em' }} className={`material-icons ${color}`}>{icon}</div>
              <big className="mono">${dataQuote ? roundC(dataQuote['05. price'], 6, 2) : '...'}</big>
              <br />
              <span className={`${color} mono`} style={{ paddingLeft: '.2em' }}>
                {changePercent < 0 ? '−' : changePercent > 0 ? '+' : '±'}
                {roundC(changePercentPositive, 2, 2)}%
                </span>
              <div style={{ clear: 'both' }}></div>

            </div>{/* end larger fontSize */}

            <h3>Stats</h3>

            <div>
              <div className="label">High</div>
              <big className="mono">{dataQuote ? roundC(dataQuote['03. high'], 6, 2) : '...'}</big>
            </div>

            <div>
              <div className="label">Low</div>
              <big className="mono">{dataQuote ? roundC(dataQuote['04. low'], 6, 2) : '...'}</big>
            </div>

            <div>
              <div className="label">Open</div>
              <big className="mono">{dataQuote ? roundC(dataQuote['02. open'], 6, 2) : '...'}</big>
            </div>

            <div>
              <div className="label">Prev. Close</div>
              <big className="mono">{dataQuote ? roundC(dataQuote['08. previous close'], 6, 2) : '...'}</big>
            </div>

          </div> // end minHeight
        }())
      }

      {!data && error
        ? null
        : (function () {

          var epsRatio = data && dataQuote ? data.EPS / dataQuote['05. price'] : null

          return <>
            <h3>Earnings per Share</h3>

            <div>
              <div className="label">EPS</div>
              <big className="mono">{data ? roundC(data.EPS, 6, 2) : '...'}</big>
            </div>

            <div>
              <div className="label">Ratio to Price: </div>
              <big className="">{epsRatio != null ? roundC(epsRatio, 3, 3) : '...'}%</big>

              <> </>
              {/* This is a primitive graphical representation. We could use a highcharts library for graphs, etc. */}
              <span style={{ display: 'inline-block', position: 'relative', width: '1em' }}>
                <div style={{ height: epsRatio * 20 + 'em', background: 'green', maxHeight: '10em', position: 'absolute' }}></div>
              </span>
            </div>

          </>
        }())}
    </article>
  </>
}

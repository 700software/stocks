//#
//#
//# Note BROWSER_CACHE in search-thing.js
const QUERY_DELAY = process.env.JEST_WORKER_ID ? 0 : 300
import fetchTimeout from '@lib/fetchTimeout'
import jsonFetch from '@lib/jsonFetch'
//#

import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import ajaxWave from '../lib/ajaxWave'
import { extractProps, paramE } from '../lib/util'
import SearchDropdownResults from './SearchDropdownResults'

const space = ' '
const tab = 9
const enter = 13
const esc = 27
const arrowUp = 38
const arrowDown = 40

/** Unexpected props could be any HTML attrs */
type SearchDropdownProps = any

export type SearchDropdownHandle = {
  setValue: (hiddenValue: string, searchString: string) => void,
}

const SearchDropdown: React.ForwardRefRenderFunction<SearchDropdownHandle, SearchDropdownProps> = function (props: SearchDropdownProps, ref) {
  var attrs = { ...props }

  const { name, whenValue } = extractProps({
    whenValue: null,
  }, attrs)

  const inputRef = useRef<HTMLInputElement>()

  const resultsComponent = useRef<SearchDropdownResults>()

  const [valueHidden, setValueHidden] = useState('')
  const [valueSearch, setValueSearch] = useState('')

  const internalRef = useRef
    <{ timeout?: any, enterPressed: { q: string, enterNotJustTabAway: boolean } | null, valueSearch?: string }>
    ({ enterPressed: null })
  internalRef.current.valueSearch = valueSearch

  useImperativeHandle<any, SearchDropdownHandle>(ref, function () {
    return {
      setValue: (hiddenValue, searchString) => {
        setValueHidden(hiddenValue)
        setValueSearch(internalRef.current.valueSearch = searchString)
        resultsComponent.current.setState({ hoveredLink: null })
        internalRef.current.enterPressed = null
        oninput(searchString)
      },
    }
  })

  return <>
    <span className="SearchableDropdown">
      <span className="material-icons" data-hidden={valueHidden ? '' : null}>search</span>
      <input type="hidden" value={valueHidden} name={name} />
      <input spellCheck={false} value={valueSearch} placeholder={space/* triggers :placeholder-shown */}
        autoComplete="off" style={{ width: '17.5em' }}
        {...attrs}
        onChange={e => {
          setValueSearch(internalRef.current.valueSearch = e.currentTarget.value)
          oninput(e.currentTarget.value)
        }}
        onFocus={onfocus}
        onKeyDown={e => onkeydown.call(e.currentTarget, e)}
        ref={node => {
          inputRef.current = node
          if (valueHidden && node) {
            node.selectionStart = 0
            node.selectionEnd = node.value.length
            node.scrollLeft = 0
          }
        }}
      />
      <span className="material-icons" onMouseDown={clickedX}>clear</span>
      <SearchDropdownResults ref={resultsComponent} chose={chose} />
    </span>
  </>

  function chose(o, blurring) {
    setValueHidden(o.key)
    setValueSearch(internalRef.current.valueSearch = o.text)
    uponHiddenValueSet(o.key, o.text, blurring)
  }

  function uponHiddenValueSet(valueHidden: string, valueSearch: string, blurringNow: boolean) {
    resultsComponent.current.setState({ hoveredLink: null })
    internalRef.current.enterPressed = null
    whenValue(valueHidden, valueSearch, blurringNow)
  }

  function onfocus(e) {
    resultsComponent.current.setState({ want: valueSearch })
    if (!valueHidden)
      return
    e.currentTarget.selectionStart = 0
    e.currentTarget.selectionEnd = e.currentTarget.length
    handleQueryMutation(valueSearch)
  }
  function oninput(valueSearch) {
    internalRef.current.enterPressed = null
    setValueHidden('')
    handleQueryMutation(valueSearch)
  }
  function onkeydown(e) {
    if (e.keyCode == enter) {
      if (resultsComponent.current.state.want == null)
        resultsComponent.current.setState({ want: this.value })
      internalRef.current.enterPressed = { q: this.value, enterNotJustTabAway: true }
      handleEnterPressed()
      searchFetchGo()
      return false
    } else if (e.keyCode == arrowUp || e.keyCode == arrowDown) {
      if (resultsComponent.current.state.want == null)
        resultsComponent.current.setState({ want: this.value })
      else
        resultsComponent.current.keyNav(e.keyCode == arrowUp ? -1 : 1)
      return false
    } else if (e.keyCode == tab && resultsComponent.current.state.hoveredLink) {
      internalRef.current.enterPressed = { q: this.value, enterNotJustTabAway: true }
      handleEnterPressed()
      searchFetchGo()
    } else if (e.keyCode == esc && valueHidden) {
      this.oninput()
      return false
    } else if (e.keyCode == esc && !valueHidden) {
      resultsComponent.current.setState({ want: null, hoveredLink: null })
      // this.oninput()
      // return false
    }
  }
  function clickedX(e) {
    setValueSearch(internalRef.current.valueSearch = '')
    oninput('')
    inputRef.current.focus()
    e.preventDefault()
  }

  function handleEnterPressed() {
    if (internalRef.current.enterPressed)
      if (resultsComponent.current.state.got && resultsComponent.current.state.got.query == internalRef.current.enterPressed.q)
        resultsComponent.current.choose(internalRef.current.enterPressed.enterNotJustTabAway, !internalRef.current.enterPressed.enterNotJustTabAway)
  }

  function handleQueryMutation(valueSearch) {
    internalRef.current.enterPressed = null

    resultsComponent.current.setState({ want: valueSearch })

    if (instantResult(valueSearch))
      return

    if (internalRef.current.timeout == null)
      internalRef.current.timeout = QUERY_DELAY == 0 ? searchFetchGo() : setTimeout(searchFetchGo, QUERY_DELAY)

  }

  function instantResult(q) {
    if (q.length < 1) {
      resultsComponent.current.setState({ got: { query: q, gray: '...' } })
      return true
    }
  }

  function searchFetchGo() {
    clearTimeout(internalRef.current.timeout)
    internalRef.current.timeout = null

    var queryHere = internalRef.current.valueSearch

    if (resultsComponent.current.state.got && resultsComponent.current.state.got.query == queryHere)
      return

    if (searchFetchGo['in progress: ' + queryHere])
      return
    searchFetchGo['in progress: ' + queryHere] = true

    /** Because of the tight rate limit for the API key, we can use demo for BA in the search (IBM in the display) and that doesn't count against rate limit. */
    var apiKey = queryHere == 'BA' ? 'demo' : process.env.NEXT_PUBLIC_API_KEY

    async()
    async function async() {
      // TODO move out and generify
      try {
        var response: any = await jsonFetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${paramE(queryHere)}&apikey=${apiKey}`
          , { timeout: 8000 })
      } catch (e) {
        var errStr = '' + e
      }

      if (response)

      delete searchFetchGo['in progress: ' + queryHere]
      if (queryHere == resultsComponent.current.state.want) {
        if (response && response.bestMatches)
          resultsComponent.current.setState({ got: { query: queryHere, results: parseResults(response) } })
        else
          resultsComponent.current.setState({ got: { query: queryHere, whoops: response && (response.Information || response.Note) || errStr } })
        handleEnterPressed()
      }
    }
  }

  /** @todo move out and generify */
  function parseResults(response: { bestMatches: any }) {
    if (!response.bestMatches)
      return null
    var dedup = {}
    var results = []
    response.bestMatches.forEach(r => {
      if (dedup[r['1. symbol']])
        return
      dedup[r['1. symbol']] = true
      results.push({
        key: r['1. symbol'],
        text: `${r['1. symbol']} - ${r['2. name']}`,
        Component: <>{r['1. symbol']} - {r['2. name']}</>,
      })
    })
    return results
  }
}

export default forwardRef(SearchDropdown)

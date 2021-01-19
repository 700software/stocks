//#
//#
//# Note BROWSER_CACHE in search-thing.js
const QUERY_DELAY = 200
//#

import React, { Component } from 'react'
import { extractProps, paramE } from '../lib/util'
import ajaxWave from '../lib/ajaxWave'
import SearchDropdownResults from './SearchDropdownResults'

const space = ' '
const tab = 9
const enter = 13
const esc = 27
const arrowUp = 38
const arrowDown = 40

export default React.forwardRef((props: any, ref) => <SearchDropdown {...props} innerRef={ref} />)

class SearchDropdown extends React.Component {
  public props: any

  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(newProps) {
    console.log(newProps)
    for (var k in newProps)
      if (typeof newProps[k] == 'function')
        continue
      else if (newProps[k] != this.props[k])
        return true
    console.log('false')
    return false
  }

  render() { return render.call(this, this.props, this.state) }
}

function render(props, state) {
  var attrs = { ...props }

  var hiddenAttrs = extractProps({ name: null, defaultValue: '' }, attrs)
  var extraProps = extractProps({ defaultDisplay: '' }, attrs)
  const { whenValue, innerRef } = extractProps({
    whenValue: null,
    innerRef: null,
  }, attrs)

  var resultsComponent = React.createRef<SearchDropdownResults>()
  var span, hidden, input

  var blurringNow = false

  return <>
    <span className="SearchableDropdown" ref={node => {
      if (node) eventHandlers(node)
      if (innerRef) innerRef.current = node
    }}>
      <span className="material-icons">search</span>
      <input type="hidden" {...hiddenAttrs} />
      <input spellCheck={false} placeholder={space/* triggers :placeholder-shown */}
        autoComplete="off" style={{ width: '17.5em' }}
        defaultValue={extraProps.defaultDisplay} {...attrs} />
      <span className="material-icons">clear</span>
      <SearchDropdownResults ref={resultsComponent} chose={chose} />
    </span>
  </>

  function chose(o, blurring) {
    if (attrs.readOnly)
      return
    hidden.value = o.key
    input.value = o.text
    blurringNow = blurring
    hidden.oninput()
    blurringNow = false
    if (hidden.value) {
      if (!blurring) {
        input.selectionStart = 0
        input.selectionEnd = input.value.length
        input.scrollLeft = 0
      }
    }
  }

  function eventHandlers(s) {
    span = s

    var icon = span.firstChild
    hidden = icon.nextSibling
    input = hidden.nextSibling
    var x = input.nextSibling

    var balloon
    var timeout = null
    var enterPressed = null

    hidden.oninput = function () {
      resultsComponent.current.setState({ hoveredLink: null })
      enterPressed = null
      if (hidden.value)
        icon.setAttribute('data-hidden', '')
      else
        icon.removeAttribute('data-hidden')
      whenValue(this.value, input.value, span, blurringNow)
    }
    input.onfocus = function () {
      resultsComponent.current.setState({ want: this.value })
      if (this.readOnly || !hidden.value)
        return
      this.selectionStart = 0
      this.selectionEnd = this.value.length
      handleQueryMutation()
    }
    input.onblur = function () {
      if (balloon) {
        var active = balloon.firstChild.lastChild.querySelector(':scope>a[data-active]')
        if (active)
          resultsComponent.current.choose(false, true)
      }
    }
    input.oninput = function () {
      enterPressed = null
      if (hidden.value) {
        hidden.value = ''
        hidden.oninput()
      }
      handleQueryMutation()
    }
    input.onkeydown = function (e) {
      if (e.keyCode == enter) {
        if (resultsComponent.current.state.want == null)
          resultsComponent.current.setState({ want: this.value })
        enterPressed = { q: this.value, enterNotJustTabAway: true }
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
        enterPressed = { q: this.value, enterNotJustTabAway: false }
        handleEnterPressed()
        searchFetchGo()
      } else if (e.keyCode == esc && hidden.value) {
        this.oninput()
        return false
      } else if (e.keyCode == esc && !hidden.value) {
        resultsComponent.current.setState({ want: null, hoveredLink: null })
        // this.oninput()
        // return false
      }
    }
    x.onmousedown = function (e) {
      input.value = ''
      input.oninput()
      input.focus()
      e.preventDefault()
      if (!input.readOnly)
        input.focus()
    }

    blurringNow = true
    hidden.oninput()
    blurringNow = false

    function handleEnterPressed() {
      if (enterPressed)
        if (resultsComponent.current.state.got && resultsComponent.current.state.got.query == enterPressed.q)
          resultsComponent.current.choose(enterPressed.enterNotJustTabAway, !enterPressed.enterNotJustTabAway)
    }

    function handleQueryMutation() {
      enterPressed = null

      resultsComponent.current.setState({ want: input.value })

      if (instantResult())
        return

      if (timeout == null)
        timeout = setTimeout(searchFetchGo, QUERY_DELAY)

    }

    function instantResult() {
      var q = resultsComponent.current.state.want

      if (q.length < 1) {
        resultsComponent.current.setState({ got: { query: q, gray: '...' } })
        return true
      }
    }

    function searchFetchGo() {
      clearTimeout(timeout)
      timeout = null

      var queryHere = input.value

      if (resultsComponent.current.state.got && resultsComponent.current.state.got.query == queryHere)
        return

      if (searchFetchGo['in progress: ' + queryHere])
        return
      searchFetchGo['in progress: ' + queryHere] = true

      // TODO move out and generify
      ajaxWave({
        url: `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${paramE(queryHere)}&apikey=${process.env.NEXT_PUBLIC_API_KEY}`,
        callback: function (wave, request) {
          delete searchFetchGo['in progress: ' + queryHere]
          if (queryHere == resultsComponent.current.state.want) {
            if (wave.json && request.status == 200 && wave.json.bestMatches)
              resultsComponent.current.setState({ got: { query: queryHere, results: parseResults(wave) } })
            else
              resultsComponent.current.setState({ got: { query: queryHere, whoops: wave.json && (wave.json.Information || wave.json.Note) || wave.text || wave.whoops } })
            handleEnterPressed()
          }
        },
      })
    }

    /** @todo move out and generify */
    function parseResults(wave) {
      if (!wave.json.bestMatches)
        return null
      var dedup = {}
      var results = []
      wave.json.bestMatches.forEach(r => {
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
}

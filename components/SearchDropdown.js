//#
//#
//# Note BROWSER_CACHE in search-thing.js
const QUERY_DELAY = 200
//#

import { extractProps, paramE } from '../lib/,global'
import ajaxWave from '../lib/ajaxWave'
import SearchableDropdownResults from './SearchableDropdownResults'

const space = ' '
const tab = 9
const enter = 13
const esc = 27
const arrowUp = 38
const arrowDown = 40

/** More to be implemented including autofill. */
export default function SearchableThing(props) {
  var attrs = { ...props }
  var hiddenAttrs = extractProps({ name: null, defaultValue: '' }, attrs)
  var extraProps = extractProps({ defaultDisplay: '' }, attrs)

  var resultsComponent = React.createRef()
  var hidden, input

  return <>
    <span className="searchable-dropdown" ref={node => { if (node) eventHandlers(node) }}>
      <span className="material-icons">search</span>
      <input type="hidden" {...hiddenAttrs} />
      <input spellCheck={false} placeholder={space/* triggers :placeholder-shown */}
        defaultValue={extraProps.defaultDisplay} {...attrs} />
      <span className="material-icons">clear</span>
      <SearchableDropdownResults ref={resultsComponent} chose={chose} />
    </span>
  </>

  function chose(o, blurring) {
    if (attrs.readOnly)
      return
    hidden.value = o.key
    input.value = o.text
    hidden.oninput()
    if (hidden.value) {
      if (!blurring) {
        input.selectionStart = 0
        input.selectionEnd = input.value.length
        input.scrollLeft = 0
      }
    }
  }

  function eventHandlers(span) {

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
    }
    input.onfocus = function () {
      if (this.readOnly || !hidden.value)
        return
      this.selectionStart = 0
      this.selectionEnd = this.value.length
      handleQueryMutation()
    }
    input.onblur = function () {
      if (balloon) {
        var active = balloon.firstChild.lastChild.querySelector(':scope>a[data-hovered]')
        if (active)
          selectLink(active, true)
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

    hidden.oninput()

    function handleEnterPressed() {
      if (enterPressed)
        if (resultsComponent.current.state.got && resultsComponent.current.state.got.query == enterPressed.q)
          resultsComponent.current.choose(enterPressed.enterNotJustTabAway)
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

      if (q.length < 3) {
        resultsComponent.current.setState({ got: { query: q, gray: q ? 'Type at least three letters' : 'Loading...' } })
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
      ajaxWave({
        url: '/api/search-things?q=' + paramE(queryHere),
        callback: function (wave, request) {
          delete searchFetchGo['in progress: ' + queryHere]
          if (queryHere == resultsComponent.current.state.want) {
            if (wave.json && request.status == 200)
              resultsComponent.current.setState({ got: { query: queryHere, results: wave.json } })
            else
              resultsComponent.current.setState({ got: { query: queryHere, whoops: wave.text || wave.whoops } })
            handleEnterPressed()
          }
        }
      })
    }

  }
}

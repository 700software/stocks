import React from 'react'
import { ellipsisTooltip } from '../lib/,global'

export default class SearchableDropdownResults extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentDidMount() { }

  keyNav(add) {
    if (!this.state.got || !this.state.got.results)
      return

    var currentI = indexOfHoveredLink(this.state)

    var i = currentI
    do {
      i += add
      if (i > this.state.got.results.length - 1)
        i = 0
      else if (i < 0)
        i = this.state.got.results.length - 1
      if (i == currentI) // looped around to same
        return
      else if (currentI == -1)
        currentI = i
    } while (this.state.got.results[i].key == 'limit')

    this.setState({ hoveredLink: this.state.got.results[i].key })
  }

  choose(orLonelyLink) {
    var currentI = indexOfHoveredLink(this.state, orLonelyLink)
    if (currentI != -1)
      this.props.chose(this.state.got.results[currentI])
  }

  render() { return render.call(this, this.props, this.state) }
}

function indexOfHoveredLink(state, orLonelyLink) {
  if (!state.got.results)
    return -1
  for (var i = 0; i < state.got.results.length; i++)
    if (state.hoveredLink == state.got.results[i].key)
      return i
  var lonelyLink = -1
  if (orLonelyLink) // maybe nothing matches hoveredLink, but there is only one hoverable option anyway
    for (var i = 0; i < state.got.results.length; i++)
      if (state.got.results[i].key != 'limit')
        if (lonelyLink == -1)
          lonelyLink = i
        else
          return -1
  return lonelyLink
}

function render(props, state) {
  var component = this
  if (!state.want)
    return null
  return <div onMouseDown={balloonMouseDown}>{/* .searchable-dropdown>div */}
    <div style={state.got && state.want == state.got.query ? {} : { opacity: .4 }}>
      {(() => {
        if (!state.got)
          return <div className="emptiness">Loading...</div>
        if (state.got.whoops)
          return <div className="emptiness red">{state.got.whoops}</div>
        if (state.got.gray)
          return <div className="emptiness">{state.got.gray}</div>
        if (state.got.results.length)
          return state.got.results.map(
            o =>
              o.key == 'limit'
                ? <div className="emptiness" key={o.key}>{o.text}</div>
                : <a jshref="javascript:" key={o.key}
                  data-val={o.key}
                  data-hovered={o.key == this.state.hoveredLink ? true : null}
                  onMouseOver={e => {
                    ellipsisTooltip.call(this, e)
                    this.setState({ hoveredLink: o.key })
                  }}
                  onMouseOut={() => {
                    this.setState({ hoveredLink: null })
                  }}
                  onClick={e => { e.preventDefault() }}
                ><div className="ellipsis-tooltipped" dangerouslySetInnerHTML={{ __html: o.html }}></div></a>)
        else
          return <div className="emptiness">— No Results —</div>
      })()}
    </div>
  </div>

  function balloonMouseDown(e) {
    e.currentTarget.addEventListener('mouseup', function () {
      component.choose() // An option will only be chosen if state.hoveredLink is not null
    }, { once: true })
    e.preventDefault()
  }
}

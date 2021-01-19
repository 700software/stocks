
/**
 * Sets `<form action="javascript:">` which is a 'do nothing' action.
 * The advantage here over ` action="#"` is that it won't scroll to top of page by default.
 **/
export function noAction(node) { if (node) node.action = 'javascript:' }

/**
 * Adds `title` attribute only if the CSS ellipsis has appeared.
 * `title` will be applied to the parent in case the parent has some extra padding and border as part of the clickable or hoverable region.
 */
export function ellipsisTooltip(e) {
  const parent = e.currentTarget
  const child = parent.firstChild
  if (child.offsetWidth < child.scrollWidth && !parent.getAttribute('title'))
    parent.setAttribute('title', child.innerText)
}

/**
 * @param {object} input The entries that you would like removed from `propsCopy`. You can provide default values, or `null` values.
 * @param {object} propsCopy The object from which those entries will be captured and deleted.
 * @returns {object} Same as `input` — after updating its values with those found in `propsCopy`.
 */
export function extractProps(input, propsCopy) {
  for (var key in input) {
    if (key in propsCopy)
      input[key] = propsCopy[key]
    delete propsCopy[key]
  }
  return input
}

/** Like `encodeURIComponent`, but looks prettier and still works. */
export function paramE(x) {
  return encodeURIComponent(x)
    .replace(/%20/g, '+')
    .replace(/%22/g, '"')
    .replace(/%24/g, '$')
    .replace(/%2C/g, ',')
    .replace(/%2F/g, '/')
    .replace(/%3A/g, ':')
    .replace(/%3B/g, ';')
    .replace(/%3C/g, '<')
    .replace(/%3D/g, '=')
    .replace(/%3E/g, '>')
    .replace(/%3F/g, '?')
    .replace(/%40/g, '@')
    .replace(/%5B/g, '[')
    .replace(/%5C/g, '\\')
    .replace(/%5D/g, ']')
    .replace(/%5E/g, '^')
    .replace(/%60/g, '`')
    .replace(/%7B/g, '{')
    .replace(/%7C/g, '|')
    .replace(/%7D/g, '}')
}

/**
 * Round a string that had user input with commas potentially
 * @param {string | number} x 
 * @param {number?} digits max decimal digits rounding
 * @param {number?} minDigits min digits to display even if .00
 * @returns {number}
 */
export function roundC(x, digits, minDigits) {
  if (typeof x == 'string') x = x.replace(/,/g, '') // auto-strips comma
  if (digits == null) return x * 1 // returns same number if no rounding specified
  var x = round(x, digits, minDigits == null ? digits : minDigits) // returns string unless minDigits is zero
  return x == 0 ? '' : x
}

/**
* round without having micro rounding differences problems
* @param {number} x 
* @param {number?} digits max decimal digits rounding
* @param {number?} minDigits min digits to display even if .00
* @returns {number}
*/
export function round(x, digits, minDigits) {
  x = x < 0 ? x - .000000001 : x*1 + .000000001 // no comma strip, but fixes micro-rounding
  if (!digits && !minDigits) return Math.round(x) // more efficient when possible
  x = x.toFixed(digits) // round
  if (!minDigits) return x * 1 // returns number if no minDigits specified
  if (digits == minDigits) return x
  x = x * 1 + '' // remove trailing zeros
  if (x.indexOf('e') != -1) return x // just in case
  var idxNow = x.lastIndexOf('.')
  if (idxNow == -1) x += '.'
  else minDigits -= x.length - idxNow - 1 // minDigits becomes 'remaining digits to add'
  while (minDigits-- > 0) x += '0' // returns string with correct minDigits as specified
  return x
}

/** e.g. Converts 1000.1 to 1,000.1 */
export function commaize(x) {
  return (''+x).replace(/(\d)(?=(?:\d\d\d)+(?:\.|$))/g, '$1,').replace(/(\.\d*),/g, '$1')
}

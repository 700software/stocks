/**
 * Client-side utility function for AJAX requests with several useful yet basic features
 * for plain-text or JSON responses, with error detection and built-in timeout.
 * 
 * Usage:
 * var request = ajaxWave({
 *   timeout: ..., // can be used to override default timeout in the function
 *   url: ..., // relative or absolute request endpoint URL
 *   postdata: ..., // converts request from GET to POST
 *   json: ..., // same as postdata, but using the application/json ctype instead of x-www-form-urlencoded
 *   callback: function (wave, request) {
 *     wave.ctype // Content-type excluding the charset portion (e.g. text/html)
 *     wave.json // JSON response if valid JSON and used application/json HTTP response header
 *     wave.html // Web page text response text/html was used as response header.
 *     wave.text // Web page text response text/plain was used as response header.
 *     You must check whether request.status == 200 to see whether it is a normal response because an error response might happens to be in the anticipated type.
 *     Any time you have an error, you can just print wave.whoops as the error message.
 *     Common usage:
 *     if (request.status == 200 && wave.json) { // checks that JSON was valid
 *       // do something with wave.json
 *     } else 
 *       alert(wave.text || wave.whoops) // Prints server-provided error if it is plain text and not an enforced timeout, otherwise stock wave.error message.
 *   },
 *   beforeSend: function (request) { } // optional for advanced use. (e.g. progress bar) See the request before it is finished.
 * })
 * @returns XMLHttpRequest (can be used to abort if conditions change)
 * @callback wave contains ctype, json, html, text, whoops. (request is same as return value and can be used to check request.status)
 * @author Bryan Field
 */
export default function ajaxWave(o) {

  if (!o.timeout) o.timeout = 1000 * 20

  var request = new XMLHttpRequest()

  var wave = {}

  request.onreadystatechange = function () {
    if (request.readyState != 4) return
    clearTimeout(timer)

    if (!wave.whoops) // check timeout reached
      if (request.status
        && request.status < 12000 // Old IE behaviour for network errors
      ) {

        wave.ctype = request.getResponseHeader('Content-Type')
        if (wave.ctype) wave.ctype = wave.ctype.replace(/\s*;[\s\S]*/, '')

        wave.whoops = 'HTTP ' + request.status + ' error'

        if (wave.ctype == 'application/json') {
          try {
            wave.json = JSON.parse(request.responseText)
          } catch (e) {
            wave.whoops = 'JSON parse error'
          }
        } else if (wave.ctype == 'text/plain')
          wave.text = request.responseText
        else if (wave.ctype == 'text/html')
          wave.html = request.responseText

      } else
        wave.whoops = 'Internet Connection Failure'

    if (o.callback)
      o.callback(wave, request)

  }

  request.open(o.postdata != null || o.json != null ? 'POST' : 'GET', o.url, true)
  if (o.json) {
    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
    if (typeof o.json == 'string')
      o.postdata = o.json
    else
      o.postdata = JSON.stringify(o.json)
  } else if (typeof o.postdata == 'string') // not a FormData object
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
  if (o.beforeSend)
    o.beforeSend(request)
  request.send(o.postdata)

  var timer = setTimeout(function () {
    wave.whoops = 'Timeout of ' + (o.timeout / 1000) + ' seconds.'
    request.abort()
  }, o.timeout)

  return request

}

export function formData(form) {
  var json = {}
  for (var i = 0; i < form.elements.length; i++) {
    var e = form.elements[i]
    if (e.tagName != 'BUTTON' && !e.disabled && e.name && (e.tagName != 'INPUT' || e.type != 'radio' && e.type != 'checkbox' || e.checked))
      if (e.tagName == 'select') {
        for (var j = 0; j < e.options.length; j++)
          if (e.options[j].selected)
            json[e.name] = (e.name in json ? json[e.name] + '\x00' : '') + e.options[j].value
      } else
        json[e.name] = (e.name in json ? json[e.name] + '\x00' : '') + e.value
  }
  return json
}

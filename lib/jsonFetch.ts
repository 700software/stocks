import fetchTimeout from './fetchTimeout'

/**
 * Similar to `fetch`, but with JSON parsing built in.
 * @param url
 * @param options supports `timeout` option
 * @throws {string} instead of `Error`
 * @returns {object} the server's response parsed as JSON
 **/
export default function jsonFetch(url: string, options): Promise<Object> {
  return fetchTimeout(url, options)
    .then(function (res: Response) {
      return res.json()
    })
}

/**
 * Shorthand syntax. So instead of
 * 
 *     url => jsonFetch(url).then(function () { ... })
 * 
 * now you can use
 * 
 *                 jsonFetch.then(function () { ... })
 **/
jsonFetch.then = function (then: Function): ((url: string) => Promise<Object>) {
  return function () {
    return jsonFetch.apply(this, arguments).then(then)
  }
}

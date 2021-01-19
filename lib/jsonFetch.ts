
/**
 * Similar to `fetch`, but with JSON parsing built in.
 * @param url
 * @throws {string} instead of `Error`
 * @returns {object} the server's response parsed as JSON
 **/
export default function jsonFetch(url: string): Promise<Object> {
  return fetch(url)
    .catch((e: Error): string => { throw '' + (e.message || e) })
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

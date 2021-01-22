
/** Similar to `fetch`, but with timeout as one of the supported `options` **/
export default async function fetchTimeout(url: string, options): Promise<Object> {
  if (!options) options = {}
  const { timeout } = options
  const controller = new AbortController()
  var timedOut = false
  if (timeout != null) {
    var timer = setTimeout(function () {
      timedOut = true
      controller.abort()
    }, timeout)
  }
  options.signal = controller.signal
  try {
    var response = await fetch(url, options)
      .catch((e: Error): string => { throw '' + (e.message || e) })
  } catch (e) {
    if (timedOut) throw `Timeout of ${timeout / 1000} seconds`
    else throw e
  } finally {
    clearTimeout(timer)
  }
  return response
}

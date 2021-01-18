[stocks.700software.com](https://stocks.700software.com)
========================

This is the result of a take-home assignment for a full-time React position.

 - Visit online at https://stocks.700software.com

 - Run locally with `npm install && npm run dev` and visit http://localhost:3000


Known issues
------------
### [`SearchDropdown.js`] uses DOM events. ###

This is because I ported it from an earlier project as it is feature-rich. (handling both mouse and keyboard interactions)
Obviously your team may prefer this be ported to controlled inputs, and pure React events, which I can do.

### [`SearchDropdown.js`] should be generic. ###
Using props, we should be able to specify a custom endpoint and results parser. Perhaps even a custom `fetch`er so the same component can be reused for any similar search of different things.

### Stop calling `alphavantage.co` client-side; add rate-limiting ###
A possible DoS scenario is that someone snags the (currently public) API key from the client and uses up the provider's rate limit. This is a DoS vector for stocks.700software.com.

We could mitigate this by providing our own API endpoint with our own rate-limiting (and caching) to substantively (although not comprehensively) mitigate this DoS vector.

The API key is currently stored [at the top if `SearchDropdown.js`].


  [stocks.700software.com]: https://stocks.700software.com
  [`SearchDropdown.js`]:               components/SearchDropdown.js
  [at the top if `SearchDropdown.js`]: components/SearchDropdown.js#L5

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

### Stop calling `alphavantage.co` client-side; add our own rate-limiting ###
A possible DoS scenario is that someone snags the (currently public) API key from the client and uses up the provider's rate limit. This is a DoS vector for stocks.700software.com.

We could mitigate this by providing our own API endpoint with our own rate-limiting (and caching) to substantively (although not comprehensively) mitigate this DoS vector.

The API key is currently stored in [`next.config.js`].

### Refresh interval is long ###

Because the free-tier API key has tight rate limit. Stock prices are not refreshed very often unless user unpins and repins the company.

### Use of TypeScript is limited ###

See [`jsonFetch.ts`] for an example where I use TypeScript, however I did not add types to all files in all places.


  [stocks.700software.com]: https://stocks.700software.com
  [`SearchDropdown.js`]: components/SearchDropdown.js
  [`next.config.js`]: next.config.js#L4
  [`jsonFetch.ts`]: lib/jsonFetch.ts

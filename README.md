[stocks.700software.com]
========================

This is the result of a take-home assignment for a full-time React position.

 - Visit online at https://stocks.700software.com

 - Run locally with `npm install && npm run dev` and visit http://localhost:3000


Suggested enhancement(s)
------------------------
### Stop calling `alphavantage.co` client-side; add our own rate-limiting server-side ###
A possible DoS scenario is that someone snags the (currently public) API key from the client and uses up the provider's rate limit. This is a DoS vector for stocks.700software.com.

We could mitigate this by providing our own API endpoint with our own rate-limiting (and caching) to substantively (although not comprehensively) mitigate this DoS vector.

The API key is currently stored in [`next.config.js`]. Normally Keys would not be stored in the repo, but in this case it is public anyway.


### Show the refresh interval to the user, and show exact time of last price quote ###

Right now I'm using the built-in auto-retry from the [swr] library.
 

  [stocks.700software.com]: https://stocks.700software.com
  [`next.config.js`]: next.config.js#L4
  [swr]: https://swr.vercel.app/

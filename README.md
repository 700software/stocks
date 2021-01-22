[stocks.700software.com]
========================


 - Visit online at https://stocks.700software.com

 - Run locally with `npm install && npm run dev` and visit http://localhost:3000

### Testing ###

 - Unit tests: `npm test`

 - Integration test: `npm run testi` (requires internet connectivity)


Features
--------

### Of note: ###
* The [`SearchDropdown.js`] handles keyboard and mouse interaction, including dragging across search results and release to select (a subtle ease of use enhancement over most search dropdowns)

  This can be easily generified for any search/autofill dropdown needed.

* Auto-retry on (e.g. quota) error is enabled by default with [`swr`].

### From original spec: ###
* Requirement: Built in react - this uses the Next.js framework
* Requirement: Some sort of unit testing - use `npm test`
* Nice to have: Integration tests - use `npm run testi`
* Nice to have: TypeScript - implemented throughout
* Nice to have Continuous integration - using Vercel
* The user wants you to create a web application that will allow them to compare up to 3 stock tickers at once.
* They want to be able to search for companies based not just based on symbols but also names. 
* As a user, I want to be able to pin/bookmark up to 3 results to my view
* As a user, I want to be able to see up to 3 pinned columns so that I can draw direct comparisons
* As a user, I want to be able to see the graphical representation of a company’s EPS earning or cash flow and be able to compare it

  **For this one, I felt an EPS Ratio was the most useful comparison to make.**  
  I do have Highcharts experience.


  [stocks.700software.com]: https://stocks.700software.com
  [`next.config.js`]: next.config.js#L4
  [`swr`]: https://swr.vercel.app/
  [`SearchDropdown.js`]: components/SearchDropdown.js

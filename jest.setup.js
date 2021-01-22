import '@testing-library/jest-dom'

if (process.env.TEST_INTEGRATIONS)
  global.fetch = require('node-fetch')
else
  require('jest-fetch-mock').enableMocks()


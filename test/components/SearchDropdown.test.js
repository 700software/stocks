import SearchDropdown from '@components/SearchDropdown'
import { fireEvent } from '@testing-library/react'
import React from 'react'
import { render, screen } from '../test-utils'

const mockResponse = `{
  "bestMatches": [
      {
          "1. symbol": "BA",
          "2. name": "Boeing Company",
          "3. type": "Equity",
          "4. region": "United States",
          "5. marketOpen": "09:30",
          "6. marketClose": "16:00",
          "7. timezone": "UTC-05",
          "8. currency": "USD",
          "9. matchScore": "1.0000"
      },
      {
          "1. symbol": "BAA",
          "2. name": "Banro Corporation USA",
          "3. type": "Equity",
          "4. region": "United States",
          "5. marketOpen": "09:30",
          "6. marketClose": "16:00",
          "7. timezone": "UTC-05",
          "8. currency": "USD",
          "9. matchScore": "0.8000"
      },
      {
          "1. symbol": "BAB",
          "2. name": "Invesco Taxable Municipal Bond ETF",
          "3. type": "ETF",
          "4. region": "United States",
          "5. marketOpen": "09:30",
          "6. marketClose": "16:00",
          "7. timezone": "UTC-05",
          "8. currency": "USD",
          "9. matchScore": "0.8000"
      },
      {
          "1. symbol": "BA.LON",
          "2. name": "BAE Systems plc",
          "3. type": "Equity",
          "4. region": "United Kingdom",
          "5. marketOpen": "08:00",
          "6. marketClose": "16:30",
          "7. timezone": "UTC+00",
          "8. currency": "GBP",
          "9. matchScore": "0.6667"
      },
      {
          "1. symbol": "BABA",
          "2. name": "Alibaba Group Holding Ltd",
          "3. type": "Equity",
          "4. region": "United States",
          "5. marketOpen": "09:30",
          "6. marketClose": "16:00",
          "7. timezone": "UTC-05",
          "8. currency": "USD",
          "9. matchScore": "0.6667"
      },
      {
          "1. symbol": "BABB",
          "2. name": "BAB Inc",
          "3. type": "Equity",
          "4. region": "United States",
          "5. marketOpen": "09:30",
          "6. marketClose": "16:00",
          "7. timezone": "UTC-05",
          "8. currency": "USD",
          "9. matchScore": "0.6667"
      },
      {
          "1. symbol": "BA3.FRK",
          "2. name": "Brooks Automation",
          "3. type": "Equity",
          "4. region": "Frankfurt",
          "5. marketOpen": "08:00",
          "6. marketClose": "20:00",
          "7. timezone": "UTC+01",
          "8. currency": "EUR",
          "9. matchScore": "0.5714"
      },
      {
          "1. symbol": "BAAPX",
          "2. name": "BlackRock Aggressive GwthPrprdPtfInvstrA",
          "3. type": "Mutual Fund",
          "4. region": "United States",
          "5. marketOpen": "09:30",
          "6. marketClose": "16:00",
          "7. timezone": "UTC-05",
          "8. currency": "USD",
          "9. matchScore": "0.5714"
      },
      {
          "1. symbol": "BABAF",
          "2. name": "Alibaba Group Holding Ltd",
          "3. type": "Equity",
          "4. region": "United States",
          "5. marketOpen": "09:30",
          "6. marketClose": "16:00",
          "7. timezone": "UTC-05",
          "8. currency": "USD",
          "9. matchScore": "0.5714"
      },
      {
          "1. symbol": "BABA34.SAO",
          "2. name": "BABA34",
          "3. type": "Equity",
          "4. region": "Brazil/Sao Paolo",
          "5. marketOpen": "10:00",
          "6. marketClose": "17:30",
          "7. timezone": "UTC-03",
          "8. currency": "BRL",
          "9. matchScore": "0.5000"
      }
  ]
}`

describe('SearchDropdown', () => {
  it('should have search icon', () => {
    render(<SearchDropdown />)
    const elem = screen.getByText(/search/i)
    expect(elem).toBeInTheDocument()
  })
  it('should bring in search results', async () => {
    var { container, rerender } = render(<div><SearchDropdown /></div>)
    var input = container.querySelector('input:not([type=hidden])')

    if (!process.env.TEST_INTEGRATIONS)
      fetch.once(mockResponse)
    fireEvent.change(input, {
      target: {
        value: 'BA',
      },
      currentTarget: {
        value: 'BA',
      },
    })

    rerender(<div><SearchDropdown /></div>)
    await screen.findByText(/Boeing/);
  })
})

import React from 'react'
// Using render and screen from test-utils.js instead of
// @testing-library/react
import { render, screen } from '../test-utils'
import Layout from '@components/Layout'

describe('Layout', () => {
  it('should say Sample Project', () => {
    render(<Layout />)

    const heading = screen.getByText(
      /Sample project/i
    )

    // we can only use toBeInTheDocument because it was imported
    // in the jest.setup.js and configured in jest.config.js
    expect(heading).toBeInTheDocument()
  })
})

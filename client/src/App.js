import React from 'react'
import { Root, Routes, addPrefetchExcludes } from 'react-static'
import { createGlobalStyle } from 'styled-components'
import { Grommet } from 'grommet'
//
import { Link, Router } from 'components/Router'

const GlobalStyle = createGlobalStyle`
  * {
    scroll-behavior: smooth;
  }
`

const theme = {
  global: {
    font: {
      family: 'sans-serif',
    },
  },
}

// Any routes that start with 'dynamic' will be treated as non-static routes
addPrefetchExcludes(['dynamic'])

function App() {
  return (
    <Root>
      <GlobalStyle />
      <Grommet theme={theme}>
        <nav>
          <Link to="/">Home</Link>
        </nav>
        <div className="content">
          <React.Suspense fallback={<em>Loading...</em>}>
            <Router>
              <Routes path="*" />
            </Router>
          </React.Suspense>
        </div>
      </Grommet>
    </Root>
  )
}

export default App

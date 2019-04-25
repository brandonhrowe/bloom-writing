import React from 'react'

import {Navbar} from './components'
import Routes from './routes'
import {Prompt} from './components'
import Story from './components/Story';

const App = () => {
  return (
    <div>
      <Navbar />
      {/* <Routes /> */}
      <Prompt />
      <Story />
    </div>
  )
}

export default App

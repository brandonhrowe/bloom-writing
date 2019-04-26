import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
// import {setStory} from '../store'
import socket from '../socket'

class Prompt extends React.Component {
  constructor(){
    super()
    this.state = {
      timestamp: "no timestamp",
      text: ""
    }
  }

  componentDidMount(){

  }

  render() {
    return (
      <div className="story-container">
        <textarea
          className="story"
          rows="10"
          cols="50"
          placeholder="Start your story here..."
        />
      </div>
    )
  }
}

/**
 * CONTAINER
 */
const mapState = state => {
  return {
    story: ''
  }
}

// const mapDispatch = dispatch => {
//   return {
//     loadPrompt() {
//       dispatch(setPrompt())
//     }
//   }
// }

export default connect(mapState)(Prompt)

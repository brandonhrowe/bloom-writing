import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
// import {setStory} from '../store'

const Prompt = ({story}) => (
  <div className="story-container">
    <textarea className="story"></textarea>
  </div>
)

/**
 * CONTAINER
 */
const mapState = state => {
  return {
    story: ""
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

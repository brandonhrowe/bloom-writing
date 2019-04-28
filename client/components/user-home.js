import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {createStoryThunk} from '../store'

/**
 * COMPONENT
 */
class UserHome extends Component {
  constructor(){
    super()
  }

  render() {
    const {username, createNewStory, story, history} = this.props

    return (
      <div className="user-home">
        <div className="welcome">
          <h1>Welcome, {username}, to Bloom!</h1>
          <h2>Select one of the modes from above to get started.</h2>
          <ul>
            <li>
              <strong>A Room Of One's Own</strong> is to write your own stories
              based off of random prompts and keep them privately saved.
            </li>
            <br />
            <li>
              <strong>The Metamorphosis</strong> is for collaborating with
              others in real time on randomly-generated starting points.
            </li>
          </ul>
          <h2>
            Then, to the right, you can either start a new story or go back to a
            previous one.
          </h2>
        </div>
        <div className="buttons">
          <button
            className="button-room-of-own"
            type="button"
            onClick={() => {
              // await createNewStory()
              history.push(`/story/new`)
            }}
          >
            <h1>Start a New Story</h1>
          </button>
          <button className="button-metamorphosis" type="button" onClick={() => {
            history.push('/yourstories')
          }}>
            <h1>See a List of Your Stories</h1>
          </button>
        </div>
      </div>
    )
  }
}

/**
 * CONTAINER
 */
const mapState = state => {
  return {
    username: state.user.username,
    story: state.story
  }
}
const mapDispatch = dispatch => {
  return {
    createNewStory: () => {
      return dispatch(createStoryThunk())
    }
  }
}

export default connect(mapState, mapDispatch)(UserHome)

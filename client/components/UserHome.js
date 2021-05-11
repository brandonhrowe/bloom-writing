import React, {Component} from 'react'
import {connect} from 'react-redux'
import {createStoryThunk} from '../store'

class UserHome extends Component {
  render() {
    const {username} = this.props
    return (
      <div className="user-home">
        <div className="welcome">
          <h1>Welcome, {username}, to BLOOM WRITING!</h1>
          <h2>Select one of the modes from above to get started:</h2>
          <ul>
            <li>
              <strong><u>A Room Of One's Own</u></strong> is to write your own stories
              based off of random prompts and keep them privately saved.
            </li>
            <br />
            <li>
              <strong><u>Metamorphoses</u></strong> is for collaborating with
              others in real time on randomly-generated starting points. (Coming
              soon...)
            </li>
          </ul>
        </div>
      </div>
    )
  }
}

const mapState = state => {
  return {
    username: state.user.username,
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

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {createStoryThunk} from '../store'

/**
 * COMPONENT
 */
class UserHome extends Component {
  constructor() {
    super()
    this.state = {
      promptLoad: 0
    }
  }

  componentWillUnmount() {
    this.setState({
      promptLoad: 0
    })
  }

  render() {
    const {username, history, createNewStory} = this.props
    const {promptLoad} = this.state
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
        {/* <div className="buttons">
          <div className="button-room-of-own-container">
            <button
              className="button-room-of-own"
              type="button"
              onClick={async () => {
                this.setState({
                  promptLoad: 1
                })
                const newStoryId = await createNewStory()
                history.push(`/story/${newStoryId}`)
              }}
            >
              <h1>Start a New Story</h1>
            </button>
            <h4 className="promptLoad" style={{opacity: promptLoad}}>
              Waiting for Godot. Or a prompt. Whichever comes first...
            </h4>
          </div>
          <div className="button-metamorphosis-container">
            <button
              className="button-metamorphosis"
              type="button"
              onClick={() => {
                history.push('/yourstories')
              }}
            >
              <h1>See a List of Your Stories</h1>
            </button>
          </div>
        </div> */}
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

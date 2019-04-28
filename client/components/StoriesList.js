import React, {Component} from 'react'
import {connect} from 'react-redux'
import {getStoriesThunk} from '../store'
import history from '../history'

/**
 * COMPONENT
 */
class StoriesList extends Component {

  componentDidMount() {
    this.props.loadStories()
  }

  handleClick(event) {
    const {id} = event.target
    history.push(`/story/${id}`)
  }

  render() {
    const {user, stories} = this.props

    return (
      <div className="stories-list-container">
        <h1>{user.username}'s Stories:</h1>
        <ol>
          {stories.sort((a, b) => a.id - b.id).map(story => {
            return (
              <li
                id={story.id}
                key={story.id}
                className="story-list-item"
                onClick={this.handleClick}
              >
                {story.prompt}
              </li>
            )
          })}
        </ol>
      </div>
    )
  }
}

/**
 * CONTAINER
 */
const mapState = state => {
  return {
    user: state.user,
    stories: state.stories
  }
}
const mapDispatch = dispatch => {
  return {
    loadStories: () => {
      return dispatch(getStoriesThunk())
    }
  }
}

export default connect(mapState, mapDispatch)(StoriesList)

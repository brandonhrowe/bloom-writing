import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {getStoriesThunk} from '../store'
import {Link} from 'react-router-dom'

/**
 * COMPONENT
 */
class StoriesList extends Component {
  // constructor(props) {
  //   super(props)
  // }

  componentDidMount() {
    this.props.loadStories()
  }

  handleClick(event) {
    const {id} = event.target
    this.props.history.push(`/story/${id}`)
  }

  render() {
    const {user, stories, history} = this.props

    return (
      <div className="stories-list-container">
        <h1>{user.username}'s Stories:</h1>
        {stories.map(story => {
          return (
            <p id={story.id} key={story.id} className="story-list-item">{story.prompt}</p>
          )
        })}
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

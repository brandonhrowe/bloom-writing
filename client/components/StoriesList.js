import React, {Component} from 'react'
import {connect} from 'react-redux'
import {getStoriesThunk} from '../store'
import history from '../history'

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
        {stories.length ? (
          <h1>{user.username}'s Stories:</h1>
        ) : (
          <h1>It looks like you need to build your library!</h1>
        )}
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
                <br />
                <h6>Word Count: {story.length}</h6>
              </li>
            )
          })}
        </ol>
      </div>
    )
  }
}

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

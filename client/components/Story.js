import React, {Component} from 'react'
import {connect} from 'react-redux'
import {
  createStoryThunk,
  getStoryThunk,
  editStoryThunk,
  clearStoryThunk
} from '../store'
import CKEditor from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import axios from 'axios'
import history from '../history'

class Story extends Component {
  constructor(props) {
    super(props)
    this.state = {
      length: 4,
      suggestion: '',
      suggestionVisibility: 0,
      saveVisibility: 0,
      definitionVisibility: 0,
      definitions: {},
      definitionsError: true
    }

    this.suggestion = this.suggestion.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.handleHighlight = this.handleHighlight.bind(this)
  }

  async suggestion(event, editor) {
    const text = editor.getData()
    this.setState({
      length: text.split(' ').length
    })
    if (this.state.length > 20) {
      const {data} = await axios.post('/prompts/suggestion', {text})
      let oldLength = text.length
      let newLength
      setTimeout(() => {
        let newData = editor.getData()
        newLength = newData.length
        if (oldLength === newLength) {
          this.setState({
            suggestion: data,
            suggestionVisibility: 1
          })
        } else if (oldLength !== newLength) {
          this.setState({
            suggestionVisibility: 0
          })
        }
      }, 5000)
      setTimeout(() => {
        this.setState({
          suggestionVisibility: 0
        })
      }, 30000)
    }
  }

  handleSave(event, editor) {
    const {id} = this.props.story
    const oldText = editor.getData()
    setTimeout(async () => {
      let newText = editor.getData()
      if (oldText === newText) {
        const {data} = await axios.put(`/api/stories/story`, {
          storyId: id,
          text: oldText,
          length: this.state.length
        })
        this.setState({
          saveVisibility: 1
        })
      }
    }, 1000)
    setTimeout(() => {
      this.setState({
        saveVisibility: 0
      })
    }, 6000)
  }

  async handleHighlight(event) {
    const text = await window
      .getSelection()
      .toString()
      .toLowerCase()
    if (text.length) {
      const {data} = await axios.get(`/api/stories/def/${text}`)
      if (data.statusCode === 404) {
        this.setState({
          definitions: {},
          definitionVisibility: 1,
          definitionsError: true
        })
        setTimeout(() => {
          this.setState({
            definitionVisibility: 0
          })
        }, 5000)
      } else {
        this.setState({
          definitionVisibility: 1,
          definitionsError: false,
          definitions: data.body
        })
        setTimeout(() => {
          this.setState({
            definitionVisibility: 0
          })
        }, 20000)
      }
    }
  }

  async componentDidMount() {
    if (this.props.match.url === '/story/new') {
      await this.props.loadNewStory()
    } else {
      this.props.loadExistingStory(this.props.match.params.storyId)
    }
  }

  componentWillUnmount() {
    this.props.clearStoryState(this.props.story, this.props.user)
  }

  render() {
    const {story, user} = this.props
    const {
      length,
      saveVisibility,
      suggestionVisibility,
      suggestion,
      definitionVisibility,
      definitionsError,
      definitions
    } = this.state
    return (
      <div className="story-container">
        <h1 className="prompt" onMouseUp={this.handleHighlight}>
          <u>
            {story.prompt
              ? story.prompt
              : 'Waiting for Godot. Or a prompt. Whichever comes first...'}
          </u>
        </h1>
        <div className="wordcount-save">
          <div className="download">
            <a
              download
              href={`/download/${user.username.split(' ').join('_')}_${
                story.id
              }.rtf`}
            >
              <u>DOWNLOAD</u>
            </a>
          </div>
          <div className="save" style={{opacity: saveVisibility}}>
            Story has been saved
          </div>
          <h4>Word Count: {length}</h4>
        </div>
        <CKEditor
          id="story"
          editor={ClassicEditor}
          data={story.text ? story.text : '<p>Start your story here!</p>'}
          onChange={(event, editor) => {
            this.suggestion(event, editor)
            this.handleSave(event, editor)
          }}
        />
        <br />
        <div className="story-bottom-container">
          <div className="suggestion-container">
            <h4>In Search of Lost <strike>Time</strike> Words? <br/>Wait a few seconds for a suggestion...<br /> </h4>
            <div className="suggestion" style={{opacity: suggestionVisibility}}>
              <h3>"{suggestion}"</h3>
            </div>
          </div>
          <div className="definitions-container">
            <h4 className="highlight-hint">
              Not sure what a word means?<br />Highlight it!
            </h4>
            <div
              className="definitions"
              style={{opacity: definitionVisibility}}
            >
              {definitionsError ? (
                <div>
                  <h2>Sorry, we cannot find a definition for that.</h2>
                </div>
              ) : (
                <div>
                  <h2>Definitions for "{definitions.word}":</h2>
                  <div>
                    {definitions.definitions.map(def => {
                      return (
                        <div className="defItem" key={def.definition}>
                          <h4>
                            <i>{def.partOfSpeech}</i>
                          </h4>
                          <h3>
                            <i>{def.definition}</i>
                          </h3>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapState = state => {
  return {
    story: state.story,
    user: state.user
  }
}

const mapDispatch = dispatch => {
  return {
    async loadNewStory() {
      await dispatch(createStoryThunk())
    },
    async loadExistingStory(id) {
      await dispatch(getStoryThunk(id))
    },
    saveStory(id, text) {
      dispatch(editStoryThunk(id, text))
    },
    clearStoryState(story, user) {
      dispatch(clearStoryThunk(story, user))
    }
  }
}

export default connect(mapState, mapDispatch)(Story)

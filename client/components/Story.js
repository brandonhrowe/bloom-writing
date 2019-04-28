import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {createStoryThunk, getStoryThunk, editStoryThunk} from '../store'
// import socket from '../socket'
import CKEditor from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import socketIOClient from 'socket.io-client'
import {EventEmitter} from 'events'
import axios from 'axios'
// const socket = io(window.location.origin)
const events = new EventEmitter()
// import StoryComp from './StoryComp'

class Story extends Component {
  constructor(props) {
    super(props)
    this.state = {
      endpoint: window.location.origin,
      // prompt: 'Waiting for Godot. Or a prompt. Whichever comes first...',
      // text: '<p>Write your story here!</p>',
      length: 4,
      suggestion: '',
      suggestionVisibility: 0,
      saveVisibility: 0
      //text should be the text pulled from the backend; the default for a new story should be "Write your story here"
    }
    this.uniqueId = Math.floor(Math.random() * 10000000000)
    //Will need to update this if there are users
    this.socket = socketIOClient(this.state.endpoint)

    this.socket.on('connect', async () => {
      console.log(
        `I have made a persistent two-way connection to the server! with React! This is my uniqueId: ${
          this.uniqueId
        }`
      )
      //Will have to modify this for sockets so that it doesn't automatically generate a new prompt and thusly a new room
      // const {data} = await axios.get('/prompts')
      // this.setState({
      //   prompt: data
      // })
      this.socket.emit('join-text', this.state.prompt, this.uniqueId)
    })

    this.socket.on('load', (story, uniqueId) => {
      console.log('loading story', story)
      this.writing(story, uniqueId, false)
    })

    this.socket.on('type-from-server', (data, uniqueId, event) => {
      console.log('data and event from update in client', data, event)
      this.writing(data, uniqueId, false, event)
      // const content = JSON.parse(data)
      // const {uniqueId, content: ops} = content
      // if (ops !== null && this.uniqueId !== uniqueId) {
      //   setTimeout(() => {
      //     this.ck.applyOperations(ops)
      //   })
      // }
    })

    // events.on('change:data', text => {
    //   console.log('this.events.on change:data called. text:', text)
    //   this.socket.emit('type-from-client', this.state.prompt, text)
    // })
    // this.send = this.send.bind(this)
    this.writing = this.writing.bind(this)
    this.update = this.update.bind(this)
    this.suggestion = this.suggestion.bind(this)
  }

  // send = content => {
  //   const data = JSON.stringify({content, uniqueId: this.uniqueId})
  //   this.socket.emit('update', data)
  // }

  // onChange = change => {
  //   const ops = change.operations
  //     .filter(o => o.type !== 'set_selection' && o.type !== 'set_text')
  //     .toJS()
  //   if (ops.length > 0) {
  //     this.send(ops)
  //   }

  writing(text, uniqueId, shouldBroadcast = true, event) {
    // if (this.uniqueId !== uniqueId) {
    this.setState({
      text
    })
    // }
    events.emit('type', text)
    // if (shouldBroadcast) {
    //   console.log('shouldBroadcast is true, events.emitting type')
    //   events.emit('type', text)
    // }
  }

  update(event, editor) {
    // event.preventDefault()
    const data = editor.getData()
    this.setState({
      length: data.split(' ').length
    })
    this.socket.emit(
      'type-from-client',
      this.state.prompt,
      data,
      this.uniqueId,
      event
    )
  }

  async suggestion(event, editor) {
    const text = editor.getData()
    this.setState({
      length: text.split(' ').length
    })
    if (this.state.length > 20) {
      const {data} = await axios.post('/prompts/suggestion', {text})
      let oldLength = text.split(' ').length
      let newLength
      setTimeout(() => {
        let newData = editor.getData()
        newLength = newData.split(' ').length
        if (oldLength === newLength) {
          this.setState({
            suggestion: data,
            suggestionVisibility: 1
          })
        }
        if (oldLength !== newLength) {
          this.setState({
            suggestionVisibility: 0
          })
        }
      }, 5000)
    }
  }

  handleSave(event, editor) {
    const {id} = this.props.story
    console.log("this.props on save", this.props)
    const oldText = editor.getData()
    console.log("storyid in frontend:", id)
    setTimeout(async () => {
      let newText = editor.getData()
      console.log("newText:", newText)
      if (oldText === newText){
        // this.props.saveStory(id, newText)
        const {data} = await axios.put(`/api/stories/story`, {"storyId": id, "text": oldText, "length": this.state.length})
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

  async componentDidMount() {
    // Here the prompt itself should be loaded - both on the page and in the state. It will then be passed in as the 'prompt' field to distinguish rooms
    // const {data} = await axios.get('/prompts')
    // this.setState({
    //   prompt: data
    // })
    console.log(this.props)
    if (this.props.match.url === "/story/new") {
      await this.props.loadNewStory()
      console.log('this.props within component mounting', this.props)
      // this.props.location.pathname = `/story/${this.props.story.id}`
    } else {
      this.props.loadExistingStory(this.props.match.params.storyId)
    }
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (this.state !== nextState) {
  //     return true
  //   }
  // }

  // handleTextChange(event) {
  //   event.preventDefault()
  //   let text = event.target.text
  //   console.log('text to return', text)
  //   writing(text)
  // }

  // socket.on('connect', () => {
  //   console.log('I have made a persistent two-way connection to the server!')
  //   socket.emit('join-text', 'prompt')
  // })

  // socket.on('load', story => {
  //   console.log('loading story', story)
  //   writing(story, false)
  // })

  // socket.on('type-from-server', text => {
  //   console.log('in type-from-server. Text:', text)
  //   writing(text, false)
  // })

  // events.on('type', text => {
  //   console.log('events.on type called. Text:', text)
  //   socket.emit('type-from-client', 'prompt', text)
  // })

  render() {
    const {story} = this.props
    return (
      <div className="story-container">
        {/* <textarea
          id="story"
          rows="10"
          cols="50"
          placeholder="Start your story here..."
          // onChange={() => this.handleTextChange()}
        /> */}
        <h1 className="prompt">
          <u>
            {story.prompt
              ? story.prompt
              : 'Waiting for Godot. Or a prompt. Whichever comes first...'}
          </u>
        </h1>
        <div className="wordcount-save">
          <h4>Word Count: {this.state.length}</h4>
          <div className="save" style={{opacity: this.state.saveVisibility}}>Story has been saved</div>
        </div>
        <CKEditor
          id="story"
          editor={ClassicEditor}
          data={story.text ? story.text : '<p>Start your story here!</p>'}
          onInit={editor => {
            console.log('Editor is ready to use!', editor)
          }}
          onChange={(event, editor) => {
            // this.update(event, editor)
            this.suggestion(event, editor)
            this.handleSave(event, editor)
          }}
        />
        <br />
        <div
          className="suggestion"
          style={{opacity: this.state.suggestionVisibility}}
        >
          In Search of Lost <strike>Time</strike> Words? Maybe Something Like
          This Could Go Next...<br /> <h3>"{this.state.suggestion}"</h3>
        </div>
        {/* <StoryComp ref={ckE => this.ck = ckE} onChange={this.onChange}/> */}
      </div>
    )
  }
}

// const setup = () => {
//   const textField = document.getElementById('story')
//   document.body.appendChild(textField)
//   setupTextField()
// }

// document.addEventListener('DOMContentLoaded', setup)

/**
 * CONTAINER
 */
const mapState = state => {
  return {
    story: state.story
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
    }
  }
}

export default connect(mapState, mapDispatch)(Story)
// export default Story

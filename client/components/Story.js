import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
// import {setStory} from '../store'
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
      prompt: 'A prompt is loading. Please wait...',
      text: '<p>Write your story here!</p>',
      suggestion: '',
      length: 4,
      suggestionVisibility: 0
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
    console.log('this.uniqueId within writing', this.uniqueId)
    console.log('uniqueId within writing', uniqueId)
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

  async componentDidMount() {
    // Here the prompt itself should be loaded - both on the page and in the state. It will then be passed in as the 'prompt' field to distinguish rooms
    const {data} = await axios.get('/prompts')
    this.setState({
      prompt: data
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state !== nextState) {
      return true
    }
  }

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
    return (
      <div className="story-container">
        {/* <textarea
          id="story"
          rows="10"
          cols="50"
          placeholder="Start your story here..."
          // onChange={() => this.handleTextChange()}
        /> */}
        <h1>
          <u>{this.state.prompt}</u>
        </h1>
        <h5>Word Count: {this.state.length}</h5>
        <CKEditor
          id="story"
          editor={ClassicEditor}
          data={this.state.text}
          onInit={editor => {
            console.log('Editor is ready to use!', editor)
          }}
          onChange={(event, editor) => {
            this.update(event, editor)
            this.suggestion(event, editor)
          }}
        />
        <br />
        <div
          className="suggestion"
          style={{opacity: this.state.suggestionVisibility}}
        >
          In Search of Lost <strike>Time</strike> Words? Maybe Something Like
          This Could Help...<br /> <h4>"{this.state.suggestion}"</h4>
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
// const mapState = state => {
//   return {
//     story: ''
//   }
// }

// const mapDispatch = dispatch => {
//   return {
//     loadPrompt() {
//       dispatch(setPrompt())
//     }
//   }
// }

// export default connect(mapState)(Story)
export default Story

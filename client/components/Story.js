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
// const socket = io(window.location.origin)
const events = new EventEmitter()
// import StoryComp from './StoryComp'

class Story extends Component {
  constructor(props) {
    super(props)
    this.state = {
      endpoint: window.location.origin,
      prompt: '',
      text: '<p>Write your story here!</p>'
    }
    this.uniqueId = Math.floor(Math.random() * 10000000000)
    //Will need to update this if there are users
    this.socket = socketIOClient(this.state.endpoint)

    this.socket.on('connect', () => {
      console.log(
        'I have made a persistent two-way connection to the server! with React!'
      )
      this.socket.emit('join-text', 'prompt')
    })

    this.socket.on('load', story => {
      console.log('loading story', story)
      this.writing(story, false)
    })

    this.socket.on('type-from-server', (data, event) => {
      console.log('data and event from update in client', data, event)
      this.writing(data, false, event)
      // const content = JSON.parse(data)
      // const {uniqueId, content: ops} = content
      // if (ops !== null && this.uniqueId !== uniqueId) {
      //   setTimeout(() => {
      //     this.ck.applyOperations(ops)
      //   })
      // }
    })
    // this.send = this.send.bind(this)
    this.writing = this.writing.bind(this)
    this.update = this.update.bind(this)
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

  writing(text, shouldBroadcast = true, event) {
    const currData = this.state.text
    console.log("in the writing function. event passed in: ", event)
    console.log("in the writing function. current state.text: ", event)
    this.setState({
      text
    })
    shouldBroadcast && events.emit('type', text)
  }

  update(event, editor) {
    console.log(event, editor)
    const data = editor.getData()
    console.log("data to be sent out from update function", data)
    this.socket.emit('type-from-client', 'prompt', data, event)
  }

  // componentDidMount() {
  //Here the prompt itself should be loaded - both on the page and in the state. It will then be passed in as the 'prompt' field to distinguish rooms
  //}

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
        <CKEditor
          id="story"
          editor={ClassicEditor}
          data={this.state.text}
          onInit={editor => {
            // You can store the "editor" and use when it is needed.
            console.log('Editor is ready to use!', editor)
          }}
          onChange={(event, editor) => this.update(event, editor)}
        />
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

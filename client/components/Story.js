import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
// import {setStory} from '../store'
// import socket from '../socket'
import CKEditor from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import io from 'socket.io-client'
import {EventEmitter} from 'events'
const socket = io(window.location.origin)
const events = new EventEmitter()

class Story extends React.Component {
  constructor() {
    super()
    this.state = {
      story: ''
    }
    // this.handleTextChange = this.handleTextChange.bind(this)
  }

  componentDidMount() {}

  // writing(text, shouldBroadcast = true){
  //   this.setState({
  //     story: text
  //   })
  //   shouldBroadcast && events.emit('type', text)
  // }

  // handleTextChange(event) {
  //   event.preventDefault()
  //   let text = event.target.value
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
        <textarea
          id="story"
          rows="10"
          cols="50"
          placeholder="Start your story here..."
          // onChange={() => this.handleTextChange()}
        />
        {/* <CKEditor
          id="story"
          editor={ClassicEditor}
          data="<p>Write your story here!</p>"
          onInit={editor => {
            // You can store the "editor" and use when it is needed.
            console.log('Editor is ready to use!', editor)
          }}
          onChange={(event, editor) => {
            const data = editor.getData()
            console.log({event, editor, data})
          }}
          onBlur={editor => {
            console.log('Blur.', editor)
          }}
          onFocus={editor => {
            console.log('Focus.', editor)
          }}
        /> */}
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
    story: ''
  }
}

// const mapDispatch = dispatch => {
//   return {
//     loadPrompt() {
//       dispatch(setPrompt())
//     }
//   }
// }

export default connect(mapState)(Story)

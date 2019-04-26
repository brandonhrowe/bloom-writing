import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
// import {setStory} from '../store'
import socket from '../socket'
import CKEditor from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

class Prompt extends React.Component {
  constructor() {
    super()
    this.state = {
      timestamp: 'no timestamp',
      text: ''
    }
  }

  componentDidMount() {}

  render() {
    return (
      <div className="story-container">
        {/* <textarea
          className="story"
          rows="10"
          cols="50"
          placeholder="Start your story here..."
        /> */}
        <CKEditor
          className="story"
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
        />
      </div>
    )
  }
}

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

export default connect(mapState)(Prompt)

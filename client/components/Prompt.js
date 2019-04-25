import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {setPrompt} from '../store'

const Prompt = ({loadPrompt, prompt, loading}) => (
  <div className="prompt-container">
    <button type="button" onClick={() => loadPrompt()}>
      Load a Prompt
    </button>
    <h1>
      {prompt.nounOne
        ? !loading
          ? `Write a story about ${
              prompt.nounOneForm === 'singular'
                ? ['a', 'e', 'i', 'o', 'u', 'h'].includes(prompt.adjective[0])
                  ? `an ${prompt.adjective} ${prompt.nounOne}`
                  : `a ${prompt.adjective} ${prompt.nounOne}`
                : `${prompt.adjective} ${prompt.nounOne}`
            } that ${
              Math.floor(Math.random() * 2) === 1 ? 'could' : 'would'
            } ${Math.floor(Math.random() * 2) === 1 ? prompt.adverb : ''} ${
              prompt.verb
            }${Math.floor(Math.random() * 2) === 1 ?
              (prompt.nounTwoForm === 'singular'
                ? ['a', 'e', 'i', 'o', 'u', 'h'].includes(prompt.nounTwo[0])
                  ? ` an ${prompt.nounTwo}.`
                  : ` a ${prompt.nounTwo}.`
                : prompt.nounTwo) : '.'
            }`
          : 'Prompt is currently loading...'
        : 'Click the button to load a prompt!'}
    </h1>
    <hr />
  </div>
)

/**
 * CONTAINER
 */
const mapState = state => {
  return {
    prompt: state.prompt,
    loading: false
  }
}

const mapDispatch = dispatch => {
  return {
    loadPrompt() {
      dispatch(setPrompt())
    }
  }
}

export default connect(mapState, mapDispatch)(Prompt)

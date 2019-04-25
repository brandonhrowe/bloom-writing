import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {setPrompt} from '../store'

const Prompt = ({loadPrompt, prompt, loading}) => (
  <div>
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

// let nounOneSyntax
//     let nounTwoSyntax
//     if (finalWords.nounOneForm === 'singular') {
//       if (["a", "e", "i", "o", "u", "h"].includes(finalWords.adjective[0])) {
//         nounOneSyntax = `an ${finalWords.adjective} ${finalWords.nounOne}`
//       } else {
//         nounOneSyntax = `a ${finalWords.adjective} ${finalWords.nounOne}`
//       }
//     } else {
//       nounOneSyntax = `${finalWords.adjective} ${finalWords.nounOne}`
//     }
//     if (finalWords.nounTwoForm === 'singular') {
//       if (["a", "e", "i", "o", "u", "h"].includes(finalWords.nounTwo[0])) {
//         nounTwoSyntax = `an ${finalWords.nounTwo}`
//       } else {
//         nounTwoSyntax = `a ${finalWords.nounTwo}`
//       }
//     } else {
//       nounTwoSyntax = finalWords.nounTwo
//     }
//     let prompt = `Write a story about ${nounOneSyntax} that ${Math.floor(Math.random() * 2) === 1 ? "could" : "would"} ${Math.floor(Math.random() * 2) === 1 && finalWords.adverb} ${finalWords.verb} ${nounTwoSyntax}`
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

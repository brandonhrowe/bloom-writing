import axios from 'axios'

/**
 * ACTION TYPES
 */
const GET_PROMPT = 'GET_PROMPT'

/**
 * INITIAL STATE
 */
const defaultPrompt = {}

/**
 * ACTION CREATORS
 */
const getPrompt = prompt => ({type: GET_PROMPT, prompt})

/**
 * THUNK CREATORS
 */

const nounCheckMeaningCloud = body => {
  //This is a helper function to determine if the noun is valid to use, and what form it is
  if (body.analysis_list) {
    //First base is if there is an analysis_list field, which will include what we want
    if (/NC-S/.test(body.analysis_list[0].tag)) {
      return {noun: body.form, form: 'singular'}
      //If word is singular noun, return the word and form to set on the state
    } else if (/NC-P/.test(body.analysis_list[0].tag)) {
      return {noun: body.form, form: 'plural'}
      //same as above, except for plural
    }
  }
  if (!body.token_list) {
    return {noun: '', form: ''}
    //if it hasn't returned yet, second base case is if there are no more token lists to check. in that case, the while loop will start over
  } else {
    return nounCheckMeaningCloud(body.token_list[body.token_list.length - 1])
    //otherwise, move down the token lists
  }
} //end of helper function

export const setPrompt = () => async dispatch => {
  //reducer to be called whenever prompt being generated
  try {
    let finalWords = {
      nounOne: '',
      nounOneForm: '',
      nounOneDefinition: '',
      nounTwo: '',
      nounTwoForm: '',
      nounTwoDefinition: '',
      verb: '',
      verbDefinition: '',
      adjective: '',
      adjectiveDefinition: '',
      adverb: '',
      adverbDefinition: ''
    }
    //define initial state; maybe set this as the default state?
    let adj = await axios.get('/prompts/word/random/adjective')
    finalWords.adjective = adj.data.word
    finalWords.adjectiveDefinition = adj.data.results.filter(result => result.partOfSpeech === "adjective")[0].definition
    //set adjective
    let adv = await axios.get('/prompts/word/random/adverb')
    finalWords.adverb = adv.data.word
    finalWords.adverbDefinition = adv.data.results.filter(result => result.partOfSpeech === "adverb")[0].definition
    //set adverb
    let verb = await axios.get('/prompts/word/random/verb')
    finalWords.verb = verb.data.word
    finalWords.verbDefinition = verb.data.results.filter(result => result.partOfSpeech === "verb")[0].definition
    //set verb; WordsAPI should pull a verb in "run" state, so prompt should be written as "would run" or "could run" to keep grammar correct for singular and plural nouns.
    let nOne
    while (finalWords.nounOne === '') {
      nOne = await axios.get('/prompts/word/random/noun')
      let nounCheck = await axios.get(`prompts/word/validate/${nOne.data.word}`)
      finalWords.nounOne = nounCheckMeaningCloud(nounCheck.data).noun
      finalWords.nounOneForm = nounCheckMeaningCloud(nounCheck.data).form
    } //gets random noun and performs check; will start from the beginning if it is an invalid noun
    finalWords.nounOneDefinition = nOne.data.results.filter(result => result.partOfSpeech === "noun")[0].definition
    let nTwo
    while (finalWords.nounTwo === '') {
      nTwo = await axios.get('/prompts/word/random/noun')
      let nounCheck = await axios.get(`prompts/word/validate/${nTwo.data.word}`)
      finalWords.nounTwo = nounCheckMeaningCloud(nounCheck.data).noun
      finalWords.nounTwoForm = nounCheckMeaningCloud(nounCheck.data).form
    } //gets random noun and performs check; will start from the beginning if it is an invalid noun
    finalWords.nounTwoDefinition = nTwo.data.results.filter(result => result.partOfSpeech === "noun")[0].definition
    dispatch(getPrompt(finalWords))
  } catch (err) {
    console.error(err)
  }
}

/**
 * REDUCER
 */
export default function(state = defaultPrompt, action) {
  switch (action.type) {
    case GET_PROMPT:
      return action.prompt
    default:
      return state
  }
}

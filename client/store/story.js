import axios from 'axios'

/**
 * ACTION TYPES
 */
const GET_STORY = 'GET_STORY'
// const CREATE_NEW_STORY = 'NEW_STORY'
const EDIT_STORY = 'EDIT_STORY'

/**
 * INITIAL STATE
 */
const defaultStory = {}

/**
 * ACTION CREATORS
 */
const getStory = story => ({type: GET_STORY, story})

/**
 * THUNK CREATORS
 */

 export const getStoryThunk = id => {
  return async dispatch => {
    try {
      const {data} = await axios.get(`/api/stories/story/${id}`)
      dispatch(getStory(data))
    } catch (error) {
      console.log(error)
    }
  }
}

 export const createStoryThunk = () => {
  return async dispatch => {
    try {
      const {data} = await axios.get(`/api/stories/create`)
      dispatch(getStory(data))
    } catch (error) {
      console.log(error)
    }
  }
}

 export const editStoryThunk = (id, text) => {
  return async dispatch => {
    try {
      const {data} = await axios.put(`/api/stories/story/${id}`, text)
      dispatch(getStory(data))
    } catch (error) {
      console.log(error)
    }
  }
}




//WORKFLOW:
//1. Start with predefined sentence: `Write a story about ${adjective} ${noun} that ${adverb} ${verb}
//2. Adjective and adverb shouldn't make any difference
//3. Get random noun and, all within a while loop, run it through meaning cloud (you'll need to put it in as "a%20noun" to make sure the api is looking at the noun version of the word if there is one). If the form is common singular, set an outside variable to "single", set a noun variable to be "a [noun]" or "an [noun]", depending on first letter, and get out of the loop. If word is plural, set variable to "plural", set word to noun variable, and get out of loop. If neither of those checks out, stay in the while loop.
//Outside of the while loop, you'll want to create a recursive function to navigate through the tiers of the meaning cloud response. You'd send in res.body and for each other recursion, you'd pass in the token_list.
//4. Based on the "single" or "plural" variable, this will determine which type of verb to search for. All sentences can be a consistent tense.

// const nounCheckMeaningCloud = body => {
//   //This is a helper function to determine if the noun is valid to use, and what form it is
//   console.log('in helper function, before anything')
//   if (body.analysis_list) {
//     //First base is if there is an analysis_list field, which will include what we want
//     console.log('body analysis list tag', body.analysis_list[0])
//     console.log('regex result', /NC-S/.test(body.analysis_list[0].tag))
//     if (/NC-S/.test(body.analysis_list[0].tag)) {
//       return {noun: body.form, form: 'singular'}
//       //If word is singular noun, return the word and form to set on the state
//     } else if (/NC-P/.test(body.analysis_list[0].tag)) {
//       return {noun: body.form, form: 'plural'}
//       //same as above, except for plural
//     }
//   }
//   if (!body.token_list) {
//     return {noun: '', form: ''}
//     //if it hasn't returned yet, second base case is if there are no more token lists to check. in that case, the while loop will start over
//   } else {
//     return nounCheckMeaningCloud(body.token_list[body.token_list.length - 1])
//     //otherwise, move down the token lists
//   }
// } //end of helper function

// export const setPrompt = () => async dispatch => {
//   //reducer to be called whenever prompt being generated
//   try {
//     let finalWords = {
//       nounOne: '',
//       nounOneForm: '',
//       nounOneDefinition: '',
//       nounTwo: '',
//       nounTwoForm: '',
//       nounTwoDefinition: '',
//       verb: '',
//       verbDefinition: '',
//       adjective: '',
//       adjectiveDefinition: '',
//       adverb: '',
//       adverbDefinition: ''
//     }
//     //define initial state; maybe set this as the default state?
//     let adj = await axios.get('/prompts/word/random/adjective')
//     finalWords.adjective = adj.data.word
//     console.log(adj)
//     finalWords.adjectiveDefinition = adj.data.results.filter(result => result.partOfSpeech === "adjective")[0].definition
//     //set adjective
//     let adv = await axios.get('/prompts/word/random/adverb')
//     finalWords.adverb = adv.data.word
//     finalWords.adverbDefinition = adv.data.results.filter(result => result.partOfSpeech === "adverb")[0].definition
//     //set adverb
//     let verb = await axios.get('/prompts/word/random/verb')
//     finalWords.verb = verb.data.word
//     finalWords.verbDefinition = verb.data.results.filter(result => result.partOfSpeech === "verb")[0].definition
//     //set verb; WordsAPI should pull a verb in "run" state, so prompt should be written as "would run" or "could run" to keep grammar correct for singular and plural nouns.
//     let nOne
//     while (finalWords.nounOne === '') {
//       nOne = await axios.get('/prompts/word/random/noun')
//       let nounCheck = await axios.get(`prompts/word/validate/${nOne.data.word}`)
//       finalWords.nounOne = nounCheckMeaningCloud(nounCheck.data).noun
//       finalWords.nounOneForm = nounCheckMeaningCloud(nounCheck.data).form
//     } //gets random noun and performs check; will start from the beginning if it is an invalid noun
//     finalWords.nounOneDefinition = nOne.data.results.filter(result => result.partOfSpeech === "noun")[0].definition
//     let nTwo
//     while (finalWords.nounTwo === '') {
//       nTwo = await axios.get('/prompts/word/random/noun')
//       let nounCheck = await axios.get(`prompts/word/validate/${nTwo.data.word}`)
//       finalWords.nounTwo = nounCheckMeaningCloud(nounCheck.data).noun
//       finalWords.nounTwoForm = nounCheckMeaningCloud(nounCheck.data).form
//     } //gets random noun and performs check; will start from the beginning if it is an invalid noun
//     finalWords.nounTwoDefinition = nTwo.data.results.filter(result => result.partOfSpeech === "noun")[0].definition
//     dispatch(getPrompt(finalWords))
//   } catch (err) {
//     console.error(err)
//   }
// }

/**
 * REDUCER
 */
export default function(state = defaultStory, action) {
  switch (action.type) {
    case GET_STORY:
      return action.story
    case EDIT_STORY:
      return { ...state, text: action.story}
    default:
      return state
  }
}
// export default function(state = defaultPrompt, action) {
//   switch (action.type) {
//     case GET_PROMPT:
//       return action.prompt
//     default:
//       return state
//   }
// }

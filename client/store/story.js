import axios from 'axios'

/**
 * ACTION TYPES
 */
const GET_STORY = 'GET_STORY'
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

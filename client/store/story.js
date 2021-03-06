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
      const {data} = await axios.post(`/api/stories`)
      dispatch(getStory(data))
      return data.id
    } catch (error) {
      console.log(error)
    }
  }
}

export const editStoryThunk = (id, text) => {
  return async dispatch => {
    try {
      const {data} = await axios.put(`/api/stories/${id}`, text)
      dispatch(getStory(data))
    } catch (error) {
      console.log(error)
    }
  }
}

export const clearStoryThunk = (story, user) => {
  return async dispatch => {
    try {
      await axios.delete(
        `/api/stories/rtf/${user.username.split(' ').join('_')}_${story.id}`
      )
      dispatch(getStory(defaultStory))
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
      return {...state, text: action.story}
    default:
      return state
  }
}

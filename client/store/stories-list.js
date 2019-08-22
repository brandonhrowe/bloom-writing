import axios from 'axios'

/**
 * ACTION TYPES
 */
const GET_STORIES = 'GET_STORIES'

/**
 * INITIAL STATE
 */
const defaultStories = []

/**
 * ACTION CREATORS
 */
const getStories = stories => ({type: GET_STORIES, stories})

/**
 * THUNK CREATORS
 */

 export const getStoriesThunk = () => {
  return async dispatch => {
    try {
      const {data} = await axios.get(`/api/stories`)
      dispatch(getStories(data))
    } catch (error) {
      console.log(error)
    }
  }
}

/**
 * REDUCER
 */
export default function(state = defaultStories, action) {
  switch (action.type) {
    case GET_STORIES:
      return action.stories
    default:
      return state
  }
}

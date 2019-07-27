import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {logout, createStoryThunk} from '../store'
import history from '../history'

class Navbar extends Component {
  constructor() {
    super()
    this.state = {
      promptLoad: 0
    }
    this.handleNewStory = this.handleNewStory.bind(this)
  }

  async handleNewStory() {
    this.setState({
      promptLoad: 1
    })
    const newStoryId = await this.props.createNewStory()
    history.push(`/story/${newStoryId}`)
    this.setState({
      promptLoad: 0
    })
  }

  render() {
    const {handleLogout, isLoggedIn} = this.props
    const {promptLoad} = this.state
    return (
      <nav className="nav-top-container">
        {isLoggedIn ? (
          <div className="dropdown-container">
            <div className="dropdown-options">
              <div className="title" onClick={() => history.push('/home')}>
                BLOOM<br /> WRITING
              </div>
              <div className="dropdown room-of-ones-own">
                <button
                  type="button"
                  className="dropbtn"
                  onClick={() => history.push('/home')}
                >
                  A Room of One's Own <i className="arrow down" />
                </button>
                <div className="dropdown-content">
                  <div onClick={this.handleNewStory}>Start a New Story</div>
                  <div onClick={() => history.push('/yourstories')}>
                    See Your Stories
                  </div>
                </div>
              </div>
              <div className="dropdown metamorphoses">
                <button type="button" className="dropbtn">
                  Metamorphoses (Coming Soon)
                </button>
              </div>
              <a href="#" onClick={handleLogout}>
                Logout
              </a>
            </div>
            <h4 className="promptLoad" style={{opacity: promptLoad}}>
              Waiting for Godot. Or a prompt. Whichever comes first...
            </h4>
          </div>
        ) : (
          <div className="login-signup">
            <h1 onClick={() => history.push('/home')}>
              BLOOM<br /> WRITING
            </h1>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </div>
        )}
      </nav>
    )
  }
}
const mapState = state => {
  return {
    isLoggedIn: !!state.user.id
  }
}
const mapDispatch = dispatch => {
  return {
    handleLogout() {
      dispatch(logout())
    },
    createNewStory: () => {
      return dispatch(createStoryThunk())
    }
  }
}
export default connect(mapState, mapDispatch)(Navbar)

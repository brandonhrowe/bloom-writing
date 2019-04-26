import io from 'socket.io-client'
import {EventEmitter} from 'events'
const events = new EventEmitter()

const socket = io(window.location.origin)

const textField = document.createElement('textarea')

const writing = (letter, shouldBroadcast = true) => {
  textField.innerHTML = textField.innerHTML.concat(letter)
  shouldBroadcast && events.emit('type', letter)
}

const setupTextField = () => {
  textField.addEventListener('keypress', event => {
    event.preventDefault()
    let letter = event.key
    console.log("text to return", letter)
    writing(letter)
  })
}

const setup = () => {
  document.body.appendChild(textField)
  setupTextField()
}

socket.on('connect', () => {
  console.log('I have made a persistent two-way connection to the server!')
  socket.emit('join-text', 'prompt')
})

socket.on('load', story => {
  console.log('loading story', story)
  writing(story, false)
})

socket.on('type-from-server', text => {
  console.log("in type-from-server. Text:", text)
  writing(text, false)
})

events.on('type', text => {
  console.log('events.on type called. Text:', text)
  socket.emit('type-from-client', 'prompt', text)
})

document.addEventListener('DOMContentLoaded', setup)

export default socket

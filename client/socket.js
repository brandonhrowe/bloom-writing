import io from 'socket.io-client'
import {EventEmitter} from 'events'
const events = new EventEmitter()

const socket = io(window.location.origin)

const textField = document.createElement('textarea')

const setup = () => {
  document.body.appendChild(textField)
}

const writing = (text, index, shouldBroadcast = true) => {
  console.log('in writing function callback')
  shouldBroadcast &&
  events.emit('type', text, index);
}

events.on('type', console.log)

socket.on('connect', () => {
  console.log('I have made a persistent two-way connection to the server!')
  socket.emit('join-text', prompt)
})

socket.on('load', words => {
  words.forEach(letter => {
    const {text, index} = letter
    writing(text, index, false)
  })
})

socket.on('type', (text, index) => {
  writing(text, index, false)
})

// textField.on('type', (text, index) => {
//   socket.emit('type', text, index)
// })

document.addEventListener('DOMContentLoaded', setup)

export default socket

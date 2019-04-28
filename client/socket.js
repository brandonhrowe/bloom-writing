// import io from 'socket.io-client'
// import {EventEmitter} from 'events'
// const events = new EventEmitter()

// const socket = io(window.location.origin)

// const textField = document.createElement('textarea')
// textField.classList.add('story')
// //Can hopefully just define this in React component instead and add event listeners there.
// //In order to do this, will first have to wait until component renders; otherwise, socket cannot find textarea. Some of this should probably be moved to a reducer.

// const writing = (letter, shouldBroadcast = true) => {
//   textField.innerHTML = textField.innerHTML.concat(letter)
//   shouldBroadcast && events.emit('type', letter)
// }

// const setupTextField = () => {
//   textField.addEventListener('keypress', event => {
//     //need to modify this so that it handles any modification to text
//     event.preventDefault()
//     let letter = event.key
//     writing(letter)
//   })
// }

// const setup = () => {
//   document.body.appendChild(textField)
//   setupTextField()
// }

// socket.on('connect', () => {
//   console.log('I have made a persistent two-way connection to the server!')
//   socket.emit('join-text', 'prompt')
// })

// socket.on('load', story => {
//   writing(story, false)
// })

// socket.on('type-from-server', text => {
//   writing(text, false)
// })

// events.on('type', text => {
//   socket.emit('type-from-client', 'prompt', text)
// })

// document.addEventListener('DOMContentLoaded', setup)

// export default socket


// //all the below was in the Story component when attempting to setup sockets

// //this.state =       endpoint: window.location.origin,


// this.uniqueId = Math.floor(Math.random() * 10000000000)
// //Will need to update this if there are users
// this.socket = socketIOClient(this.state.endpoint)

// this.socket.on('connect', async () => {
//   console.log(
//     `I have made a persistent two-way connection to the server! with React! This is my uniqueId: ${
//       this.uniqueId
//     }`
//   )
//   //Will have to modify this for sockets so that it doesn't automatically generate a new prompt and thusly a new room
//   // const {data} = await axios.get('/prompts')
//   // this.setState({
//   //   prompt: data
//   // })
//   this.socket.emit('join-text', this.state.prompt, this.uniqueId)
// })

// this.socket.on('load', (story, uniqueId) => {
//   console.log('loading story', story)
//   this.writing(story, uniqueId, false)
// })

// this.socket.on('type-from-server', (data, uniqueId, event) => {
//   console.log('data and event from update in client', data, event)
//   this.writing(data, uniqueId, false, event)
//   // const content = JSON.parse(data)
//   // const {uniqueId, content: ops} = content
//   // if (ops !== null && this.uniqueId !== uniqueId) {
//   //   setTimeout(() => {
//   //     this.ck.applyOperations(ops)
//   //   })
//   // }
// })

//     // events.on('change:data', text => {
//     //   console.log('this.events.on change:data called. text:', text)
//     //   this.socket.emit('type-from-client', this.state.prompt, text)
//     // })
//     // this.send = this.send.bind(this)


//   // send = content => {
//   //   const data = JSON.stringify({content, uniqueId: this.uniqueId})
//   //   this.socket.emit('update', data)
//   // }

//   // onChange = change => {
//   //   const ops = change.operations
//   //     .filter(o => o.type !== 'set_selection' && o.type !== 'set_text')
//   //     .toJS()
//   //   if (ops.length > 0) {
//   //     this.send(ops)
//   //   }

//   writing(text, uniqueId, shouldBroadcast = true, event) {
//     // if (this.uniqueId !== uniqueId) {
//     this.setState({
//       text
//     })
//     // }
//     events.emit('type', text)
//     // if (shouldBroadcast) {
//     //   console.log('shouldBroadcast is true, events.emitting type')
//     //   events.emit('type', text)
//     // }
//   }

//   update(event, editor) {
//     // event.preventDefault()
//     const data = editor.getData()
//     this.setState({
//       length: data.split(' ').length
//     })
//     this.socket.emit(
//       'type-from-client',
//       this.state.prompt,
//       data,
//       this.uniqueId,
//       event
//     )
//   }


  // handleTextChange(event) {
  //   event.preventDefault()
  //   let text = event.target.text
  //   console.log('text to return', text)
  //   writing(text)
  // }

  // socket.on('connect', () => {
  //   console.log('I have made a persistent two-way connection to the server!')
  //   socket.emit('join-text', 'prompt')
  // })

  // socket.on('load', story => {
  //   console.log('loading story', story)
  //   writing(story, false)
  // })

  // socket.on('type-from-server', text => {
  //   console.log('in type-from-server. Text:', text)
  //   writing(text, false)
  // })

  // events.on('type', text => {
  //   console.log('events.on type called. Text:', text)
  //   socket.emit('type-from-client', 'prompt', text)
  // })

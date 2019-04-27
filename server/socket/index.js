const stories = {}
const getStories = prompt => {
  if (stories[prompt] === undefined) {
    stories[prompt] = 'Write your story here!'
  }
  return stories[prompt]
}
//These should probably be moved to a reducer...
//Reducer should have array of all currently exitsing prompt/story pairs, and load the specific one once it has been created/selected.

module.exports = io => {
  io.on('connection', socket => {
    console.log(`A socket connection to the server has been made: ${socket.id}`)
    socket.on('connect', () => {
      console.log(`Client ${socket.id} is connected`)
    })
    socket.on('join-text', (prompt) => {
      socket.join(prompt);
      const story = getStories(prompt);
      socket.emit('load', story)
    })

    // socket.on('type-from-client', (prompt, text) => {
    //   console.log('type-from-client called. Text:', text)
    //   let story = getStories(prompt);
    //   stories[prompt] = story.concat(text);
    //   socket.broadcast.to(prompt).emit('type-from-server', text);
    // });
    socket.on('type-from-client', (prompt, content, event) => {
      stories[prompt] = content
      socket.broadcast.to(prompt).emit('type-from-server', content, event)
    })

    socket.on('disconnect', () => {
      console.log(`Connection ${socket.id} has left the building`)
    })
  })
}

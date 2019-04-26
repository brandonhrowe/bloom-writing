const stories = {}
const getStories = prompt => {
  if (stories[prompt] === undefined) {
    stories[prompt] = ''
  }
  return stories[prompt]
}

module.exports = io => {
  io.on('connection', socket => {
    console.log(`A socket connection to the server has been made: ${socket.id}`)
    socket.on('connect', () => {
      console.log(`Client ${socket.id} is connected`)
    })
    socket.on('join-text', (prompt) => {
      console.log("in join-text")
      socket.join(prompt);
      const story = getStories(prompt);
      console.log(prompt, story)
      socket.emit('load', story)
    })

    socket.on('type-from-client', (prompt, text) => {
      console.log('type-from-client called. Text:', text)
      let story = getStories(prompt);
      stories[prompt] = story.concat(text);
      socket.broadcast.to(prompt).emit('type-from-server', text);
    });

    socket.on('disconnect', () => {
      console.log(`Connection ${socket.id} has left the building`)
    })
  })
}

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
    socket.on('join-story', (prompt) => {
      socket.join(prompt);
      const story = getStories(prompt);
      socket.emit('replay-story', story)
    })

    socket.on('type-from-client', (prompt, text, index) => {
      let story = getStories(prompt);
      story = story.concat(text);
      socket.broadcast.to(prompt).emit('type-from-server', text, index);
    });

    socket.on('disconnect', () => {
      console.log(`Connection ${socket.id} has left the building`)
    })
  })
}

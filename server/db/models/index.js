const User = require('./user')
const Story = require('./story')

Story.belongsTo(User)
User.hasMany(Story)

module.exports = {
  User, Story
}

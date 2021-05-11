const Sequelize = require('sequelize')
const db = require('../db')

const Story = db.define('story', {
  prompt: {
    type: Sequelize.STRING,
    allowNull: false
  },
  text: {
    type: Sequelize.TEXT,
    defaultValue: ''
  },
  length: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  }
})

Story.afterCreate(story => {
  story.length = story.text ? story.text.split(' ').length : 0
})

module.exports = Story

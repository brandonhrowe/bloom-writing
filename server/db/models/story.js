const Sequelize = require('sequelize')
const db = require('../db')

const Story = db.define('story', {
  prompt: {
    type: Sequelize.STRING,
    allowNull: false
  },
  text: {
    type: Sequelize.TEXT,
    defaultValue: 'Start your story here!'
  },
  length: {
    type: Sequelize.INTEGER,
    defaultValue: 4
  }
})

Story.afterCreate(story => {
  story.length = story.text.split(' ').length
})

module.exports = Story

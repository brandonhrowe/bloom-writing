const Sequelize = require('sequelize')
const db = require('../db')

const Sentence = db.define('sentence', {
  text: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

module.exports = Sentence

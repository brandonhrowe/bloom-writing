/* global describe beforeEach it */

const {expect} = require('chai')
const db = require('../index')
const User = db.model('user')
const Story = db.model('story')

describe('Story model', () => {
  beforeEach(() => {
    return db.sync({force: true})
  })

  describe('valid fields', () => {
    let cody
    let story
    beforeEach(async () => {
      cody = await User.create({
        email: 'cody@puppybook.com',
        username: 'Cody',
        password: 'bones'
      })
      story = await Story.create({
        prompt: "Write a story about two cities",
        text: "It was the best of times, it was the worst of times..."
      })
      story.setUser(cody)
    })

    it('contains the prompt and text fields passed in', () => {
      expect(story.prompt).to.equal("Write a story about two cities")
      expect(story.text).to.equal("It was the best of times, it was the worst of times...")
    })

    it('belongs to user', () => {
      expect(story.userId).to.equal(cody.id)
    })

    it('automatically calculates the correct length value based on text', () => {
      expect(story.length).to.equal(12)
    })

    it ('throws an error when there is no prompt', async () => {
      let badStory = await Story.build({
        prompt: null,
        text: "What am I supposed to write about?"
      })
      return badStory.validate().then(
        () => {
          throw new Error('validation should fail when prompt is null');
        },
        createdError => expect(createdError).to.be.an.instanceOf(Error)
      );
    })
  })
})

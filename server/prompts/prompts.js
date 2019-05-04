const router = require('express').Router()
const unirest = require('unirest')
const Sentencer = require('sentencer')
const nlp = require('compromise')
const randy = require('randy')

module.exports = router

router.get('/', async (req, res, next) => {
  try {
    let verb = await unirest
      .get(
        `https://wordsapiv1.p.rapidapi.com/words/?random=true&partOfSpeech=verb&letterPattern=^[A-Za-z]*$`
      )
      .header('X-RapidAPI-Host', 'wordsapiv1.p.rapidapi.com')
      .header('X-RapidAPI-Key', process.env.WORDS_API_KEY)
    verb = verb.body.word
    let verbPresentTense
    let verbPastTense
    let verbFutureTense
    if (
      nlp(verb)
        .verbs()
        .data().length
    ) {
      verbPresentTense = nlp(verb)
        .verbs()
        .toPresentTense()
        .out()
      verbPastTense = nlp(verb)
        .verbs()
        .toPastTense()
        .out()
      verbFutureTense = nlp(verb)
        .verbs()
        .toFutureTense()
        .out()
    }

    let adverb = await unirest
      .get(
        `https://wordsapiv1.p.rapidapi.com/words/?random=true&partOfSpeech=adverb&letterPattern=^[A-Za-z]*$`
      )
      .header('X-RapidAPI-Host', 'wordsapiv1.p.rapidapi.com')
      .header('X-RapidAPI-Key', process.env.WORDS_API_KEY)
    adverb = adverb.body.word
    const prompts = [
      `Write a story about {{ adjective }} {{ nouns }} that ${adverb} ${
        verbPastTense ? verbPastTense : verb
      } {{ nouns }}.`,
      `Write a story about {{ an_adjective }} {{ noun }} and a group of {{ nouns }}.`,
      `Write a story where the protagonist is {{ an_adjective }} {{ noun }} that wants to ${verb}.`,
      `Write a story where the first line is, "It was {{ an_adjective }}, {{ adjective }} night when the {{ nouns }} came..."`,
      `Write a story about the what it means to ${verb}, as told by {{ a_noun }}.`,
      `Write a story in the form of a stream-of-conscience, as experienced by {{ a_noun }}.`,
      `Write a story where, instead of speaking, the characters ${verb}.`,
      `Write a story consisting of only dialogue between {{ a_noun }} and {{ nouns }}.`,
      `Write a story about a city where {{ nouns }} ${verb} and the {{ nouns }} are {{ adjective }}.`,
      `Write a story that begins, "If on {{ a_noun }}'s night {{ a_noun }}..." `,
      `Write a story about {{ a_noun }} that lives in {{ a_noun }}.`
    ]
    const prompt = Sentencer.make(randy.choice(prompts))
    res.send(prompt)
  } catch (error) {
    next(error)
  }
})

// let text = 'For a long time I would go to bed early. Sometimes, the candle barely out, my eyes closed so quickly that I did not have time to tell myself: “I’m falling asleep.” And half an hour later the thought that it was time to look for sleep would awaken me; I would make as if to put away the book which I imagined was still in my hands, and to blow out the light; I had gone on thinking, while I was asleep, about what I had just been reading, but these thoughts had taken a rather peculiar turn; it seemed to me that I myself was the immediate subject of my book: a church, a quartet, the rivalry between François I and Charles V. This impression would persist for some moments after I awoke; it did not offend my reason, but lay like scales upon my eyes and prevented them from registering the fact that the candle was no longer burning. Then it would begin to seem unintelligible, as the thoughts of a previous existence must be after reincarnation; the subject of my book would separate itself from me, leaving me free to apply myself to it or not; and at the same time my sight would return and I would be astonished to find myself in a state of darkness, pleasant and restful enough for my eyes, but even more, perhaps, for my mind, to which it appeared incomprehensible, without a cause, something dark indeed.'
router.post('/suggestion', async (req, res, next) => {
  try {
    let {text} = await req.body
    text = text.replace('<p>', '')
    text = text.replace('</p>', '')
    //should also include other tags like spaces to remove
    const nouns = nlp(text)
      .nouns()
      .data()
      .map(nounObj => nounObj.main)
    const commonNounsIndex = nlp(text)
      .nouns()
      .hasPlural()
    const commonNouns = nouns.filter((noun, i) => commonNounsIndex[i])
    const properNouns = nouns.filter((noun, i) => !commonNounsIndex[i])
    const verbs = nlp(text)
      .verbs()
      .data()
      .map(verbObj => verbObj.conjugations.Infinitive)
    const tense = nlp(text)
      .verbs()
      .conjugation()[0]
    let suggestion
    const sentenceStarts = [
      'After that, ',
      'However, ',
      'And then, ',
      'Luckily, ',
      'Fortunately, ',
      'Unfortunately, ',
      'To the dismay of everyone, ',
      'But if one were to recall, '
    ]
    const suggestions = [
      `${
        properNouns.length ? randy.choice(properNouns) : 'the {{ noun }}'
      } proceeded to ${randy.choice(verbs)}.`,
      `the {{ noun }} was {{ adjective }}, waiting for ${
        commonNouns.length ? randy.choice(commonNouns) : '{{ nouns }}'
      }.`,
      `there were even more ${
        commonNouns.length ? randy.choice(commonNouns) : '{{ nouns }}'
      } on the way.`,
      `there was {{ an_adjective }} ${
        commonNouns.length ? randy.choice(commonNouns) : '{{ nouns }}'
      }`
    ]

    if (tense === 'Past') {
      suggestion = nlp(
        Sentencer.make(
          `${randy.choice(sentenceStarts)}
          ${randy.choice(suggestions)}`
        )
      )
        .sentences()
        .toPastTense()
        .out()
    } else if (tense === 'Present') {
      suggestion = nlp(
        Sentencer.make(
          `${randy.choice(sentenceStarts)}
          ${randy.choice(suggestions)}`
        )
      )
        .sentences()
        .toPresentTense()
        .out()
    } else if (tense === 'Future') {
      suggestion = nlp(
        Sentencer.make(
          `${randy.choice(sentenceStarts)}
          ${randy.choice(suggestions)}`
        )
      )
        .sentences()
        .toFutureTense()
        .out()
    }
    res.send(suggestion)
  } catch (error) {
    next(error)
  }
})

router.get('/word/random/:pos', async (req, res, next) => {
  try {
    let {pos} = req.params
    await unirest
      .get(
        `https://wordsapiv1.p.rapidapi.com/words/?random=true&partOfSpeech=${pos}&letterPattern=^[A-Za-z]*$`
      )
      .header('X-RapidAPI-Host', 'wordsapiv1.p.rapidapi.com')
      .header('X-RapidAPI-Key', process.env.WORDS_API_KEY)
      .end(result => {
        res.json(result.body)
      })
  } catch (err) {
    next(err)
  }
})

router.get('/word/validate/:word', async (req, res, next) => {
  try {
    let meaningcloudURL = `https://api.meaningcloud.com/parser-2.0?key=${
      process.env.MEANING_CLOUD_API_KEY
    }&of=json&lang=en&txt=a%20${req.params.word}&uw=y&tt=e`
    //The query is for "a noun" instead of just noun to assure that Meaning Cloud is referring to the noun definition of a word if it has multiple meanings.
    await unirest
      .post(meaningcloudURL)
      .headers({
        'content-type': 'application/x-www-form-urlencoded'
      })
      .end(function(result) {
        res.send(result.body)
      })
  } catch (error) {
    next(error)
  }
})

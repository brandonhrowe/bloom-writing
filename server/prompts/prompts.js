const router = require('express').Router()
const unirest = require('unirest')
const Sentencer = require('sentencer')
const nlp = require('compromise')
const randy = require('randy')

module.exports = router

//forms in meaningcloud:
//NC-S = noun, common, singular
//NC-P = noun, common, plural
//AP = adjective, positive
//AS = adjective, superlative ('highest')
//VI-S3PPA = verb, indicative, singular, 3rd person, present, perfect, active ('has topped')
//VP---ASA-N = verb, participle, past, simple, active ('paid')
//VP---PSA-N = verb, participle, ('running')
//VI-UUASA-N = verb, indicative ('ran')
//VI-UUFSA-N = verb, future ('will run')

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
      `Write a story about {{ adjective }} {{ nouns }} that ${adverb} ${verbPastTense ? verbPastTense : verb} {{ nouns }}.`,
      `Write a story about {{ an_adjective }} {{ noun }} and a group of {{ nouns }}.`,
      `Write a story where the protagonist is {{ an_adjective }} {{ noun }} that wants to ${verb}.`,
      `Write a story where the first line is, "It was {{ an_adjective }}, {{ adjective }} night when the {{ nouns }} came..."`,
      `Write a story about the what it means to ${verb}, as told by {{ a_noun }}.`,
      `Write a story in the form of a stream-of-conscience, as experienced by {{ a_noun }}.`,
      `Write a story where, instead of speaking, the characters ${verb}.`,
      `Write a story consisting of only dialogue between {{ a_noun }} and {{ nouns }}.`
    ]
    const prompt = Sentencer.make(randy.choice(prompts))
    res.send(prompt)
  } catch (error) {
    next(error)
  }
})

router.get('/suggestion', async (req, res, next) => {
  try {
    let text = 'A dog lived with a cat. They had a pet.'

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
    Sentencer.configure({
      // nounList: [...nouns],
      // actions: {
      //   common_noun: () => {
      //     return randy.choice(commonNouns)
      //   },
      //   proper_noun: () => {
      //     return randy.choice(properNouns)
      //   },
      //   verb: () => {
      //     return randy.choice(verbs)
      //   }
      // }
    })
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
      'But if one to recall, '
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

    //also need better template suggestion sentences with more variety. look more at metaphorpsum
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

const router = require('express').Router()
const unirest = require('unirest')
const Sentencer = require('sentencer')
const nlp = require('compromise')

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

// const getRandomWord = async pos => {
//   await unirest
//     .get(
//       `https://wordsapiv1.p.rapidapi.com/words/?random=true&partOfSpeech=${pos}&letterPattern=^[A-Za-z]*$`
//     )
//     .header('X-RapidAPI-Host', 'wordsapiv1.p.rapidapi.com')
//     .header('X-RapidAPI-Key', process.env.WORDS_API_KEY)
//     .end(result => {
//       return result.body.word
//     })
// }

// Sentencer.configure({
//   verbList: ["wrestle"],
//   actions: {
//     verb_past: async () => {
//       const verb = await self.verbList[0]
//       console.log(verb)
//       return nlp(verb)
//         .verbs()
//         .toPastTense()
//         .out()
//     },
//     verb_present: async () => {
//       const verb = self.verbList[0]
//       return nlp(verb)
//         .verbs()
//         .toPresentTense()
//         .out()
//     },
//     verb_future: async () => {
//       const verb = self.verbList[0]
//       return nlp(verb)
//         .verbs()
//         .toFutureTense()
//         .out()
//     },
//     adverb: async () => {
//       const adverb = self.adverbList[0]
//       return adverb
//     }
//   }
// })

// router.get('/', async (req, res, next) => {
//   try {
//     // const verb = await getRandomWord('verb')
//     // console.log(verb)
//     // const adverb = await getRandomWord('adverb')
//     const verb = "wrestle"
//     await Sentencer.configure({
//       verbList: [verb],
//       // adverbList: [adverb]
//     })
//     const prompt = Sentencer.make(
//       'Write a story about {{ an_adjective }} {{ noun }} and several {{ nouns }} {{ verb_past }}.'
//     )
//     res.send(prompt)
//   } catch (error) {
//     next(error)
//   }
// })

router.get('/suggestion', async (req, res, next) => {
  try {
    let text =
      'Tomorrow a dog will live with a cat, and they were named Milo and Otis. They did many things together, such as swimming and fishing. They had a pet fish.'
    const initialNouns = nlp(text)
      .nouns()
      console.log(initialNouns)
    const nouns = initialNouns.filter(noun => nlp(noun).nouns().hasPlural())
      .data()
      .map(nounObj => nounObj.main)
      console.log(nouns)
      //need to figure out why filtering out only common nouns (by plural) isnt working
    Sentencer.configure({
      nounList: [...nouns]
    })
    const tense = nlp(text)
      .verbs()
      .conjugation()[0]
    let suggestion
    //also need better template suggestion sentences with more variety. look more at metaphorpsum
    if (tense === 'Past') {
      suggestion = nlp(
        Sentencer.make('And the {{ noun }} proceeded to do other things...')
      )
        .sentences()
        .toPastTense()
        .out()
    } else if (tense === 'Present') {
      suggestion = nlp(
        Sentencer.make('And the {{ noun }} proceeded to do other things...')
      )
        .sentences()
        .toPresentTense()
        .out()
    } else if (tense === 'Future') {
      suggestion = nlp(
        Sentencer.make('And the {{ noun }} proceeded to do other things...')
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

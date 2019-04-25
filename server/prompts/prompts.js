const router = require('express').Router()
const unirest = require('unirest')

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

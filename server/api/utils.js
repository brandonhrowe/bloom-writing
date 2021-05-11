const htmlToRtf = require('html-to-rtf')
const unirest = require('unirest')
const nlp = require('compromise')
const Sentencer = require('sentencer')
const randy = require('randy')
const path = require('path')

const wordsAPIBaseUrl = 'https://wordsapiv1.p.rapidapi.com'

/**
 * Generates an rtf text file and saves to the public/download folder
 * @param {Object} story
 * @param {Object} user
 * @returns {void}
 * */
const createDownloadFile = (story, user) => {
  // Creates rtf layout for file
  const html = `<div>
      <p style="font-size: 60px;" align="center"><i>${story.prompt}</i></p>
      <br/>
      <br/>
      <p align="center"><i>A story by ${user.username}</i></p>
      <br/>
      <br/>
      <p>${story.text}</p>
      </div>`
  // Saves file to public/download folder
  htmlToRtf.saveRtfInFile(
    path.join(
      __dirname,
      '..',
      '..',
      'public',
      'download',
      `${user.username.split(' ').join('_')}_${story.id}.rtf`
    ),
    htmlToRtf.convertHtmlToRtf(html)
  )
}

/**
 * Calls WordsAPI to get definition for text
 * @param {String} text
 * @returns {String} def
 * */
const fetchDefinition = async (text) => {
  try {
    const def = await unirest
      .get(`${wordsAPIBaseUrl}/words/${text}/definitions`)
      .header('X-RapidAPI-Host', 'wordsapiv1.p.rapidapi.com')
      .header('X-RapidAPI-Key', process.env.WORDS_API_KEY)
    return def
  } catch (error) {
    console.error('error fetching definition:', error)
  }
}

/**
 * Calls WordsAPI to get random word based on part of speech
 * @param {String} partOfSpeech
 * @returns {String} word
 * */
const fetchRandomWord = async (partOfSpeech) => {
  try {
    const res = await unirest
      .get(
        `${wordsAPIBaseUrl}/words/?random=true&partOfSpeech=${partOfSpeech}&letterPattern=^[A-Za-z]*$`
      )
      .header('X-RapidAPI-Host', 'wordsapiv1.p.rapidapi.com')
      .header('X-RapidAPI-Key', process.env.WORDS_API_KEY)
    return res.body.word
  } catch (error) {
    console.error('error fetching random word:', error)
  }
}

/**
 * Returns past, preset, and future variations of a verb
 * @param {String} verb
 * @returns {Object} object with verbPresentTense, verbPastTense, and verbFutureTense
 * */
const getVerbTenses = (verb) => {
  let verbPresentTense
  let verbPastTense
  let verbFutureTense

  if (nlp(verb).verbs().data().length) {
    verbPresentTense = nlp(verb).verbs().toPresentTense().out()
    verbPastTense = nlp(verb).verbs().toPastTense().out()
    verbFutureTense = nlp(verb).verbs().toFutureTense().out()
  }

  return {
    verbPresentTense,
    verbPastTense,
    verbFutureTense,
  }
}

/**
 * Returns a random first part of a sentence for a suggestion
 * @returns {String} suggestionStart
 * */
const getSuggestionStart = () => {
  const suggestionStarts = [
    'After that, ',
    'However, ',
    'And then, ',
    'Luckily, ',
    'Fortunately, ',
    'Unfortunately, ',
    'To the dismay of everyone, ',
    'But if one were to recall, ',
  ]

  return randy.choice(suggestionStarts)
}

/**
 * Returns a random body of a sentence for a suggestion
 * @param {Array} properNouns
 * @param {Array} commonNouns
 * @param {Array} verbs
 * @returns {String} suggestionBody
 * */
const getSuggestionBody = ({properNouns, commonNouns, verbs}) => {
  // Array of main clauses for suggestions, with the appropriate variables passed in. If it is unable to find any nouns pulled from Compromise, it will add new nouns from Sentencer.
  const suggestionBodies = [
    `${
      properNouns.length ? randy.choice(properNouns) : 'the {{ noun }}'
    } continue to ${verbs && verbs.length ? randy.choice(verbs) : 'write'}.`,
    `the {{ noun }} was {{ adjective }}, waiting for ${
      commonNouns.length ? randy.choice(commonNouns) : '{{ nouns }}'
    }.`,
    `there were even more ${
      commonNouns.length ? randy.choice(commonNouns) : '{{ nouns }}'
    } on the way.`,
    `there was {{ an_adjective }} ${
      commonNouns.length ? randy.choice(commonNouns) : '{{ nouns }}'
    }`,
  ]

  return randy.choice(suggestionBodies)
}

/**
 * Returns a random prompt
 * @param {String} adverb
 * @param {String} verb
 * @returns {String} prompt
 * */
const getRandomPrompt = ({adverb, verb}) => {
  const {verbPastTense} = getVerbTenses(verb)

  const prompts = [
    `Write a story about {{ adjective }} {{ nouns }} that ${adverb} ${
      verbPastTense ? verbPastTense : verb
    } {{ nouns }}.`,
    `Write a story about {{ an_adjective }} {{ noun }} and a group of {{ nouns }}.`,
    `Write a story where the protagonist is {{ an_adjective }} {{ noun }} that wants to ${verb}.`,
    `Write a story where the first line is, "It was {{ an_adjective }}, {{ adjective }} night when the {{ nouns }} came..."`,
    `Write a story about what it means to ${verb}, as told by {{ a_noun }}.`,
    `Write a story in the form of a stream-of-conscience, as experienced by {{ a_noun }}.`,
    `Write a story where, instead of speaking, the characters ${verb}.`,
    `Write a story consisting of only dialogue between {{ a_noun }} and {{ nouns }}.`,
    `Write a story about a city where {{ nouns }} ${verb} and the {{ nouns }} are {{ adjective }}.`,
    `Write a story that begins, "If on {{ a_noun }}'s night {{ a_noun }}..."`,
    `Write a story about {{ a_noun }} that lives in {{ a_noun }}.`,
  ]

  const prompt = Sentencer.make(randy.choice(prompts))

  return prompt
}

/**
 * Removes tags and extra spacing from text
 * @param {String} text
 * @returns {String} text
 * */
const stripText = (text) => {
  let result = text

  let regex1 = /(&nbsp;|<\/p>|<\/strong>|<\/i>|)/gm
  let regex2 = /(<p>|<strong>|<i>)/gm
  result = result.replace(regex1, '')
  result = result.replace(regex2, ' ')

  return result
}

/**
 * Returns arrays of common and proper nouns from text
 * @param {String} text
 * @returns {Object} arrays for commonNouns and properNouns
 * */
const getCommonAndProperNouns = (text) => {
  // Pulls all the nouns found in the text and saves them to an array
  const nouns = nlp(text)
    .nouns()
    .data()
    .map((nounObj) => nounObj.main)
  // Separates common nouns by checking if a plural version exists
  const commonNounsIndex = nlp(text).nouns().hasPlural()
  // Creates two new arrays for common and proper nouns
  const commonNouns = nouns.filter((noun, i) => commonNounsIndex[i])
  const properNouns = nouns.filter((noun, i) => !commonNounsIndex[i])

  return {
    commonNouns,
    properNouns,
  }
}

/**
 * Returns verbs and tense from those verbs from text
 * @param {String} text
 * @returns {Object} array for verbs and tense string
 * */
const getVerbsAndTense = (text) => {
  const originalVerbs = nlp(text).verbs()
  let verbs
  let tense
  if (originalVerbs && originalVerbs.length) {
    verbs = originalVerbs
      .data()
      .map((verbObj) => verbObj.conjugations.Infinitive)
    tense = originalVerbs.conjugation()[0]
  }
  return {
    verbs,
    tense,
  }
}

/**
 * Modifies text based on tense
 * @param {String} text
 * @param {String} tense
 * @returns {String} tense
 * */
const updateTextTense = (text, tense) => {
  let result = text
  // Depending on the tense in which the original text was written, it will modify the suggestion tense to match if possible.
  if (tense === 'Past') {
    result = nlp(
      Sentencer.make(text)
    )
      .sentences()
      .toPastTense()
      .out()
  } else if (tense === 'Future') {
    result = nlp(
      Sentencer.make(text)
    )
      .sentences()
      .toFutureTense()
      .out()
  } else {
    result = nlp(
      Sentencer.make(text)
    )
      .sentences()
      .toPresentTense()
      .out()
  }
  return result
}

/**
 * Generate suggestion sentence based on current text
 * @param {String} text
 * @returns {String} suggestion
 * */
const getSuggestion = (text) => {
  text = stripText(text)
  // Pulls all the nouns found in the text and saves them to an array
  const {commonNouns, properNouns} = getCommonAndProperNouns(text)
  // Pulls all the verbs found in the text and saves them to an array
  const {verbs, tense} = getVerbsAndTense(text)
  // Checks the tense in which the text has been written
  let suggestion = `${getSuggestionStart()}${getSuggestionBody({
    commonNouns,
    properNouns,
    verbs
  })}`

  suggestion = updateTextTense(suggestion, tense)

  return suggestion
}

module.exports = {
  createDownloadFile,
  fetchDefinition,
  fetchRandomWord,
  getRandomPrompt,
  getSuggestion
}

# Bloom Writing

Bloom Writing is a site designed for creative writing. The main feature is that, when the user starts up a new story, a randomly-generated prompt is given with which to start.

# Installation

First, fork the repo on Github here: https://github.com/brandonhrowe/bloom-writing

Then clone the repo to your computer:

```bash
git clone https://github.com/brandonhrowe/bloom-writing.git
```

Bloom requires an API key for proper use with the WordsAPI API. Once you have a key, save it to a secrets.js file in the project (which is included in the .gitignore so it won't be uploaded). The variable should be defined in the secrets.js as such:

```js
process.env.WORDS_API_KEY = "<YOUR_KEY_HERE>"
```

Note: the initial version of this project included calls to other API keys for the MeaningCloud API and Firebase. If any of the calls to these keys still exist in the code, they have no impact on the functionality and can be removed. Future versions will be sure to clean up this code.

Bloom is set up to use a Postgres database on the backend. Make sure you have postgres installed, and then run the following commands to create the database (and a test database should you want to make tests):

```bash
createdb bloom-writing

createdb bloom-writing-test
```

Install all of the dependencies:

```bash
npm install
```

Run the dev version:

```bash
npm run start-dev
```

# Usage

### Login

First, a user will need to either login or signup upon loading the site. This is to assure that any story they write is saved for them.

### Home

Upon login, the home page is loaded. Currently, there is only one "mode" of "A Room of One's Own" that is defaulted (more on the two modes below in Plans for the Future). In short, users are the sole author to their stories and only they can access them.

![User home page. At top, they would select the mode with which to use the program, then the buttons start up a new page or page list. In future versions, all options will be brought into the nav bar.](/public/Bloom_Home.png)

From the main page, the user can either start a new story or see all their past stories.

### Story

Upon loading a new story (which is automatically saved to the database), a random prompt is generated at the top of the page. Below that is a text editor for the user to write.

![Story page](/public/Bloom_Story_New.png)

Let's say a user has started a story, but they have reached a block. If they have not typed anything for a few seconds, a suggestion sentence will pop up in the bottom-left of the page, which will hopefully have some connection to what they've written so far. To not clutter the user's view, this suggestion will disappear after a few seconds.

![Suggestion sentence](/public/Bloom_Story_Suggestion.png)

Also, let's say a user doesn't know what a word in the prompt means. They can highlight a word and a list of definitions will be loaded into the bottom-right of the screen. Again, this will disappear after a few seconds to not bother the user as they write.

![Definition upon highlighting word in prompt](/public/Bloom_Story_Definition.png)

### List View

From the list view, the user can select one and return to wherever they last left off with that story.

![List view](/public/Bloom_List.png)

# Features

### Random Prompt

Upon loading up a new story, the user will also be given a random prompt.

This is done using a selection of template sentences and a combination of Sentencer, WordsAPI, and Compromise. Sentencer generates nouns and adjectives and gives the correct form of the word requested (ex. passing in the string "{{ a_noun }}" could give you "a bear" or "an elephant"). WordsAPI retrieves random verbs and adverbs, and then the values are passed into Compromise to mutate the form of the verb depending on the needs of the template (ex. convert "run" to "ran" for past tense).

### Suggestion Sentences

If the user has writen a bit (currently configured for a minimum of twenty words) and does not type for a while (currently configured for five seconds), they might need a suggestion for where to go next. The program will generate a suggested sentence utilizing information from what the user has already written.

This is done by using Compromise. The text within the editor is passed through Compromise to pick out all the nouns, verbs, and tense of the sentence. Then this data is parsed out to more templates and sent to the front end.

### Dictionary Definitions

When the user highlights a word within the prompt, the definitions for that word are generated.

When the prompt is clicked, an event listens for any text that is highlighted in the window. If there is text, it is sent to the WordsAPI and any definitions are sent back.

### Autosave

Stories are saved as they go. Whenever a user stops typing, the text is sent back to the database and the story is saved for future use.

### File Download

Users can now download their story as an .rtf (rich text format) file. This not only includes the text of the user's prompt and story, but also any styling they implemented, such as making parts bold or italicized. The download feature was implemented using the html-to-rtf node module in conjunction with the fs (File System) module. In order to manage files, an .rtf file is only created when on a specific story's page. It will update as the story is saved and will be ready as soon as the user selects the "Download" button. Once the component for the story is unmounted, that file is removed in order to avoid clutter.

# Technology

Bloom was build using the following technology:

### Compromise
For analyzing text and parsing out text by part of speech and form.

### Sentencer
For randomly generating nouns and adjectives, including the proper syntax.

### WordsAPI
For supplying randomly generated verbs and adverbs, as well as getting definitions.

### CKEditor
For a clean, rich-text area for writing that includes bold, italics, etc.

### html-to-rtf and fs
For converting the CKEditor's rich text into a text file and moderating which files should be created/removed at any time.

### Randy
For easily pulling random values from arrays.

### React
For components.

### Redux
For global state storage (some state elements are held in React components).

# Plans For the Future

### Multi-User Mode (Metamorphoses)

There will ideally be two methods with which to use Bloom: a solo writing experience called "A Room of One's Own", where the user is in charge of their own stories, and a realtime iteration called "Metamorphoses", where any number of people can join in on a story and create together.

Currently, only the first user experience is active. The issue that needs to be resolved with the second experience is sending info over Socket.io.

My initial attempts were sending the whole text back and forth, which created a feedback loop if typing too quickly. I'll need to instead find a way to just send actions over the sockets.

### Layout/Clean Up

Clean up the style a little bit more. Ideally, user should be able to access either a new story or story list from a dropdown menu, rather than having to go back to the home page.

### Improved Suggestions

While the current suggestions functionality works fairly well at detecting some information from the user's input, it could certainly be improved through either machine learning or other APIs.

### Synesketch

http://krcadinac.com/synesketch/

While not essential to the app, implementing this visual in the background, based off of the text written by the user, may be a nice feature.

### More Literary Puns

I Vonnegut all the puns.

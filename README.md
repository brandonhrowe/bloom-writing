# Bloom Writing

Hello! Welcome to Bloom Writing, a program made by Brandon Rowe.

The purpose of this site is to provide a platform for creative writing. When you open up a room, a randomly-generated prompt will be created in order to suggest a starting point.

#Features

-Randomly generates prompts using Sentencer and WordsAPI.
-Creates suggestions for a next sentence by parsing your own writing through Compromise.
-Dictionary lookup for any word in the prompt just by highlighting it, using WordsAPI's definitions.
-Automatically saves the story as it is written to a Postgres database for future use.

# Technology

Bloom was build using the following technology:

-Compromise, for analyzing text and parsing out text by part of speech and form.
-Sentencer, for randomly generating nouns and adjectives, including the proper syntax.
-WordsAPI, for supplying randomly generated verbs and adverbs, as well as getting definitions.
-CKEditor, for a clean, rich-text area for writing that includes bold, italics, etc.
-Randy, for easily pulling random values from arrays.

# Plans For the Future

These are a few features for Bloom that will hopefully be implemented soon:

-There will ideally be two methods with which to use Bloom: a solo writing experience called "A Room of One's Own", where the user is in charge of their own stories, and a realtime iteration called "Metamorphoses", where any number of people can join in on a story and create together. Currently, only the first user experience is active. The issue that needs to be resolved with the second experience is sending info over Socket.io. My initial attempts were sending the whole text back and forth, which created a feedback loop if typing too quickly. I'll need to instead find a way to just send actions over the sockets.
-Users should also be able to download their stories as a rich-text file.
-Clean up the style a little bit more, including a unique favicon.
-More literary puns!

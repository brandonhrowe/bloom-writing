import React from 'react'

const BottomContent = props => {
  const {
    suggestionVisibility,
    suggestion,
    definitionVisibility,
    definitionsError,
    definitions,
    addSuggestionToStory,
    clearSuggestion
  } = props
  return (
    <div className="bottom-content">
      <div className="suggestion" style={{opacity: suggestionVisibility}}>
        <h3>"{suggestion}"</h3>
        <button type="button" className="suggestion-button" onClick={() => addSuggestionToStory(suggestion)}>Add To Story</button>
        <button type="button" className="suggestion-button" onClick={clearSuggestion}>Clear</button>
      </div>
      <div className="definitions" style={{opacity: definitionVisibility}}>
        {definitionsError ? (
          <div>
            <div className="definition-for">
              Sorry, we cannot find a definition for that.
            </div>
          </div>
        ) : (
          <div>
            <div className="definition-for">
              Definitions for "{definitions.word}":
            </div>
            <div>
              {definitions.definitions.map(def => {
                return (
                  <div className="defItem" key={def.definition}>
                    <br />
                    <div className="part-of-speech">{def.partOfSpeech}</div>
                    <div className="definition">{def.definition}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BottomContent

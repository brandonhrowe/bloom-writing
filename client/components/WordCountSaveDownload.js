import React from 'react'

const WordCountSaveDownload = props => {
  const {length, saveVisibility, user, story} = props
  return (
    <div className="wordcount-save">
      <h4>Word Count: {length}</h4>
      <div className="save" style={{opacity: saveVisibility}}>
        Story has been saved
      </div>
      <div className="download">
        <a
          download
          href={`/download/${user.username.split(' ').join('_')}_${
            story.id
          }.rtf`}
        >
          <u>DOWNLOAD</u>
        </a>
      </div>
    </div>
  )
}

export default WordCountSaveDownload

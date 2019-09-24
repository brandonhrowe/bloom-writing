const {CronJob} = require('cron')
const fs = require('fs')
const path = require('path')
const fileDir = path.join(__dirname, '..', 'public', 'download')

const clearFiles = new CronJob(
  '0 0 */6 * * *',
  () => {
    const oneHourAgo = new Date().getTime() - 3600000
    fs.readdir(fileDir, (err, files) => {
      if (err) throw err
      files.forEach(file => {
        if (file !== '.gitkeep') {
          const filePath = path.join(fileDir, file)
          const birthtime = fs.statSync(filePath).birthtime.getTime()
          if (birthtime < oneHourAgo) {
            fs.unlinkSync(filePath)
          }
        }
      })
    })
  },
  null,
  true
)

module.exports = clearFiles

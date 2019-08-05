const express = require('express')
const spider = require('./spider/index.js')
const app = express()

app.get('/', (req, res) => {
  res.send('Hello world!')
})

let server = app.listen(8787, 'localhost', () => {
  let host = server.address().address
  let port = server.address().port

  console.log('Running at http://%s:%s', host, port)
})

spider.createTables()
spider.crawlCategoryPage()
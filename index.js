const express = require('express')
const spider = require('./spider/index.js')

const app = express()
spider.crawling()

app.get('/', (req, res) => {
  res.send('Hello world!')
})

let server = app.listen(7777, 'localhost', () => {
  let host = server.address().address
  let port = server.address().port

  console.log('Running at http://%s:%s', host, port)
})

const express = require('express')
const bodyParser = require('body-parser')
const router = require('./router/index.js')
const app = express()

app.use(bodyParser.json())
app.use('/api', router)
app.use(express.static('public'))

let server = app.listen(8787, 'localhost', () => {
  let host = server.address().address
  let port = server.address().port

  console.log('Running at http://%s:%s', host, port)
})
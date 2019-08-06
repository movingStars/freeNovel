const express = require('express')
const router = require('./router/index.js')
const app = express()

app.use('/api', router)

let server = app.listen(8787, 'localhost', () => {
  let host = server.address().address
  let port = server.address().port

  console.log('Running at http://%s:%s', host, port)
})
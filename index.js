const express = require('express')
const bodyParser = require('body-parser')
const router = require('./router/index.js')
const app = express()
const boom = require('boom')

app.use(bodyParser.json())
app.use(express.static('public'))
app.use('/api', router)
app.all('*', (req, res, next) => {
  next(boom.notFound('404 - Not Found'))
})

app.use((err, req, res, next) => {
  if (err.isServer) {
    console.log(err)
  }
  next()
  return res.status(err.output.statusCode).json(err.output.payload)
})

let server = app.listen(8787, 'localhost', () => {
  let host = server.address().address
  let port = server.address().port

  console.log('Running at http://%s:%s', host, port)
})
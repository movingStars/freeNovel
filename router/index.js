const express = require('express')
const router = express.Router()

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})

router.get('/best-list', (req, res) => {
  console.log(res.getHeaders('Content-Type'))
  res.send('Hello word!')
})

module.exports = router
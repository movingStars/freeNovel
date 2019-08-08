const express = require('express')
const router = express.Router()
const { getBestList, getNovelInfo } = require('../models/novels.js')

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})

router.get('/best-list', getBestList)
router.get('/novel-info', getNovelInfo)

module.exports = router
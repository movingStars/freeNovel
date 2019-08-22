const express = require('express')
const router = express.Router()
const boom = require('boom')
const { getCategoryList } = require('../models/category.js')
const { saveSearchHistory, getPublicHistory } = require('../models/history.js')
const { wxLogin, getUserInfo, updateUserInfo } = require('../models/users.js')
const { addBook, getBookshelfList } = require('../models/bookShelf.js')
const { 
  getBestList,
  getNovelInfo,
  getChapterContent,
  getChapterList,
  getNovelList,
  searchNovels,
  getPublicSearchNovels
} = require('../models/novels.js')

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})

router.use((req, res, next) => {
  const token = req.headers.authorization ? req.headers.authorization.slice(6) : ''

  if (!token) {
    const black_path = ['/update-userinfo']

    if (black_path.includes(req.path)) {
      next(boom.forbidden('403 - please log in first'))
    } else {
      next()
    }
  } else {
    req.authorization = token
    next()
  }
})

router.get('/best-list', getBestList)
router.get('/novel-info', getNovelInfo)
router.get('/chapter-content', getChapterContent)
router.get('/chapter-list', getChapterList)
router.get('/category-list', getCategoryList)
router.get('/novel-list', getNovelList)
router.get('/search-novels', searchNovels)
router.get('/public-history', getPublicHistory)
router.get('/public-search-novels', getPublicSearchNovels)
router.get('/user-info', getUserInfo)
router.get('/bookshelf-list', getBookshelfList)

router.post('/public-search', saveSearchHistory)
router.post('/wx-login', wxLogin)
router.post('/update-userinfo', updateUserInfo)
router.post('/add-book', addBook)

router.all('*', (req, res, next) => {
  next(boom.notFound('404 - Not Found'))
})

module.exports = router
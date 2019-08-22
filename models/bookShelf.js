const db = require('../server.js')
const boom = require('boom')
const { handleBadRequest } = require('./errorHandle.js')

module.exports = {
  addBook: function (req, res, next) {
    const userToken = req.authorization || ''
    const novelId = req.body.novelId
    if (!handleBadRequest({novelId}, next)) return null
    const sql = `insert into book_shelf (user_token, novel_id) values ('${userToken}', ${novelId})`

    db.query(sql, (err) => {
      if (err) {
        next(boom.badImplementation('500 - 数据插入失败', { err }))
      } else {
        res.send('加入成功')
      }
    })
  },
  getBookshelfList: function (req, res, next) {
    const token = req.authorization || ''
    const sql = `select n.id, n.logo_url, n.name from 
      (select * from novels where id in 
      (select novel_id from book_shelf where user_token = '${token}')) as n;`
    
    db.query(sql, (err, result) => {
      if (err) {
        next(boom.badImplementation('500 - 数据库查询失败', { err }))
      } else {
        res.send(result)
      }
    })
  }
}
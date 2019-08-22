const db = require('../server.js')
const boom = require('boom')

module.exports = {
  saveCategory: function (categoryNames) {
    let sql = 'insert into category(name, url) values ?'
    
    db.query(sql, [categoryNames], (err, result) => {
      if (err) {
        console.log(`插入 分类 数据失败 - ${err}`)
      } else {
        console.log(`插入 分类 数据成功 - ${JSON.stringify(result)}`)
      }
    })
  },
  getCategoryData: function (cb = () => {}) {
    let sql = 'select * from category;'

    db.query(sql, (err, result) => {
      if (err) {
        console.log(`查询 分类 数据失败 - ${err}`)
      } else {
        console.log('查询 分类 数据成功')
        cb(result)
      }
    })
  },
  getCategoryList: function (req, res, next) {
    const sql = 'select id,name from category;'

    db.query(sql, (err, result) => {
      if (err) {
        next(boom.badImplementation('500 - 数据库查询失败', { err }))
      } else {
        res.send(result)
      }
    })
  }
}
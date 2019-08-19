const db = require('../server.js')

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
  getCategoryList: function (req, res) {
    const sql = 'select id,name from category;'

    db.query(sql, (err, result) => {
      if (err) {
        res.send({
          status: 500,
          message: '数据库查询失败'
        })
      } else {
        res.send(result)
      }
    })
  }
}
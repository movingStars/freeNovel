const db = require('../server.js')

module.exports = {
  addBook: function (req, res) {
    const userToken = req.authorization || ''
    const novelId = req.body.novelId
    const sql = `insert into book_shelf (user_token, novel_id) values ('${userToken}', ${novelId})`

    db.query(sql, (err) => {
      if (err) {
        console.log(err)
        res.send({
          code: '500',
          message: '数据插入失败'
        })
      } else {
        res.send('加入成功')
      }
    })
  },
  getBookshelfList: function (req, res) {
    const token = req.authorization || ''
    const sql = `select n.id, n.logo_url, n.name from 
      (select * from novels where id in 
      (select novel_id from book_shelf where user_token = '${token}')) as n;`
    
    db.query(sql, (err, result) => {
      if (err) {
        console.log(err)
        res.send({
          code: '500',
          message: '数据库查询失败'
        })
      } else {
        res.send(result)
      }
    })
  }
}
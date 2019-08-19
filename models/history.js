const db = require('../server.js')

module.exports = {
  saveSearchHistory: function (req, res) {
    const { id, name } = req.body
    const sql = `INSERT INTO search_history (novel_name, novel_id, count) 
      VALUES ('${name}', ${id}, 1) ON DUPLICATE KEY UPDATE count=count+1;`

    db.query(sql, (err) => {
      if (err) {
        console.log(err)
        res.send({
          status: 500,
          message: '数据库操作失败'
        })
      } else {
        res.send('操作成功')
      }
    })
  },
  getPublicHistory: function (req, res) {
    const sql = `SELECT novel_id as id, novel_name as name FROM search_history 
    WHERE id >= ((SELECT MAX(id) FROM search_history)-(SELECT MIN(id) FROM search_history)) * RAND() + 
    (SELECT MIN(id) FROM search_history) LIMIT 10`

    db.query(sql, (err, result) => {
      if (err) {
        console.log(err)
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
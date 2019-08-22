const db = require('../server.js')
const boom = require('boom')
const { handleBadRequest } = require('./errorHandle.js')

module.exports = {
  saveSearchHistory: function (req, res, next) {
    const { id, name } = req.body
    if (!handleBadRequest({id, name}, next)) return null
    const sql = `INSERT INTO search_history (novel_name, novel_id, count) 
      VALUES ('${name}', ${id}, 1) ON DUPLICATE KEY UPDATE count=count+1;`

    db.query(sql, (err) => {
      if (err) {
        next(boom.badImplementation('500 - 数据库操作失败', { err }))
      } else {
        res.send('操作成功')
      }
    })
  },
  getPublicHistory: function (req, res, next) {
    const sql = `SELECT novel_id as id, novel_name as name FROM search_history 
    WHERE id >= ((SELECT MAX(id) FROM search_history)-(SELECT MIN(id) FROM search_history)) * RAND() + 
    (SELECT MIN(id) FROM search_history) LIMIT 10`

    db.query(sql, (err, result) => {
      if (err) {
        next(boom.badImplementation('500 - 数据库查询失败', { err }))
      } else {
        res.send(result)
      }
    })
  }
}
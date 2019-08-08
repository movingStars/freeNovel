const db = require('../server.js')

module.exports = {
  getBestList: function (req, res) {
    let sql = `SELECT * FROM novels 
    WHERE id >= ((SELECT MAX(id) FROM novels)-(SELECT MIN(id) FROM novels)) * RAND() + 
    (SELECT MIN(id) FROM novels) LIMIT 8`

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
  },
  getNovelInfo: function (req, res) {
    const novelId = req.query.id
    let novelSql = `select n.id, n.name, n.logo_url, n.author_name, n.update_type, n.intro, n.new_chapter_name, n.word_count, c.name as category FROM (select * from novels where id = ${novelId}) AS n JOIN category AS c ON c.id=n.category_id;`


    db.query(novelSql, (err, result) => {
      if (err) {
        res.send({
          status: 500,
          message: '数据库查询失败'
        })
      } else {
        res.send(result[0])
      }
    })
  }
}
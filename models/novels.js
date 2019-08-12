const fs = require('fs')
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
  },
  getChapterContent: function (req, res) {
    const chapterId = req.query.chapterId
    const novelName = req.query.novelName
    
    fs.readFile(`./public/novels/${novelName}/${chapterId}.txt`, { encoding: 'utf-8' }, (err, result) => {
      if (err) {
        console.log(err)
        res.send({
          status: 500,
          message: '获取章节内容时出错'
        })
      } else {
        res.send(result.split('/r/n'))
      }
    })
  },
  getChapterList: function (req, res) {
    const novelName = req.query.novelName

    fs.readFile(`./public/novels/${novelName}/chapterList.txt`, { encoding: 'utf-8' }, (err, result) => {
      if (err) {
        console.log(err)
        res.send({
          status: 500,
          message: '获取章节列表时出错'
        })
      } else {
        const resArr = result.split('/r/n-chapterList')
        const chapterList = []

        for (let i in resArr) {
          chapterList.push({
            id: parseInt(i) + 1,
            name: resArr[i]
          })
        }
        res.send(chapterList)
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
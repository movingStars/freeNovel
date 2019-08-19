const fs = require('fs')
const db = require('../server.js')

module.exports = {
  saveNovelsInfo: function (novelsInfoArr) {
    let sql = `insert into novels
      (name, logo_url, author_name, category_id, update_type, intro, new_chapter_name, novel_address, word_count) 
      values ?`
    
    db.query(sql, [novelsInfoArr], (err, result) => {
      if (err) {
        console.log(`插入 小说 数据失败 - ${err}`)
      } else {
        console.log(`插入 小说 数据成功 - ${JSON.stringify(result)}`)
      }
    })
  },
  getNovelInfo: function (req, res) {
    const token = req.authorization || ''
    const novelId = req.query.id
    const novelSql = `select n.id, n.name, n.logo_url, n.author_name, n.update_type, n.intro, n.new_chapter_name, n.word_count, c.name as category,
    (SELECT COUNT(id) FROM book_shelf WHERE user_token = '${token}' and novel_id = ${novelId}) as isAdded
    FROM (select * from novels where id = ${novelId}) AS n
    JOIN category AS c ON c.id=n.category_id;`

    db.query(novelSql, (err, result) => {
      if (err) {
        console.log(err)
        res.send({
          status: 500,
          message: '数据库查询失败'
        })
      } else {
        res.send(result[0])
      }
    })
  },
  getBestList: function (req, res) {
    const sql = `SELECT * FROM novels 
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
  getNovelList: function (req, res) {
    const { id:categoryId, pageSize, pageIndex } = req.query
    const startIdx = (pageIndex - 1) * pageSize + 1
    const sql = `select n.id, n.name, n.logo_url, n.author_name, n.intro, c.name as category from 
      (select * from novels where category_id = ${categoryId} limit ${startIdx}, ${pageSize}) 
      as n join category as c on c.id = n.category_id;`

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
  searchNovels: function (req, res) {
    const name = req.query.name
    const sql = `select n.id, n.name, n.logo_url, n.author_name, n.intro, c.name as category from 
      (select * from novels where name like '%${name}%' or author_name like '%${name}%') 
      as n join category as c on c.id = n.category_id;`

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
  getPublicSearchNovels: function (req, res) {
    const sql = `SELECT n.id, n.name, n.logo_url, n.author_name FROM 
      (SELECT * FROM novels WHERE id IN 
      (SELECT novel_id FROM search_history WHERE id >= ((SELECT MAX(id) FROM search_history)-(SELECT MIN(id) FROM search_history)) * RAND() + 
      (SELECT MIN(id) FROM search_history))) AS n LIMIT 8;`

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
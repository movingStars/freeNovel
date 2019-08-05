const db = require('../server.js')

module.exports = {
  createCategoryTable: function () {
    const sql = `create table if not exists category(
      id int primary key auto_increment,
      url varchar(255)not null,
      name varchar(255)not null
    );`

    db.query(sql, (err, result) => {
      if (err) {
        console.log(`创建 分类表 失败 - ${err}`)
        throw err
      } else {
        console.log(`创建 分类表 成功 - ${JSON.stringify(result)}`)
      }
    })
  },
  createNovelTable: function () {
    const sql = `create table if not exists novels(
      id int primary key auto_increment,
      name varchar(255)not null,
      logo_url varchar(255) null,
      author_name varchar(255) null,
      category_id int(2) comment '小说类型',
      update_type int(2) null comment '更新状态',
      intro varchar(255) null,
      word_count bigint(15) null,
      created_at datetime not null default CURRENT_TIMESTAMP(),
      foreign key(category_id) references category(id)
    );`

    db.query(sql, (err, result) => {
      if (err) {
        console.log(`创建 小说表 失败 - ${err}`)
        throw err
      } else {
        console.log(`创建 小说表 成功 - ${JSON.stringify(result)}`)
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
  saveNovelsInfo: function (novelsInfoArr) {
    let sql = `insert into novels
      (name, logo_url, author_name, category_id, update_type, intro, word_count) 
      values ?`
    
    db.query(sql, [novelsInfoArr], (err, result) => {
      if (err) {
        console.log(`插入 小说 数据失败 - ${err}`)
      } else {
        console.log(`插入 小说 数据成功 - ${JSON.stringify(result)}`)
      }
    })
  }
}
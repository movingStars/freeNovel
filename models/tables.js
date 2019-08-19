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
      new_chapter_name varchar(255) null,
      novel_address varchar(255) null,
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
  createSearchHistoryTable: function () {
    const sql = `create table if not exists search_history(
      id int primary key auto_increment,
      novel_name varchar(255) not null,
      novel_id int not null,
      count int not null,
      unique (novel_id)
    );`

    db.query(sql, (err, result) => {
      if (err) {
        console.log(`创建 搜索历史表 失败 - ${err}`)
        throw err
      } else {
        console.log(`创建 搜索历史表 成功 - ${JSON.stringify(result)}`)
      }
    })
  },
  createUsersTable: function () {
    const sql = `create table if not exists users(
      id int primary key auto_increment,
      user_token varchar(60) not null,
      openid varchar(60) not null,
      unionid varchar(60) null,
      authorized int not null default 0,
      nick_name varchar(255) null,
      gender int null,
      language varchar(20) null,
      city varchar(50) null,
      province varchar(50) null,
      country varchar(50) null,
      avatar_url varchar(255) null,
      created_at datetime not null default CURRENT_TIMESTAMP(),
      unique (openid)
    );`

    db.query(sql, (err, result) => {
      if (err) {
        console.log(`创建 用户表 失败 - ${err}`)
        throw err
      } else {
        console.log(`创建 用户表 成功 - ${JSON.stringify(result)}`)
      }
    })
  },
  createBookShelfTable: function () {
    const sql = `create table if not exists book_shelf(
      id int primary key auto_increment,
      user_token varchar(60) not null,
      novel_id int not null
    );`

    db.query(sql, (err, result) => {
      if (err) {
        console.log(`创建 书架表 失败 - ${err}`)
        throw err
      } else {
        console.log(`创建 书架表 成功 - ${JSON.stringify(result)}`)
      }
    })
  }
}
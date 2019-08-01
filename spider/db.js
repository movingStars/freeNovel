const db = require('../server.js')

module.exports = {
  createCategoryTable: function (categoryNames) {
    let createCategory = `create table if not exists category(
        id int primary key auto_increment,
        url varchar(255)not null,
        name varchar(255)not null);`

    db.query(createCategory, (err, result) => {
      if (err) {
        console.log(`创建 分类表 失败 - ${err}`)
      } else {
        console.log(`创建 分类表 成功 - ${JSON.stringify(result)}`)
        this.saveCategory(categoryNames)
      }
    })
  },
  saveCategory: function (categoryNames) {
    let createCategory = 'insert into category(name, url) values ?'
    console.log(categoryNames,createCategory)
    db.query(createCategory, [categoryNames], (err, result) => {
      if (err) {
        console.log(`插入 分类 数据失败 - ${err}`)
      } else {
        console.log(`插入 分类 数据成功 - ${JSON.stringify(result)}`)
      }
    })
    db.end()
  }
}
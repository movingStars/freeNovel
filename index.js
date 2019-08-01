const express = require('express')
const spider = require('./spider/index.js')
const app = express()

app.get('/', (req, res) => {
  res.send('Hello world!')
})

let server = app.listen(8979, 'localhost', () => {
  let host = server.address().address
  let port = server.address().port

  console.log('Running at http://%s:%s', host, port)
})

spider.crawlCategoryPage()

// const mapLimit = require('async/mapLimit')
// const str = 'xiongjiao'

// const iterateeFunction = function (item, callback) {
//   console.log('调用开始' + item)
//   setTimeout(() => {
//     var newItem = item + 1
//     console.log(1)
//     setTimeout(() => {
//       console.log(2)
//       setTimeout(() => {
//         console.log('调用结束' + item)
//         callback(null, newItem)
//       }, 2000)
//     }, 1000)
//   }, Math.random() * 1000)
// }
// var allEndFunction = function (err, results) {
//   console.log(err, results) //[ 'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1' ]
// }
// mapLimit(str,1, iterateeFunction, allEndFunction)
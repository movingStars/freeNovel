const mysql = require('mysql')
const config = require('./config/config.js')

const mysqlConfig = config.mysql
const connection = mysql.createConnection(mysqlConfig)

connection.connect()

console.log('Database has connected: %s', mysqlConfig.database)

module.exports = connection
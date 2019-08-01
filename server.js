const mysql = require('mysql')
const config = require('./config/config.js')

/*global process*/
const mysqlConfig = process.env.NODE_ENV === 'dev' ? config.devConfig.mysql : config.prodConfig.mysql
const connection = mysql.createConnection(mysqlConfig)

connection.connect()

console.log('Database has connected: %s', mysqlConfig.database)

module.exports = connection
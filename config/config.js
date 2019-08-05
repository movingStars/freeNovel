const devConfig = {
  mysql: {
    host: 'localhost',
    user: 'root',
    password: 'xj891020',
    database: 'freeNovel',
    port: 3306
  }
}

const prodConfig = {
  mysql: {
    host: '118.24.172.237',
    user: 'root',
    password: '13880316721/*qi',
    database: 'freeNovel',
    port: 3306
  }
}

module.exports = {
  devConfig,
  prodConfig
}
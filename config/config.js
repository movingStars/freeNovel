const devConfig = {
  mysql: {
    host: 'localhost',
    user: 'root',
    password: 'xj891020',
    database: 'freeNovel',
    port: 3306
  },
  siteHost: 'http://127.0.0.1:8787'
}

const prodConfig = {
  mysql: {
    host: 'localhost',
    user: 'root',
    password: '13880316721/*qi',
    database: 'freeNovel',
    port: 3306
  },
  siteHost: 'http://127.0.0.1:8787'
}

/* global process */
const config = process.env.NODE_ENV === 'dev' ? devConfig : prodConfig

module.exports = config
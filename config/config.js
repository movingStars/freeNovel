const devConfig = {
  mysql: {
    host: 'localhost',
    user: 'root',
    password: 'xj891020',
    database: 'freeNovel',
    port: 3306
  },
  siteHost: 'http://127.0.0.1:8787',
  wx: {
    appID: 'wxff91939b3635ad90',
    appSecret: '4998bd727de383348250856f45560f02'
  }
}

const prodConfig = {
  mysql: {
    host: 'localhost',
    user: 'root',
    password: '13880316721/*qi',
    database: 'freeNovel',
    port: 3306
  },
  siteHost: 'https://www.damaixiaoshuo.com',
  wx: {
    appID: 'wxff91939b3635ad90',
    appSecret: '4998bd727de383348250856f45560f02'
  }
}

/* global process */
const config = process.env.NODE_ENV === 'dev' ? devConfig : prodConfig

module.exports = config
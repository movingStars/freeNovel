const superAgent = require('superagent')
const db = require('../server.js')
const config = require('../config/config.js')
const md5 = require('md5')

module.exports = {
  wxLogin: function (req, res) {
    const code = req.body.code
    
    superAgent.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${config.wx.appID}&secret=${config.wx.appSecret}&js_code=${code}&grant_type=authorization_code`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Accept', 'application/json')
      .then((result) => {
        const info = JSON.parse(result.text) || {}
        const openid = info.openid || ''

        //先判断
        if (openid) {

          const get_sql = `select id, user_token as userToken, openid, authorized, nick_name as nickName, gender, language, city, province, country, avatar_url as avatarUrl, created_at as createdAt
            from users where openid = '${openid}'`

          db.query(get_sql, (err, result) => {
            if (err) {
              console.log(`查询 用户 数据失败 - ${err}`)
              res.send({
                code: '500',
                message: '数据库操作失败'
              })
            } else {
              //如果当前微信用户存在，直接返回用户信息
              if (result && result.length > 0) {
                res.send(result[0])
              } else {//不存在，则插入数据并返回userToken和ID
                const userToken = md5(+new Date())
                const insert_sql = `insert ignore into users (user_token, openid) values ('${userToken}', '${openid}')`
                
                db.query(insert_sql, (err, result) => {
                  if (err) {
                    console.log(`插入 用户 数据失败 - ${err}`)
                    res.send({
                      code: '500',
                      message: '数据库操作失败'
                    })
                  } else {
                    console.log(`插入 用户 数据成功 - ${JSON.stringify(result)}`)
                    res.send({
                      userToken,
                      openid
                    })
                  }
                })
              }
            }
          })
        } else {
          res.send({
            code: 500,
            message: '获取openid失败'
          })
        }
      })
  },
  getUserInfo: function (req, res) {
    const token = req.authorization || ''
    const sql = `select id, user_token as userToken, openid, authorized, nick_name as nickName, gender, language, city, province, country, avatar_url as avatarUrl, created_at as createdAt
       from users where user_token = '${token}'`

    db.query(sql, (err, result) => {
      if (err) {
        res.send({
          code: '500',
          message: '数据库操作失败'
        })
      } else {
        res.send(result[0])
      }
    })
  },
  updateUserInfo: function (req, res) {
    const token = req.authorization || ''
    const { nickName, avatarUrl, gender, country, province, city, language } = req.body
    const sql = `UPDATE users SET authorized=1, nick_name='${nickName}', gender=${gender}, avatar_url='${avatarUrl}',
    language='${language}', country='${country}', province='${province}', city='${city}' WHERE user_token='${token}';`
    
    db.query(sql, (err) => {
      if (err) {
        console.log(err)
        res.send({
          code: '500',
          message: '用户信息更新失败'
        })
      } else {
        const sql = `select id, user_token as userToken, openid, authorized, nick_name as nickName, gender, language, city, province, country, avatar_url as avatarUrl, created_at as createdAt
          from users where user_token = '${token}'`

        db.query(sql, (err, result) => {
          if (err) {
            res.send({
              code: '500',
              message: '查询用户信息失败'
            })
          } else {
            res.send(result[0])
          }
        })
      }
    })
  }
}
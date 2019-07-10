const superAgent = require('superagent')
const Nightmare = require('nightmare')
const cheerio = require('cheerio')
const fs = require('fs')
const nightmare = new Nightmare()

module.exports = {
  siteHost: 'http://www.quanben5.com',
  novelAddress: 'http://www.quanben5.com/n/doushentianxia/xiaoshuo.html',
  novelName: '斗神天下',
  chapterArr: [],
  getHtmlBySuperAgent: function (url, title, cb = () => {}) {
    console.log(`开始抓取 - ${title}`)
    superAgent.get(url).end((err, res) => {
      if (err) {
        console.log(`${title} - 抓取失败 - ${err}`)
      } else {
        cb(res)
      }
    })
  },
  getHtmlByNightmare: function (url, title) {
    return nightmare
      .goto(url)
      .wait(500)
      .evaluate(() => document.querySelector('div.row .wrapper #content').innerHTML)
      .then((htmlStr) => {
        return htmlStr
      })
      .catch(error => {
        console.log(`${title} - 抓取失败 - ${error}`)
      })
  },
  crawling: function () {
    this.crawlChapterArr(this.novelName)
  },
  crawlChapterArr: function (novelName) {
    if (!fs.existsSync(`./novels/${novelName}`)) {
      fs.mkdirSync(`./novels/${novelName}`)
    } else {
      console.log(`小说 - ${novelName} - 已存在`)
      return
    }
    this.getHtmlBySuperAgent(this.novelAddress, '斗神天下章节信息', (res) => {
      const $ = cheerio.load(res.text)

      $('.row .box ul li a').slice(0,5).each((idx, ele) => {
        let chapter = {
          name: $(ele).children().text(),
          url: $(ele).attr('href')
        }
        this.chapterArr.push(chapter)
      })
      this.crawlChapter()
    })
  },
  crawlChapter: function () {
    const promises = []

    this.chapterArr.forEach((item, idx) => {
      promises.push(
        this.getHtmlByNightmare(this.siteHost + item.url, item.name).then((res) => {
          let content = ''
          const $ = cheerio.load(res)
  
          $('p').each((idx, ele) => {
            content += $(ele).text() + '/r/n'
          })
          this.saveChapterTxt(content, idx)
        })
      )
    })
    Promise.all(promises).then(() => {
      console.log('全部抓取完毕！！')
    })
  },
  saveChapterTxt: function (content, idx) {
    fs.writeFile(`./novels/${this.novelName}/${idx + 1}.txt`, content, function (err) {
      if (err) {
        console.log(`${idx + 1}.txt - 保存失败 - ${err}`)
      } else {
        console.log(`${idx + 1}.txt - 保存成功！！！`)
      }
    })
  }
}
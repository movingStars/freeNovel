const superAgent = require('superagent')
const Nightmare = require('nightmare')
const cheerio = require('cheerio')
const fs = require('fs')
const nightmare = new Nightmare()

module.exports = {
  siteHost: 'http://www.jingpinshucheng.com',
  novelAddress: 'http://www.jingpinshucheng.com/book/26727.html',
  novelName: '鬼迷婚窍',
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
      .wait('body')
      .evaluate(() => document.querySelector('div.content div#content').innerHTML)
      .then((htmlStr) => {
        return htmlStr
      })
      .catch(error => {
        console.log(`${title} - 抓取失败 - ${error}`)
      })
  },
  crawling: function () {
    if (!fs.existsSync('./novels')) {
      fs.mkdirSync('./novels')
    }
    this.crawlChapterArr(this.novelName)
  },
  crawlChapterArr: function (novelName) {
    if (!fs.existsSync(`./novels/${novelName}`)) {
      fs.mkdirSync(`./novels/${novelName}`)
    } else {
      console.log(`小说 - ${novelName} - 已存在`)
      return
    }
    this.getHtmlBySuperAgent(this.novelAddress, `${this.novelName}章节信息`, (res) => {
      const $ = cheerio.load(res.text)

      $('div.content ul.list li:not(.chapter) a').each((idx, ele) => {
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
    this.chapterArr.forEach((item, idx) => {
      this.getHtmlBySuperAgent(this.siteHost + item.url, item.name, (res) => {
        let content = ''
        const $ = cheerio.load(res.text)
        
        $('div.content div#content p').each((idx, ele) => {
          content += $(ele).text() + '/r/n'
        })
        this.saveChapterTxt(content, idx)
      })
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
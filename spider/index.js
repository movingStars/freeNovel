const superAgent = require('superagent')
const Nightmare = require('nightmare')
const cheerio = require('cheerio')
const fs = require('fs')
const nightmare = new Nightmare()

module.exports = {
  //网站主机地址
  siteHost: 'http://www.jingpinshucheng.com',
  //要爬取的小说地址（章节列表页）
  novelAddress: 'http://www.jingpinshucheng.com/book/26743.html',
  //小说名字
  novelName: '云龙破月',
  //章节信息数组
  chapterArr: [],
  /**
   * 开始爬取
   */
  crawling: function () {
    //判断novels目录是否已存在
    if (!fs.existsSync('./novels')) {
      fs.mkdirSync('./novels')
    }
    //爬取章节列表页
    this.crawlChapterListPage(this.novelName)
  },
  /**
   * 爬取章节列表页
   * @param {*} novelName 小说的名字
   */
  crawlChapterListPage: function (novelName) {
    //判断当前小说名目录是否已存在
    if (!fs.existsSync(`./novels/${novelName}`)) {
      fs.mkdirSync(`./novels/${novelName}`)
    } else {
      console.log(`小说 - ${novelName} - 已存在`)
      return
    }
    const pageList = []

    //爬取章节列表页
    this.getHtmlBySuperAgent(this.novelAddress, `${this.novelName}章节列表页`, (res) => {
      const $ = cheerio.load(res.text)
      const promiseArr = []

      //爬取列表页底部分页选择器的信息，查看一共有几页章节列表
      $('div.nlist_page #page_select option').each((idx, ele) => {
        const pageUrl = $(ele).attr('value')
        //将章节列表页的的url存到一个数组里面
        pageList.push(this.siteHost + pageUrl)
      })
      //循环数组，对每一页章节列表进行爬取
      pageList.forEach((item, idx) => {
        //由于页面的爬取是异步的，我们又需要等每个章节列表页面爬取完成后，再继续执行，所以采用Promise.all的方式
        promiseArr.push(this.crawlChapterArr(item, idx))
      })
      Promise.all(promiseArr).then((values) => {
        for (let i of values) {
          this.chapterArr = this.chapterArr.concat(i)
        }
        //开始爬取每个章节页面
        this.crawlChapterPage()
      })
    })
  },
  /**
   * 爬取单个的章节列表页
   * @param {*} url 页面url
   */
  crawlChapterArr: function (url, idx) {
    return new Promise((resolve) => {
      this.getHtmlBySuperAgent(url, `${this.novelName} - 第${idx + 1}页章节信息`, (res) => {
        const chapterArr = []
        const $ = cheerio.load(res.text)
  
        $('div.content ul.list li:not(.chapter) a').each((idx, ele) => {
          let chapter = {
            name: $(ele).children().text(),
            url: $(ele).attr('href')
          }
          chapterArr.push(chapter)
        })
        resolve(chapterArr)
      })
    })
  },
  /**
   * 爬取章节内容
   */
  crawlChapterPage: function () {
    this.chapterArr.forEach((chapter, idx) => {
      this.getHtmlBySuperAgent(this.siteHost + chapter.url, chapter.name, (res) => {
        let content = ''
        const $ = cheerio.load(res.text)
        
        $('div.content div#content p').each((idx, ele) => {
          content += $(ele).text() + '/r/n'
        })
        //将章节内容保存到本地
        this.saveChapterTxt(content, idx)
      })
    })
  },
  /**
   * 通过superagent插件，对页面内容进行爬取
   * @param {*} url 要爬取的页面url
   * @param {*} title 为方便console.log查看，传入爬取时的大概内容
   * @param {*} cb 爬取成功的回调
   */
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
  /**
   * 通过nightmare插件对页面内容进行爬取，目前没用到（适合页面内容是动态加载的页面上使用）
   * @param {*} url 
   * @param {*} title 
   */
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
  /**
   * 将章节内容保存到本地
   * @param {*} content 要保存的内容
   * @param {*} idx 为区分是第几章节，采用数字id+1的方式
   */
  saveChapterTxt: function (content, idx) {
    //写入文件
    fs.writeFile(`./novels/${this.novelName}/${idx + 1}.txt`, content, function (err) {
      if (err) {
        console.log(`${idx + 1}.txt - 保存失败 - ${err}`)
      } else {
        console.log(`${idx + 1}.txt - 保存成功！！！`)
      }
    })
  }
}
const superAgent = require('superagent')
const Nightmare = require('nightmare')
const cheerio = require('cheerio')
const fs = require('fs')
const nightmare = new Nightmare()
const async = require('async')
const config = require('../config/config.js')

const {
  createCategoryTable,
  createNovelTable,
  createSearchHistoryTable,
  createBookShelfTable,
  createUsersTable
} = require('../models/tables.js')
const { getCategoryData, saveCategory } = require('../models/category.js')
const { saveNovelsInfo } = require('../models/novels.js')

module.exports = {
  //网站主机地址
  siteHost: 'http://www.jingpinshucheng.com',
  //分类页面地址
  categoryPage: 'http://www.jingpinshucheng.com/category.html',
  //当前查询的分类id
  currentCategoryId: 2,
  //当前小说已爬取的章节数
  chapterNum: 0,
  //小说信息数组
  novelsInfoArr: [],
  //当前爬取的小说信息
  currentNovelInfo: [],
  //当前爬取小说的字数
  currentNovelWordCount: 0,
  //超时次数
  timeoutUrl: '',
  timeoutCount: 0,
  
  /**
   * 开始抓取分类页面
   */
  crawlCategoryPage: function () {
    this.getHtmlBySuperAgent(this.categoryPage, '分类页面', (res) => {
      const $ = cheerio.load(res.text)
      const categoryList = []

      $('.content ul.category li').each((idx, ele) => {
        categoryList.push([
          $(ele).find('a span:nth-child(2)').text(),
          this.siteHost + $(ele).children('a').attr('href')
        ])
        if (idx === this.currentCategoryId - 1) {
          this.crawlNovelListPage($(ele).find('a span:nth-child(2)').text(), this.siteHost + $(ele).children('a').attr('href'))
        }
      })
      //存储分类数据
      getCategoryData((res) => {
        if (res.length <= 0) {
          saveCategory(categoryList)
        }
      })
    }, () => {
      this.crawlCategoryPage()
    })
  },
  /**
   * 抓取小说列表页
   */
  crawlNovelListPage: function (categoryName, novelListUrl) {
    this.getHtmlBySuperAgent(novelListUrl, `${categoryName}-分类列表页`, (res) => {
      const $ = cheerio.load(res.text)
      const novelList = []

      $('.content .pic_txt_list').each((idx, ele) => {
        novelList.push({
          url: this.siteHost + $(ele).find('h3 a').attr('href'),
          name: $(ele).find('h3 a span').text()
        })
      })
      async.mapLimit(novelList, 1, (novel, callback) => {
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        this.crawling(novel.url, novel.name, callback)
      }, (err, result) => {
        console.log(result)
        console.log(`共 - ${result.length}部 - 小说----------爬取---------------完成----------`)

        //把已爬取完的20部小说数据存到mysql数据库
        console.log(this.novelsInfoArr)
        this.novelsInfoArr.length > 0 && saveNovelsInfo([...this.novelsInfoArr])
        this.novelsInfoArr = []

        //5s后爬取下一页
        setTimeout(() => {
          const nextPageUrl = this.siteHost + $('.content #page_next a').attr('href')
          nextPageUrl && this.crawlNovelListPage(categoryName, nextPageUrl)
        }, 1000)
      })
    }, () => {
      this.crawlNovelListPage(categoryName, novelListUrl)
    })
  },
  /**
   * 开始爬取小说（一本）
   */
  crawling: function (novelAddress, novelName, novelCallback) {
    //判断novels目录是否已存在
    if (!fs.existsSync('./public/novels')) {
      fs.mkdirSync('./public/novels')
    }
    //windows操作系统中文件名不能包含某些特殊字符
    novelName = novelName.replace(/[\\/:*?"<>|]+/ig, '')
    //爬取章节列表页
    return this.crawlChapterListPage(novelAddress, novelName, novelCallback)
  },
  /**
   * 爬取章节列表页
   * @param {*} novelName 小说的名字
   */
  crawlChapterListPage: function (novelAddress, novelName, novelCallback) {
    //判断当前小说名目录是否已存在
    if (!fs.existsSync(`./public/novels/${novelName}`)) {
      fs.mkdirSync(`./public/novels/${novelName}`)
    } else {
      console.log(`小说 - ${novelName} - 已存在`)
      novelCallback(null, `${novelName} - 已存在`)
      return
    }
    const pageList = []

    //爬取章节列表页
    this.getHtmlBySuperAgent(novelAddress, `${novelName} - 章节列表页`, (res) => {
      const $ = cheerio.load(res.text)

      if ($('div.content ul.list li:not(.chapter)').length <= 0) {
        console.log('%%%%%%%%%%%%没有章节信息%%%%%%%%%%%%%%%')
        this.removeNovelFolder(novelName)
        novelCallback()
        return
      }

      //爬取列表页底部分页选择器的信息，查看一共有几页章节列表
      $('div.nlist_page #page_select option').each((idx, ele) => {
        const pageUrl = $(ele).attr('value')
        //将章节列表页的的url存到一个数组里面
        pageList.push(this.siteHost + pageUrl)
      })

      this.promiseCrawl(pageList, novelName, novelCallback)

      const imageSrc = $('.content .pic_txt_list .pic img').attr('src')
      const idx = imageSrc.lastIndexOf('/')
      const imageType = imageSrc.substr(idx + 1).split('.')[1]
      const imageName = `${novelName}.${imageType}`
      this.saveNovelImage(imageSrc, imageName)
      this.currentNovelInfo = [
        novelName, //小说名
        `${config.siteHost}/images/${imageName}`, //小说图片本地地址
        $('.content .pic_txt_list .info span').slice(0,1).text(), //作者名
        this.currentCategoryId, //类别
        $('.content .pic_txt_list .info span').slice(2,1) === '完结' ? 1 : 0, //更新状态
        $('.content .description').text(),//简介
        this.currentNovelInfo[4] ? $('.content > .update > p a:nth-child(2) span').text() : '',//记录最新章节名
        novelAddress//记录小说链接，便于之后定时更新
      ]
    }, () =>{
      this.crawlChapterListPage(novelAddress, novelName, novelCallback)
    })
  },
  promiseCrawl: function (pageList, novelName, novelCallback) {
    let chapterArr = []
    let chapterNames = ''
    const promiseArr = []

    console.log('=================开始爬取每个章节页面===============')

    //循环数组，对每一页章节列表进行爬取
    pageList.forEach((item, idx) => {
      //由于页面的爬取是异步的，我们又需要等每个章节列表页面爬取完成后，再继续执行，所以采用Promise.all的方式
      promiseArr.push(this.crawlChapterArr(item, novelName, idx))
    })
    Promise.all(promiseArr).then((values) => {
      for (let i of values) {
        chapterArr = chapterArr.concat(i)
      }
      for (let i of chapterArr) {
        chapterNames += i.name + '/r/n-chapterList'
      }
      this.saveChapterListTxt(novelName, chapterNames)
      //开始爬取每个章节页面
      chapterArr.forEach((chapter, idx) => {
        this.crawlChapterPage(chapter, idx, novelName, chapterArr, novelCallback)
      })
    }).catch((res) => {
      console.log(res.message)
      if (res.code === 'failed') {
        this.promiseCrawl(pageList, novelName, novelCallback)
      }
    })
  },
  /**
   * 爬取单个的章节列表页
   * @param {*} url 页面url
   */
  crawlChapterArr: function (url, novelName, idx) {
    return new Promise((resolve, reject) => {
      this.getHtmlBySuperAgent(url, `${novelName} - 第${idx + 1}页章节信息`, (res) => {
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
      }, () => {
        reject({
          code: 'failed',
          message: `${novelName} - 第${idx + 1}页章节信息 - %%%%%%%%%%%% 抓取失败 %%%%%%%%%%%%`
        })
      })
    })
  },
  /**
   * 爬取章节内容
   */
  crawlChapterPage: function (chapter, idx, novelName, chapterArr, novelCallback) {
    this.getHtmlBySuperAgent(this.siteHost + chapter.url, `${novelName} - ${chapter.name}`, (res) => {
      const $ = cheerio.load(res.text)
      const chapterName = $('div.content h2:nth-child(1)').text()
      let content = chapterName.trim() + '/r/n'
      
      $('div.content div#content p').each((idx, ele) => {
        if ($(ele).text() === '' || $(ele).text().split(' ').join('') === chapterName.split(' ').join('')) {
          return
        }
        content += $(ele).text().trim() + '/r/n'
        this.currentNovelWordCount += content.length
      })
      //将章节内容保存到本地
      this.saveChapterTxt(novelName, content, idx)
      this.chapterNum = this.chapterNum + 1

      if (this.chapterNum === chapterArr.length) {
        this.currentNovelInfo.push(this.currentNovelWordCount)
        this.novelsInfoArr.push([...this.currentNovelInfo])
        console.log(this.currentNovelInfo)

        setTimeout(() => {
          novelCallback(null, `${novelName} ----------爬取---------------完成----------`)
          this.chapterNum = 0
          this.currentNovelInfo = []
          this.currentNovelWordCount = 0
        }, 1000)
      }
    }, () => {
      this.crawlChapterPage(chapter, idx, novelName, chapterArr, novelCallback)
    })
  },
  /**
   * 通过superagent插件，对页面内容进行爬取
   * @param {*} url 要爬取的页面url
   * @param {*} title 为方便console.log查看，传入爬取时的大概内容
   * @param {*} cb 爬取成功的回调
   */
  getHtmlBySuperAgent: function (url, title, cb = () => {}, fail = () => {}) {
    console.log(`开始抓取 - ${title}`)
    superAgent.get(url).timeout(5000).end((err, res) => {
      if (err) {
        if (err.timeout) {
          console.log(`${title} - 抓取超时 - ${err}`)
        } else {
          console.log(`${title} - 抓取失败 - ${err}`)
        }
        fail()
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
  saveChapterTxt: function (novelName, content, idx) {
    //写入文件
    fs.writeFile(`./public/novels/${novelName}/${idx + 1}.txt`, content, function (err) {
      if (err) {
        console.log(`${novelName} - ${idx + 1}.txt - 保存失败 - ${err}`)
      } else {
        console.log(`${novelName} - ${idx + 1}.txt - 保存成功！！！`)
      }
    })
  },
  /**
   * 将章节列表以txt的格式保存到本地
   * @param {*} content 要保存的内容
   */
  saveChapterListTxt: function (novelName, content) {
    //写入文件
    fs.writeFile(`./public/novels/${novelName}/chapterList.txt`, content, function (err) {
      if (err) {
        console.log(`${novelName} - chapterList.txt - 保存失败 - ${err}`)
      } else {
        console.log(`${novelName} - chapterList.txt - 保存成功！！！`)
      }
    })
  },
  createTables: function () {
    createCategoryTable()
    createNovelTable()
    createSearchHistoryTable()
    createBookShelfTable()
    createUsersTable()
  },
  removeNovelFolder: function (novelName) {
    console.log(novelName)
    //删除目录
    fs.rmdir(`./public/novels/${novelName}`, (err) => {
      if (err) throw err
      console.log(`${novelName}  - 删除成功`)
    })
  },
  saveNovelImage: function (imageSrc, imageName) {
    console.log(imageName)
    if (!fs.existsSync('./public/images')) {
      fs.mkdirSync('./public/images')
    }
    superAgent.get(this.siteHost + imageSrc).then((res) => {
      if (res.statusCode === 200) {
        fs.writeFile(`./public/images/${imageName}`, res.body, (err) => {
          if (err) {
            this.saveNovelImage(imageSrc, imageName)
          } else {
            console.log('图片保存成功')
          }
        })
      } else {
        this.saveNovelImage(imageSrc, imageName)
      }
    })
  }
}
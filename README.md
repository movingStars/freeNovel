# freeNovel
### 用Node爬取小说网站

**我们要爬取的小说网站地址：http://www.jingpinshucheng.com**

**注：已支持多本查询，但只能一次查一个分类的**

**项目目录：**
-
- config
    - config.js
- modules
    - category.js
    - novel.js
- node_modules
- public
    - images
        - 鬼迷婚窍.jpg
    - novels
        - 鬼迷婚窍
            - 1.txt
            - 2.txt
            - ......
- router
    - index.js
- spider
    - db.js
    - index.js
- index.js
- spider.js
- server.js
- package.json
- 其他配置文件

***novels目录在项目运行后自动生成**

**项目使用方法：**
- 
- git clone https://github.com/movingStars/freeNovel.git
- cpnm i  或者  npm i
- spider目录下的index.js文件中，currentCategoryId代表本次要查询的分类id，修改为你需要爬取的分类id
- 执行`npm run spider:dev`开始爬取，如果实在线上则执行`npm run spider:prod`，如果线上是Windows环境，则执行`npm run spider:prod:win`
- 执行`npm run dev`开启node服务


**如果这个项目有帮助到您，右上角点个星，谢谢**

**后期会陆续更新其他功能，欢迎提issue，共进步**



**bug修复**
-
- [x] ~~章节列表页是带分页的，目前只能抓取到第一页~~
- [] 看能不能同时爬取多个分类，目前一次只能爬取一本小说，需要一整天才能爬取完一个分类，太慢了

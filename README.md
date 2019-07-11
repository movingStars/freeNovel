# freeNovel
### 用Node爬取小说网站

**网站地址：http://www.jingpinshucheng.com**

**注：目前只支持单独爬取一本小说。后续待更新...**

**项目目录：**
-
- node_modules
- novels
    - 鬼迷婚窍
        - 1.txt
        - 2.txt
        - ......
- spider
    - index.js
- index.js
- package.json
- 其他配置文件

***novels目录在项目运行后自动生成**

**项目使用方法：**
- 
- git clone https://github.com/movingStars/freeNovel.git
- cpnm i  或者  npm i
- 先到网站上面找到想要下载的小说（如 鬼迷婚窍），复制小说章节列表页面的地址（如 http://www.jingpinshucheng.com/book/26727.html ）到spider/index.js中的novelAddress属性上。
- 设置novelName属性值为小说名字（如 鬼迷婚窍）
- `npm start` (运行后自动在novels目录下生成与小说名同名的目录，目录下面是所有的小说内容，以章节划分为各个txt文件)
- `npm run dev` 与 `npm start`差不多，唯一的区别是前者支持node的热部署（即修改代码后不需要重启服务，自动重新部署）


**如果这个项目有帮助到您，右上角点个星，谢谢**

**后期会陆续更新其他功能，欢迎提issue，共进步**



**bug修复**
-
- [x] 章节列表页是带分页的，目前只能抓取到第一页

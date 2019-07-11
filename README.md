# freeNovel
### 用Node爬取小说网站

**网站地址：http://www.jingpinshucheng.com**

**注：目前只支持单独爬取一本小说。后续待更新...**

**项目目录：**

novels目录在项目运行后自动生成

**项目使用方法：**
 - 先到网站上面找到想要下载的小说（如 鬼迷婚窍），复制小说章节列表页面的地址（如 http://www.jingpinshucheng.com/book/26727.html ）到spider/index.js中的novelAddress属性上。
 - 设置novelName属性值为小说名字（如 鬼迷婚窍）
 - `npm start` (运行后自动在novels目录下生成与小说名同名的目录，目录下面是所有的小说内容，以章节划分为各个txt文件)

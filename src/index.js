const cheerio = require("cheerio");
const config = require("../config");
const fs = require("fs");
const path = require('path');
const { get } = require("../utils");

const ROOT_PATH = path.resolve(__dirname,'../');
const { downloadDir } = config;
const downloadPath = path.resolve(ROOT_PATH, downloadDir);
try{
    fs.mkdirSync(downloadPath)
}catch(e){
    // do nothing
}

/**
 *  @author xuweitao 2019年12月5日12:33:05
 *
 * 爬取笔趣阁小说内容，内容仅供学习使用
 * 现在支持笔趣阁和新笔趣阁2中编码的网站
 */
// https://www.52bqg.com/book_117179/
// http://www.xbiquge.la/14/14682/
async function start(url) {
  console.log(`开始解析[ ${ url } ]章节列表...`);
  const bookHtml = await get(url);
  const bookInfo = parseList(bookHtml);
  bookInfo.baseUrl = url;
  const { list, baseUrl } = bookInfo;
  const { parallel } = config;
  const taskList = [];
  while (list.length > 0) {
    taskList.push(list.splice(0, parallel));
  }
  const taskCount = taskList.length;
  if(taskCount <= 0){
      console.log('章节列表解析失败，下载失败！');
      return false;
  }
  const out = fs.createWriteStream(`${downloadPath}/${bookInfo.bookName}.txt`);
  console.log(`${ bookInfo.bookName }章节列表解析成功，任务开始下载！`);
  for (let i = 0; i < taskCount; i++) {
    const currentTask = taskList[i].map(chapter =>
      parseChapter(baseUrl, chapter)
    );
    let result = [];
    try {
      result = await Promise.all(currentTask);
      result.forEach(text => {
        out.write(text + "\n\n");
      });
      console.log(`任务${ i + 1 }/${ taskCount }下载成功！`);
    } catch (e) {
      // 更新失败次数
      const task = taskList[i];
      task.failureTime =
        typeof task.failureTime === "number"
          ? task.failureTime + 1
          : 1;
      const { maxFailureTime } = config;
      console.log(`任务${ i + 1 }/${ taskCount }下载失败！`);
      // 继续之前的任务
      if(maxFailureTime > task.failureTime) i--;
    }
    await wait();
  }
  out.end();
}

// 根据获取的内容解析书名、章节名称、url。
function parseList(html) {
  const $ = cheerio.load(html);
  const bookName = $("h1", "#info").text();
  const list = [];
  $("a", "#list").each((index, el) => {
    el = $(el);
    const href = el.attr("href");
    const title = el.text();
    list.push({
      title,
      href
    });
  });
  return {
    bookName,
    list
  };
}

// 解析章节
async function parseChapter(baseUrl, chapter) {
  const { title, href } = chapter;
  const urlSegment = [...baseUrl.split('/'), ...href.split('/')].filter(_ => _);
  const url = urlSegment[0] + '//' + [...new Set(urlSegment.splice(1))].join('/');
  const result = await get(url);
  const $ = cheerio.load(result);
  const textNodes = $("#content")[0].childNodes.filter(node => node.type === 'text');
  const text = textNodes.map(node => node.data.replace(/\n/g,'')).filter(_ => _).join('\n\n');
  return '\n' + title + '\n\n' + filterAds(text);
}

function filterAds(text) {
  const { adsList } = config;
  const reg = new RegExp(adsList.map(ads => ads + '\\n*').join("|"), "g");
  return text.replace(reg, "");
}

function wait() {
  return new Promise(resolve => {
    const { maxWait, minWait } = config;
    const waitTime = ((maxWait - minWait) * Math.random() + minWait) >> 0;
    setTimeout(resolve, Math.min(waitTime, 0));
  });
}
start('https://www.biquge.tv/6_6795/')
  .then(res => {
    if(res !== false){
        console.log('下载成功！');
    }
  })
  .catch(e => {
    console.log(e);
  });
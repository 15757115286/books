module.exports = {
    _baseUrl:'https://www.1biquge.com/',
    baseUrl:'https://www.52bqg.com/',
    parallel:10, // 同时请求的并发数
    maxWait:2000, // 最大等待时间
    minWait:1000, // 最小等待时间
    timeout:20000,
    // 广告列表
    adsList:[
        '一秒记住【笔趣阁 www.52bqg.com】，精彩小说无弹窗免费阅读！'
    ],
    maxFailureTime:5,
    downloadDir:'download' // 这里切勿使用'/'开头路径 已根目录为其实路径
}
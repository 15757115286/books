module.exports = {
    _baseUrl:'https://www.1biquge.com/',
    baseUrl:'https://www.52bqg.com/',
    parallel:5, // 同时请求的并发数
    maxWait:1000, // 最大等待时间
    minWait:500, // 最小等待时间
    timeout:10000,
    // 广告列表
    adsList:[
        '一秒记住【笔趣阁 www.52bqg.com】，精彩小说无弹窗免费阅读！'
    ],
    maxFailureTime:3,
    downloadDir:'download' // 这里切勿使用'/'开头路径 已根目录为其实路径
}
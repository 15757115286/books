const request = require('request-promise');
const zlib = require('zlib');
const iconv = require('iconv-lite');
const { getRandomUserAgent } = require('./user-agent');
const config = require('../config');

// 使用get获取数据
async function get(url){
    const agent = getRandomUserAgent();
    const { timeout } = config;
    const response = await request({
        url,
        timeout,
        method :'GET',
        resolveWithFullResponse:true,
        encoding:null,
        headers:{
            'Accept':'text/html',
            'Accept-Encoding':'gzip',
            'Accept-Language':'zh-CN,zh;q=0.9,en;q=0.8',
            'User-Agent':agent
        }
    });
    const { headers, body } = response;
    const encoding = headers['content-encoding'] || '';
    // 经过gzip压缩，这里不考虑deflate
    let result = null;
    if(/gzip/i.test(encoding)){
        result = await gunzip(body);
    }else{
        result = iconv.decode(body, getCharset(body));
    }
    return result;
}

function gunzip(buffer){
    return new Promise((resolve, reject) => {
        zlib.gunzip(buffer, (err, decode) => {
            if(err){
                reject(err);
            }else{
                resolve(iconv.decode(decode ,getCharset(decode)));
            }
        });
    });
}

function getCharset(buffer){
    const reg = /charset\s*=\s*([^'";]+)/;
    const html = buffer.toString();
    const match = html.match(reg);
    return match ? match[1] : 'utf-8';
}

exports.get = get;
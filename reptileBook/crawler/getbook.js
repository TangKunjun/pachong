const request = require('request');
const iconv = require('iconv-lite');
const cheerio=require('cheerio');
const config = require('../config');
const Bagpipe = require('bagpipe');
const bagpipe =new Bagpipe(1);
const bagpipeBookList =new Bagpipe(10);
const bagpipeContent =new Bagpipe(30);
const mongoose = require('mongoose');
const bookModel= mongoose.model('bookList');
const {getModel} = require("../model/schema/bookItem");


/*

const option = {
    base:"https://www.biquge.com.cn/",
    baseUrl:"https://www.biquge.com.cn/book/25103/",
    code:"yqbook",
    gs:"utf-8",
    webName:"biquge",
    keyNum:0,
    imageOrigin:""
}
*/

/*const option = {
    base:"https://www.biquyun.com/",
    baseUrl:"https://www.biquyun.com/1_1958/",
    code:"dsbook",
    gs:"gbk",
    webName:"biquyun",
    keyNum:1,
    imageOrigin:"https://www.biquyun.com/"
}*/


const option = {
    base:"https://www.qu.la/",
    baseUrl:"https://www.qu.la/book/66060/",
    code:"yqbook",
    gs:"utf-8",
    webName:"qu.la",
    keyNum:0,
    imageOrigin:""
}



const sleep = time => new Promise(resolve => {
    setTimeout(resolve,time)
});

const getContent = async function (contentInfo,item,bookItemModel,fn) {
    const userAgent = config.userAgents[parseInt(Math.random()*config.userAgents.length)];
    return new Promise(function (resolve,reject) {
        request({
            method : 'GET',
            encoding:null,
            headers:{
                'User-Agent':userAgent
            },
            url:contentInfo.originUrl,
            rejectUnauthorized:false,
        },function (err,res,body) {
            if (err){
                reject(err);
            }else {
                body = iconv.decode(body, option.gs);
                const $ = cheerio.load(body);
                contentInfo.content =$("#content").text();
                bookItemModel.insertMany(contentInfo);
                console.log(contentInfo)
                fn(item.key+contentInfo.name+contentInfo.chapter+'章节存储！');


                resolve($("#content").text())
            }
        })
    })
};
let inowss =1;
const getInfo =async function (item,callbfm) {
    await sleep(parseInt(Math.random()*5000));
    const userAgent = config.userAgents[parseInt(Math.random()*config.userAgents.length)];
    return new Promise(function (resolve,reject) {
        request({
            method : 'GET',
            encoding:null,
            headers:{
                'User-Agent':userAgent
            },
            url:item.bookUrl,
            rejectUnauthorized:false,
        },async function (err,res,body) {
            if (err){
                reject(err);
            }else {
                body = iconv.decode(body, option.gs);
                const $ = cheerio.load(body);
                item.imageUrl =option.imageOrigin+ $("#fmimg").find("img").attr('src');
                if (option.webName=='qu.la') {
                    item.bookDetail = $("#intro").text();
                }else{
                    item.bookDetail = $("#intro").find('p').text();
                }

                const list = $("#list dl").find('dd');


                const  bookItemModel = await getModel(item.key);

                const contenLength = await bookItemModel.countDocuments({})||0;

                if (contenLength>=list.length){
                    console.log(item.bookName+'列表章节数和数据库章节数一致');
                }else{

                    for(let i = contenLength;i<list.length;i++){
                        const index =i;
                        const newItem = list[i];
                        const contentInfo = {
                            name:item.bookName,
                            author:item.author,
                            chapter:$(newItem).find("a").text(),
                            section:$(newItem).find("a").text(),
                            originUrl:option.base+$(newItem).find("a").attr('href'),
                            serial:index,
                        };
                        // const bookChatper =await bookItemModel.find({originUrl:contentInfo.originUrl});
                        bookItemModel.find({originUrl:contentInfo.originUrl}).then(async function (data) {
                            if (data.length){
                                console.log(item.key+contentInfo.name+contentInfo.chapter+'该章节已存在！')
                            }else{
                                bagpipeContent.push(getContent,contentInfo,item,bookItemModel,function (strings) {
                                    console.log(strings+'--------'+list.length+"------"+inowss++)
                                })
                            }
                        });
                    };
                }
                callbfm&&callbfm(item);
                resolve(item)
            }
        })
    })
};

const start =  function () {
        const Options = {
            method : 'GET',
            encoding:null,
            url:option.baseUrl,
            rejectUnauthorized:false,
        };

        request(Options,async function (err,res,body) {
            if (err){
                console.log('首页爬取失败');
                console.log(err);
                return;
            }
            body = iconv.decode(body,option.gs);
            const $ = cheerio.load(body);

            const bookName = $('#info h1').text();
            const bookUrl = option.baseUrl;
            const bookType = option.code;
            const key =option.webName+option.baseUrl.match(/\d+/g)[option.keyNum];

            /*const newChapter = $('#info').find('p').eq(3).find('a').text();
            const updateTime = $('#info').find('p').eq(2).text().split("新：")[1];*/
            const author = $('#info').find('p').eq(0).text().split("者：")[1];

            const data = {
                key,
                bookName,
                bookUrl,
                author ,
                bookType
            };

            const bookData = await bookModel.findOne({
                $and:[
                    {bookName:data.bookName},
                    {author:data.author}
                ]
            });

            if(bookData){
               console.log(bookName+':当前小说已存在')
            }else{
                bagpipeBookList.push(await getInfo,data,async function (bookInfo) {
                    console.log('添加新书:'+bookName);
                    await bookModel.create(bookInfo);
                })
            }
        });
    };


start()
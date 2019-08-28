const startGet =  async (webType) => {
    const request = require('request');
    const iconv = require('iconv-lite');
    const cheerio=require('cheerio');
    const configPublic = require('../config');
    const Bagpipe = require('bagpipe');
    const bagpipe =new Bagpipe(1);
    const bagpipeBookList =new Bagpipe(10);
    const bagpipeContent =new Bagpipe(30);
    const mongoose = require('mongoose');
    const bookModel= mongoose.model('bookList');
    const {getModel} = require("../model/schema/bookItem");

    let config;
    switch (webType) {
        case 'biquge':
            config = require('../config/biquge.config');
            break;
        case 'biquyun':
            config = require('../config/biquyun.config');
            break;
        case 'qu.la':
            config=require("../config/qu.la.config");
            break;
    }



    const sleep = time => new Promise(resolve => {
        setTimeout(resolve,time)
    });

    const getContent = async function (contentInfo,item,bookItemModel,fn) {
        const userAgent = configPublic.userAgents[parseInt(Math.random()*configPublic.userAgents.length)];
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
                        body = iconv.decode(body, config.gs);
                        const $ = cheerio.load(body);
                        contentInfo.content =$("#content").text();
                        bookItemModel.insertMany(contentInfo)
                        fn(item.key+contentInfo.name+contentInfo.chapter+'章节存储！');

                        resolve($("#content").text())
                    }
                })
            })
    };

    const getInfo =async function (item,callbfm) {
        await sleep(parseInt(Math.random()*5000));
        const userAgent = configPublic.userAgents[parseInt(Math.random()*configPublic.userAgents.length)];
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
                    body = iconv.decode(body, config.gs);
                    const $ = cheerio.load(body);
                    item.imageUrl =config.imageOrigin+ $("#fmimg").find("img").attr('src');
                    if (webType=='qu.la') {
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
                        const newcontentLength = contenLength>20?contenLength-20:contenLength;

                        for(let i = newcontentLength;i<list.length;i++){
                            const index =i;
                            const newItem = list[i];
                            const contentInfo = {
                                name:item.bookName,
                                author:item.author,
                                chapter:$(newItem).find("a").text(),
                                section:$(newItem).find("a").text(),
                                originUrl:config.baseUrl+$(newItem).find("a").attr('href'),
                                serial:index,
                            };
                            // const bookChatper =await bookItemModel.find({originUrl:contentInfo.originUrl});
                            bookItemModel.find({originUrl:contentInfo.originUrl}).then(async function (data) {
                                if (data.length){
                                    console.log(item.key+contentInfo.name+contentInfo.chapter+'该章节已存在！')
                                }else{
                                    bagpipeContent.push(getContent,contentInfo,item,bookItemModel,function (strings) {
                                        console.log(strings)
                                    })
                                    // getContent(contentInfo,item,bookItemModel);
                                }
                            });

                            // if (bookChatper.length){
                            //     console.log(item.key+contentInfo.name+contentInfo.chapter+'该章节已存在！')
                            // }else{
                            //     contentInfo.content = await getContent(contentInfo.originUrl);
                            //     console.log(item.key+contentInfo.name+contentInfo.chapter+'章节存储！')
                            //     bookItemModel.insertMany(contentInfo)
                            // }
                        };
                    }
                    callbfm&&callbfm(item);
                    resolve(item)
                }
            })
        })
    };

const start =  function (currentType,callfn) {

        const Options = {
            method : 'GET',
            encoding:null,
            url:config.baseUrl +currentType.url,
            rejectUnauthorized:false,
        };

    request(Options,function (err,res,body) {
        if (err){
            console.log('首页爬取失败');
            console.log(err);
            return;
        }
        body = iconv.decode(body,config.gs);
        const $ = cheerio.load(body);
        const URLS = $('#newscontent li');
        let inow = 0;
        URLS.each(async function (index,ele) {
            const a = $(ele).find('.s2 a');
            const bookName = a.text();

            const bookType = currentType.code;
            const newChapter = $(ele).find('.s3 a')?$(ele).find('.s3 a').text():null;

            var updateTime;
            var author;
            var bookUrl;

            if (webType=='qu.la'){
                if ($(ele).find('.s4').length){
                    updateTime = $(ele).find('.s5').text();
                    author = $(ele).find('.s4').text();
                }else {
                    updateTime = null;
                    author = $(ele).find('.s5').text();
                }
                bookUrl = config.baseUrl+a.attr('href')
            }else{
                 updateTime = $(ele).find('.s3')?$(ele).find('.s3').text().replace(newChapter,'').replace('(','').replace(')',''):null;
                 author = $(ele).find('.s5').text();
                bookUrl = a.attr('href');
            }

            const key =config.webName+bookUrl.match(/\d+/g)[config.keyNum];

            const data = {
                key,
                bookName,
                bookUrl,
                newChapter,
                updateTime,
                author ,
                bookType
            };



                        let bookData = await bookModel.findOne({
                            $and:[
                                {bookName:data.bookName},
                                {author:data.author}
                            ]
                        });



                        if(bookData){
                            if (bookData.key==data.key) {
                                if (bookData.updateTime != data.updateTime || bookData.newChapter !== data.newChapter) {
                                    console.log(bookName + ':有更新');
                                    const bookInfo = await getInfo(data);
                                    if (bookInfo.newChapter) {
                                        await bookModel.updateOne({key: bookInfo.key}, {
                                            updateTime: bookInfo.updateTime,
                                            newChapter: bookInfo.newChapter
                                        })
                                    }
                                } else {
                                    console.log(bookName + ':当前是最新章节')
                                }
                            }
                        }else{
                           /* bagpipeBookList.push(await getInfo,data,async function (bookInfo) {
                                console.log('添加新书:'+data.key+bookName+'.....'+author);
                                await bookModel.create(bookInfo);
                            })*/
                            // const bookInfo = await getInfo(data);
                            // console.log('添加新书:'+bookName);
                            // await bookModel.create(bookInfo);
                        }


            inow++;
            console.log(inow, URLS.length,'dubag')
            if (inow==URLS.length){
                callfn()
            }
        });


        /* async.mapLimit(urlArry,MAXLIMIT,function (item,fn) {
             getInfo(item)
         },function (err,result) {

         })*/
    });
}


;(async => {
        for (let i = 0; i < config.type.length; i++) {
            bagpipe.push(start, config.type[i], function () {
                console.log('爬取下一种类型')
            })
        }

    })();
};

module.exports = startGet;
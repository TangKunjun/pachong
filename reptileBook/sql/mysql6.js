//在booklist刷新章节
const request = require('request');
const iconv = require('iconv-lite');
const cheerio=require('cheerio');
const mysql = require("mysql");
const moment = require('moment');

const bagPipe = require('bagpipe');
const bag = new bagPipe(1);
const bagContent = new bagPipe(10);
const configPublic = require('../config');
const fs = require('fs');



const baseUrls ={
    qula:"https://www.qu.la",
    biquyun:"https://www.biquyun.com",
    biquge:"https://www.biquge.com.cn",

}

const connition = mysql.createConnection({
    host: "52.194.11.19",
    port: 2019,
    user:'admin',
    password:'New_shidai2017',
    database: "book",
});

var getQuery = function (sqr,value) {
    return new Promise(function (resolve,reject) {
        connition.query(sqr,value,function (err,data) {
            if (err){
                reject(err)
            }else{
                resolve(JSON.parse(JSON.stringify(data)))
            }
        })
    })
};

var pudateQuery = function (sqr,value) {
    return new Promise(function (resolve,reject) {
        connition.query(sqr,value,function (err,data) {
            if (err){
                reject(err)
            }else{
                resolve()
            }
        })
    })
};

var my_request=function(url,webUrl,fn){
    const userAgent = configPublic.userAgents[parseInt(Math.random()*configPublic.userAgents.length)];
    request({
        method : 'GET',
        encoding: null,
        url:url,
        rejectUnauthorized:false,
        headers:{
            'User-Agent':userAgent
        }
    },fn)
};

var contentData = function(content,inow,fn){
    request(content.chapterUrl,{
        method : 'GET',
        encoding: null,
        url:content.chapterUrl,
        rejectUnauthorized:false
    },async function(req,res,body){
        if (body) {
            let webUrl = content.id.replace(/\d/g, '');
            if (webUrl === 'biquyun') {
                body = iconv.decode(body, 'gbk');
            } else {
                body = iconv.decode(body, 'utf-8');
            }
            const $ = cheerio.load(body);
            content.content = $("#content").text();
            const recontent =new RegExp("404 - File or directory not found");
            const recontent2 =new RegExp("正在手打中");

            if(recontent.test(content.content)&&recontent2.test(content.content)&&content.content.length<100) {
                fn();
                return;
            }
            const countContent =  (await getQuery("SELECT COUNT(*) count FROM "+content.dataBase+" WHERE bookid=? AND chapter=? AND content=?",[content.id,content.chapter,content.content]))[0].count;


            if (countContent===0){
                connition.query("INSERT INTO "+ content.dataBase+" SET ?",{
                        id:null,
                        bookid:content.id,
                        name:content.bookName,
                        chapter:content.chapter,
                        content:content.content,
                        serial:inow
                    },
                    function (err) {
                        if (err){
                            console.log("插入失败"+content.id+'---'+content.chapter+'-----'+inow,err);
                            fs.appendFile('./error.txt',"插入失败"+content.id+'----'+content.dataBase+'---'+content.chapter+'-----'+'\n',function (err) {
                                if (err){
                                    console.log('写入失败')
                                } else{
                                    console.log('写入成功')
                                }
                            });
                            fn()
                        } else {
                            console.log("插入成功"+content.id+'---'+content.chapter+'-----'+inow);
                            fn()
                        }
                    })
            }else{
                console.log(content.id+'----'+content.chapter+'-------'+content.dataBase+'已存在')
                fn()
            }
        }else{
            console.log(content.id+'-------'+content.chapterUrl+"----没有数据");
            fn()
        }

    })

}

var iooo=0
var saveData = function (bookItem,i,fn) {
    let webUrl = bookItem.id.replace(/\d/g,'');


    my_request(bookItem.bookUrl,webUrl,async function(req,res,body){
        if (webUrl==='biquyun'){
            body = iconv.decode(body, 'gbk');
        }else{
            body = iconv.decode(body, 'utf-8');
        }
        const $ = cheerio.load(body);
        const url_chapter = $("#info").find("p").eq(3).find('a').text();
        const bookDetail = $('#intro').text().slice(0,200);
        let bookImg;
        if (webUrl==='biquge'){
            bookImg =  $('#fmimg').find('img').attr('src');
        }else{
            bookImg =  baseUrls[webUrl]+$('#fmimg').find('img').attr('src');
        }

        let url_time = $("#info").find("p").eq(2).text().replace('最后更新：','');
        if (webUrl=='qula'){
            // url_time = moment(url_time,'MM/DD/YYYY')
            url_time = url_time.replace(/\//g,"-")
        }

        //10天没有更新就设置为完结
        const isOver=moment(new Date()).diff(bookItem.bookUpdateTime, 'days')>10;


        if (
            bookItem.bookUpdateTime!=moment(url_time).format('YYYY-MM-DD').toString()||
            url_chapter!=bookItem.newChapter||
            !bookItem.bookDetail
        ){
            await pudateQuery('UPDATE booklist SET bookUpdateTime=?,newChapter=?,bookDetail=?,imageUrl=? WHERE id=?',[moment(url_time).format('YYYY-MM-DD'),url_chapter,bookDetail,bookImg,bookItem.id]);
            console.log('更新成功')

        }else{
            if (isOver){
                await pudateQuery('UPDATE booklist SET bookUpdateTime=NULL,newChapter=? WHERE id=?',[url_chapter,bookItem.id]);
                console.log(bookItem.bookName+'------该书已完结')
            }else {
                console.log('没有更新');
            }
        }
        //准备获取内容
        var chapterlist =  $("#list").find('dd a');
        var dataBaseData = (await getQuery('SELECT COUNT(*) count FROM '+bookItem.dataBase+' WHERE bookid=?',bookItem.id))[0];

        if(chapterlist.length>dataBaseData.count){
            let curruti=0;
            if (dataBaseData.count) {
                if (chapterlist.length - dataBaseData.count >15){
                    fs.appendFile('./queshao.txt',"插入失败"+bookItem.id+'----'+bookItem.dataBase+'--------'+'\n',function (err) {
                        if (err){
                            console.log('写入失败')
                        } else{
                            console.log('写入成功')
                        }
                    });
                }

                curruti = dataBaseData.count;
                if (chapterlist.length - dataBaseData.count < 15) {
                    curruti = dataBaseData.count;
                } else {
                    curruti = dataBaseData.count;
                    // curruti = 0;
                }
            }else{
                curruti=0
            }
            for (let i=curruti;i<chapterlist.length;i++){
                const liele = chapterlist[i];
                bookItem.chapterUrl =baseUrls[webUrl]+ $(liele).attr('href');
                bookItem.chapter= $(liele).text();

                const contentInfo = {
                    id:bookItem.id,
                    bookName:bookItem.bookName,
                    chapterUrl:bookItem.chapterUrl,
                    chapter:bookItem.chapter,
                    dataBase:bookItem.dataBase
                }
                bagContent.push(contentData,contentInfo,i,function(){

                    curruti++;
                    console.log(curruti,chapterlist.length)
                    if(curruti>=chapterlist.length-1){
                        fn()
                    }
                });
            }
        }else{
            console.log(bookItem.id+'===='+bookItem.bookName+'是最新章节');
            fn()
        }
        // fn()
    })
};

(async function () {

    var myinow=0;
    // var booklist =[{bookName:"生生不灭",id:"biquge13122",dataBase:"database4"},{bookName:"无限作死之最强教父",id:"biquyun10091",dataBase:"database8"},{bookName:"我的自述日记",id:"qula101088",dataBase:"database13"}];
    // var booklist = await getQuery('select * from booklist where id LIKE "biquge%" or id like "biquyun%" or id like "qula%" LIMIT 500,500; ');
    var booklist = await getQuery('select * from booklist where bookUpdateTime IS NOT NULL LIMIT 0,100; ');
    // var booklist = await getQuery('select * from booklist where bookUrlKey IS NULL limit 0, 20 ');
    // var booklist = await getQuery('select * from booklist where id IN()');
    console.log(booklist.length);
    booklist.forEach(async function (item,i) {
        bag.push(saveData,item,i, function () {
            myinow++;
            console.log(myinow)
        })
    })
})();
//在booklist刷新章节
const request = require('request');
const iconv = require('iconv-lite');
const cheerio=require('cheerio');
const mysql = require("mysql");
const moment = require('moment');

const bagPipe = require('bagpipe');
const bag = new bagPipe(3);
const bagContent = new bagPipe(10);
const configPublic = require('../config');
const fs = require('fs');



const baseUrls ={
    qula:"https://www.qu.la",
    biquyun:"https://www.biquyun.com",
    biquge:"https://www.biquge.com.cn",

}

const connition = mysql.createConnection({
    host: "localhost",
    // port: 2019,
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
                            fs.appendFile('./error.txt',"插入失败"+content.id+'----'+content.dataBase+'---'+content.chapter+'-----'+i+'\n',function (err) {
                                if (err){
                                    console.log('写入失败')
                                } else{
                                    console.log('写入成功')
                                }
                            });
                        } else {
                            console.log("插入成功"+content.id+'---'+content.chapter+'-----'+inow);
                        }
                    })
            }else{
                console.log(content.id+'----'+content.chapter+'-------'+content.dataBase+'已存在')
            }
        }else{
            console.log(content.id+'-------'+content.chapterUrl+"----没有数据");
        }
        fn()
    })

}

var saveData = function (bookItem,i,fn) {
    let webUrl = bookItem.id.replace(/\d/g,'');

    my_request(bookItem.bookUrl,webUrl,async function(req,res,body){
        if (webUrl==='biquyun'){
            body = iconv.decode(body, 'gbk');
        }else{
            body = iconv.decode(body, 'utf-8');
        }
        const $ = cheerio.load(body);
        let url_time = $("#info").find("p").eq(2).text().replace('最后更新：','');
        const url_chapter = $("#info").find("p").eq(3).find('a').text();
        if (webUrl=='qula'){
            url_time = moment(url_time,'MM/DD/YYYY')
        }

        //10天没有更新就设置为完结
        const isOver=moment(new Date()).diff(bookItem.bookUpdateTime, 'days')>10;

        if (bookItem.bookUpdateTime!=moment(url_time).format('YYYY-MM-DD').toString()||url_chapter!=bookItem.newChapter){
            await pudateQuery('UPDATE booklist SET bookUpdateTime=?,newChapter=? WHERE id=?',[moment(url_time).format('YYYY-MM-DD'),url_chapter,bookItem.id]);
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
                if (dataBaseData.count > 2) {
                    curruti = dataBaseData.count - 2;
                } else {
                    curruti = dataBaseData.count;
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
                    curruti++
                    if(curruti>=chapterlist.length-1){
                        fn()
                    }
                });
            }
        }else{
            console.log(bookItem.id+'===='+bookItem.bookName+'是最新章节');
            fn()
        }
    })
};

(async function () {

    // var booklist =[{bookName:"生生不灭",id:"biquge13122",dataBase:"database4"},{bookName:"无限作死之最强教父",id:"biquyun10091",dataBase:"database8"},{bookName:"我的自述日记",id:"qula101088",dataBase:"database13"}];
    // var booklist = await getQuery('select * from booklist where id LIKE "biquge%" or id like "biquyun%" or id like "qula%" limit 10,3000 ; ');
    var booklist = await getQuery('select * from booklist where bookUpdateTime IS NOT NULL limit 100,1000');
    booklist.forEach(async function (item,i) {
        bag.push(saveData,item,i, function () {
        })
    })
})()
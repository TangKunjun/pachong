//添加qula
const request = require('request');
const iconv = require('iconv-lite');
const cheerio=require('cheerio');
const configPublic = require('../config');
const Bagpipe = require('bagpipe');
const bagpipeType =new Bagpipe(1);
const bagpipe =new Bagpipe(5);
const bagpipeContent =new Bagpipe(30);
const mysql = require('mysql');
var lodash = require('lodash');


let config;


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


var saveData =async function (bookobj,fn) {
    const isExit =(await getQuery('SELECT COUNT(*) count FROM booklist WHERE bookName=?',bookobj.bookName))[0].count;

    if(isExit==0){
        const sqlDataLen =(await getQuery('SELECT COUNT(*) count FROM booklist',null))[0].count;
        bookobj.dataBase = 'database'+Math.floor(sqlDataLen/500);
        var objInfo = {
            id:bookobj.id,
            bookName:bookobj.bookName,
            bookUrl:bookobj.bookUrl,
            bookType:bookobj.bookType,
            dataBase:bookobj.dataBase
        }
        connition.query("INSERT INTO booklist SET ?",objInfo,function(err){
            if (err) {
                console.log(bookobj.id+'----'+bookobj.bookName+'存储失败')
            }else{
                console.log(bookobj.id+'----'+bookobj.bookName+'-----'+bookobj.dataBase+'---存储成功')
            }
        })
    }
        fn()
}


function getBook(url) {

    const userAgent = configPublic.userAgents[parseInt(Math.random()*configPublic.userAgents.length)];

    request({
        method : 'GET',
        encoding: null,
        url:url,
        rejectUnauthorized:false,
        headers:{
            'User-Agent':userAgent
        }
    },async function (req,res,body) {

        body = iconv.decode(body, 'utf-8');

        const $ = cheerio.load(body);

        var typeArry = ["xhbook","xxbook","dsbook","lsbook","khbook","wybook","qcbook","xhbook"];
        var resultArray =[];
        list = $("#main").find('.index_toplist');
        for(let i=0;i<list.length;i++){
            var inwo = i+1;
            var lists = $("#tabData_"+inwo);
            var lllist = lists.find("ul li");
            for (let j=0;j<lllist.length;j++){
                var ele = lllist[j];
                var urlstr = $(ele).find('a').attr('href');
                resultArray.push({
                    bookName:$(ele).find('a').text(),
                    bookType:typeArry[i],
                    bookUrl:"https://www.qu.la"+urlstr,
                    id:"qula"+urlstr.match(/\d+/g)[0]
                })
            }
        }
        resultArray =lodash.uniqWith(resultArray, lodash.isEqual);
        for(let xx=0;xx<resultArray.length;xx++){
            var bookobj = resultArray[xx];
            bagpipe.push(saveData,bookobj,function(){

            })

        }
    })

}


;(function () {
    const targetUrl = 'https://www.qu.la/wanbenxiaoshuo/';
    const config = require('../config/qu.la.config');

    getBook(targetUrl,config)
})();

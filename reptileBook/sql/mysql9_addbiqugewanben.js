//添加biquge完本
    const request = require('request');
    const iconv = require('iconv-lite');
    const cheerio=require('cheerio');
    const configPublic = require('../config');
    const Bagpipe = require('bagpipe');
    const bagpipeType =new Bagpipe(1);
    const bagpipe =new Bagpipe(1);
    const bagpipeContent =new Bagpipe(30);
    const mysql = require('mysql');


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


    function getBook(url,typeInfo,config,fn) {

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


            if (config.webName === 'biquyun') {
                body = iconv.decode(body, 'gbk');
            } else {
                body = iconv.decode(body, 'utf-8');
            }
            const $ = cheerio.load(body);

            list = $("#main").find('ul li');



            var  objs={
                "玄幻小说":"xhbook",
                "修真小说":"xxbook",
                "都市小说":"dsbook",
                "网游小说":"wybook",
                "历史小说":"lsbook",
                "科幻小说":"khbook",
                "其他小说":"xhbook",
                "言情小说":"yqbook"
            }


            for(let i=1;i<list.length;i++){
                const ele = list[i];
                const sqlDataLen =(await getQuery('SELECT COUNT(*) count FROM booklist',null))[0].count;
                const a = $(ele).find('.s2 a');
                const author = $(ele).find('.s4').text();
                const bookUrl =config.baseUrl+ a.attr('href');
                const typeKey = $(ele).find('.s1 a').text();

                const bookobj = {
                    id:config.webName+bookUrl.match(/\d+/g)[config.keyNum],
                    dataBase:'database'+Math.floor(sqlDataLen/500),
                    bookType:objs[typeKey],
                    author:author,
                    bookName : a.text(),
                    bookUrl:bookUrl
                };


                 const isExit =(await getQuery('SELECT COUNT(*) count FROM booklist WHERE bookName=?  AND author=?',[bookobj.bookName,bookobj.author]))[0].count;

                 if(isExit==0){
                     connition.query("INSERT INTO booklist SET ?",{
                         id:bookobj.id,
                         bookName:bookobj.bookName,
                         bookUrl:bookobj.bookUrl,
                         author:bookobj.author,
                         bookType:bookobj.bookType,
                         dataBase:bookobj.dataBase
                     },function(err){
                         if (err) {
                             console.log(bookobj.id+'----'+bookobj.bookName+'存储失败')
                         }else{
                             console.log(bookobj.id+'----'+bookobj.bookName+'-----'+bookobj.dataBase+'---存储成功')
                         }
                     })
                 }

                if (i>=list.length-1) {
                    fn()
                }
            }
        })

    }

    function target(config,fn) {
        config.type = ['quanben',"quanben/2.html","quanben/3.html","quanben/4.html"];
        for(let i=0;i<config.type.length;i++){
            const urlType = config.type[i];
            const urlUrl = config.baseUrl+urlType;

            var inow =0;
            bagpipeType.push(getBook,urlUrl,urlType,config,function () {
                inow++;
                if(inow>=config.type.length){
                    fn()
                }
            })
        }
    }

    ;(function () {

        const targetUrl = [
            require('../config/biquge.config')
        ];


        for(let i=0;i<1;i++){
            config = targetUrl[i];
            bagpipe.push(target,config,function () {
                console.log()
            } )
        }
    })();

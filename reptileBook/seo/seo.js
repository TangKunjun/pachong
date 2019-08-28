//百度链接主动推送
const request = require('request');
const mysql = require('mysql');
const bagPipe = require('bagpipe');
const bag = new bagPipe(10);

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
var post = function (bodys) {
    return new Promise(function (resolve,reject) {
        request({
            method: 'POST',
            encoding: null,
            url: "http://data.zz.baidu.com/urls?site=www.941kanshu.com&token=yYtInFqwTZdPs9CP",
            headers: {
                "Content-Type": "text/plain"
            },
            body: bodys
        }, function (req, res, body) {
            if (Buffer.isBuffer(body)) {
                if (JSON.parse(body.toString()).success) {
                    console.log(bodys + "--------成功");
                    resolve(true)
                } else {
                    console.log(bodys + "--------失败");
                    reject(false)
                }
            }
        });
    })
}

var targetUrl = "http://www.941kanshu.com/";
var Book = "m/book/";

var url = [
    "http://www.941kanshu.com/",
    "http://www.941kanshu.com/chepter/xh",
    "http://www.941kanshu.com/chepter/ds",
    "http://www.941kanshu.com/chepter/ls",
    "http://www.941kanshu.com/chepter/qc",
    "http://www.941kanshu.com/chepter/qh",
    "http://www.941kanshu.com/chepter/xy",
    "http://www.941kanshu.com/chepter/wy",
    "http://www.941kanshu.com/m",
    "http://www.941kanshu.com/m/classify",
    "http://www.941kanshu.com/m/newbook",
    "http://www.941kanshu.com/book/chepter/xhbook",
    "http://www.941kanshu.com/book/chepter/dsbook",
    "http://www.941kanshu.com/book/chepter/lsbook",
    "http://www.941kanshu.com/book/chepter/qcbook",
    "http://www.941kanshu.com/book/chepter/qhbook",
    "http://www.941kanshu.com/book/chepter/xybook",
    "http://www.941kanshu.com/book/chepter/wybook"
];

var postWrap = async function(bodys,fn){
    await post(bodys);
    fn();
}

var inow=0;
;(async function () {
    var url = await getQuery('select * from booklist');

    console.log(url.length);
    for (var i=0;i<url.length;i++){
        bag.push(postWrap,targetUrl+Book+url[i].id+"/"+url[i].dataBase,function(){
           console.log(inow++)
        })
    }
})()




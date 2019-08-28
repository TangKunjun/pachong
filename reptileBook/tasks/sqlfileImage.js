var fs = require('fs');
var request = require("request");
const mysql = require('mysql');
const path = './bookImage/';
const bage = require('bagpipe');
const bagpipe = new bage(1);

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

const fn = function (book,fn) {
        var isExist = fs.existsSync(path+book.id+'.jpg');
        if(book.imageUrl&&!isExist){
            var writeStream = fs.createWriteStream(path+book.id+'.'+book.imageUrl.substr(-3));
            var readStream = request({
                method: "GET",
                url:book.imageUrl,
                timeout: 10000,
                pool: false,
                strictSSL: false,
                rejectUnauthorized: false,
                header:{
                    Referer:'no-referrer-when-downgrade',
                }
            })
            readStream.pipe(writeStream);
            readStream.on('end', function() {
                book.bookUrlKey = book.id+'.jpg';
                console.log('文件下载成功');
            });
            readStream.on('error', function(err) {
                console.log("错误信息:" + err)
            })
            writeStream.on("finish",async function() {
                console.log("文件写入成功");
                await getQuery('UPDATE booklist SET bookUrlKey=? WHERE id=?',[book.bookUrlKey,book.id] )
                writeStream.end();
                fn()
            });
        }else {
            fn()
        }
    }

;(async function () {
   var books = await getQuery(`SELECT * FROM booklist WHERE bookUrlKey IS NULL`);


    let iss = 0;
    for (let i=0;i<books.length;i++){
        const book = books[i];
        // book.imageUrl= book.imageUrl.replace('https://www.biquge.com.cn/','');
        // book.features.push("girlRead");
        // book.dataBase = 'database16';
        // await book.save()
        bagpipe.push(fn,book,function () {
            iss++;
            console.log(books.length+'-----------'+iss)
        })
    }
})()




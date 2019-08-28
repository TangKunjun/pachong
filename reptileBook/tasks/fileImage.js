var fs = require('fs');
var request = require("request");
const mongoose = require('mongoose');
const bookModel = mongoose.model('bookList');
const path = '../myDom/public/image/bookImage/';
const bage = require('bagpipe');
const bagpipe = new bage(5);

const fn = function (book,fn) {
        var isExist = fs.existsSync(path+book.key+'.jpg');
        if(book.imageUrl&&!isExist){
            var writeStream = fs.createWriteStream(path+book.key+'.'+book.imageUrl.substr(-3));
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
                book.bookUrlKey = book.key+'.jpg';
                console.log('文件下载成功');
            });
            readStream.on('error', function(err) {
                console.log("错误信息:" + err)
            })
            writeStream.on("finish",async function() {
                console.log("文件写入成功");
                book.bookUrlKey = book.key+'.'+book.imageUrl.substr(-3);
                await book.save();
                writeStream.end();
                fn()
            });
        }else {
            fn()
        }
    }

;(async () => {
    let books = await bookModel.find({
dataBase:{$exists:false},
   /* $or:[
        {bookUrlKey:{$exists:false}},
        {bookUrlKey:null},
        {bookUrlKey:''},
    ]*/

    /*$or:[
        {key:"xglt68414"},
        {key:"xglt68378"},
        {key:"xglt68383"},
        {key:"xglt68312"},
        {key:"xglt68316"},
        {key:"xglt68358"},
    ]*/



}).limit(480);

let iss = 0;
for (let i=0;i<books.length;i++){
    const book = books[i];
    // book.imageUrl= book.imageUrl.replace('https://www.biquge.com.cn/','');
    // book.features.push("girlRead");
    book.dataBase = 'database16';
    await book.save()
    // bagpipe.push(fn,book,function () {
    //     iss++;
    //     console.log(books.length+'-----------'+iss)
    // })
}

})();


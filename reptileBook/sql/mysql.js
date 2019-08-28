const mongoose = require('mongoose');
const bookModel= mongoose.model('bookList');
const {getModel} = require("../model/schema/bookItem");
const mysql = require("mysql");
const moment = require('moment');

const connition = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user:'root',
    password:'123456',
    database: "book",
})




connition.connect(function (err) {
    if (err){
        console.log('链接失败')
    } else{
        console.log("链接成功");

        clData();
    }
})

async function clData() {
    var booklist = await bookModel.find({dataBase:{$exists:false}});

    console.log(booklist.length)
    booklist.forEach(function (item,i) {


//         if (item.updateTime) {
//             const mouth = item.updateTime.split('-')[0] * 1;
//             if (mouth > 6) {
//                 item.updateTime = "2018-" + item.updateTime
//             } else {
//                 item.updateTime = "2019-" + item.updateTime
//             }
//         }
//
//         connition.query(`INSERT INTO booklist VALUES ('${item.key}','${item.bookName}','${item.bookUrl}','${item.newChapter}','${item.imageUrl}','${item.bookDetail}','${item.author}',
// '${item.bookType}',null,'${item.bookUrlKey}','${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}','${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}')`,
//             function (err) {
//                 if (err){
//                     console.log("插入失败"+item.key,err)
//                 } else {
//                     console.log("插入成功"+item.key)
//                 }
//             })



        connition.query(`UPDATE booklist SET \`dataBase\`='${item.dataBase}' where id='${item.key}'`,
            function (err) {
                if (err){
                    console.log("插入失败"+item.key,err)
                } else {
                    console.log("插入成功"+item.key+'---------'+i)
                }
            })
    })
};
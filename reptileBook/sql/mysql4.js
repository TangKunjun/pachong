//查看mysql中哪些有书名却没有章节的
const mysql = require("mysql");

const bagPipe = require('bagpipe');

const fs = require('fs');


const connition = mysql.createConnection({
    host: "192.168.1.147",
    port: 3306,
    user:'admin',
    password:'New_shidai2017',
    database: "book",
})

connition.connect(function (err) {
    if (err) {
        console.log('连接失败');

        // connition.query("SELECT booklist.bookName,booklist.bookDetail,booklist.author,booklist.bookUrlKey,booklist.dataBase,"+dataBase+".id,"+dataBase+".chapter,"+dataBase+".content,"+dataBase+".serial FROM booklist  JOIN "+dataBase+" ON booklist.id=? AND  booklist.id = "+dataBase+".bookid ORDER BY serial ASC;")
    }else{
        console.log('连接成功');
        connition.query('SELECT * FROM booklist ',function (err,result) {
            if (err){
                console.log(err)
            }else{
                var data =JSON.parse(JSON.stringify(result));
                for(var  i=10220;i<data.length;i++) {
                    const item = data[i];
                    connition.query("SELECT COUNT(*) AS count FROM "+item.dataBase + " WHERE bookid=?",item.id,function (err,result) {
                        if (err){
                            console.log(err)
                        }else{
                            result = JSON.parse(JSON.stringify(result))
                            console.log(item.bookName+'---'+item.id+'====='+item.dataBase+'----'+result[0].count+">>>>>"+data.length+'-----'+i);
                            if (result[0].count=='0'){
                                fs.appendFile('./data.json','{bookName:'+item.bookName+',id:'+item.id+',dataBase:'+item.dataBase+'}\n',function (err) {
                                    if (err){
                                        console.log('写入失败')
                                    }else{
                                        console.log('写入成功')
                                    }
                                })
                            }
                        }
                    })
                }
            }
        })
    }
})



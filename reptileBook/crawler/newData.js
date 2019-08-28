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


;(async function () {
    const  bookList = await bookModel.find({
            // collectionType:"xglt"
            dataBase:"database0"
            // collectionType:"biquge"
    });

    for(let i=77;i<bookList.length;i++) {
        const item = bookList[i];

        console.log(item.key)
       const bookChapterModel = await getModel(item.key);

       console.log(bookChapterModel)
       if (bookChapterModel) {
           let bookChapter = await bookChapterModel.find({});

           console.log()
           if (!bookChapter.length){
               continue;
           }


           bookChapter = JSON.parse(JSON.stringify(bookChapter));


           const type = await getModel("xglt67897");

           const arry=[];
           bookChapter.forEach(async function (chapter) {
                   const obj ={
                       key : item.key,
                       name : chapter.name,
                       "author" : chapter.author,
                       "chapter" : chapter.chapter,
                       "originUrl" : chapter.originUrl,
                       "serial" :  chapter.serial,
                       "content" : chapter.content
                   }
                   arry.push(obj);
               // const chapterLength =await type.find({"originUrl" : chapter.originUrl}).count();

               // if (!chapterLength) {
               //     await type.create(obj);
               //     console.log(obj.name +"---"+obj.chapter)
               // }
           });
           const chapterLength =await type.find({key : arry[0].key}).count();
           if (!chapterLength) {
               await type.insertMany(arry);
               console.log(arry[0].name)
           }

       }

        console.log(bookList.length + '--------' + i)

    }

})();







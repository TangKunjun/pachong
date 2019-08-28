//上传到七牛


const qiniu = require('qiniu');
// const nanoid = require('nanoid');
const mongoose = require('mongoose');
const bookModel = mongoose.model('bookList');
const config = require('../config');
const path = require('path');

const bucket = config.qiniu.bucket;
const mac = new qiniu.auth.digest.Mac(config.qiniu.AK,config.qiniu.SK);
const cfg = new qiniu.conf.Config();
const client = new qiniu.rs.BucketManager(mac, cfg);



const uploadToQiniu = async(url,key) => {
    return new Promise((resolve,reject) => {
        client.fetch(url,bucket,key,(err,ret,info) => {
            console.log(info.statusCode)
            if (err){
                reject(err);
            }else{
                if(info.statusCode==200){
                    resolve(key)
                }else{
                    reject(err)
                }
            }
        })
    })
};

;(async () => {
    let books = await bookModel.find({
        $or:[
            {bookUrlKey:{$exists:false}},
            {bookUrlKey:null},
            {bookUrlKey:''},
        ]
    });
    for (let i=0;i<[books[0]].length;i++){
        const book = books[i];
        if(book.imageUrl&&!book.bookUrlKey){
            try {
                console.log('开始传poster');
                let imageKey = await uploadToQiniu(path.resolve(__dirname,'../../../bookImage/'+book.key+'.png'),book.key+'.png');

                if(imageKey){
                    book.bookUrlKey = imageKey
                }
                console.log(book)
                await book.save();
            }catch (err) {
                console.log(err)
            }
        }
    }
})();

const mongoose = require('mongoose');
// const db = 'mongodb://fangke2:w!z%40j#p$z&805@52.194.11.19:2019/book';
const db = 'mongodb://192.168.1.14:27017/book';
const glob = require('glob');
const {resolve} = require('path');

mongoose.Promise = global.Promise;

exports.connect = () => {
    glob.sync(resolve(__dirname,'./','**/*.js')).forEach(require)//加载所有schema文件下的js

    let maxConnectTimes =0;

    return new Promise((resolve,reject) => {
        mongoose.set('useNewUrlParser', true);
        mongoose.set('useFindAndModify', false);
        mongoose.set('useCreateIndex', true);
        mongoose.connect(db);

        mongoose.connection.on('disconnected',() => {  //断开的时候监听
            maxConnectTimes++;
            if (maxConnectTimes<5) {
                mongoose.connect(db)
            }else{
                throw new Error('数据库挂了，都连接了5次了')
            }
        });

        mongoose.connection.on('error',error => {
            if (maxConnectTimes<5) {
                mongoose.connect(db, {useNewUrlParser: true})
            }else{
                throw new Error('数据库挂了，都连接了5次了')
            }
            console.log(error);
        });

        mongoose.connection.once('open',() => {
            resolve();
            console.log('数据库连接成功')
        })
    })


};
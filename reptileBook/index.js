const {connect,initSchemas} =require('./model/init');
const startGet = require('./crawler/getbooklist');
let timer = null;
let timer2 = null;
let timer3 = null;
;(async() => {
    // await connect();

    // require('./crawler/newData');   //数据库优化
    require('./sql/mysql6');   //数据库优化
    // require('./crawler/getquanben');   //爬取全本

    // require('./crawler/getbooklist');   //获取指定网站的数据

    // require('./crawler/getbook');  //获取笔趣阁某一本小说

    //biquyun 网站爬取
/*
    startGet('biquyun')
    clearInterval(timer)
    timer = setInterval(() => {
        startGet('biquyun')
    },60000*30);
   //biquge网站爬取

startGet('biquge')
clearInterval(timer2)
timer2 = setInterval(() => {
    startGet('biquge')
},60000*60);


//qu.la网站
startGet('qu.la');
clearInterval(timer3)
timer3 = setInterval(() => {
    startGet('qu.la')
},60000*90);

*/

    // require('./tasks/qiniu');
    // require('./tasks/fileImage');
})();

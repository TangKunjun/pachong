const mongoose = require('mongoose');
const bookModel= mongoose.model('bookList');
const {getModel} = require("../model/schema/bookItem");
const mysql = require("mysql");
const moment = require('moment');
const bagPipe = require('bagpipe');
const bag = new bagPipe(1);
const fs = require('fs');
var inow = 0;

const connition = mysql.createConnection({
    host: "192.168.1.149",
    port: 3306,
    user:'admin',
    password:'New_shidai2017',
    database: "book",
})




connition.connect(function (err) {
    if (err){
        console.log('链接失败',err)
    } else{
        console.log("链接成功");

        clData();
    }
})


var getCount = function (sqr,value) {
    return new Promise(function (resolve,reject) {
        connition.query(sqr,value,function (err,data) {
            if (err){
                reject(err)
            }else{
                resolve(JSON.parse(JSON.stringify(data[0])).count)
            }
        })
    })
}

async function  saveData(item,i,fn){


    // var dataBase=item.dataBase;

    // var bookItem = await getModel(item.key).find();


    var bookItem = await getModel(item.id).find();


    if (!bookItem.length) {
        fs.appendFile('./nofile.txt',item.id+'-------'+bookItem.length+'\n',function (err) {
            if (err){
                console.log(err)
            }else{
                console.log('插入成功')
            }
        })
        fn();
        return;
    }


    let inows =1;

    bookItem.forEach(async function (data) {

        var count = await getCount("SELECT COUNT(*) count FROM "+item.dataBase+" WHERE bookid=? AND chapter=? AND content=?",[item.id,data.chapter,data.content]);

        if(JSON.parse(count===0)){
            connition.query("INSERT INTO "+ item.dataBase+" SET ?",{
                    id:null,
                    bookid:item.id,
                    name:data.name,
                    chapter:data.chapter,
                    content:data.content,
                    serial:data.serial
                },
                function (err) {
                    if (err){
                        console.log("插入失败"+item.id+'---'+data.chapter+'-----'+i,err);
                        fs.appendFile('./error.txt',"插入失败"+item.id+'----'+item.dataBase+'---'+data.chapter+'-----'+i+'\n',function (err) {
                            if (err){
                                console.log('写入失败')
                            } else{
                                console.log('写入成功')
                            }
                        });
                    } else {
                        console.log("插入成功"+item.id+'---'+data.chapter+'-----'+i);
                    }
                })
        }else{
            console.log(item.id+","+data.chapter+","+item.dataBase+"已存在");
        }

        inows++;
        if (inows>=bookItem.length){
            fn(inow)
        }

    })
}


const querys = function (sqt,value) {
    return  new Promise(function (resolve,reject) {
        connition.query(sqt,value,function (err,sult) {
            if (err){
                reject(err)
            }else{
                resolve(JSON.parse(JSON.stringify(sult[0])))
            }
        })
    })
}

async function clData() {
    /*var booklist = await bookModel.find({
        dataBase: 'database16',
    });*/

    var booklist =[
        "lt1257",
        "lt1262",
        "lt1272",
        "lt1277",
        "lt1287",
        "lt1292",
        "lt1297",
        "lt3802",
        "lt3824",
        "lt3818",
        "lt3813",
        "lt3834",
        "lt3844",
        "lt3839",
        "lt3854",
        "lt3859",
        "lt3864",
        "lt3807",
        "lt3869",
        "lt3889",
        "lt3884",
        "lt1282",
        "lt3879",
        "lt4970",
        "lt3894",
        "lt4985",
        "lt4980",
        "lt4975",
        "lt5066",
        "lt5076",
        "lt5081",
        "lt4990",
        "lt4965",
        "lt5096",
        "lt5091",
        "lt5169",
        "lt5164",
        "lt5173",
        "lt5188",
        "lt5193",
        "lt5183",
        "lt5264",
        "lt5086",
        "lt5279",
        "lt5289",
        "lt5299",
        "lt5269",
        "lt5367",
        "lt5372",
        "lt5392",
        "lt5382",
        "lt5294",
        "lt5467",
        "lt5462",
        "lt5477",
        "lt5487",
        "lt5274",
        "lt5565",
        "lt5497",
        "lt5492",
        "lt5387",
        "lt5580",
        "lt5570",
        "lt5595",
        "lt5672",
        "lt5667",
        "lt5692",
        "lt5697",
        "lt5687",
        "lt5472",
        "lt5662",
        "lt5585",
        "lt5774",
        "lt5784",
        "lt5779",
        "lt5764",
        "lt5769",
        "xglt68283",
        "lt5794",
        "xglt68253",
        "xglt68335",
        "xglt68352",
        "xglt68311",
        "xglt68412",
        "xglt68387",
        "xglt68377",
        "xglt79510",
        "xglt68419",
        "xglt68404",
        "xglt68396",
        "xglt79521",
        "xglt79545",
        "xglt79563",
        "xglt79501",
        "xglt79551",
        "xglt79576",
        "xglt79537",
        "xglt79570",
        "lt1209",
        "xglt79557",
        "lt1218",
        "lt1204",
        "lt1238",
        "lt1233",
        "lt1228",
        "lt1243",
        "lt1273",
        "lt1258",
        "lt1253",
        "lt1268",
        "lt1223",
        "lt1283",
        "lt1278",
        "lt3803",
        "lt1288",
        "lt3809",
        "lt1298",
        "lt3820",
        "lt3825",
        "lt3830",
        "lt3845",
        "lt3850",
        "lt3855",
        "lt3890",
        "lt3865",
        "lt3840",
        "lt3860",
        "lt3880",
        "lt3885",
        "lt4971",
        "lt4981",
        "lt3895",
        "lt4996",
        "lt4966",
        "lt4986",
        "lt5072",
        "lt5062",
        "lt5067",
        "lt5087",
        "lt5174",
        "lt5077",
        "lt5092",
        "lt5199",
        "lt5165",
        "lt5189",
        "lt5270",
        "lt5184",
        "lt5194",
        "lt5290",
        "lt5285",
        "lt5082",
        "lt5265",
        "lt5295",
        "lt5383",
        "lt5363",
        "lt5368",
        "lt5398",
        "lt5473",
        "lt5378",
        "lt5373",
        "lt5483",
        "lt5463",
        "lt5393",
        "lt5478",
        "lt5571",
        "lt5566",
        "lt5493",
        "lt5576",
        "lt5581",
        "lt5591",
        "lt5488",
        "lt5678",
        "lt5596",
        "lt5688",
        "lt5683",
        "lt5673",
        "lt5668",
        "lt5765",
        "lt5775",
        "lt5698",
        "xglt68265",
        "lt5785",
        "lt5780",
        "lt5795",
        "xglt68320",
        "lt5790",
        "xglt68413",
        "xglt68338",
        "xglt68388",
        "xglt68379",
        "xglt68420",
        "xglt68368",
        "xglt79497",
        "xglt68397",
        "xglt79502",
        "xglt79546",
        "xglt79528",
        "xglt79522",
        "xglt79511",
        "xglt79578",
        "xglt79558",
        "xglt79564",
        "xglt79571",
        "lt1224",
        "lt1214",
        "lt1219",
        "xglt79552",
        "lt1234",
        "lt1205",
        "lt1244",
        "lt1249",
        "lt1254",
        "lt1259",
        "lt1264",
        "lt1274",
        "lt1279",
        "lt1299",
        "lt1269",
        "lt1289",
        "lt3815",
        "lt3810",
        "lt1294",
        "lt3836",
        "lt3821",
        "lt3831",
        "lt3826",
        "lt3856",
        "lt3851",
        "lt3866",
        "lt3846",
        "lt3861",
        "lt3881",
        "lt3896",
        "lt4972",
        "lt3886",
        "lt3891",
        "lt4992",
        "lt4977",
        "lt5063",
        "lt4982",
        "lt5068",
        "lt5073",
        "lt5078",
        "lt5098",
        "lt5088",
        "lt5170",
        "lt5166",
        "lt4997",
        "lt5180",
        "lt5190",
        "lt5093",
        "lt5185",
        "lt5195",
        "lt5296",
        "lt5276",
        "lt5281",
        "lt5364",
        "lt5291",
        "lt5286",
        "lt5384",
        "lt5399",
        "lt5369",
        "lt5464",
        "lt5374",
        "lt5469",
        "lt5389",
        "lt5484",
        "lt5474",
        "lt5494",
        "lt5567",
        "lt5479",
        "lt5499",
        "lt5592",
        "lt5577",
        "lt5582",
        "lt5664",
        "lt5674",
        "lt5679",
        "lt5587",
        "lt5771",
        "lt5669",
        "lt5689",
        "lt5694",
        "lt5776",
        "lt5699",
        "lt5766",
        "xglt68295",
        "lt5791",
        "lt5786",
        "xglt68344",
        "xglt68370",
        "xglt68325",
        "xglt68268",
        "xglt68383",
        "xglt68414",
        "xglt79512",
        "xglt68398",
        "xglt68421",
        "xglt79504",
        "xglt79523",
        "xglt79565",
        "xglt79547",
        "xglt68360",
        "xglt79539",
        "xglt79560",
        "xglt79498",
        "xglt79573",
        "xglt79579",
        "lt1220",
        "lt1210",
        "lt1201",
        "lt1215",
        "lt1235",
        "lt1225",
        "lt1230",
        "lt1240",
        "lt1270",
        "lt1260",
        "lt1265",
        "lt1255",
        "lt1275",
        "lt1290",
        "lt1250",
        "lt1295",
        "lt1877",
        "lt1285",
        "lt3842",
        "lt3832",
        "lt3827",
        "lt3811",
        "lt3852",
        "lt3877",
        "lt3862",
        "lt3867",
        "lt3892",
        "lt4968",
        "lt3897",
        "lt3822",
        "lt3857",
        "lt3882",
        "lt4978",
        "lt4998",
        "lt3887",
        "lt5064",
        "lt5074",
        "lt5069",
        "lt4988",
        "lt5094",
        "lt5084",
        "lt5089",
        "lt5099",
        "lt5181",
        "lt5262",
        "lt5186",
        "lt5277",
        "lt5282",
        "lt5167",
        "lt5267",
        "lt5191",
        "lt5297",
        "lt5365",
        "lt5385",
        "lt5395",
        "lt5475",
        "lt5292",
        "lt5470",
        "lt5380",
        "lt4993",
        "lt5176",
        "lt5287",
        "lt5370",
        "lt5465",
    ];



    booklist.forEach(async function (item,i) {
        inow++;
      const booklist =  await querys('select * from booklist where id=?',item);



       bag.push(saveData,booklist,i, function (inow) {
           console.log(inow)
       })
    })
};
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
var mongoosedb = mongoose.createConnection('mongodb://192.168.1.14:27017/myguwenBookList');
var serverdb = mongoose.createConnection('mongodb://52.194.11.19:27017/book');

const bookMap =Schema({
    key:{
        type:String,
        unique:true,
        required:true
    },
    bookName:String,
    bookUrl:String,
    newChapter:String,
    imageUrl:String,
    bookDetail:String,
    author:String,
    bookType:String,
    updateTime:String,
    bookUrlKey:String,
    features:[String],
    category:[{
        type:ObjectId,
        ref:'Category'
    }],
    meta:{
        createAt:{
            type:Date,
            default:Date.now()
        },
        updatedAt:{
            type:Date,
            default:Date.now()
        }
    }
});

const mongdooseModel = mongoosedb.model("bookList",bookMap);
const serverdbModel = serverdb.model("bookList",bookMap);

;(async function () {
   let data =  await mongdooseModel.find().collation({"locale": "zh", numericOrdering:true}).sort({key:-1}).limit(317);

   data = data.map(function(v){
       return {
           features: v.features,
           category: v.category,
           key:v.key,
           bookName:v.bookName,
           bookUrl:v.bookUrl,
           bookDetail:v.bookDetail,
           imageUrl:v.imageUrl,
           author:v.author,
           bookType:v.bookType,
           bookUrlKey:v.bookUrlKey
       }
   })


    serverdbModel.insertMany(data,function(err,data){
        console.log(err, data)
    })
})()

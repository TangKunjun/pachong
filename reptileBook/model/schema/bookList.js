const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
//小说列表
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

bookMap.pre('save',function(next){  //保存之前的中间件
    if (this.isNew){
        this.meta.createAt = this.meta.updatedAt = Date.now()
    }else{
        this.meta.updatedAt = Date.now()
    }
    next()
});
mongoose.model('bookList',bookMap);
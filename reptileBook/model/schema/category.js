const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;      //id

const categorySchema = new Schema({
    name:{
        unique:true,
        type:String
    },
    movies:[{
       type:ObjectId,
        ref:'bookList'
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

categorySchema.pre('save',function(next){  //保存之前的中间件
    if (this.isNew){
        this.meta.createAt = this.meta.updatedAt = Date.now()
    }else{
        this.meta.updatedAt = Date.now()
    }
    next()
});


mongoose.model('Category',categorySchema);



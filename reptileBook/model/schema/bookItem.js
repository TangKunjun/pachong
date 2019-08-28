const mongoose = require('mongoose');

//内容集合
const bookItemSchema = new mongoose.Schema({
    name:String,
    author:String,
    chapter:String,
    content:String,
    // section:String,
    originUrl:String,
    dataBase:String,
    key:String,
    serial:{
        type:Number,
        unique:false,
        required:true
    },
});

bookItemSchema.pre('save',function (next) {
    this.content = this.content.replace(/\s\s\s\s/g, '<br>&nbsp;&nbsp;&nbsp;');
    next();
});
//model
const getModel = function (collectionName) {
    return mongoose.model(collectionName,bookItemSchema)
};

module.exports = {
    getModel
};
//子进程

const cp = require('child_process');
const mongoose = require('mongoose');
const {resolve} = require('path');
const bookModel= mongoose.model('bookList');
const Category = mongoose.model('Category')

;(async () => {
    const script = resolve(__dirname,'../crawler/getbooklist');
    const child = cp.fork(script,[]);
    let invoked = false;    //是否允许过

    child.on('error',error => {  //出错
        if (invoked)  return;
        invoked = true;

        console.log(error)
    });


    child.on('exit',code => {  //退出
        if (invoked) return;
        invoked = true;
        let err = code === 0?null:new Error('exit code'+code);
        if (err) {
            console.log(err);
        }
    });


    child.on('message',async data => {   //数据
        const newBook = data.info;
        if (data.type == 'bookList'){
            let book = await bookModel.findOne({
                key:newBook.key
            });
            if(book){
               if (book.updateTime!=newBook.updateTime||book.newChapter!==newBook.newChapter){
                   console.log('有更新');

                   await bookModel.updateOne({key:data.key},{
                       updateTime:newBook.updateTime,
                       newChapter:newBook.newChapter
                   })
               }
            }else{
                console.log('添加新书');
                await bookModel.create(newBook);
            }
        }

        /*let doubanId = data.doubanId;
        let movie = await Movie.findOne({
            doubanId:doubanId
        });
        if (data.video) {
            movie.video = data.video;
            movie.cover = data.cover;

            await movie.save();
        }else {
            await movie.remove();
            let movieTypes = movie.movieTypes;
            for (let i=0;i<movieTypes.length;i++){
                let type = movieTypes[i];
                let cat = Category.findOne({
                    name:type
                });
                if (cat && cat.movies){
                    let idx = cat.movies.indexOf(movie._id);
                    if (idx>-1){
                        cat.movies = cat.movies.splice(idx, 1)
                    }
                    await cat.save()
                }
            }
        }*/
    });

})();
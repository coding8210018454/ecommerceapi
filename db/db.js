const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE);

const db = mongoose.connection;

db.on('error',(err)=>{
    console.log(err);
})
db.once('open',()=>{
    console.log("db is connected sucssfully");
})

module.exports=db;


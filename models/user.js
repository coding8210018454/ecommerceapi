const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    passwordHash:{
        type: String,
        required: true,
    },
    phone:{
        type: Number,
        required: true,
    },
    isAdmin:{
        type: Boolean,
        default: false,
    },
    street:{
        type: String,
        default: ''
    },
    apartment:{
        type: String,
        default: ''
    },
    zip:{
        type: String,
        default: ''
    },
    city:{
        type: String,
        default: ''
    },
    country:{
        type: String,
        default: ''
    },
})

//for same _id as virutal id id
// userSchema.virtual('id').get(function(){
//     return this._id.toHexString();
// })
// userSchema.set('toJSON', {
//     virtuals:true,
// })

exports.User = mongoose.model('User', userSchema);
exports.userSchema=userSchema;
const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get('/', async(req, res)=>{
    // const userList = await User.find().select('name email'); //we need only this
    // const userList = await User.find().select('-passwordHash');//show data without password
    const userList = await User.find();

    if(!userList){
        res.status(500).json({success: false})
    }
    res.send(userList);
})

router.get('/:id', async(req, res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');//show data without password
    // const user = await User.findById(req.params.id);
    if(!user){
        res.status(500).json({message:'The category with the given id was not found '})
    }
    res.status(200).send(user);
})

router.post('/', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10) ,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
});

router.post('/login', async(req, res)=>{
    const user = await User.findOne({email: req.body.email});
    const secret = process.env.secret;

    if(!user){
        return res.status(400).send('The user not exist')
    }
    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token = jwt.sign({
            userId: user._id,
            isAdmin: user.isAdmin
        }, secret,{expiresIn: '300s'})
        res.status(200).send({user: user.email, token: token})
        //res.cookie("jwt", token,{expires:'1h, httpOnly:true})  //for web cookie
    }else{
         res.status(400).send('password is wrong!')
    }
    
})

//delete
router.delete('/:id', async(req , res)=>{
    const userDel = await User.findByIdAndDelete(req.params.id);

    try{

        if(userDel){
            return res.status(200).json({success: true, message:'user is deleted'})
        }else{
            return res.status(404).json({success: false, message: 'user not found!'})
        }
    }catch(err){
     return res.status(400).json({success: false, error: err});
    }

    

})


//count
router.get(`/get/count`,async(req, res)=>{
    
    const userCount = await User.countDocuments(); //count documents
    if(!userCount){
        res.status(500).json({success:false})
    }
    res.send({
        count:userCount
    });
})

module.exports = router;
const express = require('express');
const router = express.Router();
const product = require('../models/product');
const { Category } = require('../models/category');
const mongoose = require('mongoose');
const multer =require('multer')

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'public/uploads')
//     },
//     filename: function (req, file, cb) {
//     //   const fileName = Date.now() + '-' + Math.round(Math.random() * 1E9)
//     const fileName = file.originalname.split(' ').join('-');
//       cb(null, fileName + '-' + Date.now())
//     }
//   })
  
//   const upload = multer({ storage: storage })

const FILE_TYPE_MAP = {
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg': 'jpg'
}
const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const isValid = FILE_TYPE_MAP[file.mimetype];
            let uploadError = new Error('invalid image type');
            if(isValid){
                uploadError=null;
            }
          cb(uploadError, 'public/uploads')
        },
        filename: function (req, file, cb) {
        //   const fileName = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
          cb(null, `${fileName} - ${Date.now()}.${extension}`)
        }
      })
      
      const upload = multer({ storage: storage })

//get all product List
router.get(`/`,async(req, res)=>{
    // const prodList = await product.find().select('name image -_id'); //-_id for not show id to user and name: only name show to the user etc
    // const prodList = await product.find().populate('category');//show all the data of category
    
    // let filter ={};
    // if(req.query.categories){
    //     filter = {category: req.query.categories.split(',')} //split mean all the query separated with comma in url (products/categories=7878688,8756579  or products/categories=7878688 )
    // }
    
    const prodList = await product.find()
    if(!prodList){
        res.status(500).json({success:false})
    }
    res.send(prodList);
})

//only one product get using id
router.get(`/:id`,async(req, res)=>{
    // const prod = await product.findById(req.params.id).populate('category');//show all the data of category
    const prod = await product.findById(req.params.id);// in the category only show id of category
    if(!prod){
        res.status(500).json({success:false})
    }
    res.send(prod);
})


router.post(`/`,upload.single('image'),async(req, res)=>{  // image is a field name

    const category = await Category.findById(req.body.category);
    if(!category){
        return res.status(400).send('Invalid Category');
    }
    const file = req.file;  // validate images
    if(!file) return res.status(400).send('No image in the request')
    // const basePath=`${req.protocol}://${req.get('host')}/public/upload`;
    const fileName = req.file.filename;
    const Newproduct = new product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: fileName,           
        // image: `${basePath}${fileName}`, //ful url "http://localhost:3000/public/uploads/image-232423"
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category:req.body.category,
        countInStock:req.body.countInStock,
        rating: req.body.rating,
        numReviews:req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })
    const prod = await Newproduct.save();
    try{
        
        if(!prod){
            // res.status(201).json(prod);
            return res.status(500).send('The product connot be created');
        }
        res.send(prod);
        
    }catch(err){
       console.log(err);
    }
    
    

})

//update 
router.put('/:id', async(req, res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
       return res.status(400).send('Invalid Porduct Id')
    }
    const category= await Category.findById(req.body.category);
    if(!category){
        return res.status(400).send('Invalid category');
    }

    const Newproduct = await product.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category:req.body.category,
        countInStock:req.body.countInStock,
        rating: req.body.rating,
        numReviews:req.body.numReviews,
        isFeatured: req.body.isFeatured,
    }, {new: true})

    if(!Newproduct){
        return res.status(500).send('the product cnnot be updated!')
    }

    res.send(Newproduct);

})

router.delete('/:id', async(req , res)=>{
    const pro = await product.findByIdAndDelete(req.params.id);

    try{

        if(pro){
            return res.status(200).json({success: true, message:'product is deleted'})
        }else{
            return res.status(404).json({success: false, message: 'product not found!'})
        }
    }catch(err){
     return res.status(400).json({success: false, error: err});
    }

    

})

//count
router.get(`/get/count`,async(req, res)=>{
    
    const prodCount = await product.countDocuments(); //count documents
    if(!prodCount){
        res.status(500).json({success:false})
    }
    res.send({
        count:prodCount
    });
})

//feature
router.get(`/get/features`,async(req, res)=>{
    
    const prodF = await product.find({isFeatured: true});
    if(!prodF){
        res.status(500).json({success:false})
    }
    res.send(prodF);
})
router.get(`/get/features/:count`,async(req, res)=>{
    const count = req.params.count ? req.params.count : 0 //return string
    const prodF = await product.find({isFeatured: true}).limit(count);//limit need a number
    if(!prodF){
        res.status(500).json({success:false})
    }
    res.send(prodF);
})

router.put(
    '/gallery-images/:id', 
    upload.array('images', 10), 
    async (req, res)=> {
        if(!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id')
         }
         const files = req.files
         let imagesPaths = [];
         const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

         if(files) {
            files.map(file =>{
                imagesPaths.push(`${basePath}${file.filename}`);
            })
         }

         const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths
            },
            { new: true}
        )

        if(!product)
            return res.status(500).send('the gallery cannot be updated!')

        res.send(product);
    }
)



module.exports=router;
const express = require('express');
require('dotenv').config();

const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const db= require('./db/db');
const productRouter = require('./routes/products')
const categoryRouter = require('./routes/categories');
const cors = require('cors')
const usersRoute = require('./routes/users')
const jwtAuth = require('./jsonwebtoken/jwt')
const orderRouter = require('./routes/Orders')




//for connect bacend to fronend using cors put before all 
app.use(cors());
app.options('*', cors);


//middleware 
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use('/public/uploads',express.static(__dirname+'/public/uploads')) // for show in the front end
// app.use(authJwt);



//routers
app.use(`/api/products`,jwtAuth, productRouter)
app.use('/api/categories', categoryRouter)
app.use(`/api/users`, usersRoute);
app.use(`/api/orders`, orderRouter);



app.listen(process.env.port, ()=>{
    console.log("server is running on port: ",process.env.port);
})
const express=require('express');
const cors=require('cors');
const dotenv=require('dotenv');
const bcrypt=require('bcrypt');
const User=require('./model/User');

dotenv.config();
const app=express();
const connectDB = require("./connection/db_connect");
app.use(express.json());
app.use(cors());




//listen to server
const PORT=process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});

// Connect to MongoDB
connectDB();


//Register api

app.post('/api/register',async(req,res)=>{
    try{
        const {name,email,password,address,phoneNumber}=req.body;
        if(!name || !email || !password || !address || !phoneNumber){
            return res.status(400).json({message:'All fields are required'});
        }

        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:'User already exists'});
        }

        const hashedPassword= await bcrypt.hash(password,10);

        const newUser=await User.create({
            name,
            email,
            password:hashedPassword,
            address,
            phoneNumber
        });

        return res.status(201).json({status:"success", message:'User registered successfully'});


        }catch(err){
            console.error('Error in registration:', err);
            res.status(500).json({message:'Server error'});
        }

});



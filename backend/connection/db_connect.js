const mongoose= require('mongoose');
const dotenv=require('dotenv');
dotenv.config();

const MONGO_URI=process.env.MONGO_URI;


const connectDB=async()=>{
    try{
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected');
    }catch(err){
        console.error('❌ Connection Failed:', err);
        process.exit(1);
    }
}

module.exports=connectDB;
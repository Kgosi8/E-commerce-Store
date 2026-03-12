const mongoose=require('mongoose');

const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    price:{
        type:Number,
        required:true,
        min:0
    },
    category:{ 
        type:String,
        required:true,
        trim:true
    },
    stock:{
        type:Number,
        required:true,
        min:0
    },
    images:{
        type:[String],
        trim:true
    }
},{
    timestamps:true
});

const Product=mongoose.model('Product',productSchema,'Product');

module.exports=Product;
const mongoose=require('mongoose');

const userDetailsSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        minLength:6
    },
    address:{
        type:String,
        required:true,
    },
    phoneNumber:{
        type:String,
        required:true,
        trim:true,
        minLength:10,
    },
    cart: [
        {
            productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products'
          },
            quantity: {
              type: Number,
              default: 1
            }
        }
    ]

},{timestamps:true});

const User=mongoose.model('Users',userDetailsSchema);

module.exports=User;
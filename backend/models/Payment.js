const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({

  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  amount:Number,

  reference:String,

  status:{
    type:String,
    default:"pending"
  },

  createdAt:{
    type:Date,
    default:Date.now
  }

});

module.exports = mongoose.model("Payment",PaymentSchema);
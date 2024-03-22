var mongoose = require('mongoose');


var transactionSchema = mongoose.Schema({

   trasactionHash:String,
   status:{
       type:String,
       default:"Delivered"
        },
    blockHash:String,
    blockNumber:String,
    from:String,
    to:String,
    ImperiumHash:String,

});

var transactionModel = mongoose.model('transaction', transactionSchema);

module.exports = transactionModel;




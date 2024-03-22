const moongoose = require('mongoose');


/**How access and token works only we are perfoming just restructuring****/

var OrderSchema = new moongoose.Schema({
   emitter:moongoose.Types.ObjectId,
   plantation:moongoose.Types.ObjectId,
   status:String,
   emitter_name:String,
   plantation_name:String,
   approxCapacity:String,
   totalArea:String,
   quotation:String,
   date:{
       type:Date,
       default:new Date(),
   },
});

var Order = moongoose.model('Order',OrderSchema);

module.exports = Order  ;

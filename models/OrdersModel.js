const moongoose = require('mongoose');

const validator = require('validator');

const bcrypt = require('bcryptjs');

/**How access and token works only we are perfoming just restructuring****/

var DecarbisationSchema = new moongoose.Schema({
    parentId:{
        type:moongoose.Types.ObjectId,
    },
    company_name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate: {

            validator: validator.isEmail,
            message: '{VALUE} Entered Invalid Email'
        }

    },
    mobile: {

        type: String
    },

    profile_image: {

        type: String,
        default:null

    },

    quotation:{
        type:Number,
        default:0,
    },

    totalArea:{
        type:Number,
        default:0,
    },
    phone:{
        type:String,
    },
    ApproxCapacity:{
        type:Number,
        default:0,
    },
    password: {
        type: String,
        required: true
    },

    created_at: {
        type: String,
        default: new Date()
    },

    created_by: {
        type: Number,
        default: 0
    },

    updated_at: {
        type: String,
        default: null
    },
    otp:{
        type:String,
        default:null,
    },
    updated_by: {
        type: String,
        default: 0
    },

    companys_licence:{
        type:String,
        required:true,
    },

    status:{
        type: String,
        default: 'active'
    },

    tokens: [{
        access: {

            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

var Decarbisation = moongoose.model('DecarbisationCompany', DecarbisationSchema);

module.exports =  Decarbisation ;

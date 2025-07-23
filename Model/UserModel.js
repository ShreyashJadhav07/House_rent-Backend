const mongoose = require('mongoose');
const wishlistSchema = new mongoose.Schema({
  id: Number,
  title: String,
  location: String,
  price: Number,
  bedrooms: Number,
  image: String, 
});




const schemaRules = {
    name :{
        type: String,
        required: [true,"name is required"],
    },

    email :{
        type: String,
        required: [true,"email is required"],
        unique: [true,"email must be unique"],
    },
    password :{
        type: String,
        required: [true,"password is required"],
        minLength: [6,"password must be at least 6 characters long"],
    },
    confirmPassword: {
        type: String,
        required: function() {
            return this.isNew; // Only required when creating new user
        },
        minLength: [6, "confirm password must be at least 6 characters long and must match password"],
        validate: [function() {
            return !this.confirmPassword || this.password === this.confirmPassword;
        }, "confirm password must match password"]
    },

      role: {
        type: String,
        enum: ['renter', 'owner','broker'],
        default: 'renter'
        
    },
    isApprovedOwner:{
        type:Boolean,
        default:false,
    },
    createdAt: {
    type: Date,
    default: Date.now,
    },

   
 
  
       otp: {
        type: String,
    },

    otpExpiry:{
        type: Date,

    },
    isPremium: {
        type: Boolean,
        default: false
    },
    wishlist: [wishlistSchema],
 

}
const userSchema=new mongoose.Schema(schemaRules);



userSchema.pre('save', function(next) {

    this.confirmPassword = undefined; 
    next();
})

userSchema.post('save', function(){
    this.__v = undefined; 
    this.password = undefined;
})

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
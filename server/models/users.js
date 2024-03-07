const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema(
  {

    username:{type:String , required:true},
    password:{type:String ,required:true},
    email:{type:String ,required:true, unique:true},
    reputation: { type: Number, default:0 },
    isAdmin:{type :Boolean,default:false }
  },
  
  {timestamps:true},
  
  );

  UsersSchema.virtual('url').get(function () {
    return `/posts/user/`+this._id;
  });
  
  module.exports = mongoose.model('Users',UsersSchema);


  

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  text:{type :String, required:true},
  commented_by:{type:String, required:true},
  commented_date_time:{type:Date,default: Date.now},
  votes: { type: Number, default: 0 }

});

CommentSchema.virtual('url').get(function () {
  return `/posts/comment/`+this._id;
});

module.exports = mongoose.model('Comments',CommentSchema );
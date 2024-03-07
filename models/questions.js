// Question Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Tags = require('./tags');
const Answers =require('./answers')
const Comments =require('./comment')
const QuestionSchema = new Schema({
  title: {type:String ,required:true, maxlength: 50},
  text:{type:String, required:true},
  tags:[{type: Schema.Types.ObjectId, ref : 'Tags' , required:true }],
  answers:[{type: Schema.Types.ObjectId, ref :'Answers'}],
  asked_by:{type:String, default: 'Anonymous'},
  ask_date_time:{type:Date,default: Date.now},
  views:{type:Number, default: 0 },
  summary: { type: String, required: true ,maxlength: 140},
  votes: { type: Number, default: 0 },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comments' }],
});

QuestionSchema.virtual('url').get(function () {
  return `/posts/question/`+this._id;
});

module.exports = mongoose.model('Questions',QuestionSchema);





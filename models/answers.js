// Answer Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
  text:{type :String, required:true},
  ans_by:{type:String, required:true},
  ans_date_time:{type:Date,default: Date.now},
  votes: { type: Number, default: 0 },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comments' }],
});

AnswerSchema.virtual('url').get(function () {
  return `/posts/answer/`+this._id;
});

module.exports = mongoose.model('Answers',AnswerSchema);




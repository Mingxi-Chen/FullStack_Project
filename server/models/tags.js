// Tag Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TagsSchema = new Schema({
  name:{type: String, required:true},
  created_by:{type:String, required:true},
});

TagsSchema.virtual('url').get(function () {
  return `/posts/tag/`+this._id;
});

module.exports = mongoose.model('Tags',TagsSchema);



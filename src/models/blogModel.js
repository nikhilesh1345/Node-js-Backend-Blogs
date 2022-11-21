const mongoose = require('mongoose')  // importing the mongoose to create the blog schema
const objectId = mongoose.Schema.Types.ObjectId  // syntax to refer an authorId in a blog

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    authorId: {
        type: objectId,
        ref: 'Author',
        required: true
    },
    tags: [String],
    category: {
        type: String,
        required: true
    },
    subcategory: [String],
    deletedAt:{
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: String
    },
    isPublished: {
        type: Boolean,
        default: false
    }


}, { timestamps: true })

module.exports = mongoose.model('Blog', blogSchema)  // mongoose creates the model
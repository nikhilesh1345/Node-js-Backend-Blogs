const { findById } = require("../models/authorModel")
const authorModel = require("../models/authorModel")  // importing the module that contains the author schema
const blogModel = require("../models/blogModel")  // importing the module that contains the blog schema
const mongoose = require('mongoose')


// validation function 
const isValid = function(value) {
    if ( typeof value === 'undefined' || value === null ) return false
    if ( typeof value === 'string' && value.trim().length === 0 ) return false
    if ( typeof value == 'string' && value.length !== value.trim().length ) return false
    if ( typeof value == 'number' ) return false
    return true;
}


/*
const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
        //will return an array of all keys. so, we can simply get the length of an array with .length
}
*/



// ==> POST api: Create a blog

const createBlog = async function (req, res) {
    try {
        let blogData = req.body
        if (Object.keys(blogData).length === 0) {  // if there is no data provided in the request body
            return res.status(400).send({ status: false, msg: "BAD REQUEST (No data provided in request body)" })
        }

        // extracting the data provided in the request body
        let authorId = blogData.authorId
        let title = blogData.title
        let body = blogData.body
        let category = blogData.category
        if ( !title || !body || !authorId || !category ) {  // if any of the required fields is not provided.
            return res.status(400).send({ status: false, msg: "Provide the mandatory fields: title, body, authorId and category." })
        }

        // validations for mandatory fields.
        let inValid = ' '
        if ( !isValid ( authorId ) ) inValid = inValid + 'authorId '
        if ( !isValid ( body ) ) inValid = inValid + "body "
        if ( !isValid ( title ) ) inValid = inValid + "title "
        if ( !isValid ( category ) ) inValid = inValid + "category "
        if ( !isValid(authorId) || !isValid(body) || !isValid(title) || !isValid(category) ) {
            return res.status(400).send({ status: false, msg: `Enter valid details in following field(s): ${inValid}` })
        }
        
        // to validate the provided authorId
        if ( !mongoose.Types.ObjectId.isValid(authorId) ) return res.status(400).send({ status: false, msg: "Enter a valid authorId" })

        let authorFound = await authorModel.findById({ _id: authorId })  // to check if the provided authorId is present in the database.
        if ( !authorFound ) {
            return res.status(404).send({ status: false, msg: "Author id is not present." })  // --> when authorId is not available in the database.
        }

        if (!blogData.isPublished || blogData.isPublished == false) {    // --> if isPublished is false or not provided.
            blogData.publishedAt = null
            let blogCreated = await blogModel.create(blogData)
            res.status(201).send({ status: true, data: blogCreated })
        } else {                                                         // --> if isPublished is true.
            blogData.publishedAt = new Date()
            let blogCreated = await blogModel.create(blogData)           // to create the blog
            res.status(201).send({ status: true, data: blogCreated })    // created is shown in the response body.
        }
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


 
// ==> DELETE api: Deleting a blog by its _id in the path params
   
const deleteBlogById = async function (req, res) {
    try {
        let blogid = req.params.blogId;  // blogid is provided in the path params.
           
        let blog = await blogModel.findOne({ _id: blogid, isDeleted: false })  // to check if that blogid exists for that logged-in author
        
        if (!blog) return res.status(400).send({ status: false, msg: "The blog is already deleted." })  // --> if the blog is not found or already deleted, i.e., ( isDeleted == true )
        
        await blogModel.findOneAndUpdate(
            { _id: blogid },
            { $set: { isDeleted: true, deletedAt: new Date() } });
        return res.status(200).send()  // --> blog deleted with no response in the body.
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
};
    


// ==> GET api: to get all the blogs that are published and not deleted and applying the filters also

const getBlogs = async function (req, res) {
    try {
        let filters = req.query  // filters are provided in the query params

        let mandatory = { isDeleted: false, isPublished: true, ...filters }  // --> combining the provided details alongwith the mandatory fields.
        
        // finding all the blogs as per the mandatory fields and filters.
        let getBlogs = await blogModel.find( mandatory )
        
        // if no blog is found as per the request which are not deleted and unpublished
        if ( getBlogs.length === 0 ) return res.status(404).send({ status: false, msg: `No such blog exists as per the request made.` })
        
        return res.status(201).send({ status: true, data: getBlogs })  // --> existing blogs are reflected in the response body.
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}



// ==> PUT api: Update a blog

const updateBlog = async function (req, res) {
    try {
        let data = req.body
        const { title, body, tags, subcategory } = data  // --> destructuring the data provided in the body
        
        // if no data is provided in the body to update.
        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, msg: "Provide the data in body to update."})
        
        // if data is provided in the body to update.
        let updatedBlog = await blogModel.findOneAndUpdate(
            { _id: req.params.blogId },
            { $set: { title: title, body: body, isPublished: true, publishedAt: new Date() }, $push: { tags: tags, subcategory: subcategory } },
            { new: true });
        return res.status(200).send({ status: true, data: updatedBlog })
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
    
}



// ==> DELETE api: Deleting the blog(s) by the fields provided in the query params

const delByQuery = async function (req, res) {
    try {
        let data = req.query  // data is provided in query params to delete the blog(s)
        data.authorId = req.authorId  // a new key value pair is added to the data provided in query params
        
        let mandatory = { isDeleted: false, isPublished: false, ...data };

        let findBlogs = await blogModel.find( mandatory )  // to find all the blogs of the author as per the request made
        if ( findBlogs.length === 0 ) return res.status(404).send({ status: false, msg: "No such blog found to delete." })  // --> if no blog is found to delete

        let deleted = await blogModel.updateMany( mandatory, { isDeleted: true, deletedAt: new Date() }, { new: true } )  // --> to delete the blogs if found
        return res.status(200).send({ status: true, data: deleted })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
    
}



// exporting all the functions
module.exports.createBlog = createBlog
module.exports.deleteBlogById = deleteBlogById
module.exports.updateBlog = updateBlog
module.exports.getBlogs = getBlogs
module.exports.delByQuery = delByQuery
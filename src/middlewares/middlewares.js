const jwt = require("jsonwebtoken");  // importing the jsonwebtoken so as to authenticate and authorize the author.
const blogModel = require("../models/blogModel");
const mongoose = require('mongoose')

let decodedToken



// ==> Authentication middleware function

const authenticate = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"]  // --> token is picked from the headers section of the request
        if ( !token ) return res.status(401).send( { status: false, msg: "token must be present in request header."} )  // --> if token is not present in the headers
        decodedToken = jwt.verify(token, 'avinash-ajit-manish-nikhilesh', (err, decode) => {
            if (err) return null;
            else return decode;
        })  // --> token is verified using the secret key
        if(!decodedToken) return res.status(403).send({status: false, msg: "Invalid token."})
        next()  // --> next function is called after successful verification of the token, either another middleware (in case of PUT and DELETE api) or root handler function.
    } catch (err) {
        return res.status(500).send( { status: false, error: err.message} )
    }
}



// ==> Authorization middleware function for PUT api and DELETE api by blogId in the path params

const authorize = async function (req, res, next) {
    try {
        let blogId = req.params.blogId  // --> authorId is provided in the query params to match with the one whose token is provided in the headers.
        if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) return res.status(400).send({ status: false, msg: "Enter a valid blogId."})
        let blog = await blogModel.findOne({ _id: blogId, isDeleted: false });
        if ( !blog ) return res.status(404).send({ status: false, msg: "No blog found" })
        if ( blog.authorId.toString() !== decodedToken.authorId ) return res.status(403).send({ status: false, msg: "You are not authorized to access this blog." })
        next()  // --> next function is called when it is evident that the logged-in author is authorized.
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}



// ==> Authorization middleware function for DELETE blog(s) by query params 

const authDelByQuery = async function (req, res, next) {
    try {
        let authorId = req.query.authorId

        // if authorId is provided in query params but not valid
        if ( authorId && !mongoose.Types.ObjectId.isValid(authorId) ) return res.status(400).send({ status: false, msg: "authorId is invalid."})

        // if authorId is provided in query params and doesn't match with the logged-in author
        if ( authorId && authorId !== decodedToken.authorId ) return res.status(400).send({ status: false, msg: "You are not authorized to delete these blogs. authorId doesn't belong to you."})
        
        // if authorId is provided in query params and matches with the logged-in author or not provided in query params at all
        req.authorId = decodedToken.authorId
        next()
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.authenticate = authenticate
module.exports.authorize = authorize
module.exports.authDelByQuery = authDelByQuery
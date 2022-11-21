const authorModel = require("../models/authorModel")  // importing the module that contains the author schema
const jwt = require("jsonwebtoken");  // importing the jsonwebtoken so as to generate the token for the author after successful login
const validator = require("email-validator");  // importing the package in order to identify a valid email.


// validation function
const isValid = function (value) {
    if ( typeof value === 'undefined' || value === null ) {
        return false
    }
    if ( typeof value == 'string' && value.trim().length == 0 ) {
        return false
    }
    if ( typeof value == 'string' && value.length !== value.trim().length ) {
        return false
    }
    if ( typeof value == 'number' ) {
        return false
    }
    return true
}


const isValidTitle = function (title) {
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}


/*
const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
        //will return an array of all keys. so, we can simply get the length of an array with .length
}
*/



// ==> POST api: Creating an author

const createAuthor = async function (req, res) {
    try {
        let authorData = req.body
        const { fname, lname, title, email, password } = authorData  // destructuring the request body object

        // Body should not be empty.
        if ( !fname || !lname || !title || !email || !password ) {
           return res.status(400).send({ status: false, msg: "Provide all the mandatory fields: fname (first name), lname (last name), title, email and password."})
        }
        
        // Applying validations so that fields don't contain invalid characters like spaces and numbers.
        let inValid = ' '
        if ( !isValid ( fname ) ) inValid = inValid + "fname( First name ) "
        if ( !isValid ( lname ) ) inValid = inValid + "lname( Last name ) "
        if ( !isValid ( title ) ) inValid = inValid + 'title( "Mr", "Mrs", "Miss" ) '
        if ( !isValid ( email ) ) inValid = inValid + "email "
        if ( !isValid ( password ) ) inValid = inValid + "password "
        if ( !isValid(fname) || !isValid(lname) || !isValid(title) || !isValid(email) || !isValid(password) ) {
            return res.status(400).send({ status: false, msg: `Enter valid details in following field(s): ${inValid}` })
        }

        if ( !isValidTitle ( title ) ) return res.status(400).send({ status: false, msg: "title can either be 'Mr', 'Mrs' or 'Miss'."})
        
        let validEmail = validator.validate(email)  // To validate the email, 'email-validator' package is used.

        if (validEmail == true) {  // When email is validated by the package.
            let authorFound = await authorModel.findOne({email: email})  // To check if the email is already present in the database.

            if ( !authorFound ) {  // Email is not present in the database
                let authorCreated = await authorModel.create(authorData)
                return res.status(201).send({ status: true, data: authorCreated })
            } else {
                return res.status(400).send({ status: false, msg: "Email already in use." })  // Email is already present in the database.
            }

        } else {  // when email is not validated by the package.
            return res.status(403).send({ status: false, msg: "Email is not valid." })
        }

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}



// ==> POST api: Login for an author

const loginAuthor = async function (req, res) {
    try {
        let email = req.body.email
        let password = req.body.password
        if ( !email || !password ) return res.status(400).send({ status: false, msg: "Provide the email and password to login." })  // if either email, password or both not present in the request body.

        let validEmail = validator.validate(email)  // to validate the email by the use of package
        if ( validEmail == false ) return res.status(400).send({ status: false, msg: "Email is not valid."})  // if email is not validated.

        let author = await authorModel.findOne({ email: email, password: password })  // to find that particular author document.
        if ( !author ) return res.status(403).send({ status: false, msg: "Email or password is incorrect." })  // if the author document isn't found in the database.

        let token = jwt.sign(  // --> to generate the jwt token
            {
                authorId: author._id.toString(),          // --> payload
                project: "Blogging Site Mini Project",
                batch: "Radon"
            },
            "avinash-ajit-manish-nikhilesh"               // --> secret key
        )
        res.setHeader("x-api-key", token)  // to send the token in the header of the browser used by the author(user).
        return res.status(200).send({ status: true, data: {token: token} })  // token is shown in the response body.
    } catch (err) {
        return res.status(500).send({ status: false, err: err.message })
    }
}



// exporting all the functions
module.exports.createAuthor = createAuthor
module.exports.loginAuthor = loginAuthor
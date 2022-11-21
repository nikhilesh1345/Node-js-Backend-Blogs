const express = require('express')
const router = express.Router()
const authorController = require("../controllers/authorController")
const blogController = require("../controllers/blogController")
const middleware = require("../middlewares/middleware")

router.post('/authors', authorController.createAuthor)  // POST api to create an author

router.post('/login', authorController.loginAuthor)  // POST api for an author to login

router.post('/blogs', middleware.authenticate, blogController.createBlog)  // POST api to create a blog

router.get('/blogs', middleware.authenticate, blogController.getBlogs) // GET api to get the blog(s)

router.put('/blogs/:blogId', middleware.authenticate, middleware.authorize, blogController.updateBlog)  // PUT api to update a blog

router.delete('/blogs/:blogId', middleware.authenticate, middleware.authorize, blogController.deleteBlogById)  // DELETE api to delete a blog

router.delete('/blogs', middleware.authenticate, middleware.authDelByQuery, blogController.delByQuery)  // DELETE api to delete the blog(s)


module.exports = router;  // --> exported
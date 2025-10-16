const express = require('express')
const { 
  registerAdmin, 
  loginAdmin, 
  addProducts, 
  createBlog, 
  getProducts, 
  getCategories, 
  addMainCategory, 
  addSubCategory, 
  addThirdCategory, 
  getBlogs, 
  editBlog, 
  deleteBlog 
} = require('../services/admin-services')
const { isLoggedIn, isAdmin } = require('../middleware/auth')
const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const result = await registerAdmin(req.body, res)
    res.status(201).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const result = await loginAdmin(req.body, res)
    res.json(result)
  } catch (error) {
    res.status(401).json({ message: error.message })
  }
})

router.get("/home", isAdmin, (req, res)=>{
    res.status(200).json({admin: req.admin})
})

router.post("/addproducts", isAdmin, async (req, res) => {
  try {
    const product = await addProducts(req.body, req.admin._id)
    res.status(201).json({ message: 'Product added successfully', product })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.get("/products", isAdmin, async (req, res) => {
  try {
    const products = await getProducts(req.admin._id)
    res.status(200).json({ products })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.get("/categories", isAdmin, async (req, res) => {
  try {
    const categories = await getCategories()
    res.status(200).json({ categories })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post("/addcategory", isAdmin, async (req, res) => {
  try {
    const category = await addMainCategory(req.body)
    res.status(201).json({ message: 'Main category added successfully', category })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post("/addsubcategory", isAdmin, async (req, res) => {
  try {
    const subCategory = await addSubCategory(req.body)
    res.status(201).json({ message: 'Sub category added successfully', subCategory })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post("/addthirdcategory", isAdmin, async (req, res) => {
  try {
    const thirdCategory = await addThirdCategory(req.body)
    res.status(201).json({ message: 'Third category added successfully', thirdCategory })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post("/create-blog", isAdmin, async (req, res) => {
  try {
    const blog = await createBlog(req.body, req.admin._id)
    res.status(201).json({ message: 'Blog created successfully', blog })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.get("/blogs", isAdmin, async(req, res)=>{
  try{
    const blogs = await getBlogs(req.admin._id)
    res.status(200).json({blogs})
  }
  catch (error){
    res.status(404).json({message: error.message})
  }
})

router.put("/edit-blog/:blogId", isAdmin, async (req, res) => {
  try {
    const blog = await editBlog(req.params.blogId, req.admin._id, req.body)
    res.status(200).json({ message: 'Blog updated successfully', blog })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.delete("/delete-blog/:blogId", isAdmin, async (req, res) => {
  try {
    await deleteBlog(req.params.blogId, req.admin._id)
    res.status(200).json({ message: 'Blog deleted successfully' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.get("/logout", isLoggedIn, (req, res)=>{
    res.clearCookie('token')
    res.status(200).json({message: "You are logged out."})
})

module.exports = router
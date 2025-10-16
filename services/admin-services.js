const Admin = require('../models/admin-model')
const jwt = require('jsonwebtoken')

const registerAdmin = async (adminData, res) => {
  const { fullName, email, password } = adminData
  
  const existingAdmin = await Admin.findOne({ email })
  if (existingAdmin) {
    throw new Error('Admin already exists')
  }
  const admin = new Admin({ fullName, email, password })
  await admin.save()
  return { message: 'Admin registration submitted. Awaiting super admin approval.' }
}

const loginAdmin = async (adminData, res) => {
  const { email, password } = adminData
  const admin = await Admin.findOne({ email })
  if (!admin || !(await admin.comparePassword(password))) {
    throw new Error('Invalid credentials')
  }
  if (!admin.isApproved) {
    throw new Error('Admin account pending approval from super admin')
  }

  const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET_KEY)
  res.cookie('adminToken', token, { httpOnly: true, secure: false })
  return { admin: { id: admin._id, fullName: admin.fullName, email } }
}

const addProducts = async (productData, adminId) => {
  const Product = require('../models/product-model')
  const MainCategory = require('../models/main-category-model')
  const SubCategory = require('../models/sub-category-model')
  const ThirdCategory = require('../models/third-category-model')
  
  const { name, description, price, mainCategory, subCategory, thirdCategory, images, serviceableAreas } = productData
  
  const mainCat = await MainCategory.findOne({ name: mainCategory })
  if (!mainCat) throw new Error(`Main category '${mainCategory}' not found`)
  
  const subCat = await SubCategory.findOne({ name: subCategory, mainCategory: mainCat._id })
  if (!subCat) throw new Error(`Sub category '${subCategory}' not found`)
  
  const thirdCat = await ThirdCategory.findOne({ name: thirdCategory, subCategory: subCat._id })
  if (!thirdCat) throw new Error(`Third category '${thirdCategory}' not found`)
  
  const product = new Product({
    name,
    description,
    price,
    mainCategory: mainCat._id,
    subCategory: subCat._id,
    thirdCategory: thirdCat._id,
    images: images || [],
    addedBy: adminId,
    serviceableAreas: serviceableAreas || []
  })
  await product.save()
  return product
}

const createBlog = async (blogData, adminId) => {
  const Blog = require('../models/blog-model')
  const { title, content, tags, published } = blogData
  
  const blog = new Blog({
    title,
    content,
    author: adminId,
    tags: tags || [],
    published: published || false
  })
  
  await blog.save()
  return blog
}

const getProducts = async (adminId) => {
  const Product = require('../models/product-model')
  const products = await Product.find({ addedBy: adminId })
    .populate('mainCategory')
    .populate('subCategory')
    .populate('thirdCategory')
  return products
}

const getCategories = async () => {
  const MainCategory = require('../models/main-category-model')
  const SubCategory = require('../models/sub-category-model')
  const ThirdCategory = require('../models/third-category-model')
  
  const categories = await MainCategory.find()
  
  const categoriesWithSubs = await Promise.all(categories.map(async (mainCat) => {
    const subCategories = await SubCategory.find({ mainCategory: mainCat._id })
    
    const subCategoriesWithThird = await Promise.all(subCategories.map(async (subCat) => {
      const thirdCategories = await ThirdCategory.find({ subCategory: subCat._id })
      return {
        ...subCat.toObject(),
        thirdCategories
      }
    }))
    
    return {
      ...mainCat.toObject(),
      subCategories: subCategoriesWithThird
    }
  }))
  
  return categoriesWithSubs
}

const addMainCategory = async (categoryData) => {
  const MainCategory = require('../models/main-category-model')
  const { name, description } = categoryData
  const category = new MainCategory({ name, description })
  await category.save()
  return category
}

const addSubCategory = async (categoryData) => {
  const SubCategory = require('../models/sub-category-model')
  const MainCategory = require('../models/main-category-model')
  const { name, description, mainCategory } = categoryData
  
  const mainCat = await MainCategory.findOne({ name: mainCategory })
  if (!mainCat) throw new Error(`Main category '${mainCategory}' not found`)
  
  const subCategory = new SubCategory({ name, description, mainCategory: mainCat._id })
  await subCategory.save()
  return subCategory
}

const addThirdCategory = async (categoryData) => {
  const ThirdCategory = require('../models/third-category-model')
  const SubCategory = require('../models/sub-category-model')
  const { name, description, subCategory } = categoryData
  
  const subCat = await SubCategory.findOne({ name: subCategory })
  if (!subCat) throw new Error(`Sub category '${subCategory}' not found`)
  
  const thirdCategory = new ThirdCategory({ name, description, subCategory: subCat._id })
  await thirdCategory.save()
  return thirdCategory
}

const getBlogs = async (adminId) => {
  const Blog = require('../models/blog-model')
  const blogs = await Blog.find({ author: adminId }).populate('author')
  return blogs
}

const editBlog = async (blogId, adminId, updateData) => {
  const Blog = require('../models/blog-model')
  const blog = await Blog.findOneAndUpdate(
    { _id: blogId, author: adminId },
    updateData,
    { new: true }
  )
  
  if (!blog) {
    throw new Error('Blog not found or unauthorized')
  }
  
  return blog
}

const deleteBlog = async (blogId, adminId) => {
  const Blog = require('../models/blog-model')
  const blog = await Blog.findOneAndDelete({
    _id: blogId,
    author: adminId
  })
  
  if (!blog) {
    throw new Error('Blog not found or unauthorized')
  }
  
  return blog
}

module.exports = { 
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
}
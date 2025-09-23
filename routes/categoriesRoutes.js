const express = require('express');
const router = express.Router();
const categoryController = require('../controller/categoryController');

router.post('/category/register', categoryController.addCategory);

router.get('/category/all', categoryController.getAllCategories);

router.get('/category/:id', categoryController.getCategoryById);

router.put('/category/update/:id', categoryController.updateCategory);

router.delete('/category/delete/:id', categoryController.deleteCategory);

module.exports = router;
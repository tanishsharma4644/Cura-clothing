const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const products = [
  {
    name: 'Classic White T-Shirt',
    description: 'A timeless staple for every wardrobe. Made from 100% organic cotton for ultimate comfort and breathability.',
    price: 29.99,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80',
    category: 'Men',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Grey'],
    countInStock: 100
  },
  {
    name: 'Vintage Wash Denim Jacket',
    description: 'Classic fit denim jacket with a soft, vintage wash. Perfect for layering in any season.',
    price: 89.99,
    imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80',
    category: 'Women',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Blue'],
    countInStock: 40
  },
  {
    name: 'High-Rise Relaxed Jeans',
    description: 'Comfortable high-rise jeans with a relaxed fit. Premium denim that holds its shape.',
    price: 79.99,
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80',
    category: 'Women',
    sizes: ['24', '25', '26', '27', '28', '29', '30'],
    colors: ['Light Blue', 'Dark Wash'],
    countInStock: 65
  },
  {
    name: 'Minimalist Leather Sneakers',
    description: 'Sleek, low-top sneakers crafted from genuine leather. Dress them up or down effortlessly.',
    price: 119.99,
    imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1364&q=80',
    category: 'Accessories',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['White', 'Black'],
    countInStock: 30
  },
  {
    name: 'Oversized Knit Sweater',
    description: 'Cozy and stylish oversized knit sweater, perfect for chilly days.',
    price: 59.99,
    imageUrl: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1372&q=80',
    category: 'Women',
    sizes: ['S', 'M', 'L'],
    colors: ['Beige', 'Olive'],
    countInStock: 50
  },
  {
    name: 'Everyday Chino Pants',
    description: 'Versatile chino pants with a modern tailored fit.',
    price: 49.99,
    imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80',
    category: 'Men',
    sizes: ['30x30', '32x30', '32x32', '34x32'],
    colors: ['Khaki', 'Navy'],
    countInStock: 80
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected to seed data...');
    try {
      await Product.deleteMany(); // Clear existing
      await Product.insertMany(products);
      console.log('Data Imported!');
      process.exit();
    } catch (error) {
      console.error('Error importing data', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Database connection failed', err);
    process.exit(1);
  });

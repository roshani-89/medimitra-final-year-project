import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchProducts();
  }, [location]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, priceFilter, categoryFilter, sortBy]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      const currentDate = new Date();
      const activeProducts = res.data.filter(product => new Date(product.expiryDate) > currentDate);
      setProducts(activeProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Price filter
    if (priceFilter) {
      const [min, max] = priceFilter.split('-').map(p => parseFloat(p));
      if (max) {
        filtered = filtered.filter(product => product.price >= min && product.price <= max);
      } else {
        filtered = filtered.filter(product => product.price >= min);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        setProducts(products.filter(product => product._id !== id));
      } catch (err) {
        console.error('Error deleting product:', err);
      }
    }
  };

  const handleOrder = (product) => {
    // Navigate to checkout page with product data
    navigate('/checkout', { state: { product } });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">Products</h1>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 mb-2 text-sm sm:text-base">Search</label>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 text-sm sm:text-base">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="">All Categories</option>
              <option value="Medicine">Medicine</option>
              <option value="Medical Equipment">Medical Equipment</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2 text-sm sm:text-base">Price Range</label>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="">All Prices</option>
              <option value="0-50">$0 - $50</option>
              <option value="50-100">$50 - $100</option>
              <option value="100-500">$100 - $500</option>
              <option value="500">$500+</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2 text-sm sm:text-base">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.map(product => (
          <div key={product._id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            {product.photos && product.photos.length > 0 && (
              <img
                src={product.photos[0]}
                alt={product.name}
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}
            <h2 className="text-lg sm:text-xl font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-2 text-sm sm:text-base line-clamp-2">{product.description}</p>
            <p className="text-lg font-bold text-green-600 mb-2">${product.price}</p>
            <p className="text-sm text-gray-500">Quantity: {product.quantity}</p>
            <p className="text-sm text-gray-500 mb-4">Seller: {product.sellerId?.name}</p>
            <div className="flex gap-2">
              {user?.role === 'Patient' && product.quantity > 0 && (
                <button
                  onClick={() => handleOrder(product)}
                  className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-green-700 flex-1 text-sm sm:text-base"
                >
                  Buy Now
                </button>
              )}
              {(user?.role?.toLowerCase() === 'donor' || user?.role?.toLowerCase() === 'ngo') && user?._id === product.sellerId?._id && (
                <button
                  onClick={() => handleDelete(product._id)}
                  className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-red-700 flex-1 text-sm sm:text-base"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;

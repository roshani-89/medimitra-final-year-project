import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import MyOrders from '../components/MyOrders';

const UserProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [soldProducts, setSoldProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    society: user?.society || '',
    pincode: user?.pincode || '',
    mobile: user?.mobile || '',
    bio: user?.bio || '',
    gender: user?.gender || 'Prefer not to say',
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
    address: user?.address || '',
    landmark: user?.landmark || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);

  useEffect(() => {
    if (activeTab === 'sold') {
      fetchSoldProducts();
    }
  }, [activeTab]);

  useEffect(() => {
    // Update profile image when user changes
    if (user?.profileImage) {
      setProfileImage(user.profileImage);
    }
  }, [user]);

  useEffect(() => {
    // Update formData when user changes
    setFormData({
      name: user?.name || '',
      society: user?.society || '',
      pincode: user?.pincode || '',
      mobile: user?.mobile || '',
      bio: user?.bio || '',
      gender: user?.gender || 'Prefer not to say',
      dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
      address: user?.address || '',
      landmark: user?.landmark || ''
    });
  }, [user]);

  const fetchSoldProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      console.log('Fetching products with token:', token ? 'Token exists' : 'No token');

      const response = await axios.get('http://localhost:5000/api/products/user/my-products', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Fetched products:', response.data);
      setSoldProducts(response.data);
    } catch (error) {
      console.error('Error fetching sold products:', error.response?.data || error);
      if (error.response?.status === 401) {
        alert('Please login again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        setDeleting(productId);

        const token = localStorage.getItem('token');
        console.log('Deleting product:', productId);
        console.log('Using token:', token ? 'Token exists' : 'No token');

        const response = await axios.delete(
          `http://localhost:5000/api/products/${productId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        console.log('Delete response:', response.data);

        // Remove from UI immediately
        setSoldProducts(prev => prev.filter(p => p._id !== productId));

        alert('✅ Product deleted successfully!');

      } catch (error) {
        console.error('Delete error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });

        if (error.response?.status === 401) {
          alert('❌ Session expired. Please login again');
        } else if (error.response?.status === 403) {
          alert('❌ You are not authorized to delete this product');
        } else if (error.response?.status === 404) {
          alert('❌ Product not found');
        } else {
          alert('❌ Failed to delete product. Please try again.');
        }
      } finally {
        setDeleting(null);
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const imageFormData = new FormData();
      imageFormData.append('profileImage', file);

      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await axios.post(
          'http://localhost:5000/api/auth/upload-profile-image',
          imageFormData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        console.log('Image upload response:', response.data);

        const newImageUrl = response.data.profileImage;
        setProfileImage(newImageUrl);
        setUser({ ...user, profileImage: newImageUrl });

        alert('✅ Profile picture updated successfully!');
      } catch (error) {
        console.error('Error uploading image:', error.response?.data || error);
        alert('❌ Failed to upload image. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('❌ New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/auth/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error.response?.data || error);
      alert(`❌ Error: ${error.response?.data?.message || 'Failed to update password'}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = () => {
    const fields = ['name', 'mobile', 'society', 'pincode', 'bio', 'gender', 'dob', 'address', 'landmark'];
    const filledFields = fields.filter(f => user[f] && user[f] !== '' && user[f] !== 'Prefer not to say');
    const imageWeight = user.profileImage ? 1 : 0;
    const totalPossible = fields.length + 1;
    const totalFilled = filledFields.length + imageWeight;
    return Math.round((totalFilled / totalPossible) * 100);
  };

  const completion = calculateCompletion();

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.put(
        'http://localhost:5000/api/auth/update-profile',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setUser(response.data.user);
      setEditing(false);
      alert('✅ Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error);
      alert('❌ Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  const getProductStatus = (product) => {
    if (product.quantity <= 0) {
      return { text: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: '❌' };
    }
    if (isExpired(product.expiryDate)) {
      return { text: 'Expired', color: 'bg-gray-100 text-gray-800', icon: '⚠️' };
    }
    if (isExpiringSoon(product.expiryDate)) {
      return { text: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-800', icon: '⏰' };
    }
    if (product.quantity <= 5) {
      return { text: 'Low Stock', color: 'bg-orange-100 text-orange-800', icon: '📉' };
    }
    return { text: 'Active', color: 'bg-teal-100 text-teal-800', icon: '✅' };
  };

  // Get profile image URL
  const getProfileImageUrl = () => {
    if (!profileImage) return null;

    // If it's already a full URL, return as is
    if (profileImage.startsWith('http')) {
      return profileImage;
    }

    // If it starts with /, add base URL
    if (profileImage.startsWith('/')) {
      return `http://localhost:5000${profileImage}`;
    }

    // Otherwise, add both / and base URL
    return `http://localhost:5000/${profileImage}`;
  };

  const imageUrl = getProfileImageUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white/30 shadow-lg">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', imageUrl);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="text-3xl sm:text-4xl font-bold w-full h-full flex items-center justify-center"
                  style={{ display: imageUrl ? 'none' : 'flex' }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || '👤'}
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-1">👋 Welcome, {user?.name}!</h1>
                <p className="text-white/90 text-sm sm:text-base flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                    {user?.role}
                  </span>
                  <span>Manage your account & products</span>
                </p>
              </div>
            </div>
          </div>

          {/* Modern Tabs */}
          <div className="border-b bg-gray-50">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all ${activeTab === 'profile'
                  ? 'border-b-3 border-teal-600 text-teal-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
              >
                👤 Profile
              </button>
              <button
                onClick={() => setActiveTab('bought')}
                className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all ${activeTab === 'bought'
                  ? 'border-b-3 border-teal-600 text-teal-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
              >
                🛒 Bought Products
              </button>
              <button
                onClick={() => setActiveTab('sold')}
                className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all ${activeTab === 'sold'
                  ? 'border-b-3 border-teal-600 text-teal-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
              >
                💼 My Products
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all ${activeTab === 'security'
                  ? 'border-b-3 border-teal-600 text-teal-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
              >
                🔒 Security
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {/* Profile Completion Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-700">Profile Completion</span>
                <span className="text-sm font-bold text-teal-600">{completion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full transition-all duration-1000"
                  style={{ width: `${completion}%` }}
                ></div>
              </div>
              {completion < 100 && (
                <p className="text-xs text-gray-500 mt-2">
                  💡 Complete your profile to earn the "Verified Member" badge!
                </p>
              )}
            </div>

            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Profile Picture Section */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl">
                  <div className="relative group">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Profile image failed to load:', imageUrl);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="text-4xl sm:text-5xl text-white font-bold w-full h-full flex items-center justify-center"
                        style={{ display: imageUrl ? 'none' : 'flex' }}
                      >
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </div>
                    <label className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 sm:p-3 rounded-full cursor-pointer hover:bg-teal-700 shadow-lg transition-all group-hover:scale-110">
                      <span className="text-xl">📷</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={loading}
                      />
                    </label>
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{user?.name}</h2>
                    <p className="text-gray-600 text-lg mt-1">{user?.email}</p>
                    <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                      <span className="px-4 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold">
                        {user?.role}
                      </span>
                      {completion === 100 && (
                        <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-1">
                          🛡️ Verified Member
                        </span>
                      )}
                      <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                        ✓ Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      📋 Personal Information
                    </h3>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Name</label>
                      {editing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      ) : (
                        <p className="text-gray-900 text-lg">{user?.name}</p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">📧 Email</label>
                      <p className="text-gray-900 text-lg">{user?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">📱 Phone Number</label>
                      {editing ? (
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter phone number"
                          pattern="[0-9]{10}"
                          title="Please enter a valid 10-digit mobile number"
                        />
                      ) : (
                        <p className="text-gray-900 text-lg">{user?.mobile || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">⚧ Gender</label>
                      {editing ? (
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      ) : (
                        <p className="text-gray-900 text-lg">{user?.gender || 'Prefer not to say'}</p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">🎂 Date of Birth</label>
                      {editing ? (
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      ) : (
                        <p className="text-gray-900 text-lg">{user?.dob ? formatDate(user.dob) : 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      📍 Location & Bio
                    </h3>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">🏠 House / Street Address</label>
                      {editing ? (
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="House No, Street name"
                        />
                      ) : (
                        <p className="text-gray-900 text-lg">{user?.address || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">🏢 Society</label>
                      {editing ? (
                        <input
                          type="text"
                          name="society"
                          value={formData.society}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      ) : (
                        <p className="text-gray-900 text-lg">{user?.society || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">📍 Landmark</label>
                      {editing ? (
                        <input
                          type="text"
                          name="landmark"
                          value={formData.landmark}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Near hospital, park, etc."
                        />
                      ) : (
                        <p className="text-gray-900 text-lg">{user?.landmark || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">📮 Pincode</label>
                      {editing ? (
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          pattern="[0-9]{6}"
                          title="Please enter a valid 6-digit pincode"
                        />
                      ) : (
                        <p className="text-gray-900 text-lg">{user?.pincode || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">✍️ Bio</label>
                      {editing ? (
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Tell us about yourself..."
                        />
                      ) : (
                        <p className="text-gray-900">{user?.bio || 'No bio added yet'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    📊 Account Statistics
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <div className="text-3xl mb-2">📅</div>
                      <p className="text-sm text-gray-600">Joined</p>
                      <p className="text-lg font-bold text-gray-900">{formatDate(user?.createdAt)}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <div className="text-3xl mb-2">🎭</div>
                      <p className="text-sm text-gray-600">Role</p>
                      <p className="text-lg font-bold text-gray-900">{user?.role}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <div className="text-3xl mb-2">⚡</div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="text-lg font-bold text-emerald-600">Active</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  {editing ? (
                    <>
                      <button
                        onClick={() => setEditing(false)}
                        className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-all"
                      >
                        ❌ Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 font-semibold shadow-lg transition-all"
                      >
                        {loading ? '⏳ Saving...' : '✅ Save Changes'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 font-semibold shadow-lg transition-all"
                    >
                      ✏️ Edit Profile
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'bought' && <MyOrders />}

            {activeTab === 'security' && (
              <div className="max-w-md mx-auto py-8">
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-sm">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    🔒 Change Password
                  </h3>
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                        placeholder="••••••••"
                        minLength="6"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                        placeholder="••••••••"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-4 rounded-xl hover:from-black hover:to-gray-800 font-bold shadow-lg transition-all disabled:opacity-50"
                    >
                      {loading ? '⏳ Updating...' : '🔒 Update Password'}
                    </button>
                  </form>
                </div>

                <div className="mt-8 bg-red-50 border border-red-100 rounded-2xl p-6">
                  <h4 className="text-red-800 font-bold mb-2 flex items-center gap-2">
                    ⚠️ Dangerous Actions
                  </h4>
                  <p className="text-red-600 text-sm mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className="text-red-700 font-bold text-sm hover:underline">
                    Delete Account Permanently
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'sold' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    💼 My Products ({soldProducts.length})
                  </h3>
                  <button
                    onClick={fetchSoldProducts}
                    disabled={loading}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold text-sm disabled:opacity-50 transition-all"
                  >
                    {loading ? '⏳ Loading...' : '🔄 Refresh'}
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal-600"></div>
                  </div>
                ) : soldProducts.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-teal-50 rounded-2xl">
                    <div className="text-6xl mb-4">📦</div>
                    <h4 className="text-xl font-semibold text-gray-600 mb-2">No products yet</h4>
                    <p className="text-gray-500 mb-6">Add your first product to get started!</p>
                    <a
                      href="/add-product"
                      className="inline-block px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 font-semibold shadow-lg transition-all"
                    >
                      ➕ Add Product
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {soldProducts.map((product) => {
                      const status = getProductStatus(product);
                      const isDeleting = deleting === product._id;

                      return (
                        <div key={product._id} className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:shadow-xl transition-all group">
                          {/* Product Image */}
                          {product.photos && product.photos.length > 0 && (
                            <div className="mb-4 rounded-xl overflow-hidden bg-gray-100">
                              <img
                                src={product.photos[0]}
                                alt={product.name}
                                className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            </div>
                          )}

                          {/* Status Badge */}
                          <div className="mb-3">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                              {status.icon} {status.text}
                            </span>
                          </div>

                          {/* Product Details */}
                          <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1" title={product.name}>
                            {product.name}
                          </h4>
                          <div className="space-y-2 text-sm mb-4">
                            <p className="text-gray-700 flex items-center gap-2">
                              <span className="font-semibold">💰 Price:</span> ₹{product.price}
                            </p>
                            <p className="text-gray-700 flex items-center gap-2">
                              <span className="font-semibold">📊 Stock:</span> {product.quantity} units
                            </p>
                            <p className="text-gray-700 flex items-center gap-2">
                              <span className="font-semibold">📁 Category:</span> {product.category}
                            </p>
                            <p className="text-gray-700 flex items-center gap-2">
                              <span className="font-semibold">📅 Expiry:</span> {formatDate(product.expiryDate)}
                            </p>
                            <p className="text-gray-500 text-xs flex items-center gap-2">
                              <span className="font-semibold">➕ Added:</span> {formatDate(product.createdAt)}
                            </p>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteProduct(product._id, product.name)}
                            disabled={isDeleting}
                            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDeleting ? (
                              <span className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                Deleting...
                              </span>
                            ) : (
                              '🗑️ Delete Product'
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
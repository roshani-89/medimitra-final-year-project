import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import {
  PlusCircle, Package, Tag, Calendar,
  MapPin, Upload, X, Check, AlertCircle,
  Stethoscope, Info, ChevronRight, ArrowLeft,
  ShieldCheck
} from 'lucide-react';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [genericName, setGenericName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState('Medicine');
  const [society, setSociety] = useState('');
  const [pincode, setPincode] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      setSociety(user.society || '');
      setPincode(user.pincode || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let uploadedPhotoUrls = [];
      if (selectedFiles.length > 0) {
        setUploading(true);
        const uploadPromises = selectedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          const res = await axios.post('https://medimitra-final-year-project-3.onrender.com/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          return res.data.url;
        });
        uploadedPhotoUrls = await Promise.all(uploadPromises);
        setUploading(false);
      }

      await axios.post('https://medimitra-final-year-project-3.onrender.com/api/products', {
        name,
        brand,
        generic_name: genericName,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        expiryDate,
        category,
        society,
        pincode,
        photos: uploadedPhotoUrls
      });

      setSuccess(true);
      setTimeout(() => navigate('/products'), 1500);
    } catch (err) {
      setError('Failed to add product. Please try again.');
      setUploading(false);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles(selectedFiles.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-teal-600 font-bold text-xs uppercase tracking-widest mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Go Back
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-teal-600 font-black text-xs uppercase tracking-widest mb-3">
              <PlusCircle className="w-4 h-4" /> Marketplace Listing
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
              Sell <span className="text-teal-600">Medicine</span>
            </h1>
            <p className="text-gray-500 font-medium mt-3">Help someone in need and earn from your surplus inventory.</p>
          </div>
          <div className="hidden lg:block">
            <div className="px-6 py-4 bg-teal-600 text-white rounded-3xl shadow-xl shadow-teal-500/20 flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 opacity-50" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Authenticated</p>
                <p className="text-sm font-bold">Safe Transactions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Alerts */}
        {success && (
          <div className="mb-8 p-6 bg-emerald-50 border border-emerald-100 rounded-[32px] text-emerald-700 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="p-3 bg-emerald-500 rounded-2xl text-white">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black uppercase tracking-tight">Listing Created!</p>
              <p className="text-sm font-medium opacity-80">Your product is now live on the marketplace. Redirecting...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-[32px] text-red-600 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="p-3 bg-red-500 rounded-2xl text-white">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black uppercase tracking-tight">Submission Failed</p>
              <p className="text-sm font-medium opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Step 1: Core Information */}
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-xl">1</div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Core Details</h3>
                  <p className="text-sm text-gray-500 font-medium">Identify your product clearly</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Product Identity</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-bold"
                    placeholder="e.g. Paracetamol 500mg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Manufacturer/Brand</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-bold"
                    placeholder="e.g. GlaxoSmithKline"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Active Ingredient (Generic)</label>
                  <input
                    type="text"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-bold"
                    placeholder="e.g. Acetaminophen"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Classification Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-black uppercase appearance-none"
                  >
                    <option value="Medicine">Medicine 💊</option>
                    <option value="Medical Equipment">Equipment 🏥</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Clinical Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-medium"
                  placeholder="Enter indications, dosage, and storage instructions..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Step 2: Inventory & Log */}
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-xl">2</div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Inventory Control</h3>
                  <p className="text-sm text-gray-500 font-medium">Pricing and viability data</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Pricing (₹)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-4 font-black text-teal-600">₹</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-11 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-black"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Available Units</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-bold"
                    placeholder="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Expiration Timeline</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-bold"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Media & Location */}
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-xl">3</div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Media & Logistics</h3>
                  <p className="text-sm text-gray-500 font-medium">Help buyers find and trust you</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Local Area/Society</label>
                  <input
                    type="text"
                    value={society}
                    onChange={(e) => setSociety(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-bold"
                    placeholder="Sector 14, Galaxy Enclave"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-bold"
                    placeholder="400001"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Visual Proof (Photos)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-[32px] p-12 text-center hover:border-teal-500 transition-all bg-gray-50/50">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <Upload className="w-12 h-12 text-teal-600 mb-4 opacity-50" />
                      <p className="text-lg font-black text-gray-900 uppercase tracking-tighter">Upload Evidence</p>
                      <p className="text-xs text-gray-400 font-bold uppercase mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  </label>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group aspect-square rounded-[24px] overflow-hidden border border-gray-100 shadow-sm animate-in zoom-in-75">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-xl w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-8 mb-12">
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full py-6 bg-gray-900 text-white rounded-[32px] font-black text-xl uppercase tracking-tighter shadow-2xl hover:bg-black transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
            >
              {uploading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Syncing Assets...
                </>
              ) : loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <Check className="w-6 h-6" />
                  INITIATE LISTING
                </>
              )}
            </button>
            <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-6">
              By listing, you agree to our pharmaceutical verification protocols.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;

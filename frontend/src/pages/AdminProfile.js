import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    Shield, User, Mail, Calendar, LayoutDashboard,
    LogOut, ChevronRight, Settings, Bell, Lock,
    Phone, MapPin, Edit3, Camera, Save, X
} from 'lucide-react';

const AdminProfile = () => {
    const { user, setUser, logout } = useContext(AuthContext);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
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

    useEffect(() => {
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.put(
                'http://localhost:5000/api/auth/update-profile',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUser(response.data.user);
            setEditing(false);
            alert('✅ Administrator profile updated successfully!');
        } catch (error) {
            console.error('Error updating admin profile:', error);
            alert('❌ Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

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
            setUser({ ...user, profileImage: response.data.profileImage });
            alert('✅ Profile picture updated!');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('❌ Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Admin Dashboard', path: '/admin-dashboard', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { icon: Settings, label: 'Platform Settings', path: '#', color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { icon: Bell, label: 'Notifications', path: '#', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { icon: Lock, label: 'Security & Audit Logs', path: '#', color: 'text-red-500', bg: 'bg-red-500/10' },
    ];

    const getProfileImageUrl = () => {
        if (!user?.profileImage) return null;
        if (user.profileImage.startsWith('http')) return user.profileImage;
        return `http://localhost:5000/${user.profileImage.startsWith('/') ? user.profileImage.substring(1) : user.profileImage}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Banner */}
            <div className="h-56 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative">
                <div className="absolute -bottom-20 left-8 sm:left-12 flex items-end gap-6">
                    <div className="relative group">
                        <div className="w-36 h-36 rounded-3xl bg-white p-2 shadow-2xl">
                            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-red-600 to-purple-700 flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-inner overflow-hidden">
                                {getProfileImageUrl() ? (
                                    <img src={getProfileImageUrl()} alt="Admin" className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0)?.toUpperCase()
                                )}
                            </div>
                        </div>
                        <label className="absolute bottom-2 right-2 p-2.5 bg-gray-900 text-white rounded-xl cursor-pointer hover:bg-black transition-all shadow-lg border border-gray-700">
                            <Camera className="w-5 h-5" />
                            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                        </label>
                    </div>
                    <div className="mb-6">
                        <h1 className="text-4xl font-black text-white mb-2 drop-shadow-lg">{user?.name}</h1>
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-1 bg-red-600 text-white text-xs font-black rounded-full uppercase tracking-widest shadow-lg border border-red-500/50">
                                System Administrator
                            </span>
                            <span className="text-white/70 text-sm font-bold flex items-center gap-1.5 backdrop-blur-md bg-white/5 px-3 py-1 rounded-lg">
                                <Shield className="w-4 h-4 text-red-500" />
                                Root Access Restricted
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Account Details & Editing */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                <div className="p-2.5 bg-gray-100 rounded-xl">
                                    <Settings className="w-6 h-6 text-gray-600" />
                                </div>
                                Profile Configuration
                            </h2>
                            <button
                                onClick={() => editing ? handleSaveProfile() : setEditing(true)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${editing
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
                                        : 'bg-gray-900 text-white hover:bg-black shadow-gray-500/20'
                                    }`}
                            >
                                {editing ? (
                                    <><Save className="w-5 h-5" /> Save Changes</>
                                ) : (
                                    <><Edit3 className="w-5 h-5" /> Edit Profile</>
                                )}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Personal Info */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-l-4 border-red-500 pl-3">Personal Details</h3>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        disabled={!editing}
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-semibold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all disabled:opacity-70"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-500 ml-1">Gender</label>
                                        <select
                                            name="gender"
                                            disabled={!editing}
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-semibold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all disabled:opacity-70"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-500 ml-1">DOB</label>
                                        <input
                                            type="date"
                                            name="dob"
                                            disabled={!editing}
                                            value={formData.dob}
                                            onChange={handleInputChange}
                                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-semibold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all disabled:opacity-70"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 ml-1">Administrator Bio</label>
                                    <textarea
                                        name="bio"
                                        disabled={!editing}
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Enter admin credentials/bio..."
                                        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-semibold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all disabled:opacity-70 resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Contact & Address */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-l-4 border-purple-500 pl-3">Contact & Identification</h3>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={user?.email}
                                        disabled
                                        className="w-full bg-gray-100 border border-gray-100 p-4 rounded-2xl font-semibold text-gray-500"
                                    />
                                    <p className="text-[10px] text-gray-400 font-bold px-1 uppercase tracking-tighter">Login email cannot be changed</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 ml-1">Mobile Access</label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        disabled={!editing}
                                        value={formData.mobile}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-semibold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all disabled:opacity-70"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-500 ml-1">Street Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            disabled={!editing}
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="House No / Street"
                                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-semibold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all disabled:opacity-70"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-500 ml-1">Landmark</label>
                                        <input
                                            type="text"
                                            name="landmark"
                                            disabled={!editing}
                                            value={formData.landmark}
                                            onChange={handleInputChange}
                                            placeholder="Area Landmark"
                                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-semibold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all disabled:opacity-70"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {editing && (
                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    onClick={() => setEditing(false)}
                                    className="px-8 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" /> Discard
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                                >
                                    <Save className="w-4 h-4" /> Save Configuration
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Actions & Security */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-black text-gray-900 mb-6">System Controls</h2>
                        <div className="space-y-4">
                            {menuItems.map((item, index) => (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className="group flex items-center justify-between p-5 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-200 transition-all hover:shadow-md"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 ${item.bg} ${item.color} rounded-xl transition-transform group-hover:scale-110`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-sm">{item.label}</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Root Access Only</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-all group-hover:translate-x-1" />
                                </Link>
                            ))}
                        </div>

                        <button
                            onClick={logout}
                            className="w-full mt-10 py-5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-2xl font-black transition-all flex items-center justify-center gap-3 border-2 border-red-100 hover:border-red-600 shadow-lg shadow-red-500/10 active:scale-95 group"
                        >
                            <LogOut className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                            Secure Termination
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-gray-950 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden group border border-gray-800 shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                        <div className="relative z-10">
                            <div className="p-3 bg-red-500/20 rounded-2xl w-fit mb-6 border border-red-500/20">
                                <Shield className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black mb-3 italic tracking-tight">Security Advisory</h3>
                            <p className="text-gray-400 mb-8 text-sm leading-relaxed font-medium">
                                High-level administrative permissions detected. All actions are logged and audited in real-time. Unauthorized access attempts will trigger system isolation.
                            </p>
                            <button className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black transition-all border border-white/10 text-sm flex items-center justify-center gap-2 group">
                                <Lock className="w-4 h-4 text-red-500" />
                                View Audit Trails
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;

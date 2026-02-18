import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Users, Package, ShoppingCart, TrendingUp,
  Activity, BarChart3, User as UserIcon,
  Search, Filter, ExternalLink, RefreshCw,
  Mail, Phone, MapPin, Calendar, Clock,
  Tag, Info, Stethoscope, Star
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [detailedData, setDetailedData] = useState({
    users: [],
    products: [],
    orders: []
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes, productsRes, ordersRes] = await Promise.all([
        axios.get('https://medimitra-final-year-project-3.onrender.com/api/auth/admin/stats', axiosConfig),
        axios.get('https://medimitra-final-year-project-3.onrender.com/api/auth/admin/users', axiosConfig),
        axios.get('https://medimitra-final-year-project-3.onrender.com/api/products/admin/all', axiosConfig),
        axios.get('https://medimitra-final-year-project-3.onrender.com/api/orders/admin/all', axiosConfig)
      ]);

      setStats(statsRes.data);
      setDetailedData({
        users: usersRes.data,
        products: productsRes.data,
        orders: ordersRes.data.orders || ordersRes.data // Handle both paginated and direct array
      });
    } catch (err) {
      setError('Failed to fetch platform data. Please ensure you have admin privileges.');
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading Platform Command Center...</p>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className={`bg-white rounded-3xl shadow-sm p-6 border border-gray-100 relative overflow-hidden group`}>
      <div className={`absolute top-0 right-0 w-32 h-32 ${color.replace('font-', 'bg-').replace('text-', 'bg-')}/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl ${color.replace('text-', 'bg-')}/10 ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          {subtitle && (
            <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded-full text-gray-500">
              {subtitle}
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Platform Users"
          value={stats?.summary?.users || 0}
          icon={Users}
          color="text-blue-500"
        />
        <StatCard
          title="Global Orders"
          value={stats?.summary?.orders || 0}
          icon={ShoppingCart}
          color="text-emerald-500"
        />
        <StatCard
          title="Inventory Items"
          value={stats?.summary?.products || 0}
          icon={Package}
          color="text-purple-500"
        />
        <StatCard
          title="Platform Sales"
          value={`₹${(stats?.summary?.revenue || 0).toLocaleString()}`}
          icon={TrendingUp}
          color="text-orange-500"
          subtitle="Recent Revenue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {detailedData.orders.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Order {order.orderId}</p>
                    <p className="text-xs text-gray-500">{order.buyerId?.name} • ₹{order.totalPrice}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                  {order.status}
                </span>
              </div>
            ))}
            {detailedData.orders.length === 0 && (
              <p className="text-center py-8 text-gray-400 italic">No recent transactions</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-blue-500" />
            New Registrations
          </h3>
          <div className="space-y-4">
            {detailedData.users.slice(0, 5).map((u) => (
              <div key={u._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-gray-400">
                  {new Date(u.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
            {detailedData.users.length === 0 && (
              <p className="text-center py-8 text-gray-400 italic">No user data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const InsightsTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 gap-8">
        {/* Daily Sales Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-500" />
            Daily Revenue Trends (Last 30 Days)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] bg-gray-50 font-bold uppercase tracking-widest">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Orders</th>
                  <th className="px-6 py-4">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats?.charts?.dailySales?.slice().reverse().map((day) => (
                  <tr key={day._id} className="text-sm">
                    <td className="px-6 py-4 font-medium">{day._id}</td>
                    <td className="px-6 py-4">{day.count}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">₹{day.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Monthly Growth Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Revenue Flow</h4>
              {stats?.charts?.monthlySales?.slice().reverse().map((month) => (
                <div key={month._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-xs font-bold text-gray-600">{month._id}</span>
                  <span className="text-sm font-black text-gray-800">₹{month.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">User Registrations</h4>
              {stats?.charts?.userTrends?.slice().reverse().slice(0, 10).map((trend) => (
                <div key={trend._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-xs font-bold text-gray-600">{trend._id}</span>
                  <span className="text-sm font-black text-blue-600">+{trend.count} Users</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const LeaderboardTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-500" />
            Top Products by Volume
          </h3>
          <div className="space-y-4">
            {stats?.leaderboard?.topProducts?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-gray-300 w-6">#{idx + 1}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{item.product.name}</p>
                    <p className="text-[10px] text-gray-500">{item.product.brand}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-800">{item.totalSold} Units</p>
                  <p className="text-[10px] text-emerald-600 font-bold">₹{item.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Top Value Buyers
          </h3>
          <div className="space-y-4">
            {stats?.leaderboard?.topBuyers?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-gray-300 w-6">#{idx + 1}</span>
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                    {item.user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{item.user.name}</p>
                    <p className="text-[10px] text-gray-500">{item.orderCount} Orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-600">₹{item.totalSpent.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const TableHeader = ({ icon: Icon, title, count }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-500/20">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500">Total {count} records found</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm w-full sm:w-64"
          />
        </div>
        <button className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">
          <Filter className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const UsersTab = () => {
    const filteredUsers = detailedData.users.filter(u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <TableHeader icon={Users} title="User Management" count={detailedData.users.length} />
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-8 py-5">User Account</th>
                  <th className="px-6 py-5">Contact</th>
                  <th className="px-6 py-5">Activity</th>
                  <th className="px-6 py-5">Platform Role</th>
                  <th className="px-6 py-5">Joined</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold shadow-md">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{u.name}</p>
                          <p className="text-[10px] text-gray-400">ID: {u._id.substring(18)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Mail className="w-3 h-3 text-gray-400" />
                          {u.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {u.mobile}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Clock className="w-3 h-3 text-gray-400" />
                          Last: {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {u.society}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all shadow-sm ${u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 hover:bg-white rounded-lg group-hover:shadow-sm text-gray-400 hover:text-red-500 transition-all border border-transparent hover:border-gray-100">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const ProductsTab = () => {
    const filteredProducts = detailedData.products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.generic_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <TableHeader icon={Package} title="Inventory Control" count={detailedData.products.length} />
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-8 py-5">Product Details</th>
                  <th className="px-6 py-5">Seller Info</th>
                  <th className="px-6 py-5">Pricing & Stock</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Category</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden shadow-sm">
                          {p.photos?.[0] ? (
                            <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{p.name}</p>
                          <p className="text-[10px] text-gray-500">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-xs font-bold text-gray-800">{p.sellerId?.name}</p>
                        <p className="text-[10px] text-gray-500">{p.sellerId?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                          <Tag className="w-3 h-3 text-red-500" />
                          ₹{p.price}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Info className="w-3 h-3 text-gray-400" />
                          Stock: {p.quantity} units
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${p.quantity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {p.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500 transition-all border border-transparent hover:border-gray-100">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const OrdersTab = () => {
    const filteredOrders = detailedData.orders.filter(o =>
      o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.buyerId?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <TableHeader icon={ShoppingCart} title="Platform Transactions" count={detailedData.orders.length} />
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-8 py-5">Order ID & Item</th>
                  <th className="px-6 py-5">Parties Involved</th>
                  <th className="px-6 py-5">Transaction Details</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Timestamp</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                          #
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{o.orderId}</p>
                          <p className="text-[10px] text-gray-500 truncate max-w-[150px]">{o.productId?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <span className="font-bold text-gray-400 text-[8px] uppercase">Buyer:</span>
                          {o.buyerId?.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                          {o.buyerId?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-emerald-600">₹{o.totalPrice}</p>
                        <p className="text-[10px] text-gray-400">Qty: {o.quantity}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${o.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {new Date(o.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500 transition-all border border-transparent hover:border-gray-100">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <div className="w-20 lg:w-72 bg-gray-900 text-white flex flex-col p-4 transition-all">
        <div className="flex items-center gap-3 px-4 py-8 mb-8">
          <div className="p-2 bg-red-600 rounded-xl shadow-lg shadow-red-500/20">
            <Stethoscope className="w-6 h-6 lg:w-8 lg:h-8" />
          </div>
          <span className="text-xl font-black lg:block hidden tracking-tighter uppercase">Platform Cmd</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', icon: Activity, label: 'Overview' },
            { id: 'insights', icon: BarChart3, label: 'Insights' },
            { id: 'leaderboard', icon: Star, label: 'Leaderboard' },
            { id: 'users', icon: Users, label: 'Users' },
            { id: 'products', icon: Package, label: 'Products' },
            { id: 'orders', icon: ShoppingCart, label: 'Orders' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSearchTerm('');
              }}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${activeTab === item.id
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
              <span className="font-bold lg:block hidden">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/10 mt-8">
          <Link to="/admin/profile" className="flex items-center gap-4 px-4 py-4 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
            <UserIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="font-bold lg:block hidden">Admin Profile</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30 px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tight">
                {activeTab} <span className="text-red-600">Console</span>
              </h1>
              <p className="text-sm text-gray-400 font-medium">Monitoring platform integrity and health</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all border border-gray-200"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-red-600' : ''}`} />
                {refreshing ? 'Syncing...' : 'Sync System'}
              </button>
            </div>
          </div>
        </header>

        <main className="p-8">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-3xl text-red-600 flex items-center gap-3">
              <Info className="w-5 h-5" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'insights' && <InsightsTab />}
          {activeTab === 'leaderboard' && <LeaderboardTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'orders' && <OrdersTab />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

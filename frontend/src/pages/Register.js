import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [society, setSociety] = useState('');
  const [pincode, setPincode] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [societyError, setSocietyError] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateName = (value) => {
    if (!value.trim()) return 'Name is required';
    if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name must contain only letters and spaces';
    return '';
  };

  const validateEmail = (value) => {
    if (!value.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters long';
    if (!/(?=.*\d)(?=.*[!@#$%^&*])/.test(value)) return 'Password must contain at least one number and one special character';
    return '';
  };

  const validateMobile = (value) => {
    if (!value.trim()) return 'Mobile number is required';
    if (!/^\d{10}$/.test(value)) return 'Mobile number must be exactly 10 digits';
    return '';
  };

  const validateSociety = (value) => {
    if (!value.trim()) return 'Society is required';
    return '';
  };

  const validatePincode = (value) => {
    if (!value.trim()) return 'Pincode is required';
    if (!/^\d{6}$/.test(value)) return 'Pincode must be exactly 6 digits';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const mobileErr = validateMobile(mobile);
    const societyErr = validateSociety(society);
    const pincodeErr = validatePincode(pincode);

    setNameError(nameErr);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setMobileError(mobileErr);
    setSocietyError(societyErr);
    setPincodeError(pincodeErr);

    if (nameErr || emailErr || passwordErr || mobileErr || societyErr || pincodeErr) {
      return;
    }

    // Validate admin code if registering as admin
    if (showAdminCode) {
      if (!adminCode.trim()) {
        setError('Admin secret code is required');
        return;
      }
      if (adminCode !== 'ADMIN2024') { // You can change this secret code
        setError('Invalid admin secret code');
        return;
      }
    }

    try {
      const role = showAdminCode ? 'Admin' : 'User';
      await register(name, email, password, mobile, society, pincode, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Register</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2 text-sm sm:text-base">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError('');
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            />
            {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
          </div>
          <div>
            <label className="block text-gray-700 mb-2 text-sm sm:text-base">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            />
            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
          </div>
          <div>
            <label className="block text-gray-700 mb-2 text-sm sm:text-base">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            />
            {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
          </div>
          <div>
            <label className="block text-gray-700 mb-2 text-sm sm:text-base">Mobile Number</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value);
                setMobileError('');
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            />
            {mobileError && <p className="text-red-500 text-xs mt-1">{mobileError}</p>}
          </div>
          <div>
            <label className="block text-gray-700 mb-2 text-sm sm:text-base">Society</label>
            <input
              type="text"
              value={society}
              onChange={(e) => {
                setSociety(e.target.value);
                setSocietyError('');
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            />
            {societyError && <p className="text-red-500 text-xs mt-1">{societyError}</p>}
          </div>
          <div>
            <label className="block text-gray-700 mb-2 text-sm sm:text-base">Pincode</label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value);
                setPincodeError('');
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            />
            {pincodeError && <p className="text-red-500 text-xs mt-1">{pincodeError}</p>}
          </div>

          {/* Admin Registration Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="adminRegister"
              checked={showAdminCode}
              onChange={(e) => setShowAdminCode(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="adminRegister" className="ml-2 block text-sm text-gray-700">
              Register as Admin
            </label>
          </div>

          {showAdminCode && (
            <div>
              <label className="block text-gray-700 mb-2 text-sm sm:text-base">Admin Secret Code</label>
              <input
                type="password"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                placeholder="Enter admin code"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-sm sm:text-base"
          >
            Register
          </button>
        </form>
        <p className="mt-6 text-center text-sm sm:text-base">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import logo from '../assets/logo.png';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [formVisible, setFormVisible] = useState(false);
  // Add these near your other useState declarations
  const [successMessage, setSuccessMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  
  // Animation effect when component mounts
  useEffect(() => {
    setFormVisible(true);
  }, []);
  // Add this with your other useEffect hooks
  useEffect(() => {
    let timer;
    if (showMessage) {
      timer = setTimeout(() => {
        setShowMessage(false);
        setSuccessMessage('');
        setError('');
      }, 5000);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [showMessage]);

  const navigate = useNavigate();

  // redirect user to login page if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user-data'));
      if (!userData) {
        console.log('User data not found in localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('user-data');
        return;
      }
      
      if (userData.role === 'pharmacy') {
        navigate('/pharmacy');
      }
      else if (userData.role === 'admin') {
        navigate('/admin');
      }
      else {
        navigate('/user');
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    
    try {
      const data = await api.post('/auth/login', { email, password });
      
      if (data.data.success) {
        setSuccessMessage('Login successful! Redirecting...');
        setShowMessage(true);
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user-data', JSON.stringify(data.data.user));
        
        // Redirect after delay to show message
        setTimeout(() => {
          // Redirect based on role
          if (data.data.user.role === 'pharmacy') {
            navigate('/pharmacy');
          } else if (data.data.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/user');
          }
        }, 1000);
      } else {
        setError(data.data.errors || 'Login failed. Please check your credentials.');
        setShowMessage(true);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Something went wrong. Please try again later.');
      setShowMessage(true);
    }
    
    setIsLoading(false);
  };
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
  
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setShowMessage(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const data = await api.post('/auth/signup', {
        name,
        email,
        password,
        role,
      });
      
      if (data.data.success) {
        setSuccessMessage('Account created successfully! Redirecting...');
        setShowMessage(true);
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user-data', JSON.stringify(data.data.user));
        
        setTimeout(() => {
          if (data.data.user.role === 'pharmacy') {
            navigate('/onboard-pharmacy');
          } else {
            navigate('/user');
          }
        }, 1000);
      } else {
        setError(data.errors || 'Signup failed. Please try again.');
        setShowMessage(true);
      }
    } catch (error) {
      if (error.status === 400) {
        setError("A user with this email already exists");
      }
      else {
        console.error('Error during signup:', error);
        setError(error.message || 'Something went wrong. Please try again later.');
      }
      setShowMessage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left panel - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 py-12 lg:px-8">
        <div 
          className={`mb-8 transform transition-all duration-700 ${formVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}
        >
          {/* This is where you'll place your logo */}
          <div className="h-45 w-auto text-center mb-2">
            {/* Replace this with your own logo component or image */}
            {/* <div className="bg-blue-600 p-2 rounded-full inline-block">
              <PlusCircle size={28} className="text-white" />
            </div> */}
<div className="h-82 w-auto text-center mb-2">
  <div className="h-74">
    <img src={logo} alt="Logo" className="h-70 mx-auto" />
  </div>
</div>


          </div>
          
          <h2 className="text-center text-blue-600 font-semibold">Nearby Pharmacy Tracker</h2>
        </div>
        
        <div className={`w-full max-w-md transition-all duration-500 ${formVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
          <h2 className="text-3xl font-semibold mb-1 text-gray-900">
            {!isSignUp ? "Sign in" : "Create account"}
          </h2>
          
          {!isSignUp && (
            <p className="text-gray-600 mb-8">
              Don't have an account? <button onClick={() => setIsSignUp(true)} className="text-blue-600 hover:text-blue-800 font-medium">Create now</button>
            </p>
          )}
          
          {isSignUp && (
            <p className="text-gray-600 mb-8">
              Already have an account? <button onClick={() => setIsSignUp(false)} className="text-blue-600 hover:text-blue-800 font-medium">Sign in</button>
            </p>
          )}
          
          {showMessage && (
              <div className={`p-3 rounded-md mb-6 text-sm transition-all duration-300 ${
                successMessage ? 'bg-green-50 text-green-700' : error ? 'bg-red-50 text-red-700' : ''
              }`}>
                {successMessage || error}
              </div>
            )}
          
          {!isSignUp ? (
            // Login Form
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-4 py-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="example@gmail.com"
                    required
                  />
                </div>
              </div>
              
              <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-300">Forgot Password?</a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="px-4 py-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">NEARBY</span>
                </div>
              </div>
            </form>
          ) : (
            // Signup Form
            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="px-4 py-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  required
                >
                  <option value="user">Regular User</option>
                  <option value="pharmacy">Pharmacy Owner</option>
                </select>
              </div>
              
              <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-4 py-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  placeholder="example@gmail.com"
                  required
                />
              </div>
              
              <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="px-4 py-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="px-4 py-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center mt-4">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the terms and conditions
                </label>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
      
      {/* Right panel - Feature Showcase */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-900 text-white p-12 flex-col justify-center relative overflow-hidden">
        <div className={`relative z-10 max-w-md transition-all duration-1000 ${formVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
          <h2 className="text-3xl font-bold mb-6">Find Nearby Pharmacies</h2>
          <p className="text-lg mb-8">
            Use our platform to locate medicines at pharmacies near you. 
            Save time and find what you need quickly.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 transform transition-all duration-500 hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-white/20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-lg">Track Locations</h3>
                <p className="text-white/80">Find medicines nearest to you</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-lg">Save Time</h3>
                <p className="text-white/80">Quick search for available medicines</p>
              </div>
            </div>
          </div>
          
          <div className="transform transition-all duration-500 hover:translate-x-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-lg">Inventory Management</h3>
                  <p className="text-white/80">For pharmacy owners</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-white/70">
            <p>Your trusted pharmacy tracking platform</p>
            <a href="#" className="text-white underline mt-2 inline-block transition-all duration-300 hover:text-blue-200">Learn more about our services</a>
          </div>
        </div>
        
        {/* Decorative animated elements */}
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-20 -right-16 w-32 h-32 bg-white/5 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-white/5 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
    </div>
  );
}

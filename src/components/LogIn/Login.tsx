import React from 'react';
import { Eye, EyeOff, User, Lock, Shield, LogIn, Loader2 } from 'lucide-react';
import { useLoginLogic } from '../../hooks/useLoginLogic';

interface LoginProps {
  onLogin?: (data: { username: string; password: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const {
    formData,
    showPassword,
    isLoading,
    errorMessage,
    successMessage,
    handleInputChange,
    handleSubmit,
    togglePassword
  } = useLoginLogic(onLogin);

  // Note: The outer 'min-h-screen' and background divs were removed. 
  // This component now only renders the Card itself.
  return (
    <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-12 w-full relative overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-800"></div>

      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center mb-6">
          <img 
            src="/favicons/favicon-32x32.png" 
            alt="Movonte Logo" 
            className="w-16 h-16 mr-4"
          />
          <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
            <Shield className="w-10 h-10 text-white relative z-10" />
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">
          Movonte Admin
        </h1>
        <p className="text-gray-600 font-medium mb-1">Administration Panel</p>
        <p className="text-gray-400 text-sm">Sign in to access the system</p>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 text-red-700 p-4 rounded-xl mb-6 border border-red-200 shadow-sm">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 p-4 rounded-xl mb-6 border border-green-200 shadow-sm">
          {successMessage}
        </div>
      )}

      {/* Form */}
      {!isLoading ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-gray-700 text-sm font-semibold mb-2 tracking-wide">
              Username or Email
            </label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full pl-14 pr-5 py-4 border-2 border-gray-200 rounded-xl text-base font-medium transition-all duration-300 bg-gray-50 text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg focus:-translate-y-0.5 hover:border-gray-300 hover:bg-white"
                placeholder="Enter your username or email"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2 tracking-wide">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-14 pr-14 py-4 border-2 border-gray-200 rounded-xl text-base font-medium transition-all duration-300 bg-gray-50 text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg focus:-translate-y-0.5 hover:border-gray-300 hover:bg-white"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-900 to-blue-600 text-white font-bold text-base rounded-xl cursor-pointer transition-all duration-300 mt-4 relative overflow-hidden tracking-wide hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/25 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-500"></div>
            <div className="relative flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" />
              Sign In
            </div>
          </button>
        </form>
      ) : (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Verifying credentials...</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-10 pt-6 border-t border-gray-200">
        <p className="text-gray-400 text-sm font-medium">
          &copy; 2024 Movonte. All rights reserved.
        </p>
        <p className="text-gray-300 text-xs mt-2 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" />
          Secure and encrypted access
        </p>
      </div>
    </div>
  );
};

export default Login;
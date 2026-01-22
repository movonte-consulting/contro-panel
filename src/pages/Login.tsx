import React from 'react';
import Login from '../components/LogIn/Login';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-600 to-blue-800 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cpattern id='grain' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='25' cy='25' r='1' fill='white' opacity='0.1'/%3E%3Ccircle cx='75' cy='75' r='1' fill='white' opacity='0.1'/%3E%3Ccircle cx='50' cy='10' r='0.5' fill='white' opacity='0.1'/%3E%3Ccircle cx='10' cy='60' r='0.5' fill='white' opacity='0.1'/%3E%3Ccircle cx='90' cy='40' r='0.5' fill='white' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grain)'/%3E%3C/svg%3E")`
             }}>
        </div>
      </div>

      {/* Render the Login Component (The Card) */}
      <div className="relative z-10 w-full max-w-md">
        <Login />
      </div>
    </div>
  );
};

export default LoginPage;
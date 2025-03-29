import { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

export default function Auth() {
  const [showLogin, setShowLogin] = useState<boolean>(true);

  function toggleForm() {
    setShowLogin(!showLogin);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md">
        {showLogin ? (
          <Login switchToSignup={() => setShowLogin(false)} />
        ) : (
          <Signup switchToLogin={() => setShowLogin(true)} />
        )}
      </div>
    </div>
  );
} 
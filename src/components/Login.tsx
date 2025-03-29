import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseError } from 'firebase/app';

interface LoginProps {
  switchToSignup: () => void;
}

export default function Login({ switchToSignup }: LoginProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showTestAccounts, setShowTestAccounts] = useState<boolean>(false);
  const { login } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await login(email, password);
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/invalid-email':
            setError('Invalid email address');
            break;
          case 'auth/user-not-found':
            setError('No account found with this email');
            break;
          case 'auth/wrong-password':
            setError('Incorrect password');
            break;
          case 'auth/invalid-credential':
            setError('Invalid login credentials');
            break;
          default:
            setError(`Failed to sign in: ${error.message}`);
        }
      } else {
        setError('Failed to sign in');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleUseTestAccount(testEmail: string) {
    setEmail(testEmail);
    setPassword('password123');
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">School Document Manager</h2>
        <p className="text-gray-600 mt-2">Sign in to manage your documents</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="flex items-center justify-between pt-2">
          <button
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          <button
            className="font-bold text-sm text-blue-500 hover:text-blue-800"
            type="button"
            onClick={switchToSignup}
            disabled={loading}
          >
            Create Account
          </button>
        </div>
      </form>
      
      <div className="mt-8">
        <button
          onClick={() => setShowTestAccounts(!showTestAccounts)}
          className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {showTestAccounts ? 'Hide Test Accounts' : 'Show Test Accounts'}
        </button>
        
        {showTestAccounts && (
          <div className="mt-4 bg-gray-50 p-4 rounded border border-gray-200">
            <h3 className="text-md font-semibold mb-3">Test Accounts</h3>
            <p className="text-xs text-gray-600 mb-2">All accounts use password: <code className="bg-gray-200 px-1 py-0.5 rounded">password123</code></p>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleUseTestAccount('principal@school.edu')}
                className="text-left px-2 py-1 text-sm hover:bg-blue-100 rounded flex justify-between items-center"
                disabled={loading}
              >
                <span>principal@school.edu</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">Admin</span>
              </button>
              
              <button
                onClick={() => handleUseTestAccount('docmanager@school.edu')}
                className="text-left px-2 py-1 text-sm hover:bg-blue-100 rounded flex justify-between items-center"
                disabled={loading}
              >
                <span>docmanager@school.edu</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">Admin</span>
              </button>
              
              <button
                onClick={() => handleUseTestAccount('teacher1@school.edu')}
                className="text-left px-2 py-1 text-sm hover:bg-blue-100 rounded flex justify-between items-center"
                disabled={loading}
              >
                <span>teacher1@school.edu</span>
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-semibold">Teacher</span>
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-3">
              Note: You need to create an admin account first and use it to generate test accounts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 
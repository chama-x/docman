import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseError } from 'firebase/app';

interface SignupProps {
  switchToLogin: () => void;
}

export default function Signup({ switchToLogin }: SignupProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const { signup } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (password.length < 6) {
      return setError('Password should be at least 6 characters');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setLoading(true);
      await signup(email, password, isAdmin, isTeacher);
      setSuccess(true);
      
      // Reset form after successful signup
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setIsAdmin(false);
      setIsTeacher(false);
      
      // Switch to login after 2 seconds
      setTimeout(() => {
        switchToLogin();
      }, 2000);
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            setError('Email is already in use');
            break;
          case 'auth/invalid-email':
            setError('Invalid email address');
            break;
          case 'auth/weak-password':
            setError('Password is too weak');
            break;
          default:
            setError(`Failed to create an account: ${error.message}`);
        }
      } else {
        setError('Failed to create an account');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg shadow-black/20 w-full border border-gray-700">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Create Account</h2>
        <p className="text-gray-400 mt-2">Register to manage school documents</p>
      </div>
      
      {error && (
        <div className="bg-red-900 bg-opacity-20 border border-red-700 text-red-400 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-900 bg-opacity-20 border border-green-700 text-green-400 px-4 py-3 rounded mb-4">
          Account created successfully! Redirecting to login...
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="bg-gray-700 border border-gray-600 rounded w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:ring focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || success}
          />
        </div>
        
        <div>
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="bg-gray-700 border border-gray-600 rounded w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:ring focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading || success}
          />
          <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters</p>
        </div>
        
        <div>
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="confirm-password">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirm-password"
            className="bg-gray-700 border border-gray-600 rounded w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:ring focus:ring-blue-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading || success}
          />
        </div>
        
        <div>
          <label className="block text-gray-300 text-sm font-bold mb-2">
            Role
          </label>
          <div className="flex flex-col space-y-2 bg-gray-700 p-3 rounded border border-gray-600">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-600 bg-gray-800 text-blue-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                disabled={loading || success}
              />
              <span className="ml-2 text-gray-300">Administrator (Principal)</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-600 bg-gray-800 text-blue-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                checked={isTeacher}
                onChange={(e) => setIsTeacher(e.target.checked)}
                disabled={loading || success}
              />
              <span className="ml-2 text-gray-300">Teacher</span>
            </label>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <button
            className={`bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-500 ${
              (loading || success) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            type="submit"
            disabled={loading || success}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
          
          <button
            className="font-bold text-sm text-blue-400 hover:text-blue-300"
            type="button"
            onClick={switchToLogin}
            disabled={loading}
          >
            Have an account? Login
          </button>
        </div>
      </form>
    </div>
  );
} 
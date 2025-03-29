import { z } from 'zod';
import { Input } from '../Form/Input';
import { Button } from '../Button';
import { useZodForm } from '@/hooks/useZodForm';
import toast from 'react-hot-toast';
import { useState } from 'react';

// Define the form schema with Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

// Type inference from the schema
type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize form with Zod validation
  const form = useZodForm(loginSchema, {
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Form submission handler
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      console.info('Form submitted:', data);
      toast.success('Login successful!');
      
      // Reset form after successful submission
      form.reset();
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
        Sign In
      </h2>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Input
          name="email"
          label="Email"
          type="email"
          form={form}
          required
          placeholder="Enter your email"
        />
        
        <Input
          name="password"
          label="Password"
          type="password"
          form={form}
          required
          placeholder="Enter your password"
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:focus:ring-primary-400"
              {...form.register('rememberMe')}
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 text-sm text-gray-700 dark:text-gray-300"
            >
              Remember me
            </label>
          </div>
          
          <a
            href="#"
            className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
          >
            Forgot password?
          </a>
        </div>
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          disabled={isLoading}
        >
          Sign In
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <a
            href="#"
            className="font-medium text-primary-600 hover:underline dark:text-primary-400"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
} 
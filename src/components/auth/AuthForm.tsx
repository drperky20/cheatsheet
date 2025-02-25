import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/button';

interface AuthFormProps {
  onSubmit: (email: string, password: string) => void;
  type: 'login' | 'register';
}

const AuthForm: React.FC<AuthFormProps> = ({ onSubmit, type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl"
    >
      <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
        {type === 'login' ? 'Welcome Back' : 'Create Account'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
            required
          />
        </div>
        
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-500/90 hover:to-purple-500/90"
        >
          {type === 'login' ? 'Sign In' : 'Sign Up'}
        </Button>
      </form>
    </motion.div>
  );
};

export default AuthForm;

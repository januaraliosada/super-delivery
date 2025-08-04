import { createContext, useContext, useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi.js';
import { useToast } from '@/hooks/useToast.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { post, get } = useApi();
  const { toast } = useToast();

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          setIsAuthenticated(true);
          localStorage.setItem('auth_token', token);
        } else {
          localStorage.removeItem('auth_token');
        }
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const data = await post('/auth/login', { email, password });
      
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('auth_token', data.token);
        
        toast({
          variant: "success",
          title: "Login Successful",
          description: `Welcome back, ${data.user.first_name}!`,
        });
        
        return { success: true, user: data.user };
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const data = await post('/auth/register', userData);
      
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('auth_token', data.token);
        
        toast({
          variant: "success",
          title: "Registration Successful",
          description: `Welcome to Super Delivery, ${data.user.first_name}!`,
        });
        
        return { success: true, user: data.user };
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Failed to create account.",
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Call logout endpoint
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local state regardless of API call result
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('auth_token');
      
      toast({
        variant: "success",
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        toast({
          variant: "success",
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
        return { success: true, user: data.user };
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
      });
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          variant: "success",
          title: "Password Changed",
          description: "Your password has been updated successfully.",
        });
        return { success: true };
      } else {
        throw new Error(data.message || 'Failed to change password');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Password Change Failed",
        description: error.message || "Failed to change password.",
      });
      return { success: false, error: error.message };
    }
  };

  const getAuthToken = () => {
    return localStorage.getItem('auth_token');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    getAuthToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


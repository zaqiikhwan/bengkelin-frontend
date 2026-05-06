import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api';
import type { UserInfo, MitraInfo } from '../types/api';

interface AuthContextType {
  user: UserInfo | null;
  mitra: MitraInfo | null;
  userType: 'users' | 'mitras' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAsUser: (email: string, password: string) => Promise<void>;
  loginAsMitra: (email: string, password: string) => Promise<void>;
  registerAsUser: (userData: any) => Promise<void>;
  registerAsMitra: (userData: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  switchUserType: (type: 'users' | 'mitras') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [mitra, setMitra] = useState<MitraInfo | null>(null);
  const [userType, setUserType] = useState<'users' | 'mitras' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = (!!user || !!mitra) && apiService.isAuthenticated();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (apiService.isAuthenticated()) {
        const storedUserType = apiService.getUserType();
        if (storedUserType) {
          setUserType(storedUserType);
          
          // Try to get user profile to validate token
          try {
            let response;
            if (storedUserType === 'users') {
              response = await apiService.getUserProfile();
            } else {
              response = await apiService.getMitraProfile();
            }
            
            if (response.success && response.data) {
              if (storedUserType === 'users') {
                const userData = response.data as any;
                setUser({
                  id: userData.user_id || userData.id,
                  first_name: userData.first_name,
                  last_name: userData.last_name,
                  email: userData.email,
                  phone_number: userData.phone_number,
                  avatar_url: userData.avatar_url
                });
              } else {
                const mitraData = response.data as any;
                setMitra({
                  id: mitraData.mitra_id || mitraData.id,
                  first_name: mitraData.first_name,
                  last_name: mitraData.last_name,
                  email: mitraData.email,
                  phone_number: mitraData.phone_number,
                  bank_name: mitraData.bank_name,
                  bank_number: mitraData.bank_number
                });
              }
            } else {
              // Profile request failed, token might be invalid
              throw new Error('Profile request failed');
            }
          } catch (profileError: any) {
            console.warn('Profile request failed, clearing invalid token:', profileError);
            
            // Clear the auth state for any profile request failure
            // This ensures invalid tokens are properly handled
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_type');
            setUser(null);
            setMitra(null);
            setUserType(null);
          }
        }
      } else {
        // No token, clear everything
        setUser(null);
        setMitra(null);
        setUserType(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_type');
      setUser(null);
      setMitra(null);
      setUserType(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsUser = async (email: string, password: string) => {
    try {
      console.log('Attempting user login...');
      const response = await apiService.userLogin({ email, password });
      console.log('Login response:', response);
      console.log('Response status:', response?.success);
      console.log('Response data:', response?.data);
      
      if (response.success && response.data) {
        const { access_token, refresh_token, user: userData } = response.data;
        
        console.log('Tokens received:', { access_token: !!access_token, refresh_token: !!refresh_token });
        console.log('User data received:', userData);
        
        if (!access_token || !refresh_token) {
          throw new Error('Missing authentication tokens in response');
        }
        
        console.log('Setting tokens and user data...');
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        apiService.setUserType('users');
        setUserType('users');
        
        if (userData) {
          setUser(userData);
          setMitra(null);
          console.log('User data set successfully, isAuthenticated should be true');
        } else {
          console.log('No user data, trying to refresh...');
          try {
            await refreshUser();
          } catch (refreshError) {
            console.warn('Profile refresh failed, using login data only:', refreshError);
            // If profile endpoint isn't available, we'll rely on the token being valid
          }
        }
        
        // Force a small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('Login process completed, authentication state updated');
        console.log('isAuthenticated should now be:', (!!user || !!mitra) && apiService.isAuthenticated());
      } else {
        console.error('Login response not successful:', response);
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error in auth hook:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Check if it's a network error
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      
      // Check if it's a connection refused error
      if (error.message.includes('ECONNREFUSED') || error.message.includes('connect ECONNREFUSED')) {
        throw new Error('Backend server is not running. Please start the Bengkelin API service.');
      }
      
      // Handle specific user login error responses
      if (error.response?.status === 404) {
        const errorData = error.response.data;
        throw new Error(errorData?.message || 'User not found');
      }
      
      if (error.response?.status === 401) {
        const errorData = error.response.data;
        if (errorData?.errors?.code === 'INVALID_CREDENTIALS') {
          throw new Error('Invalid email or password');
        }
        throw new Error(errorData?.message || 'Invalid credentials');
      }
      
      // Handle other HTTP status codes
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        throw new Error(errorData?.message || 'Invalid request data');
      }
      
      if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  const loginAsMitra = async (email: string, password: string) => {
    try {
      console.log('Attempting mitra login...');
      const response = await apiService.mitraLogin({ email, password });
      console.log('Mitra login response:', response);
      
      if (response.success && response.data) {
        const { access_token, refresh_token, mitra: mitraData } = response.data;
        
        console.log('Setting tokens and mitra data...');
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        apiService.setUserType('mitras');
        setUserType('mitras');
        
        if (mitraData) {
          setMitra(mitraData);
          setUser(null);
          console.log('Mitra data set successfully, isAuthenticated should be true');
        } else {
          console.log('No mitra data, trying to refresh...');
          try {
            await refreshUser();
          } catch (refreshError) {
            console.warn('Profile refresh failed, using login data only:', refreshError);
            // If profile endpoint isn't available, we'll rely on the token being valid
          }
        }
        
        // Force a small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('Mitra login process completed, authentication state updated');
        console.log('isAuthenticated should now be:', (!!user || !!mitra) && apiService.isAuthenticated());
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Mitra login error in auth hook:', error);
      
      // Check if it's a network error
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      
      // Check if it's a connection refused error
      if (error.message.includes('ECONNREFUSED') || error.message.includes('connect ECONNREFUSED')) {
        throw new Error('Backend server is not running. Please start the Bengkelin API service.');
      }
      
      // Handle specific mitra login error responses
      if (error.response?.status === 404) {
        const errorData = error.response.data;
        if (errorData?.errors?.code === 'MITRA_NOT_FOUND') {
          throw new Error('Mitra not registered yet. Please register first.');
        }
        throw new Error(errorData?.message || 'Mitra not found');
      }
      
      if (error.response?.status === 401) {
        const errorData = error.response.data;
        if (errorData?.errors?.code === 'INVALID_CREDENTIALS') {
          throw new Error('Invalid email or password');
        }
        throw new Error(errorData?.message || 'Invalid credentials');
      }
      
      // Handle other HTTP status codes
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        throw new Error(errorData?.message || 'Invalid request data');
      }
      
      if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  const registerAsUser = async (userData: any) => {
    try {
      const response = await apiService.userRegister(userData);
      if (response.success && response.data) {
        const { access_token, refresh_token, user: userInfo } = response.data;
        
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        apiService.setUserType('users');
        setUserType('users');
        
        if (userInfo) {
          setUser(userInfo);
          setMitra(null);
        } else {
          await refreshUser();
        }
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  };

  const registerAsMitra = async (userData: any) => {
    try {
      const response = await apiService.mitraRegister(userData);
      if (response.success && response.data) {
        const { access_token, refresh_token, mitra: mitraInfo } = response.data;
        
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        apiService.setUserType('mitras');
        setUserType('mitras');
        
        if (mitraInfo) {
          setMitra(mitraInfo);
          setUser(null);
        } else {
          await refreshUser();
        }
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  };

  const logout = () => {
    const currentUserType = userType || 'users';
    apiService.logout(currentUserType);
    setUser(null);
    setMitra(null);
    setUserType(null);
    
    // Force a page reload to clear any cached state
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    try {
      let response;
      if (userType === 'users') {
        response = await apiService.getUserProfile();
      } else {
        response = await apiService.getMitraProfile();
      }
      
      if (response.success && response.data) {
        if (userType === 'users') {
          const userData = response.data as any;
          setUser({
            id: userData.user_id || userData.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            phone_number: userData.phone_number,
            avatar_url: userData.avatar_url
          });
        } else {
          const mitraData = response.data as any;
          setMitra({
            id: mitraData.mitra_id || mitraData.id,
            first_name: mitraData.first_name,
            last_name: mitraData.last_name,
            email: mitraData.email,
            phone_number: mitraData.phone_number,
            bank_name: mitraData.bank_name,
            bank_number: mitraData.bank_number
          });
        }
      }
    } catch (error) {
      console.warn('Failed to refresh user profile (endpoint may not be implemented):', error);
      // Don't throw error if profile endpoint isn't available
    }
  };

  const switchUserType = (type: 'users' | 'mitras') => {
    setUserType(type);
    apiService.setUserType(type);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        mitra,
        userType,
        isAuthenticated,
        isLoading,
        loginAsUser,
        loginAsMitra,
        registerAsUser,
        registerAsMitra,
        logout,
        refreshUser,
        switchUserType,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
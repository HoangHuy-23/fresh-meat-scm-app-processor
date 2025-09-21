import axiosClient from './axiosClient';

export const AuthApi = {
  logIn: async (email: string, password: string) => {
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Error while login:', error);
      throw error;
    }
  },
  getUserProfile: async () => {
    try {
      const response = await axiosClient.get('/profile/me');
      return response.data;
    } catch (error) {
      console.error('Error while fetching user profile:', error);
      throw error;
    }
  },
};

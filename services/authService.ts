
import { User } from '../types';
import { AVATAR_COLORS } from '../constants';

const USERS_KEY = 'procureflow_users';

export const authService = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  register: (username: string, password: string): User => {
    const users = authService.getUsers();
    
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('A user with this username already exists.');
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      password, // In a real app, this would be hashed
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    };

    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    return newUser;
  },

  login: (username: string, password: string): User => {
    const users = authService.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    
    if (!user) {
      throw new Error('Invalid username or password.');
    }

    return user;
  }
};

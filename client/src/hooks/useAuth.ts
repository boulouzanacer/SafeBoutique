import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found in localStorage');
        return null;
      }
      
      console.log('Checking auth with token:', token.substring(0, 20) + '...');
      
      const res = await fetch("/api/auth/user", {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include' // Include credentials for CORS
      });
      
      if (res.status === 401) {
        console.log('Token invalid/expired, clearing from localStorage');
        localStorage.removeItem('authToken'); // Clear invalid token
        return null;
      }
      if (!res.ok) {
        console.error('Auth check failed:', res.status, res.statusText);
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      const userData = await res.json();
      console.log('Auth check successful for user:', userData.email, 'isAdmin:', userData.isAdmin);
      return userData;
    },
  });

  // Role-based access helper functions
  const isAdmin = () => user?.role === 'admin' || user?.isAdmin === true;
  const isModerator = () => user?.role === 'moderator';
  const isUser = () => user?.role === 'user' || (!user?.role && user?.isAdmin === false);
  const hasRole = (role: string) => user?.role === role;
  const canAccessAdminPanel = () => isAdmin() || isModerator();
  const canAccessSettings = () => isAdmin(); // Only admins can access settings
  const canAccessUserManager = () => isAdmin(); // Only admins can manage users
  const canAccessAPI = () => isAdmin(); // Only admins can access API tab

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    // Role-based access helpers
    isAdmin,
    isModerator,
    isUser,
    hasRole,
    canAccessAdminPanel,
    canAccessSettings,
    canAccessUserManager,
    canAccessAPI,
  };
}
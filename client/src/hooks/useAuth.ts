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

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
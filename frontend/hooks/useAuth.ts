// hooks/useAuth.ts
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
}

export const useAuth = (redirectTo: string = "/login") => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('jwt_token') || 
                     localStorage.getItem('token') || 
                     localStorage.getItem('authToken');

        if (!token) {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
          });
          router.push(redirectTo);
          return;
        }

        // Validasi format JWT
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
          });
          router.push(redirectTo);
          return;
        }

        // Cek expiration
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp < currentTime) {
            // Token expired
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('token');
            localStorage.removeItem('authToken');
            
            setAuthState({
              isAuthenticated: false,
              isLoading: false,
              user: null,
            });
            router.push(redirectTo);
            return;
          }

          // Token valid
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: payload,
          });

        } catch (decodeError) {
          // Token tidak bisa di-decode
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
          });
          router.push(redirectTo);
        }

      } catch (error) {
        console.error('Error checking authentication:', error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
        router.push(redirectTo);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

  return authState;
};

// Fungsi utility untuk logout
export const logout = () => {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  
  // Hapus cookies jika ada
  document.cookie = 'jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // Redirect ke login
  window.location.href = '/login';
};
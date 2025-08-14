"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthToken = () => {
      try {
        // Fungsi untuk mendapatkan cookie by name
        const getCookie = (name: string): string | null => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
          return null;
        };

        // Cek token dari localStorage dan cookies
        const tokenFromStorage = localStorage.getItem('jwt_token') ||
          localStorage.getItem('token') ||
          localStorage.getItem('authToken');

        const tokenFromCookie = getCookie('jwt_token') ||
          getCookie('token') ||
          getCookie('authToken');

        const token = tokenFromStorage || tokenFromCookie;

        if (!token) {
          router.push('/login');
          return;
        }

        // Validasi JWT format
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          // Hapus token yang tidak valid
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');

          // Hapus cookies juga
          document.cookie = 'jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

          router.push('/login');
          return;
        }

        // Cek expiration
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          const currentTime = Math.floor(Date.now() / 1000);

          if (payload.exp && payload.exp < currentTime) {
            // Token expired - cleanup
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('token');
            localStorage.removeItem('authToken');

            document.cookie = 'jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

            router.push('/login');
            return;
          }
        } catch (decodeError) {
          // Cleanup invalid tokens
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');

          document.cookie = 'jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

          router.push('/login');
          return;
        }

        // Token valid
        router.push('/dashboard');

      } catch (error) {
        console.error('Error checking auth token:', error);
        router.push('/login');
      }
    };

    checkAuthToken();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Mengecek status login...</p>
      </div>
    </div>
  );
}
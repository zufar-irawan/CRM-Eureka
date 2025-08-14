// context/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
    checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const isAuthenticated = !!user;

    const checkAuth = async () => {
        try {
            setIsLoading(true);

            const token = localStorage.getItem('jwt_token') ||
                localStorage.getItem('token') ||
                localStorage.getItem('authToken');

            if (!token) {
                setUser(null);
                setIsLoading(false);
                return;
            }

            // Validasi format JWT
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                logout();
                return;
            }

            // Decode payload
            const payload = JSON.parse(atob(tokenParts[1]));
            const currentTime = Math.floor(Date.now() / 1000);

            if (payload.exp && payload.exp < currentTime) {
                logout();
                return;
            }

            // Set user dari payload token
            setUser({
                id: payload.sub || payload.userId || payload.id,
                email: payload.email,
                name: payload.name || payload.username,
                role: payload.role || 'user',
                ...payload
            });

        } catch (error) {
            console.error('Error checking auth:', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    const login = (token: string) => {
        localStorage.setItem('jwt_token', token);
        checkAuth();
    };

    const logout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');

        document.cookie = 'jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        setUser(null);
        router.push('/login');
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}

// HOC untuk protect page dengan context
export function withAuthContext<P extends object>(
    WrappedComponent: React.ComponentType<P>
) {
    const AuthenticatedComponent = (props: P) => {
        const { isAuthenticated, isLoading, user } = useAuthContext();
        const router = useRouter();

        useEffect(() => {
            if (!isLoading && !isAuthenticated) {
                router.push('/login');
            }
        }, [isAuthenticated, isLoading, router]);

        if (isLoading) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            );
        }

        if (!isAuthenticated) {
            return null;
        }

        return <WrappedComponent {...props} user={user} />;
    };

    AuthenticatedComponent.displayName = `withAuthContext(${WrappedComponent.displayName || WrappedComponent.name})`;

    return AuthenticatedComponent;
}
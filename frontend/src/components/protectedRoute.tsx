"use client";
import { useAuthContext } from '@/context/authContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: string[];
    fallbackPath?: string;
}

export default function ProtectedRoute({
    children,
    requiredRoles = [],
    fallbackPath = '/login'
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push(fallbackPath);
                return;
            }

            // Check roles if required
            if (requiredRoles.length > 0) {
                const userRole = user?.role;
                if (!userRole || !requiredRoles.includes(userRole)) {
                    router.push('/unauthorized');
                    return;
                }
            }
        }
    }, [isAuthenticated, isLoading, user, router, requiredRoles, fallbackPath]);

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

    if (requiredRoles.length > 0) {
        const userRole = user?.role;
        if (!userRole || !requiredRoles.includes(userRole)) {
            return null;
        }
    }

    return <>{children}</>;
}
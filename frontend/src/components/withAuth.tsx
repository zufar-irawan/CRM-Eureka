// components/withAuth.tsx
"use client";
import { useAuth } from "../../hooks/useAuth";
import { ComponentType } from "react";

// Loading component
const AuthLoading = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Mengecek autentikasi...</p>
        </div>
    </div>
);

// HOC untuk protect page
export function withAuth<P extends object>(
    WrappedComponent: ComponentType<P>,
    redirectTo: string = "/login"
) {
    const AuthenticatedComponent = (props: P) => {
        const { isAuthenticated, isLoading, user } = useAuth(redirectTo);

        if (isLoading) {
            return <AuthLoading />;
        }

        if (!isAuthenticated) {
            return null; // atau bisa return loading component
        }

        // Pass user data sebagai prop ke component
        return <WrappedComponent {...props} user={user} />;
    };

    AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

    return AuthenticatedComponent;
}

// HOC khusus untuk admin/role-based access
export function withAuthRole<P extends object>(
    WrappedComponent: ComponentType<P>,
    allowedRoles: string[] = [],
    redirectTo: string = "/login",
    unauthorizedRedirect: string = "/unauthorized"
) {
    const RoleBasedComponent = (props: P) => {
        const { isAuthenticated, isLoading, user } = useAuth(redirectTo);

        if (isLoading) {
            return <AuthLoading />;
        }

        if (!isAuthenticated) {
            return null;
        }

        // Cek role user
        if (allowedRoles.length > 0) {
            const userRole = user?.role || user?.roles || [];
            const hasPermission = Array.isArray(userRole)
                ? userRole.some((role: string) => allowedRoles.includes(role))
                : allowedRoles.includes(userRole);

            if (!hasPermission) {
                // Redirect ke halaman unauthorized atau dashboard
                window.location.href = unauthorizedRedirect;
                return null;
            }
        }

        return <WrappedComponent {...props} user={user} />;
    };

    RoleBasedComponent.displayName = `withAuthRole(${WrappedComponent.displayName || WrappedComponent.name})`;

    return RoleBasedComponent;
}
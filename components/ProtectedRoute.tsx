import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { User } from 'firebase/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [user, setUser] = useState<User | null | undefined>(undefined);

    useEffect(() => {
        console.log("[ProtectedRoute] Mounting, waiting for auth...");
        const unsubscribe = authService.onAuthChange((currentUser) => {
            console.log(`[ProtectedRoute] User resolved: ${currentUser?.email ?? 'null'}`);
            setUser(currentUser);
        });
        return () => {
            console.log("[ProtectedRoute] Unmounting/Cleaning up subscription");
            unsubscribe();
        };
    }, []);

    if (user === undefined) {
        console.log("[ProtectedRoute] Rendering Loading state...");
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>; // Or a spinner
    }

    if (user === null) {
        console.log("[ProtectedRoute] User is null, redirecting to /admin");
        return <Navigate to="/admin" replace />;
    }

    console.log("[ProtectedRoute] Access granted, rendering child component");
    return <>{children}</>;
};

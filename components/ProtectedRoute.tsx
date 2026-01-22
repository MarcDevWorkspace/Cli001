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
        const unsubscribe = authService.onAuthChange((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    if (user === undefined) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>; // Or a spinner
    }

    if (user === null) {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
};

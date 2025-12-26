/**
 * Super Admin Guard Component
 * HOC that protects routes from unauthorized access
 * Only allows super admins to view protected content
 */

import React, { useEffect, useState, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { isSuperAdmin, logAdminAction } from './superAdmin';

// ==========================================
// TYPES
// ==========================================

interface SuperAdminGuardProps {
  children: ReactNode;
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

// ==========================================
// ACCESS DENIED COMPONENT
// ==========================================

const AccessDenied: React.FC = () => (
  <div className="min-h-screen bg-carbon-900 flex items-center justify-center">
    <div className="text-center max-w-md p-8">
      <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">Access Denied</h1>
      <p className="text-gray-400 mb-6">
        You don't have permission to access this area. This section is restricted to platform administrators only.
      </p>
      <a 
        href="/" 
        className="inline-block bg-locale-blue hover:bg-locale-darkBlue text-white font-bold px-6 py-3 rounded-xl transition-colors"
      >
        Return Home
      </a>
    </div>
  </div>
);

// ==========================================
// LOADING COMPONENT
// ==========================================

const AdminLoading: React.FC = () => (
  <div className="min-h-screen bg-carbon-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-locale-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-400">Verifying admin access...</p>
    </div>
  </div>
);

// ==========================================
// SUPER ADMIN GUARD HOC
// ==========================================

export const SuperAdminGuard: React.FC<SuperAdminGuardProps> = ({
  children,
  fallbackPath = '/',
  showAccessDenied = true,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAdmin: false,
  });
  const location = useLocation();

  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthState({ user: null, loading: false, isAdmin: false });
        return;
      }
      
      // Check super admin status
      const isAdmin = await isSuperAdmin(user);
      
      // Log the access attempt
      if (isAdmin) {
        logAdminAction(user, 'page_access', { path: location.pathname });
      }
      
      setAuthState({ user, loading: false, isAdmin });
    });

    return () => unsubscribe();
  }, [location.pathname]);

  // Still loading
  if (authState.loading) {
    return <AdminLoading />;
  }

  // Not logged in - redirect to login
  if (!authState.user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Logged in but not admin
  if (!authState.isAdmin) {
    if (showAccessDenied) {
      return <AccessDenied />;
    }
    return <Navigate to={fallbackPath} replace />;
  }

  // User is a super admin - render children
  return <>{children}</>;
};

// ==========================================
// HOOK FOR CHECKING ADMIN STATUS
// ==========================================

export const useSuperAdmin = () => {
  const [state, setState] = useState<{
    isAdmin: boolean;
    loading: boolean;
    user: User | null;
  }>({
    isAdmin: false,
    loading: true,
    user: null,
  });

  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ isAdmin: false, loading: false, user: null });
        return;
      }
      
      const isAdmin = await isSuperAdmin(user);
      setState({ isAdmin, loading: false, user });
    });

    return () => unsubscribe();
  }, []);

  return state;
};

// ==========================================
// CONDITIONAL RENDER FOR ADMIN-ONLY UI
// ==========================================

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const AdminOnly: React.FC<AdminOnlyProps> = ({ children, fallback = null }) => {
  const { isAdmin, loading } = useSuperAdmin();

  if (loading) return null;
  if (!isAdmin) return <>{fallback}</>;
  
  return <>{children}</>;
};

export default SuperAdminGuard;

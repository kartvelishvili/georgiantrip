
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSession = useCallback(async (session) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        handleSession(session);
      } catch (error) {
        console.error('Error getting session:', error);
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // console.log('Auth state change:', event, session?.user?.email);
        handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      let title = 'Sign up Failed';
      let description = error.message || 'Something went wrong';
      
      if (error.message?.includes('already registered') || error.message?.includes('23505')) {
        description = 'This email is already registered. Try signing in instead.';
      } else if (error.message?.includes('Password')) {
        title = 'Weak Password';
        description = error.message;
      }
      
      toast({
        variant: 'destructive',
        title,
        description,
      });
    }

    return { data, error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let title = 'Login Failed';
      let description = error.message || 'Something went wrong';
      
      // User-friendly messages
      if (error.message?.includes('Invalid login credentials')) {
        description = 'Incorrect email or password. Please try again.';
      } else if (error.message?.includes('Email not confirmed')) {
        description = 'Please verify your email address first.';
      } else if (error.message?.includes('Too many requests')) {
        title = 'Too Many Attempts';
        description = 'Please wait a moment and try again.';
      }
      
      toast({
        variant: 'destructive',
        title,
        description,
      });
    }

    return { data, error };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out Failed",
        description: error.message || "Something went wrong",
      });
    }
    
    // Clear state immediately for UI responsiveness
    setUser(null);
    setSession(null);
    
    return { error };
  }, [toast]);

  // Check if user has admin or super_admin role
  const checkAdminRole = useCallback(() => {
    const role = user?.user_metadata?.role;
    return role === 'admin' || role === 'super_admin';
  }, [user]);

  // Check specifically for super_admin
  const isSuperAdmin = useCallback(() => {
    return user?.user_metadata?.role === 'super_admin';
  }, [user]);

  // Derived boolean flag for easy access
  const isAdmin = useMemo(() => {
    const role = user?.user_metadata?.role;
    return role === 'admin' || role === 'super_admin';
  }, [user]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    checkAdminRole,
    isSuperAdmin,
    isAdmin, // Exposed flag
  }), [user, session, loading, signUp, signIn, signOut, checkAdminRole, isSuperAdmin, isAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

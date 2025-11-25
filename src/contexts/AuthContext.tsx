import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('[AuthContext] Fetching profile for user:', userId);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );

      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.error('[AuthContext] Error fetching profile:', error);
        console.error('[AuthContext] Error code:', error.code);
        console.error('[AuthContext] Error message:', error.message);
        
        // If profile doesn't exist, try to get user email and create one
        if (error.code === 'PGRST116') {
          console.log('[AuthContext] Profile not found, attempting to create one');
          try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser?.email) {
              const isAdmin = authUser.email.toLowerCase() === 'warrenokumu98@gmail.com';
              console.log('[AuthContext] Creating profile with role:', isAdmin ? 'admin' : 'user');
              
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  user_id: userId,
                  email: authUser.email,
                  role: isAdmin ? 'admin' : 'user',
                })
                .select()
                .single();
              
              if (createError) {
                console.error('[AuthContext] Failed to create profile:', createError);
                console.error('[AuthContext] This might be an RLS policy issue');
                // Still set profile to null but continue - user can still access dashboard
                setProfile(null);
              } else {
                console.log('[AuthContext] Profile created successfully:', newProfile);
                setProfile(newProfile);
              }
            } else {
              setProfile(null);
            }
          } catch (createErr) {
            console.error('[AuthContext] Error creating profile:', createErr);
            setProfile(null);
          }
        } else {
          // For other errors, still set profile to null but don't block
          console.warn('[AuthContext] Profile fetch failed, continuing without profile');
          setProfile(null);
        }
      } else {
        console.log('[AuthContext] Profile fetched successfully:', {
          email: data.email,
          role: data.role,
        });
        setProfile(data);
      }
    } catch (error: any) {
      console.error('[AuthContext] Unexpected error fetching profile:', error);
      // Even on error, set profile to null and continue
      setProfile(null);
    } finally {
      // Always set loading to false, even if there were errors
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('[AuthContext] Attempting sign in with email:', email);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('[AuthContext] Sign in error:', error.message);
        setLoading(false);
        throw error;
      }

      if (data.user) {
        console.log('[AuthContext] Sign in successful, fetching profile...');
        // Fetch profile, but set a timeout to ensure we don't hang forever
        const profileTimeout = setTimeout(() => {
          console.warn('[AuthContext] Profile fetch taking too long, setting loading to false');
          setLoading(false);
        }, 5000);
        
        try {
          await fetchProfile(data.user.id);
          clearTimeout(profileTimeout);
        } catch (profileError) {
          clearTimeout(profileTimeout);
          console.warn('[AuthContext] Profile fetch error, continuing anyway:', profileError);
          setLoading(false);
          setProfile(null);
        }
      } else {
        console.warn('[AuthContext] Sign in succeeded but no user data');
        setLoading(false);
      }
    } catch (error) {
      console.error('[AuthContext] Unexpected error during sign in:', error);
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log('[AuthContext] Attempting sign up with email:', email);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('[AuthContext] Sign up error:', error.message);
        setLoading(false);
        throw error;
      }

      if (data.user) {
        console.log('[AuthContext] User created, ID:', data.user.id);
        
        // The database trigger should automatically create the profile
        // But we'll update it with full_name if provided
        // Wait a moment for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (fullName) {
          const isAdmin = email.toLowerCase() === 'warrenokumu98@gmail.com';
          const { error: upsertError } = await supabase.from('profiles').upsert(
            {
              user_id: data.user.id,
              email: email.trim().toLowerCase(),
              full_name: fullName,
              role: isAdmin ? 'admin' : 'user',
            },
            { onConflict: 'user_id' },
          );

          if (upsertError) {
            console.error('[AuthContext] Error upserting profile:', upsertError);
            // Don't throw - the trigger might have already created it
          } else {
            console.log('[AuthContext] Profile upserted successfully');
          }
        }
        
        // Fetch the profile to ensure we have the latest data
        await fetchProfile(data.user.id);
      } else {
        console.log('[AuthContext] Sign up successful but no user data (email confirmation may be required)');
        setLoading(false);
      }
    } catch (error) {
      console.error('[AuthContext] Unexpected error during sign up:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: profile?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


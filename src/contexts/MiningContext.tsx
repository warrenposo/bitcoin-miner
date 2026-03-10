import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'btc_mining_session';
const SIMULATED_DAY_SECONDS = 300;
const TICK_MS = 500;

interface MiningSessionState {
  sessionStartTime: number;
  sessionTarget: number;
  sessionId: string;
  userId: string;
  stopBalance: number | null;
  balanceAtStart: number;
}

interface MiningContextValue {
  isSessionActive: boolean;
  sessionStartTime: number | null;
  sessionTarget: number;
  sessionId: string | null;
  getCurrentMined: () => number;
  startSession: (state: MiningSessionState) => void;
  clearSession: () => void;
  SIMULATED_DAY_SECONDS: number;
}

const MiningContext = createContext<MiningContextValue | null>(null);

function loadStoredSession(): MiningSessionState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.sessionStartTime && data?.sessionTarget != null && data?.sessionId && data?.userId) return data as MiningSessionState;
  } catch (_) {}
  return null;
}

function saveSession(state: MiningSessionState | null) {
  if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  else localStorage.removeItem(STORAGE_KEY);
}

export function MiningProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<MiningSessionState | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    setSession(null);
    saveSession(null);
  }, []);

  const startSession = useCallback((state: MiningSessionState) => {
    if (state.balanceAtStart <= 0 || state.sessionTarget <= 0) return;
    setSession(state);
    saveSession(state);
  }, []);

  const getCurrentMined = useCallback(() => {
    if (!session) return 0;
    const elapsedSec = (Date.now() - session.sessionStartTime) / 1000;
    const expected = (elapsedSec / SIMULATED_DAY_SECONDS) * session.sessionTarget;
    return Math.min(session.sessionTarget, Math.round(expected * 100) / 100);
  }, [session]);

  // Restore session from localStorage when user is available (e.g. after refresh)
  useEffect(() => {
    const stored = loadStoredSession();
    if (!stored) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.id === stored.userId) {
        setSession(stored);
        setCurrentUserId(stored.userId);
      } else {
        saveSession(null);
      }
    });
  }, []);

  // Keep current user in sync for session ownership; clear session when user logs out
  useEffect(() => {
    supabase.auth.onAuthStateChange((_e, { user }) => {
      setCurrentUserId(user?.id ?? null);
      const stored = loadStoredSession();
      if (!user) {
        saveSession(null);
        setSession(null);
      } else if (stored && user.id !== stored.userId) {
        saveSession(null);
        setSession(null);
      }
    });
  }, []);

  // Background timer: runs even when user is off the mining page
  useEffect(() => {
    if (!session || session.userId !== currentUserId) return;

    const intervalId = setInterval(() => {
      const elapsedSec = (Date.now() - session.sessionStartTime) / 1000;
      const currentMined = Math.min(
        session.sessionTarget,
        Math.round((elapsedSec / SIMULATED_DAY_SECONDS) * session.sessionTarget * 100) / 100
      );

      if (session.stopBalance != null && session.stopBalance > 0 && session.balanceAtStart + currentMined >= session.stopBalance) {
        clearInterval(intervalId);
        const sid = session.sessionId;
        const stopVal = session.stopBalance;
        clearSession();
        supabase
          .from('mining_sessions')
          .update({
            amount_mined: currentMined,
            ended_at: new Date().toISOString(),
            status: 'stopped',
            updated_at: new Date().toISOString(),
          })
          .eq('id', sid)
          .then(() => {});
        toast({ title: 'Mining stopped', description: `Reached stop balance (${stopVal} USD). Session recorded; no credit this time.` });
        return;
      }

      if (elapsedSec >= SIMULATED_DAY_SECONDS) {
        clearInterval(intervalId);
        const credit = Math.round(session.sessionTarget * 100) / 100;
        const uid = session.userId;
        const sid = session.sessionId;
        clearSession();
        (async () => {
          try {
            const { data: existing } = await supabase
              .from('mining_stats')
              .select('total_mined, available_balance')
              .eq('user_id', uid)
              .maybeSingle();
            const currentTotal = Number(existing?.total_mined ?? 0);
            const currentAvail = Number(existing?.available_balance ?? 0);
            const { error: updateError } = await supabase
              .from('mining_stats')
              .update({
                total_mined: currentTotal + credit,
                available_balance: currentAvail + credit,
                last_updated: new Date().toISOString(),
              })
              .eq('user_id', uid);
            if (updateError) throw updateError;
            await supabase
              .from('mining_sessions')
              .update({
                amount_mined: credit,
                ended_at: new Date().toISOString(),
                status: 'completed',
                updated_at: new Date().toISOString(),
              })
              .eq('id', sid);
            toast({ title: 'Mining day complete', description: `+${credit.toFixed(2)} USD (20%) added to your balance.` });
          } catch (e: any) {
            toast({ title: 'Error', description: e?.message || 'Failed to credit balance', variant: 'destructive' });
          }
        })();
      }
    }, TICK_MS);

    return () => clearInterval(intervalId);
  }, [session?.sessionStartTime, session?.sessionTarget, session?.sessionId, session?.userId, session?.stopBalance, session?.balanceAtStart, currentUserId, clearSession]);

  const value: MiningContextValue = {
    isSessionActive: !!session && session.userId === currentUserId,
    sessionStartTime: session?.sessionStartTime ?? null,
    sessionTarget: session?.sessionTarget ?? 0,
    sessionId: session?.sessionId ?? null,
    getCurrentMined,
    startSession,
    clearSession,
    SIMULATED_DAY_SECONDS,
  };

  return <MiningContext.Provider value={value}>{children}</MiningContext.Provider>;
}

export function useMining() {
  const ctx = useContext(MiningContext);
  if (!ctx) throw new Error('useMining must be used within MiningProvider');
  return ctx;
}

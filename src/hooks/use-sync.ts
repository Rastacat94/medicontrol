'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMedicationStore } from '@/store/medication-store';
import { useAuthStore } from '@/store/auth-store';
import {
  fullSync,
  canSync,
  isAuthenticatedWithSupabase,
  processPendingChanges,
  getPendingChanges,
  type SyncStatus,
} from '@/lib/sync-service';

// Helper function to get initial state from localStorage
function getInitialLastSyncAt(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('medicontrol-last-sync');
}

function getInitialPendingChanges(): number {
  if (typeof window === 'undefined') return 0;
  return getPendingChanges().length;
}

interface UseSyncResult {
  status: SyncStatus;
  lastSyncAt: string | null;
  error: string | null;
  pendingChanges: number;
  sync: () => Promise<void>;
  processPending: () => Promise<void>;
}

export function useSync(): UseSyncResult {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(getInitialLastSyncAt);
  const [error, setError] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState(getInitialPendingChanges);
  
  const { isAuthenticated } = useAuthStore();
  const { 
    setMedications, 
    setDoseRecords, 
    setProfile,
    setCaregivers 
  } = useMedicationStore();
  
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  // Update pending changes count
  const updatePendingCount = useCallback(() => {
    const pending = getPendingChanges();
    setPendingChanges(pending.length);
  }, []);

  // Perform full sync
  const sync = useCallback(async () => {
    if (status === 'syncing') return;

    setStatus('syncing');
    setError(null);

    try {
      const canPerformSync = await canSync();
      if (!canPerformSync) {
        setStatus('offline');
        return;
      }

      const authed = await isAuthenticatedWithSupabase();
      if (!authed) {
        setStatus('idle');
        return;
      }

      const result = await fullSync();

      if (!result.success) {
        setError(result.error || 'Sync failed');
        setStatus('error');
        return;
      }

      // Update store with synced data
      if (result.medications) {
        setMedications(result.medications);
      }
      if (result.doseRecords) {
        setDoseRecords(result.doseRecords);
      }
      if (result.profile) {
        setProfile(result.profile);
      }

      // Update sync state
      const now = new Date().toISOString();
      setLastSyncAt(now);
      localStorage.setItem('medicontrol-last-sync', now);
      
      updatePendingCount();
      setStatus('idle');
    } catch (err) {
      console.error('Sync error:', err);
      setError('Failed to sync');
      setStatus('error');
    }
  }, [status, setMedications, setDoseRecords, setProfile, setCaregivers, updatePendingCount]);

  // Process pending changes (for offline sync)
  const processPending = useCallback(async () => {
    if (status === 'syncing') return;

    setStatus('syncing');
    setError(null);

    try {
      const result = await processPendingChanges();
      
      if (!result.success) {
        setError('Some changes failed to sync');
      }
      
      updatePendingCount();
      
      // After processing pending changes, do a full sync
      await sync();
    } catch (err) {
      console.error('Process pending error:', err);
      setError('Failed to process pending changes');
      setStatus('error');
    }
  }, [status, sync, updatePendingCount]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = async () => {
      console.log('Back online, processing pending changes...');
      await processPending();
    };

    const handleOffline = () => {
      console.log('Gone offline');
      setStatus('offline');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [processPending, updatePendingCount]);

  // Periodic sync when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial sync on mount
    const initialSync = async () => {
      const authed = await isAuthenticatedWithSupabase();
      if (authed && isMounted.current) {
        await sync();
      }
    };

    initialSync();

    // Set up periodic sync (every 5 minutes)
    syncIntervalRef.current = setInterval(async () => {
      const authed = await isAuthenticatedWithSupabase();
      if (authed && isMounted.current) {
        await sync();
      }
    }, 5 * 60 * 1000);

    return () => {
      isMounted.current = false;
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isAuthenticated, sync]);

  return {
    status,
    lastSyncAt,
    error,
    pendingChanges,
    sync,
    processPending,
  };
}

// Hook for manual sync trigger
export function useSyncTrigger() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerSync = useCallback(async () => {
    setIsSyncing(true);
    setError(null);

    try {
      const authed = await isAuthenticatedWithSupabase();
      if (!authed) {
        setError('Not authenticated with cloud');
        return false;
      }

      const result = await fullSync();
      
      if (!result.success) {
        setError(result.error || 'Sync failed');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Sync error:', err);
      setError('Failed to sync');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return {
    isSyncing,
    error,
    triggerSync,
  };
}

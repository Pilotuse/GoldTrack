import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

export type ApiMethod = 'GET' | 'POST' | 'WS';

type SettingsContextValue = {
  apiBaseUrl: string;
  commentApiUrl: string;
  apiMethod: ApiMethod;
  commentApiMethod: ApiMethod;
  apiIntervalMs: number;
  fundsEncrypted: boolean;
  faceUnlockEnabled: boolean;
  locked: boolean;
  updateApiBaseUrl: (url: string) => void;
  updateCommentApiUrl: (url: string) => void;
  updateApiMethod: (method: ApiMethod) => void;
  updateCommentApiMethod: (method: ApiMethod) => void;
  updateApiInterval: (ms: number) => void;
  updateFundsEncrypted: (on: boolean) => void;
  updateFaceUnlock: (on: boolean) => void;
  unlockByFace: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [commentApiUrl, setCommentApiUrl] = useState('');
  const [apiMethod, setApiMethod] = useState<ApiMethod>('GET');
  const [commentApiMethod, setCommentApiMethod] = useState<ApiMethod>('GET');
  const [apiIntervalMs, setApiIntervalMs] = useState(1000);
  const [fundsEncrypted, setFundsEncrypted] = useState(true);
  const [faceUnlockEnabled, setFaceUnlockEnabled] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!faceUnlockEnabled) {
      setLocked(false);
      return;
    }

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') setLocked(true);
    });
    return () => sub.remove();
  }, [faceUnlockEnabled]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      apiBaseUrl,
      commentApiUrl,
      apiMethod,
      commentApiMethod,
      apiIntervalMs,
      fundsEncrypted,
      faceUnlockEnabled,
      locked,
      updateApiBaseUrl: (url) => setApiBaseUrl(url.trim()),
      updateCommentApiUrl: (url) => setCommentApiUrl(url.trim()),
      updateApiMethod: (method) => setApiMethod(method),
      updateCommentApiMethod: (method) => setCommentApiMethod(method),
      updateApiInterval: (ms) => setApiIntervalMs(Math.max(1, Math.round(ms))),
      updateFundsEncrypted: (on) => setFundsEncrypted(on),
      updateFaceUnlock: (on) => {
        setFaceUnlockEnabled(on);
        if (!on) setLocked(false);
      },
      unlockByFace: () => setLocked(false),
    }),
    [
      apiBaseUrl,
      commentApiUrl,
      apiMethod,
      commentApiMethod,
      apiIntervalMs,
      fundsEncrypted,
      faceUnlockEnabled,
      locked,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('SettingsProvider missing');
  }
  return context;
}

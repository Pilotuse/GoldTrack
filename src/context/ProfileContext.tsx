import { profile as initialProfile, type Profile, type ProfileField } from '@/mock/profile';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type ProfileContextValue = {
  profile: Profile;
  updateProfile: (field: ProfileField, value: string) => void;
  updateAvatar: (uri: string | null) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState(initialProfile);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      updateProfile: (field, next) => {
        setProfile((current) => ({ ...current, [field]: next }));
      },
      updateAvatar: (uri) => {
        setProfile((current) => ({ ...current, avatarUri: uri }));
      },
    }),
    [profile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('ProfileProvider missing');
  }
  return context;
}

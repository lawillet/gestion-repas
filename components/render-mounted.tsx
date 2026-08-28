'use client';

import { useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export const RenderMounted = ({ children }: { children: ReactNode }) => {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (!mounted) return null;

  return <>{children}</>;
};

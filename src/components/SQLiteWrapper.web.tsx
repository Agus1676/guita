import React, { useEffect } from 'react';
import { initDatabase } from '@/db/database';

export default function SQLiteWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initDatabase();
  }, []);

  return <>{children}</>;
}

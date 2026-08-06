import React from 'react';
import { SQLiteProvider } from 'expo-sqlite';
import { initDatabase } from '@/db/database';

export default function SQLiteWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SQLiteProvider databaseName="guita.db" onInit={initDatabase}>
      {children}
    </SQLiteProvider>
  );
}

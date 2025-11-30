
'use client';

import { useState, useEffect, useDebugValue } from 'react';
import { Database, ref, onValue, off, Query } from 'firebase/database';
import { useDatabase } from '@/firebase';

export function useDatabaseObject<T>(path: string | null): { data: T | null, isLoading: boolean } {
  const db = useDatabase();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db || !path) {
      setIsLoading(false);
      return;
    }

    const dataRef = ref(db, path);
    const listener = onValue(dataRef, (snapshot) => {
      setData(snapshot.val());
      setIsLoading(false);
    });

    return () => off(dataRef, 'value', listener);
  }, [db, path]);

  return { data, isLoading };
}

export function useDatabaseObjectList<T>(dbQuery: Query | null): { data: Record<string, T> | null, isLoading: boolean } {
  const [data, setData] = useState<Record<string, T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const queryPath = dbQuery ? dbQuery.toString() : null;
  useDebugValue(queryPath);

  useEffect(() => {
    if (!dbQuery) {
      setData(null);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    const listener = onValue(dbQuery, (snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.val());
      } else {
        setData(null);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Firebase Realtime Database Error:", error);
      setData(null);
      setIsLoading(false);
    });

    return () => off(dbQuery, 'value', listener);
  }, [queryPath]); // Use the string representation of the query as a dependency

  return { data, isLoading };
}

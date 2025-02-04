'use client';

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SoundwaveDB extends DBSchema {
  playlists: {
    key: string;
    value: {
      id: string;
      name: string;
      createdAt: number;
      tracks: string[];
    };
    indexes: { 'by-date': number };
  };
  tracks: {
    key: string;
    value: {
      id: string;
      name: string;
      artist?: string;
      duration: number;
      url: string;
      blob?: Blob;
      createdAt: number;
    };
    indexes: { 'by-date': number };
  };
}

let dbPromise: Promise<IDBPDatabase<SoundwaveDB>>;

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<SoundwaveDB>('soundwave-db', 1, {
      upgrade(db) {
        const playlistStore = db.createObjectStore('playlists', {
          keyPath: 'id',
        });
        playlistStore.createIndex('by-date', 'createdAt');

        const trackStore = db.createObjectStore('tracks', {
          keyPath: 'id',
        });
        trackStore.createIndex('by-date', 'createdAt');
      },
    });
  }
  return dbPromise;
};

export const getDB = async () => {
  return await initDB();
};

export const getAllTracks = async () => {
  const db = await getDB();
  return await db.getAll('tracks');
};

export const getAllPlaylists = async () => {
  const db = await getDB();
  return await db.getAll('playlists');
};
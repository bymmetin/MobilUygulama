import * as SQLite from 'expo-sqlite';

let db;

export const getDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('mnemo.db');
  }
  return db;
};

export const initDB = async () => {
  const db = await getDB();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      xp INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      last_login TEXT
    );

    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      order_num INTEGER
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      order_num INTEGER,
      FOREIGN KEY (topic_id) REFERENCES topics(id)
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      option_a TEXT,
      option_b TEXT,
      option_c TEXT,
      option_d TEXT,
      correct_answer TEXT NOT NULL,
      image_url TEXT,
      audio_url TEXT,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
      score INTEGER DEFAULT 0,
      correct_count INTEGER DEFAULT 0,
      total_count INTEGER DEFAULT 0,
      earned_xp INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    );
  `);

  // Mevcut DB'lere yeni kolonları ekle (hata fırlatırsa zaten var demektir)
  try { await db.execAsync('ALTER TABLE questions ADD COLUMN image_url TEXT'); } catch (_) {}
  try { await db.execAsync('ALTER TABLE questions ADD COLUMN audio_url TEXT'); } catch (_) {}
  try { await db.execAsync('ALTER TABLE user_progress ADD COLUMN correct_count INTEGER DEFAULT 0'); } catch (_) {}
  try { await db.execAsync('ALTER TABLE user_progress ADD COLUMN total_count INTEGER DEFAULT 0'); } catch (_) {}
  try { await db.execAsync('ALTER TABLE user_progress ADD COLUMN earned_xp INTEGER DEFAULT 0'); } catch (_) {}

  // Sadece Supabase'den senkronize edilen cache tablolarını temizle.
  // user_progress KULLANICI VERİSİ — silinmemeli!
  await db.execAsync(`
    DELETE FROM questions;
    DELETE FROM lessons;
    DELETE FROM topics;
  `);

  console.log('Veritabanı hazır');
};
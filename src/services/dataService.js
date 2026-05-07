import { supabase } from '../config/supabase';
import { getDB } from '../db/database';

// ─── Cache yardımcıları ──────────────────────────────────────────────────────

const cacheTopics = async (db, topics) => {
  for (const t of topics) {
    await db.runAsync(
      'INSERT OR REPLACE INTO topics (id, title, description, order_num) VALUES (?, ?, ?, ?)',
      [t.id, t.title, t.description, t.order_num]
    );
  }
};

const cacheLessons = async (db, lessons) => {
  for (const l of lessons) {
    await db.runAsync(
      'INSERT OR REPLACE INTO lessons (id, topic_id, title, order_num) VALUES (?, ?, ?, ?)',
      [l.id, l.topic_id, l.title, l.order_num]
    );
  }
};

const cacheQuestions = async (db, questions) => {
  for (const q of questions) {
    await db.runAsync(
      `INSERT OR REPLACE INTO questions
        (id, lesson_id, question_text, question_type, option_a, option_b, option_c, option_d,
         correct_answer, image_url, audio_url, extra_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [q.id, q.lesson_id, q.question_text, q.question_type ?? 'multiple_choice',
       q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer,
       q.image_url ?? null, q.audio_url ?? null, q.extra_data ?? null]
    );
  }
};

// ─── Public API ──────────────────────────────────────────────────────────────

export const getTopics = async () => {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('order_num');
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('empty');
    const db = await getDB();
    await cacheTopics(db, data);
    return data;
  } catch (e) {
    console.warn('[Supabase] getTopics hata, SQLite cache kullanılıyor:', e.message);
    const db = await getDB();
    return db.getAllAsync('SELECT * FROM topics ORDER BY order_num');
  }
};

export const getLessonsByTopic = async (topicId) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('topic_id', topicId)
      .order('order_num');
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('empty');
    const db = await getDB();
    await cacheLessons(db, data);
    return data;
  } catch (e) {
    console.warn('[Supabase] getLessonsByTopic hata, SQLite cache kullanılıyor:', e.message);
    const db = await getDB();
    return db.getAllAsync(
      'SELECT * FROM lessons WHERE topic_id = ? ORDER BY order_num',
      [topicId]
    );
  }
};

export const getQuestionsByLesson = async (lessonId) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('lesson_id', lessonId);
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('empty');
    getDB().then(db => cacheQuestions(db, data)).catch(e =>
      console.warn('[SQLite] cacheQuestions hata:', e.message)
    );
    return data;
  } catch (e) {
    console.warn('[Supabase] getQuestionsByLesson hata:', e.message);
    const db = await getDB();
    return db.getAllAsync('SELECT * FROM questions WHERE lesson_id = ?', [lessonId]);
  }
};

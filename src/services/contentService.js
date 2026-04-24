import { getDB } from '../db/database';

// Veri katmanı — şu an SQLite, ileride API endpoint'e taşınabilir.
// Ekranlar bu servisi kullanır, kaynağı bilmez.

export const getTopics = async () => {
  const db = await getDB();
  return db.getAllAsync('SELECT * FROM topics ORDER BY order_num');
};

export const getLessonsByTopic = async (topicId) => {
  const db = await getDB();
  return db.getAllAsync(
    'SELECT * FROM lessons WHERE topic_id = ? ORDER BY order_num',
    [topicId]
  );
};

export const getQuestionsByLesson = async (lessonId) => {
  const db = await getDB();
  return db.getAllAsync(
    'SELECT * FROM questions WHERE lesson_id = ?',
    [lessonId]
  );
};

export const saveProgress = async (userId, lessonId, score) => {
  const db = await getDB();
  const existing = await db.getFirstAsync(
    'SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?',
    [userId, lessonId]
  );
  if (existing) {
    await db.runAsync(
      'UPDATE user_progress SET completed = 1, score = ? WHERE user_id = ? AND lesson_id = ?',
      [score, userId, lessonId]
    );
  } else {
    await db.runAsync(
      'INSERT INTO user_progress (user_id, lesson_id, completed, score) VALUES (?, ?, 1, ?)',
      [userId, lessonId, score]
    );
  }
};

export const getUserProgress = async (userId) => {
  const db = await getDB();
  return db.getAllAsync(
    'SELECT * FROM user_progress WHERE user_id = ?',
    [userId]
  );
};

export const addXP = async (userId, amount) => {
  const db = await getDB();
  await db.runAsync(
    'UPDATE users SET xp = xp + ? WHERE id = ?',
    [amount, userId]
  );
  return db.getFirstAsync('SELECT xp, streak FROM users WHERE id = ?', [userId]);
};

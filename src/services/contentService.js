import { supabase } from '../config/supabase';

// Kullanıcı ilerlemesi ve XP/streak artık Supabase'de (profiles + user_progress).
// İçerik (topics/lessons/questions) dataService.js üzerinden gelir.

export const saveProgress = async (
  userId, lessonId, score,
  correctCount = 0, totalCount = 0, earnedXP = 0, wrongQuestionIds = []
) => {
  const wrongJson = JSON.stringify(wrongQuestionIds);

  const { data: existing } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (existing) {
    // Skor sadece yükselebilir — tekrar oynayıp düşük skor alınca aşama kilitlenmesin
    if (score > (existing.score ?? 0)) {
      await supabase.from('user_progress').update({
        completed: 1,
        score,
        correct_count: correctCount,
        total_count: totalCount,
        earned_xp: (existing.earned_xp ?? 0) + earnedXP,
        wrong_question_ids: wrongJson,
      }).eq('user_id', userId).eq('lesson_id', lessonId);
    } else {
      // Skor daha düşük/eşit → en iyi skoru koru, sadece yanlış soruları güncelle
      await supabase.from('user_progress').update({
        earned_xp: (existing.earned_xp ?? 0) + earnedXP,
        wrong_question_ids: wrongJson,
      }).eq('user_id', userId).eq('lesson_id', lessonId);
    }
  } else {
    await supabase.from('user_progress').insert({
      user_id: userId,
      lesson_id: lessonId,
      completed: 1,
      score,
      correct_count: correctCount,
      total_count: totalCount,
      earned_xp: earnedXP,
      wrong_question_ids: wrongJson,
    });
  }
};

export const getUserProgress = async (userId) => {
  const { data } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);
  return data ?? [];
};

export const deleteProgress = async (userId, lessonId) => {
  await supabase
    .from('user_progress')
    .delete()
    .eq('user_id', userId)
    .eq('lesson_id', lessonId);
};

export const addXP = async (userId, amount) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, streak')
    .eq('id', userId)
    .maybeSingle();

  const newXp = (profile?.xp ?? 0) + amount;
  await supabase.from('profiles').update({ xp: newXp }).eq('id', userId);
  return { xp: newXp, streak: profile?.streak ?? 0 };
};

// Günlük streak yönetimi
export const updateStreak = async (userId) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('streak, last_login')
    .eq('id', userId)
    .maybeSingle();
  if (!profile) return;

  const today     = new Date().toISOString().slice(0, 10);
  const lastLogin = profile.last_login ? profile.last_login.slice(0, 10) : null;

  if (lastLogin === today) return; // Bugün zaten oynandı

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const newStreak = lastLogin === yesterday ? (profile.streak ?? 0) + 1 : 1;

  await supabase
    .from('profiles')
    .update({ streak: newStreak, last_login: today })
    .eq('id', userId);
};

// TEST MODU: Kullanıcının ilerlemesini ve XP/streak'ini sıfırlar (hesap korunur).
// App.js her açılışta çağırır. Üretime geçerken kaldırılacak.
export const resetUserDataForTest = async (userId) => {
  await supabase.from('user_progress').delete().eq('user_id', userId);
  await supabase
    .from('profiles')
    .update({ xp: 0, streak: 0, last_login: null })
    .eq('id', userId);
};

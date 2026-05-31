import { supabase } from '../config/supabase';

let setGlobalUser = null;
export const setUserSetter = (fn) => { setGlobalUser = fn; };

// Supabase auth user + profiles satırını tek bir kullanıcı objesine birleştirir.
// Ekranlar bu objeyi kullanır: { id, email, username, xp, streak, last_login }
const buildUser = (authUser, profile) => ({
  id:         authUser.id,
  email:      authUser.email,
  username:   profile?.username ?? authUser.email?.split('@')[0] ?? 'kullanıcı',
  xp:         profile?.xp ?? 0,
  streak:     profile?.streak ?? 0,
  last_login: profile?.last_login ?? null,
});

const fetchProfile = async (userId) => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return data;
};

// İngilizce Supabase hatalarını Türkçeye çevirir
const cevirHata = (msg = '') => {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Email veya şifre hatalı';
  if (m.includes('user already registered'))   return 'Bu email zaten kayıtlı';
  if (m.includes('password should be'))         return 'Şifre en az 6 karakter olmalı';
  if (m.includes('unable to validate email'))   return 'Geçerli bir email gir';
  if (m.includes('email not confirmed'))        return 'Email doğrulanmamış';
  return msg;
};

export const register = async (username, email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { success: false, message: cevirHata(error.message) };

    const authUser = data.user;
    if (!authUser) return { success: false, message: 'Kayıt oluşturulamadı' };

    // Profil satırını oluştur (trigger varsa upsert çakışmayı önler)
    await supabase.from('profiles').upsert({ id: authUser.id, username });

    const profile = await fetchProfile(authUser.id);
    const user = buildUser(authUser, profile ?? { username });
    if (setGlobalUser) setGlobalUser(user);
    return { success: true, user };
  } catch (hata) {
    return { success: false, message: hata.message };
  }
};

export const login = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: cevirHata(error.message) };

    const profile = await fetchProfile(data.user.id);
    const user = buildUser(data.user, profile);
    if (setGlobalUser) setGlobalUser(user);
    return { success: true, user };
  } catch (hata) {
    return { success: false, message: hata.message };
  }
};

export const logout = async () => {
  await supabase.auth.signOut();
  if (setGlobalUser) setGlobalUser(null);
};

export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  const profile = await fetchProfile(session.user.id);
  return buildUser(session.user, profile);
};

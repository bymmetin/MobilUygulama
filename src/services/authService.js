import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDB } from '../db/database';

let setGlobalUser = null;

export const setUserSetter = (fn) => {
  setGlobalUser = fn;
};

const hashPassword = async (password) => {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return hash;
};

export const register = async (username, email, password) => {
  try {
    const db = await getDB();

    const existing = await db.getFirstAsync(
      'SELECT * FROM users WHERE email = ?', [email]
    );
    if (existing) {
      return { success: false, message: 'Bu email zaten kayıtlı' };
    }

    const hashedPassword = await hashPassword(password);

    await db.runAsync(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const newUser = await db.getFirstAsync(
      'SELECT * FROM users WHERE email = ?', [email]
    );

    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    if (setGlobalUser) setGlobalUser(newUser);

    return { success: true, user: newUser };
  } catch (hata) {
    return { success: false, message: hata.message };
  }
};

export const login = async (emailOrUsername, password) => {
  try {
    const db = await getDB();
    const hashedPassword = await hashPassword(password);

    const user = await db.getFirstAsync(
      'SELECT * FROM users WHERE (email = ? OR username = ?) AND password = ?',
      [emailOrUsername, emailOrUsername, hashedPassword]
    );

    if (!user) {
      return { success: false, message: 'Email/kullanıcı adı veya şifre hatalı' };
    }

    await AsyncStorage.setItem('user', JSON.stringify(user));
    if (setGlobalUser) setGlobalUser(user);

    return { success: true, user };
  } catch (hata) {
    return { success: false, message: hata.message };
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem('user');
  if (setGlobalUser) setGlobalUser(null);
};

export const getCurrentUser = async () => {
  const user = await AsyncStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
// api.js — NestJS backend ile HTTP iletişimi.
//
// BASE_URL: NestJS'in çalıştığı adres.
//   Expo Go fiziksel cihazda çalışırken 'localhost' telefona değil bilgisayara işaret etmez.
//   Bu yüzden bilgisayarın local IP'si kullanılır (192.168.x.x).
//   IP değişirse buradan güncelle.
//
// apiFetch(): tüm isteklerde ortak işlemleri yapar:
//   - AsyncStorage'dan token alır ve Authorization başlığına ekler
//   - JSON dönüştürme ve hata yönetimi yapar

import AsyncStorage from '@react-native-async-storage/async-storage';

// NestJS backend adresi — bilgisayarın local IP'si
export const BASE_URL = 'http://192.168.1.80:3000';

// Token anahtarları AsyncStorage'da bu isimlerle saklanır
const ACCESS_TOKEN_KEY  = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Token'ı kaydet
export const saveTokens = async (accessToken, refreshToken) => {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

// Token'ı oku
export const getAccessToken = () => AsyncStorage.getItem(ACCESS_TOKEN_KEY);

// Token'ları sil (logout)
export const clearTokens = async () => {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Tüm API istekleri bu fonksiyon üzerinden geçer.
// path: '/auth/login' gibi endpoint yolu
// options: fetch seçenekleri (method, body vb.)
// withAuth: true → Authorization: Bearer <token> başlığı ekle
export const apiFetch = async (path, options = {}, withAuth = false) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers ?? {}) };

  // Korumalı endpoint'lerde token ekle
  if (withAuth) {
    const token = await getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Yanıt boşsa (204 No Content gibi) JSON parse etme
  if (response.status === 204) return null;

  const data = await response.json();

  // HTTP hata kodlarında hata fırlat (4xx, 5xx)
  if (!response.ok) {
    const message = data?.message ?? 'Bir hata oluştu';
    // NestJS bazen message'ı dizi olarak döner (validation hatası)
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return data;
};

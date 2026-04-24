import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { getCurrentUser, setUserSetter } from '../services/authService';
import AuthStack from './AuthStack';
import MainStack from './MainStack';

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUserSetter(setUser);
    const kontrol = async () => {
      const mevcutUser = await getCurrentUser();
      setUser(mevcutUser);
      setLoading(false);
    };
    kontrol();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
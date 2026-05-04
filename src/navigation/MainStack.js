import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import LeaguesScreen from '../screens/LeaguesScreen';
import DailyScreen from '../screens/DailyScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LessonScreen from '../screens/LessonScreen';
import ResultScreen from '../screens/ResultScreen';
import { colors } from '../config/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Her tab için emoji ikon
const TAB_ICONS = {
  HomeTab: '🏛️',
  LeaguesTab: '⚔️',
  DailyTab: '📜',
  ProfileTab: '🪖',
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 6,
        },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: focused ? 28 : 22, opacity: focused ? 1 : 0.55 }}>
            {TAB_ICONS[route.name]}
          </Text>
        ),
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.tabBarIcon,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="LeaguesTab" component={LeaguesScreen} />
      <Tab.Screen name="DailyTab" component={DailyScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeTabs" component={HomeTabs} />
      <Stack.Screen name="Lesson" component={LessonScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
    </Stack.Navigator>
  );
}

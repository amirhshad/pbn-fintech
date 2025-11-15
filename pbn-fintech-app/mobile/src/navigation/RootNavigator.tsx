import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../store';
import { loadStoredAuth } from '../store/authSlice';

// Screens
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { COLORS } from '../constants';

// Navigation types
export type RootStackParamList = {
  // Auth
  Login: undefined;

  // Main
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = React.useState(true);

  useEffect(() => {
    // Load stored auth on app start
    const initAuth = async () => {
      await dispatch(loadStoredAuth());
      setIsInitializing(false);
    };

    initAuth();
  }, [dispatch]);

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          // Main Stack
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                headerShown: true,
                title: 'PBN Fintech',
                headerStyle: {
                  backgroundColor: COLORS.primary,
                },
                headerTintColor: '#FFFFFF',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

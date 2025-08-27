import 'react-native-gesture-handler';
import 'react-native-reanimated';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { LocalizationProvider } from './src/context/LocalizationProvider';
import { GrantsProvider } from './src/context/GrantsContext';
import RootNavigator from './src/app/navigation/RootNavigator';
import Toast from 'react-native-toast-message';
import { TextInput } from 'react-native';
import { useFonts } from 'expo-font';

//To stop font scaling
interface TextWithDefaultProps extends Text {
  defaultProps?: { allowFontScaling?: boolean };
};

((Text as unknown) as TextWithDefaultProps).defaultProps =
  ((Text as unknown) as TextWithDefaultProps).defaultProps || {};
((Text as unknown) as TextWithDefaultProps).defaultProps!.allowFontScaling = false;

((TextInput as unknown) as TextWithDefaultProps).defaultProps =
  ((TextInput as unknown) as TextWithDefaultProps).defaultProps || {};
((TextInput as unknown) as TextWithDefaultProps).defaultProps!.allowFontScaling = false;

export default function App() {

  useFonts({
    'Montserrat-Bold': require('./assets/fonts/Montserrat-Bold.otf'),
    'Montserrat-Medium': require('./assets/fonts/Montserrat-Medium.otf'),
    'Montserrat-Regular': require('./assets/fonts/Montserrat-Regular.otf'),
  });

  return (
    <SafeAreaProvider>
      <LocalizationProvider>
        <ThemeProvider>
          <GrantsProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
            <Toast />
          </GrantsProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </SafeAreaProvider>
  );
}

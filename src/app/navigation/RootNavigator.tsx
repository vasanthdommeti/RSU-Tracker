import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Tabs from './Tabs';
import GrantDetailsScreen from '../screens/GrantDetailsScreen';
import { useTheme } from '../../context/ThemeContext';

const Stack = createNativeStackNavigator();
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 }; // bigger tap area

export default function RootNavigator() {
    const { palette, isDark } = useTheme();
    const backBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)';

    const styles = React.useMemo(() =>
        StyleSheet.create({
            header: {
                backgroundColor: palette.card
            },
            content: {
                backgroundColor: palette.background
            },
            title: {
                fontFamily: 'Montserrat-Bold',
                fontSize: 18,
                color: palette.text
            },
            backBtn: {
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: -4,
                marginRight: 12,
                backgroundColor: backBg,
            },
        }), [palette, backBg]
    );

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: styles.header,
                headerTintColor: palette.text,
                contentStyle: styles.content,
                headerTitleStyle: styles.title,
            }}
        >
            {/* Tabs (no header) */}
            <Stack.Screen name="HomeTabs" component={Tabs} options={{ headerShown: false, title: ' ' }} />

            {/* Details with themed back chip */}
            <Stack.Screen
                name="GrantDetails"
                component={GrantDetailsScreen}
                options={({ navigation }) => ({
                    title: 'Grant',
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backBtn}
                            hitSlop={HIT_SLOP}
                        >
                            <Ionicons name="arrow-back" size={22} color={palette.text} />
                        </TouchableOpacity>
                    ),
                })}
            />
        </Stack.Navigator>
    );
}

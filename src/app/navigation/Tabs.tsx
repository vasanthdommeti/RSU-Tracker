import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// screens
import PortfolioOverviewScreen from '../screens/PortfolioOverviewScreen';
import AddGrantScreen from '../screens/AddGrantScreen';
import VestingCalendarScreen from '../screens/VestingCalendarScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';

// context
import { useTheme } from '../../context/ThemeContext';
import { useL10n } from '../../context/LocalizationProvider';

// navigator
const Tab = createBottomTabNavigator();

export default function Tabs() {
    // theme + i18n
    const { palette, isDark } = useTheme();
    const { t } = useL10n();
    const s = makeStyles(palette);

    // tab colors
    const activeTint = isDark ? '#ffffff' : '#000000';
    const inactiveTint = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';

    return (
        <Tab.Navigator
            // global tab options
            screenOptions={{
                headerShown: false,
                tabBarStyle: s.tabBar,
                tabBarLabelStyle: s.tabLabel,
                tabBarActiveTintColor: activeTint,
                tabBarInactiveTintColor: inactiveTint,
            }}
        >
            {/* Portfolio */}
            <Tab.Screen
                name="Portfolio"
                component={PortfolioOverviewScreen}
                options={{
                    title: t('portfolio'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />

            {/* Add grant */}
            <Tab.Screen
                name="AddGrant"
                component={AddGrantScreen}
                options={{
                    title: t('addGrant'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="add-circle" size={size} color={color} />
                    ),
                }}
            />

            {/* Calendar */}
            <Tab.Screen
                name="Calendar"
                component={VestingCalendarScreen}
                options={{
                    title: t('calendar'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar" size={size} color={color} />
                    ),
                }}
            />

            {/* Analytics */}
            <Tab.Screen
                name="Analytics"
                component={AnalyticsScreen}
                options={{
                    title: t('analytics'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="stats-chart" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

// styles
const makeStyles = (p: any) =>
    StyleSheet.create({
        tabBar: {
            backgroundColor: p.card,
            borderTopColor: p.border,
        },
        tabLabel: {
            fontFamily: 'Montserrat-Bold',
            fontSize: 12,
            letterSpacing: 0.2,
        },
    });

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Grant } from '../types/types';
import { useTheme } from '../context/ThemeContext';
import { useCompanyLogo } from '../hooks/useFunctionality';
import { useGrantCardStrings } from '../hooks/useGrantCard';

export default function GrantCard({ grant, value, onPress }: { grant: Grant; value: number; onPress: () => void }) {
    const { palette } = useTheme();
    const s = makeStyles(palette);
    const logoFor = useCompanyLogo();

    const { title, sharesLine, atPrice, valueText } = useGrantCardStrings(
        grant.company,
        grant.symbol,
        grant.shares,
        grant.grantPrice,
        value
    );

    return (
        <Animated.View entering={FadeInDown.delay(80).duration(380)}>
            <TouchableOpacity onPress={onPress} style={s.card}>
                <Image source={logoFor(grant.symbol)} style={s.logo} />

                <View style={s.centerCol}>
                    <Text style={s.title}>{title}</Text>
                    <Text style={s.subTop}>{sharesLine}</Text>
                    <Text style={s.subBottom}>{atPrice}</Text>
                </View>

                <View style={s.rightCol}>
                    <Text style={s.value}>{valueText}</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const makeStyles = (p: any) =>
    StyleSheet.create({
        card: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 14,
            borderRadius: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: p.border,
            backgroundColor: p.card,
            marginHorizontal: 12,
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowOffset: { width: 0, height: 6 },
            shadowRadius: 10,
            elevation: 1
        },
        logo: {
            width: 40,
            height: 40,
            marginRight: 12,
            borderRadius: 8
        },
        centerCol: {
            flex: 1,
            paddingRight: 8
        },
        rightCol: {
            alignItems: 'flex-end',
            justifyContent: 'center'
        },
        title: {
            fontFamily: 'Montserrat-Bold',
            fontSize: 16,
            color: p.text
        },
        subTop: {
            marginTop: 3,
            fontFamily: 'Montserrat-Regular',
            color: p.muted,
            fontSize: 13
        },
        subBottom: {
            marginTop: 2,
            fontFamily: 'Montserrat-Regular',
            color: p.muted,
            fontSize: 13
        },
        value: {
            fontFamily: 'Montserrat-Bold',
            fontSize: 16,
            color: p.text
        }
    });

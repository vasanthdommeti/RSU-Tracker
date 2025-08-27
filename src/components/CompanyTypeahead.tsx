import React, { Platform, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useL10n } from '../context/LocalizationProvider';
import { useTypeahead, CompanyItem } from '../hooks/useTypeahead';

type Props = { items: CompanyItem[]; onSelect: (item: CompanyItem | null) => void; error?: boolean; resetKey?: number };

export default function CompanyTypeahead({ items, onSelect, error, resetKey = 0 }: Props) {
    const { palette } = useTheme();
    const { t } = useL10n();
    const s = makeStyles(palette, !!error);

    // hook: state + helpers
    const { open, setOpen, query, setQuery, inputRef, hostRef, anchor, filtered, pick, clear, measure } =
        useTypeahead(items, resetKey, onSelect);

    const HITSLOP = { top: 10, bottom: 10, left: 10, right: 10 };
    const isPortal = Platform.OS === 'android';

    return (
        <View ref={hostRef} onLayout={measure} style={s.container}>
            <TextInput
                ref={inputRef}
                value={query}
                onChangeText={(t) => {
                    setQuery(t);
                    setOpen(true);
                }}
                onFocus={() => {
                    setOpen(true);
                    measure();
                }}
                onBlur={() => setTimeout(() => setOpen(false), 120)}
                placeholder={t('typeCompanyPlaceholder')}
                placeholderTextColor={palette.muted}
                autoCorrect={false}
                autoCapitalize="none"
                style={s.input}
            />

            {query.length > 0 ? (
                <TouchableOpacity style={s.iconRight} onPress={clear} hitSlop={HITSLOP}>
                    <Ionicons name="close-circle" size={18} color={palette.muted} />
                </TouchableOpacity>
            ) : (
                <View style={s.iconRight}>
                    <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={palette.muted} />
                </View>
            )}

            {!isPortal && open && (
                <View style={s.dropdown}>
                    {filtered.length === 0 ? (
                        <Text style={s.dropdownEmpty}>{t('noDataFound')}</Text>
                    ) : (
                        <ScrollView style={s.dropdownScroll} keyboardShouldPersistTaps="handled">
                            {filtered.map((item) => (
                                <TouchableOpacity key={item.value} style={s.item} onPress={() => pick(item)}>
                                    <Text style={s.itemLabel}>{item.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            )}

            {isPortal && open && anchor && (
                <Modal transparent visible onRequestClose={() => setOpen(false)}>
                    <Pressable style={s.backdrop} onPress={() => setOpen(false)} />
                    <View style={[s.portalDropdown, { top: anchor.y + anchor.h + 4, left: anchor.x, width: anchor.w }]}>
                        <ScrollView style={s.portalScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                            {filtered.length === 0 ? (
                                <Text style={s.dropdownEmpty}>{t('noDataFound')}</Text>
                            ) : (
                                filtered.map((item) => (
                                    <TouchableOpacity key={item.value} style={s.item} onPress={() => pick(item)}>
                                        <Text style={s.itemLabel}>{item.label}</Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const makeStyles = (p: any, error: boolean) =>
    StyleSheet.create({
        container: {
            position: 'relative',
            zIndex: 50,
            marginBottom: 12
        },
        input: {
            borderWidth: 1,
            borderColor: error ? '#ef4444' : p.border,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: p.text,
            backgroundColor: p.card,
            fontFamily: 'Montserrat-Regular'
        },
        iconRight: {
            position: 'absolute',
            right: 10,
            top: 12
        },
        dropdown: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 52,
            backgroundColor: p.card,
            borderWidth: 1,
            borderColor: error ? '#ef4444' : p.border,
            borderRadius: 12,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 }
        },
        dropdownScroll: {
            maxHeight: 240
        },
        dropdownEmpty: {
            color: p.muted,
            padding: 12,
            fontFamily: 'Montserrat-Regular'
        },
        portalDropdown: {
            position: 'absolute',
            backgroundColor: p.card,
            borderWidth: 1,
            borderColor: p.border,
            borderRadius: 12,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOpacity: 0.18,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 10 }
        },
        portalScroll: {
            maxHeight: 300
        },
        item: {
            padding: 12,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: p.border
        },
        itemLabel: {
            color: p.text,
            fontFamily: 'Montserrat-Regular'
        },
        backdrop: {
            flex: 1,
            backgroundColor: 'transparent'
        }
    });

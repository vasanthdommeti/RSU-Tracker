import AsyncStorage from '@react-native-async-storage/async-storage';
import { Grant } from '../types/types';

const KEY = 'RSU_GRANTS_V1';

export async function loadGrants(): Promise<Grant[]> {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as Grant[] : [];
}
export async function saveGrants(grants: Grant[]): Promise<void> {
    await AsyncStorage.setItem(KEY, JSON.stringify(grants));
}

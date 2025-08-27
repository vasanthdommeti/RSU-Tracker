import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { GrantsAction, GrantsState, PriceMap } from '../types/types';
import { computePortfolioMetrics } from '../utils/calculations';
import { loadGrants, saveGrants } from '../storage/grantsRepo';
import { sampleGrants } from '../data/sample';
import { fetchCurrentPrices } from '../services/marketData';


const GrantsCtx = createContext<{
    state: GrantsState;
    dispatch: React.Dispatch<GrantsAction>;
    refreshPrices: () => Promise<void>;
    metrics: ReturnType<typeof computePortfolioMetrics>;
} | null>(null);

const initial: GrantsState = {
    grants: [],
    prices: {},
    loadingPrices: false,
};

function reducer(state: GrantsState, action: GrantsAction): GrantsState {
    switch (action.type) {
        case 'HYDRATE':
            return { ...state, grants: action.payload };
        case 'ADD_GRANT': {
            const grants = [action.payload, ...state.grants];
            saveGrants(grants).catch(() => { });
            return { ...state, grants };
        }
        case 'UPDATE_GRANT': {
            const grants = state.grants.map(g => g.id === action.payload.id ? action.payload : g);
            saveGrants(grants).catch(() => { });
            return { ...state, grants };
        }
        case 'DELETE_GRANT': {
            const grants = state.grants.filter(g => g.id !== action.payload.id);
            saveGrants(grants).catch(() => { });
            return { ...state, grants };
        }
        case 'SET_PRICES':
            return { ...state, prices: action.payload.prices, loadingPrices: false, lastPricesAt: new Date().toISOString() };
        case 'SET_LOADING_PRICES':
            return { ...state, loadingPrices: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        default:
            return state;
    }
}

export const GrantsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initial);

    useEffect(() => {
        (async () => {
            const persisted = await loadGrants();
            if (persisted.length) {
                dispatch({ type: 'HYDRATE', payload: persisted });
            } else {
                // seed with sample grants on first run
                dispatch({ type: 'HYDRATE', payload: sampleGrants });
                saveGrants(sampleGrants).catch(() => { });
            }
        })();
    }, []);

    const refreshPrices = async () => {
        try {
            dispatch({ type: 'SET_LOADING_PRICES', payload: true });
            const symbols = Array.from(new Set(state.grants.map(g => g.symbol))) as any;
            const prices: PriceMap = await fetchCurrentPrices(symbols);
            dispatch({ type: 'SET_PRICES', payload: { prices } });
        } catch (e: any) {
            dispatch({ type: 'SET_ERROR', payload: e?.message ?? 'Failed to load prices' });
            dispatch({ type: 'SET_LOADING_PRICES', payload: false });
        }
    };

    useEffect(() => { if (state.grants.length) refreshPrices(); }, [state.grants.length]);

    const metrics = useMemo(() => computePortfolioMetrics(state.grants, state.prices), [state.grants, state.prices]);

    return (
        <GrantsCtx.Provider value={{ state, dispatch, refreshPrices, metrics }}>
            {children}
        </GrantsCtx.Provider>
    );
};

export function useGrants() {
    const ctx = useContext(GrantsCtx);
    if (!ctx) throw new Error('useGrants must be used within GrantsProvider');
    return ctx;
}

import React from 'react';
import { VictoryLine, VictoryChart, VictoryTheme } from 'victory-native';

export default function PortfolioValueChart({ points }: { points: { x: number; y: number }[] }) {
    return (
        <VictoryChart theme={VictoryTheme.material}>
            <VictoryLine data={points} />
        </VictoryChart>
    );
}

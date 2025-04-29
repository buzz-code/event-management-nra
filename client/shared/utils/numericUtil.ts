export const round = (value: number, decimals: number = 2): number => {
    if (value < 0) {
        const newValue = value * -1;
        const roundedValue = Number(Math.round(Number(newValue + 'e' + decimals)) + 'e-' + decimals);
        return roundedValue * -1;
    }
    return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
};

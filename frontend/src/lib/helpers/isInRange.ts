export const isInRange = (value: number, range: { r1: number; r2: number }) => {
    const { r1, r2 } = range;

    const min = Math.min(r1, r2);
    const max = Math.max(r1, r2);

    return value >= min && value <= max;
};

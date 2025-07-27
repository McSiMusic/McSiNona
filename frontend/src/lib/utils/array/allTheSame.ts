export const allTheSame = <T>(array: Array<T>) => {
    return new Set(array).size === 1;
};

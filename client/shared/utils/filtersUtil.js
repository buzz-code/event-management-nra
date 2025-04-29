export const filterArrayByParams = (items, params) =>
    items
        .map(item => typeof item === 'function' ? item(params) : item)
        .filter(item => item);

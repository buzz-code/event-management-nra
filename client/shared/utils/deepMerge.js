export const deepMerge = (objA, objB) => {
    if (!objA || typeof objA !== 'object' || Array.isArray(objA)) {
        return objB;
    }
    if (!objB || typeof objB !== 'object' || Array.isArray(objB)) {
        return objA;
    }
    const res = JSON.parse(JSON.stringify(objA));
    for (const key in objB) {
        res[key] = deepMerge(objA[key], objB[key]);
    }
    return res;
}
export const api = {
    getBranches: () => fetch('/api/branches').then(res => res.json()),
    getServices: () => fetch('/api/branches/services').then(res => res.json())
};
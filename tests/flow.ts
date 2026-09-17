import { loadEnv } from 'vite';

export const flow = loadEnv('production', process.cwd(), 'VITE_').VITE_FLOW ?? 'all';

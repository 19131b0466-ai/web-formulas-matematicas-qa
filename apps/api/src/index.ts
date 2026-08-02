import { createApp } from './app.js';
import { getDb } from './db/index.js';

export const app = createApp(getDb);
export default app;
export type { AppType } from './app.js';
export { createApp } from './app.js';

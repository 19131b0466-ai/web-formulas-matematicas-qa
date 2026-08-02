import { createApp } from './create-app.js';
import { getDb } from './db/index.js';

export const app = createApp(getDb);
export default app;
export type { AppType } from './create-app.js';
export { createApp } from './create-app.js';

import path from 'path';

/** Artifacts the `setup` project writes and the UI projects consume. Git-ignored. */
export const AUTH_DIR = path.resolve(__dirname, '../../.auth');
export const STORAGE_STATE = path.join(AUTH_DIR, 'user.json');
export const CREDENTIALS_FILE = path.join(AUTH_DIR, 'credentials.json');

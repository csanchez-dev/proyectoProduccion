import fs from 'fs';
import path from 'path';

const STORAGE_DIR = process.env.LOCAL_STORAGE_DIR
  ? path.resolve(process.cwd(), process.env.LOCAL_STORAGE_DIR)
  : path.resolve(__dirname, '../../..', 'storage');

const ensureStorageDir = () => {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
};

const safeKey = (key: string) => key.replace(/[^a-zA-Z0-9_-]/g, '_');

const getStoragePath = (key: string) => {
  ensureStorageDir();
  return path.join(STORAGE_DIR, `${safeKey(key)}.json`);
};

export const listStorageKeys = () => {
  ensureStorageDir();
  return fs.readdirSync(STORAGE_DIR)
    .filter((file) => file.endsWith('.json'))
    .map((file) => path.basename(file, '.json'));
};

export const readStorage = (key: string) => {
  const filePath = getStoragePath(key);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
};

export const writeStorage = (key: string, value: any) => {
  const filePath = getStoragePath(key);
  // Protecciones: nunca escribir contraseñas en el almacenamiento del repo
  let safeValue = value;
  try {
    if (typeof key === 'string' && key.toLowerCase().includes('usuarios_locales')) {
      if (Array.isArray(value)) {
        safeValue = value.map((u: any) => {
          const copy = { ...u };
          if (copy.password) delete copy.password;
          if (copy.pwd) delete copy.pwd;
          return copy;
        });
      } else if (typeof value === 'object' && value !== null) {
        const copy = { ...value };
        if (copy.password) delete copy.password;
        if (copy.pwd) delete copy.pwd;
        safeValue = copy;
      }
    }
  } catch (e) {
    // no bloquear en caso de error al sanear
    safeValue = value;
  }

  fs.writeFileSync(filePath, JSON.stringify(safeValue, null, 2), 'utf-8');
};

export const deleteStorage = (key: string) => {
  const filePath = getStoragePath(key);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

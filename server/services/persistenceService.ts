import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { RuntimeData } from '../types/index.js';

// Resolve project root and data file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const DATA_DIR = path.resolve(PROJECT_ROOT, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'runtime.json');
const TMP_FILE = path.resolve(DATA_DIR, 'runtime.json.tmp');

// In-process async mutex queue for concurrent writes
class AsyncMutex {
  private queue: Promise<void> = Promise.resolve();

  async runExclusive<T>(task: () => Promise<T>): Promise<T> {
    let resolveTask: () => void;
    const nextInQueue = new Promise<void>((resolve) => {
      resolveTask = resolve;
    });

    const currentQueue = this.queue;
    this.queue = nextInQueue;

    await currentQueue;
    try {
      return await task();
    } finally {
      resolveTask!();
    }
  }
}

const mutex = new AsyncMutex();

export const getEmptyRuntimeData = (): RuntimeData => ({
  users: [],
  games: [],
  categories: [],
  carts: [],
  wishlists: [],
  orders: [],
  orderItems: [],
  payments: [],
  library: [],
  promotions: [],
  sessions: [],
  auditLogs: [],
  metadata: {
    appName: 'AMR Game Space',
    version: '1.0.0',
    mode: 'simulator',
    seededAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  },
});

export class PersistenceService {
  public static async ensureDataDirectoryExists(): Promise<void> {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  public static async readData(): Promise<RuntimeData> {
    await this.ensureDataDirectoryExists();
    if (!fs.existsSync(DATA_FILE)) {
      const initial = getEmptyRuntimeData();
      await this.writeData(initial);
      return initial;
    }

    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      if (!raw || raw.trim() === '') {
        const initial = getEmptyRuntimeData();
        await this.writeData(initial);
        return initial;
      }
      const data = JSON.parse(raw) as RuntimeData;
      // Ensure required arrays exist
      return {
        users: data.users || [],
        games: data.games || [],
        categories: data.categories || [],
        carts: data.carts || [],
        wishlists: data.wishlists || [],
        orders: data.orders || [],
        orderItems: data.orderItems || [],
        payments: data.payments || [],
        library: data.library || [],
        promotions: data.promotions || [],
        sessions: data.sessions || [],
        auditLogs: data.auditLogs || [],
        metadata: data.metadata || getEmptyRuntimeData().metadata,
      };
    } catch (error) {
      console.error('Error reading runtime.json, initializing fresh structure:', error);
      const initial = getEmptyRuntimeData();
      await this.writeData(initial);
      return initial;
    }
  }

  private static atomicPersistSync(content: string): void {
    fs.writeFileSync(TMP_FILE, content, 'utf-8');
    const verifyRaw = fs.readFileSync(TMP_FILE, 'utf-8');
    JSON.parse(verifyRaw); // verify JSON integrity

    let attempts = 0;
    while (attempts < 5) {
      try {
        fs.renameSync(TMP_FILE, DATA_FILE);
        return;
      } catch (err: any) {
        if ((err.code === 'EPERM' || err.code === 'EBUSY') && attempts < 4) {
          attempts++;
          const start = Date.now();
          while (Date.now() - start < 10 * attempts) {}
        } else {
          try {
            fs.copyFileSync(TMP_FILE, DATA_FILE);
            if (fs.existsSync(TMP_FILE)) fs.unlinkSync(TMP_FILE);
            return;
          } catch {
            throw err;
          }
        }
      }
    }
  }

  public static async writeData(data: RuntimeData): Promise<void> {
    return mutex.runExclusive(async () => {
      await this.ensureDataDirectoryExists();
      data.metadata.lastUpdated = new Date().toISOString();
      const serialized = JSON.stringify(data, null, 2);
      this.atomicPersistSync(serialized);
    });
  }

  public static async updateData<T>(
    updater: (draft: RuntimeData) => T | Promise<T>
  ): Promise<T> {
    return mutex.runExclusive(async () => {
      const currentData = await this.readDataInternal();
      const result = await updater(currentData);
      currentData.metadata.lastUpdated = new Date().toISOString();
      const serialized = JSON.stringify(currentData, null, 2);

      await this.ensureDataDirectoryExists();
      this.atomicPersistSync(serialized);

      return result;
    });
  }

  private static async readDataInternal(): Promise<RuntimeData> {
    await this.ensureDataDirectoryExists();
    if (!fs.existsSync(DATA_FILE)) {
      return getEmptyRuntimeData();
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    if (!raw.trim()) return getEmptyRuntimeData();
    return JSON.parse(raw) as RuntimeData;
  }
}

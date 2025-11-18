/**
 * Storage Adapter Interface
 * Allows alternative storage backends for messages and files
 */

export interface StorageObject {
  key: string;
  data: string | Buffer;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface IStorageAdapter {
  /**
   * Store an object
   */
  put(object: StorageObject): Promise<string>;

  /**
   * Retrieve an object
   */
  get(key: string): Promise<StorageObject | null>;

  /**
   * Delete an object
   */
  delete(key: string): Promise<void>;

  /**
   * Check if object exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * List objects with prefix
   */
  list(prefix: string): Promise<string[]>;

  /**
   * Health check
   */
  healthCheck(): Promise<boolean>;
}

/**
 * In-Memory Storage Adapter (for testing/development)
 */
export class InMemoryStorageAdapter implements IStorageAdapter {
  private storage: Map<string, StorageObject> = new Map();

  async put(object: StorageObject): Promise<string> {
    this.storage.set(object.key, object);
    return object.key;
  }

  async get(key: string): Promise<StorageObject | null> {
    return this.storage.get(key) || null;
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.has(key);
  }

  async list(prefix: string): Promise<string[]> {
    return Array.from(this.storage.keys()).filter(key => key.startsWith(prefix));
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  clear(): void {
    this.storage.clear();
  }
}

/**
 * File System Storage Adapter
 */
export class FileSystemStorageAdapter implements IStorageAdapter {
  constructor(private basePath: string) {}

  async put(object: StorageObject): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(this.basePath, object.key);

    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Write file
    const data = typeof object.data === 'string' ? object.data : object.data.toString();
    await fs.writeFile(filePath, data);

    // Write metadata if provided
    if (object.metadata || object.contentType) {
      const metadataPath = `${filePath}.meta.json`;
      await fs.writeFile(metadataPath, JSON.stringify({
        contentType: object.contentType,
        metadata: object.metadata,
      }));
    }

    return object.key;
  }

  async get(key: string): Promise<StorageObject | null> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(this.basePath, key);

    try {
      const data = await fs.readFile(filePath, 'utf-8');

      // Try to read metadata
      let metadata: Record<string, string> | undefined;
      let contentType: string | undefined;

      try {
        const metadataPath = `${filePath}.meta.json`;
        const metaContent = await fs.readFile(metadataPath, 'utf-8');
        const meta = JSON.parse(metaContent);
        metadata = meta.metadata;
        contentType = meta.contentType;
      } catch {
        // Metadata doesn't exist, that's ok
      }

      return {
        key,
        data,
        contentType,
        metadata,
      };
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(this.basePath, key);

    try {
      await fs.unlink(filePath);
      // Try to delete metadata
      try {
        await fs.unlink(`${filePath}.meta.json`);
      } catch {
        // Ignore if metadata doesn't exist
      }
    } catch {
      // File doesn't exist, that's ok
    }
  }

  async exists(key: string): Promise<boolean> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(this.basePath, key);

    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async list(prefix: string): Promise<string[]> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const dirPath = path.join(this.basePath, path.dirname(prefix));
    const filePrefix = path.basename(prefix);

    try {
      const files = await fs.readdir(dirPath);
      return files
        .filter(file => file.startsWith(filePrefix) && !file.endsWith('.meta.json'))
        .map(file => path.join(path.dirname(prefix), file));
    } catch {
      return [];
    }
  }

  async healthCheck(): Promise<boolean> {
    const fs = await import('fs/promises');
    try {
      await fs.access(this.basePath);
      return true;
    } catch {
      return false;
    }
  }
}

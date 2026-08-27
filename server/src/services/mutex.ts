/**
 * Async Mutex / Lock Manager
 * Prevents race conditions during topic slot booking and application registrations.
 * Guarantees that concurrent requests for the same topic or student are executed strictly sequentially.
 */
export class AsyncLockManager {
  private locks: Map<string, Promise<void>> = new Map();

  /**
   * Acquire a lock for a given resource key, execute the callback atomically, then release lock.
   */
  async acquire<T>(key: string, callback: () => Promise<T>): Promise<T> {
    while (this.locks.has(key)) {
      try {
        await this.locks.get(key);
      } catch {
        // Ignore previous error and continue
      }
    }

    let resolveLock!: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      resolveLock = resolve;
    });

    this.locks.set(key, lockPromise);

    try {
      return await callback();
    } finally {
      this.locks.delete(key);
      resolveLock();
    }
  }
}

export const lockManager = new AsyncLockManager();


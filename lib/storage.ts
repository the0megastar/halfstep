import type { Injection } from './injections';
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('halfstep-injections', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('injections', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Local storage is unavailable. Your entry was not saved.'));
    request.onblocked = () => reject(new Error('Close other Halfstep tabs and try again.'));
  });
}
export async function loadInjections(): Promise<Injection[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('injections', 'readonly');
    const request = tx.objectStore('injections').getAll();
    tx.oncomplete = () => { db.close(); resolve(request.result); };
    tx.onabort = () => { db.close(); reject(new Error('Could not read local history.')); };
  });
}
export async function saveInjection(record: Injection, expectedRevision?: number): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('injections', 'readwrite');
    const store = tx.objectStore('injections');
    let failure = 'Could not save locally. Your changes have not been saved.';
    const request = store.get(record.id);
    request.onsuccess = () => {
      const existing = request.result as Injection | undefined;
      if (expectedRevision === undefined && existing) return; // Idempotent creation retry.
      if (expectedRevision !== undefined && existing?.revision !== expectedRevision) {
        failure = 'This entry changed in another tab. Close this panel and reopen history before editing.';
        tx.abort(); return;
      }
      store.put(record);
    };
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onabort = () => { db.close(); reject(new Error(failure)); };
  });
}

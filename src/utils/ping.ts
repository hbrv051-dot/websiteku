import { WebsiteItem } from '../types';
import { normalizeUrl } from './helpers';

export interface PingResult {
  websiteId: string;
  isOnline: boolean;
  latencyMs: number;
  status: 'online' | 'slow' | 'offline';
  statusText: string;
  timestamp: string;
}

/**
 * Menguji keterjangkauan dan latensi (ms) suatu website melalui browser fetch.
 * Menggunakan mode no-cors untuk memastikan permintaan sampai ke server target
 * dan mengukur waktu pulang-pergi (round-trip time).
 */
export async function checkWebsitePing(
  rawUrl: string,
  timeoutMs: number = 6000
): Promise<{ isOnline: boolean; latencyMs: number; status: 'online' | 'slow' | 'offline'; statusText: string }> {
  const targetUrl = normalizeUrl(rawUrl);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const startTime = performance.now();

  try {
    // 1. Primary probe via no-cors fetch
    // Append timestamp cache-buster query
    const probeUrl = new URL(targetUrl);
    probeUrl.searchParams.set('_ping', Date.now().toString());

    await fetch(probeUrl.toString(), {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - startTime);

    if (latencyMs > 2000) {
      return {
        isOnline: true,
        latencyMs,
        status: 'slow',
        statusText: `Online (Respon Lambat: ${latencyMs}ms)`,
      };
    }

    return {
      isOnline: true,
      latencyMs,
      status: 'online',
      statusText: `Online (Respon Cepat: ${latencyMs}ms)`,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);

    // If fetch failed, attempt a fallback favicon image probe
    try {
      const fallbackResult = await probeWithImage(targetUrl, 3000);
      if (fallbackResult.isOnline) {
        return fallbackResult;
      }
    } catch {
      // Fallback also failed
    }

    const isTimeout = err?.name === 'AbortError';
    return {
      isOnline: false,
      latencyMs: isTimeout ? timeoutMs : 0,
      status: 'offline',
      statusText: isTimeout ? 'Request Timeout (>6 detik)' : 'Tidak Merespons / Offline',
    };
  }
}

/**
 * Fallback probe menggunakan elemen Image (favicon/asset)
 */
function probeWithImage(
  baseUrl: string,
  timeoutMs: number
): Promise<{ isOnline: boolean; latencyMs: number; status: 'online' | 'slow' | 'offline'; statusText: string }> {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const img = new Image();
    let isSettled = false;

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        img.src = '';
        reject(new Error('Timeout'));
      }
    }, timeoutMs);

    img.onload = () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        const latencyMs = Math.round(performance.now() - startTime);
        resolve({
          isOnline: true,
          latencyMs,
          status: latencyMs > 2000 ? 'slow' : 'online',
          statusText: `Online (${latencyMs}ms)`,
        });
      }
    };

    img.onerror = () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        // An image error still proves DNS resolved & server sent a response (e.g. 404/Content-Type)
        const latencyMs = Math.round(performance.now() - startTime);
        resolve({
          isOnline: true,
          latencyMs,
          status: latencyMs > 2000 ? 'slow' : 'online',
          statusText: `Online (${latencyMs}ms)`,
        });
      }
    };

    try {
      const parsed = new URL(baseUrl);
      img.src = `${parsed.origin}/favicon.ico?_ping=${Date.now()}`;
    } catch {
      reject(new Error('Invalid URL'));
    }
  });
}

/**
 * Memeriksa seluruh website secara batch dengan batas concurrency (misal 3 secara simultan)
 */
export async function checkAllWebsitesPing(
  websites: WebsiteItem[],
  onProgress?: (current: number, total: number, item: WebsiteItem, result: PingResult) => void
): Promise<WebsiteItem[]> {
  const results: WebsiteItem[] = [...websites];
  const total = websites.length;
  let completed = 0;

  // Concurrency pool runner
  const concurrency = 3;
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < total) {
      const index = currentIndex++;
      const item = websites[index];
      
      const pingData = await checkWebsitePing(item.url);
      completed++;

      const timestamp = new Date().toISOString();
      const updatedItem: WebsiteItem = {
        ...item,
        pingStatus: pingData.status,
        pingLatency: pingData.latencyMs,
        lastPingChecked: timestamp,
        httpStatusNote: pingData.statusText,
      };

      results[index] = updatedItem;

      if (onProgress) {
        onProgress(completed, total, item, {
          websiteId: item.id,
          isOnline: pingData.isOnline,
          latencyMs: pingData.latencyMs,
          status: pingData.status,
          statusText: pingData.statusText,
          timestamp,
        });
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, total) }, () => worker());
  await Promise.all(workers);

  return results;
}

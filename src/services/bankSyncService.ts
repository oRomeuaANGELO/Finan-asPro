/**
 * Mock Bank Sync Service
 * Simulates an external API for bank account synchronization.
 */

export interface SyncResponse {
  id: string;
  newBalance: number;
  lastSync: string;
  status: "Sincronizado";
}

const INSTITUTION_RANGES: Record<string, { min: number; max: number }> = {
  "Nubank": { min: 1000, max: 5000 },
  "Itaú": { min: 10000, max: 20000 },
  "XP Investimentos": { min: 50000, max: 100000 },
  "default": { min: 0, max: 10000 }
};

export const bankSyncService = {
  /**
   * Simulates a secure connection to a bank API to fetch the current balance.
   */
  async fetchUpdatedBalance(accountId: string, institution: string): Promise<SyncResponse> {
    // Simulate network latency (1.5s to 3s)
    const latency = Math.floor(Math.random() * 1500) + 1500;
    await new Promise(resolve => setTimeout(resolve, latency));

    const range = INSTITUTION_RANGES[institution] || INSTITUTION_RANGES.default;
    const newBalance = Math.random() * (range.max - range.min) + range.min;

    return {
      id: accountId,
      newBalance: parseFloat(newBalance.toFixed(2)),
      lastSync: new Date().toISOString(),
      status: "Sincronizado"
    };
  }
};

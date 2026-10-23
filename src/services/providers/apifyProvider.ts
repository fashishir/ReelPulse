import type { Reel } from '../../types'
import { ProviderNotWiredError, type ApifyConfig, type ReelProvider } from './types'

/**
 * Apify adapter scaffold.
 *
 * Example live flow:
 *   POST https://api.apify.com/v2/acts/{actorId}/runs?token={token}
 *   then read the dataset: GET /v2/datasets/{datasetId}/items
 *
 * Map each dataset item into `Reel` and return the normalized array.
 */
export function createApifyProvider(config: ApifyConfig): ReelProvider {
  return {
    id: 'apify',
    label: 'Apify',
    isLive: true,
    async fetchReels(): Promise<Reel[]> {
      if (!config.token || !config.actorId) {
        throw new ProviderNotWiredError('Apify')
      }
      throw new ProviderNotWiredError('Apify')
    },
  }
}

import { REELS } from '../../data/reels'
import type { Reel } from '../../types'
import type { ReelProvider } from './types'

export const demoProvider: ReelProvider = {
  id: 'demo',
  label: 'ReelPulse demo dataset',
  isLive: false,
  async fetchReels(): Promise<Reel[]> {
    return REELS
  },
}

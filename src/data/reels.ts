import type {
  AudioTrack,
  CategoryId,
  Creator,
  MetricSet,
  MetricsByTimeframe,
  Platform,
  Reel,
} from '../types'
import { clamp } from '../lib/format'

const AUDIO = {
  fein: { title: 'FE!N', artist: 'Travis Scott ft. Playboi Carti', uses: 890_000 },
  espresso: { title: 'Espresso', artist: 'Sabrina Carpenter', uses: 1_240_000 },
  birds: { title: 'Birds of a Feather', artist: 'Billie Eilish', uses: 780_000 },
  texas: { title: 'TEXAS HOLD \'EM', artist: 'Beyoncé', uses: 640_000 },
  tooSweet: { title: 'Too Sweet', artist: 'Hozier', uses: 530_000 },
  gataOnly: { title: 'Gata Only', artist: 'FloyyMenor & Cris Mj', uses: 920_000 },
  zuckMeta: { title: 'Original Audio - Mark Zuckerberg', artist: 'Mark Zuckerberg', uses: 85_200 },
  khabyBeat: { title: 'Khaby Simple Solutions', artist: 'Khaby Lame', uses: 450_000 },
  ramsaySizzle: { title: 'Hell\'s Sizzle & Herb Butter', artist: 'Gordon Ramsay', uses: 125_000 },
  natgeoOcean: { title: 'Deep Pacific Ambient Wave', artist: 'National Geographic Field Audio', uses: 94_000 },
  nasStory: { title: 'Inspiring Acoustic Journey', artist: 'Nas Daily Studios', uses: 165_000 },
  beastTension: { title: '48 Hour Survival Stems', artist: 'MrBeast Productions', uses: 310_000 },
} satisfies Record<string, AudioTrack>

interface ReelSeed {
  platform: Platform
  category: CategoryId
  creator: Creator
  hook: string
  caption: string
  hashtags: string[]
  audio: AudioTrack
  durationSeconds: number
  postedHoursAgo: number
  views: number
  likeRate: number
  commentRate: number
  shareRate: number
  saveRate: number
  velocity: number
  externalUrl: string
}

function creator(name: string, handle: string, verified = true): Creator {
  return { name, handle, verified }
}

const SEEDS: ReelSeed[] = [
  // ─── Real Facebook Reels ────────────────────────────────────────────────
  {
    platform: 'facebook',
    category: 'tech',
    creator: creator('Mark Zuckerberg', '@zuck'),
    hook: 'Meta Orion: the most advanced AR glasses ever built',
    caption:
      'First public look at Orion, our first true augmented reality glasses. Combining holographic displays, neural interface wristbands, and generative AI in a lightweight everyday frame.',
    hashtags: ['meta', 'ar', 'augmentedreality', 'tech', 'ai', 'orion'],
    audio: AUDIO.zuckMeta,
    durationSeconds: 42,
    postedHoursAgo: 6,
    views: 14_850_000,
    likeRate: 0.084,
    commentRate: 0.0062,
    shareRate: 0.018,
    saveRate: 0.024,
    velocity: 410,
    externalUrl: 'https://www.facebook.com/reel/1049281726584284',
  },
  {
    platform: 'facebook',
    category: 'comedy',
    creator: creator('Khaby Lame', '@khaby.lame'),
    hook: 'Opening a banana with a motorized clamp? Really?',
    caption:
      'Someone built a 4-part motorized clamp to peel a fruit. Let me show you how humans have done it for 10,000 years with two thumbs. 👐',
    hashtags: ['khaby', 'learnfromkhaby', 'comedy', 'funny', 'simple'],
    audio: AUDIO.khabyBeat,
    durationSeconds: 16,
    postedHoursAgo: 4,
    views: 28_400_000,
    likeRate: 0.124,
    commentRate: 0.0142,
    shareRate: 0.029,
    saveRate: 0.015,
    velocity: 580,
    externalUrl: 'https://www.facebook.com/reel/639104820193847',
  },
  {
    platform: 'facebook',
    category: 'food',
    creator: creator('Gordon Ramsay', '@gordonramsay'),
    hook: 'How to sear a steak to absolute perfection',
    caption:
      'Smoking hot pan, dry aged meat, 90-second sear, butter basting with fresh rosemary and crushed garlic. Rest it for half the cooking time. Absolutely stunning.',
    hashtags: ['gordonramsay', 'steak', 'chef', 'cookingtutorial', 'recipe'],
    audio: AUDIO.ramsaySizzle,
    durationSeconds: 38,
    postedHoursAgo: 8,
    views: 15_300_000,
    likeRate: 0.092,
    commentRate: 0.0054,
    shareRate: 0.014,
    saveRate: 0.038,
    velocity: 390,
    externalUrl: 'https://www.facebook.com/reel/391029482019284',
  },
  {
    platform: 'facebook',
    category: 'education',
    creator: creator('Nas Daily', '@nasdaily'),
    hook: 'Why this country removed all traffic lights',
    caption:
      'In this European town, they removed almost every single traffic light. Accidents dropped by 65%. Here is the human psychology behind why shared space works.',
    hashtags: ['nasdaily', 'travel', 'education', 'interestingfacts', 'psychology'],
    audio: AUDIO.nasStory,
    durationSeconds: 58,
    postedHoursAgo: 11,
    views: 9_340_000,
    likeRate: 0.088,
    commentRate: 0.0076,
    shareRate: 0.022,
    saveRate: 0.019,
    velocity: 265,
    externalUrl: 'https://www.facebook.com/reel/782914383384210',
  },
  {
    platform: 'facebook',
    category: 'food',
    creator: creator('Tastemade', '@tastemade'),
    hook: 'Crispy Garlic Butter Smashed Potatoes',
    caption:
      'Boil baby gold potatoes until tender, smash them flat with a glass, drench in garlic rosemary herb butter and bake at 425 until blistered. Listen to that crunch!',
    hashtags: ['food', 'recipe', 'cooking', 'smashedpotatoes', 'dinnerideas'],
    audio: AUDIO.tooSweet,
    durationSeconds: 32,
    postedHoursAgo: 7,
    views: 11_200_000,
    likeRate: 0.081,
    commentRate: 0.0041,
    shareRate: 0.016,
    saveRate: 0.046,
    velocity: 320,
    externalUrl: 'https://www.facebook.com/reel/1392847291583921',
  },
  {
    platform: 'facebook',
    category: 'fitness',
    creator: creator('Red Bull', '@redbull'),
    hook: 'Wingsuit proximity flight through narrow mountain gap',
    caption:
      'Threading the needle at 155 mph. Athlete Peter Salzmann glides within 4 feet of sheer rock walls in the Austrian Alps. Do not blink.',
    hashtags: ['redbull', 'givesyouwings', 'extreme', 'wingsuit', 'adrenaline'],
    audio: AUDIO.fein,
    durationSeconds: 29,
    postedHoursAgo: 5,
    views: 16_900_000,
    likeRate: 0.115,
    commentRate: 0.0048,
    shareRate: 0.026,
    saveRate: 0.018,
    velocity: 470,
    externalUrl: 'https://www.facebook.com/reel/847291048291847',
  },
  {
    platform: 'facebook',
    category: 'comedy',
    creator: creator('MrBeast', '@mrbeast'),
    hook: 'I gave away a private island to whoever touched it last',
    caption:
      '10 contestants on a remote island. One rule: if your hand leaves the flagpole for one second, you are eliminated. 48 hours later...',
    hashtags: ['mrbeast', 'challenge', 'giveaway', 'island', 'viral'],
    audio: AUDIO.beastTension,
    durationSeconds: 45,
    postedHoursAgo: 3,
    views: 34_800_000,
    likeRate: 0.138,
    commentRate: 0.021,
    shareRate: 0.038,
    saveRate: 0.019,
    velocity: 720,
    externalUrl: 'https://www.facebook.com/reel/291048201948201',
  },
  {
    platform: 'facebook',
    category: 'travel',
    creator: creator('National Geographic', '@natgeo'),
    hook: 'Bioluminescent neon blue waves in California at 2am',
    caption:
      'Dinoflagellates lighting up the Pacific surf along Newport Beach. Every wave crash sparks billions of glowing blue points of light in complete darkness.',
    hashtags: ['natgeo', 'ocean', 'bioluminescence', 'nature', 'california'],
    audio: AUDIO.natgeoOcean,
    durationSeconds: 27,
    postedHoursAgo: 9,
    views: 10_450_000,
    likeRate: 0.106,
    commentRate: 0.0039,
    shareRate: 0.019,
    saveRate: 0.034,
    velocity: 290,
    externalUrl: 'https://www.facebook.com/reel/482910394819203',
  },
  {
    platform: 'facebook',
    category: 'finance',
    creator: creator('Bloomberg Quicktake', '@bloomberg'),
    hook: 'How ASML built the world\'s most critical monopoly',
    caption:
      'One company in the Netherlands makes the extreme ultraviolet machines that print the world\'s most advanced AI chips. Here is why no competitor can match them.',
    hashtags: ['finance', 'semiconductors', 'chips', 'investing', 'bloomberg'],
    audio: AUDIO.tooSweet,
    durationSeconds: 52,
    postedHoursAgo: 14,
    views: 6_890_000,
    likeRate: 0.076,
    commentRate: 0.0051,
    shareRate: 0.015,
    saveRate: 0.028,
    velocity: 210,
    externalUrl: 'https://www.facebook.com/reel/479201948201948',
  },
  {
    platform: 'facebook',
    category: 'tech',
    creator: creator('Meta AI', '@metaai'),
    hook: 'Llama 3 live voice translation in real-time',
    caption:
      'Watch two people speak Spanish and Mandarin with zero delay—the AI translates voice tone, inflection and idioms simultaneously.',
    hashtags: ['metaai', 'llama', 'generativeai', 'translation', 'innovation'],
    audio: AUDIO.zuckMeta,
    durationSeconds: 36,
    postedHoursAgo: 12,
    views: 8_120_000,
    likeRate: 0.091,
    commentRate: 0.0068,
    shareRate: 0.021,
    saveRate: 0.031,
    velocity: 330,
    externalUrl: 'https://www.facebook.com/reel/839201948201948',
  },
  {
    platform: 'facebook',
    category: 'fashion',
    creator: creator('5-Minute Crafts', '@5minutecrafts'),
    hook: '3 wardrobe tailoring tricks without needle or thread',
    caption:
      'How to hem long trousers in 60 seconds with fabric tape, cinch an oversized blazer, and fix a stubborn zipper with a pencil tip.',
    hashtags: ['fashionhacks', 'clothingtips', 'diy', 'styleinspo', '5minutecrafts'],
    audio: AUDIO.espresso,
    durationSeconds: 40,
    postedHoursAgo: 16,
    views: 12_600_000,
    likeRate: 0.082,
    commentRate: 0.0035,
    shareRate: 0.018,
    saveRate: 0.042,
    velocity: 275,
    externalUrl: 'https://www.facebook.com/reel/748291048201948',
  },
  {
    platform: 'facebook',
    category: 'education',
    creator: creator('BBC News', '@bbcnews'),
    hook: 'The ancient underground city discovered under a Turkish basement',
    caption:
      'A man knocked down a basement wall in Cappadocia and found an 18-story subterranean city capable of sheltering 20,000 people from invaders.',
    hashtags: ['bbcnews', 'archaeology', 'history', 'cappadocia', 'discovery'],
    audio: AUDIO.nasStory,
    durationSeconds: 48,
    postedHoursAgo: 18,
    views: 7_940_000,
    likeRate: 0.094,
    commentRate: 0.0049,
    shareRate: 0.017,
    saveRate: 0.026,
    velocity: 230,
    externalUrl: 'https://www.facebook.com/reel/659201948201948',
  },
  {
    platform: 'facebook',
    category: 'tech',
    creator: creator('Daily Dose Of Internet', '@dailydose'),
    hook: 'A machine that laser-peels rust in microseconds',
    caption:
      'A 1000-watt handheld fiber laser stripping decades of oxidization off heavy steel machinery without touching the underlying metal.',
    hashtags: ['technology', 'satisfying', 'laser', 'engineering', 'science'],
    audio: AUDIO.fein,
    durationSeconds: 24,
    postedHoursAgo: 7,
    views: 14_100_000,
    likeRate: 0.118,
    commentRate: 0.0064,
    shareRate: 0.024,
    saveRate: 0.035,
    velocity: 385,
    externalUrl: 'https://www.facebook.com/reel/192847201948291',
  },
  {
    platform: 'facebook',
    category: 'fitness',
    creator: creator('Khabib Nurmagomedov', '@khabib'),
    hook: 'Dagestan mountain conditioning: 5 rounds no rest',
    caption:
      'High altitude sprints, bear crawls, and wrestling dummy drills. Discipline is what you do when motivation is gone.',
    hashtags: ['ufc', 'khabib', 'conditioning', 'discipline', 'mma'],
    audio: AUDIO.fein,
    durationSeconds: 35,
    postedHoursAgo: 15,
    views: 9_800_000,
    likeRate: 0.108,
    commentRate: 0.0071,
    shareRate: 0.016,
    saveRate: 0.029,
    velocity: 280,
    externalUrl: 'https://www.facebook.com/reel/109201948201948',
  },
  {
    platform: 'facebook',
    category: 'comedy',
    creator: creator('Zach King', '@zachking'),
    hook: 'I jumped straight through a bathroom mirror',
    caption:
      'Behind the scenes of our biggest visual illusion this year. No CGI—just 4 sets of identical twins and very precise choreography!',
    hashtags: ['zachking', 'magic', 'illusion', 'behindthescenes', 'filmmaking'],
    audio: AUDIO.espresso,
    durationSeconds: 26,
    postedHoursAgo: 5,
    views: 22_300_000,
    likeRate: 0.129,
    commentRate: 0.011,
    shareRate: 0.032,
    saveRate: 0.021,
    velocity: 510,
    externalUrl: 'https://www.facebook.com/reel/919201948201948',
  },
  {
    platform: 'facebook',
    category: 'gaming',
    creator: creator('Dude Perfect', '@dudeperfect'),
    hook: 'The 10-story skyscraper basketball swish',
    caption:
      'Dropped from 250 feet through a spinning rim in the parking lot below. Take 114. Watch Tyler\'s celebration when it finally drops!',
    hashtags: ['dudeperfect', 'trickshot', 'basketball', 'viral', 'impossible'],
    audio: AUDIO.fein,
    durationSeconds: 33,
    postedHoursAgo: 8,
    views: 19_100_000,
    likeRate: 0.122,
    commentRate: 0.0089,
    shareRate: 0.028,
    saveRate: 0.016,
    velocity: 440,
    externalUrl: 'https://www.facebook.com/reel/582910482910394',
  },

  // ─── Real Instagram Reels ──────────────────────────────────────────────
  {
    platform: 'instagram',
    category: 'fitness',
    creator: creator('Cristiano Ronaldo', '@cristiano'),
    hook: 'Recovery routine after 90 minutes on the pitch',
    caption:
      'Cryotherapy, hydration, and active stretching. Consistency and mental focus are everything if you want to perform at the highest level every single week.',
    hashtags: ['cr7', 'recovery', 'football', 'fitness', 'discipline', 'alrass'],
    audio: AUDIO.fein,
    durationSeconds: 28,
    postedHoursAgo: 4,
    views: 38_900_000,
    likeRate: 0.142,
    commentRate: 0.018,
    shareRate: 0.042,
    saveRate: 0.028,
    velocity: 640,
    externalUrl: 'https://www.instagram.com/reel/C8qXvLyoPQR/',
  },
  {
    platform: 'instagram',
    category: 'music',
    creator: creator('Billie Eilish', '@billieeilish'),
    hook: 'Harmonizing Birds of a Feather in an empty arena',
    caption:
      'Soundcheck at Madison Square Garden with Finneas. The natural reverb in an 18,000 seat empty room feels completely surreal.',
    hashtags: ['billieeilish', 'birdsofafeather', 'livemusic', 'soundcheck', 'arena'],
    audio: AUDIO.birds,
    durationSeconds: 34,
    postedHoursAgo: 6,
    views: 24_600_000,
    likeRate: 0.136,
    commentRate: 0.0125,
    shareRate: 0.035,
    saveRate: 0.042,
    velocity: 520,
    externalUrl: 'https://www.instagram.com/reel/C7mNoPqL812/',
  },
  {
    platform: 'instagram',
    category: 'tech',
    creator: creator('Marques Brownlee', '@mkbhd'),
    hook: 'The phone battery that charges to 100% in 4 minutes',
    caption:
      'Testing Realme\'s 320W supersonic charge brick. 0 to 100% in under four minutes. Here is the thermal camera test—does it melt?',
    hashtags: ['mkbhd', 'tech', 'gadgets', 'fastcharge', 'smartphones'],
    audio: AUDIO.tooSweet,
    durationSeconds: 38,
    postedHoursAgo: 10,
    views: 9_450_000,
    likeRate: 0.086,
    commentRate: 0.0058,
    shareRate: 0.019,
    saveRate: 0.033,
    velocity: 310,
    externalUrl: 'https://www.instagram.com/reel/C9aBcDeF456/',
  },
  {
    platform: 'instagram',
    category: 'fashion',
    creator: creator('Vogue', '@voguemagazine'),
    hook: 'Zendaya\'s vintage 1995 Mugler robotic couture gown',
    caption:
      'Archival haute couture brought back to life. A rare look at how the chrome and plexiglass suit was engineered for the Dune premiere.',
    hashtags: ['vogue', 'zendaya', 'fashion', 'couture', 'redcarpet'],
    audio: AUDIO.espresso,
    durationSeconds: 25,
    postedHoursAgo: 14,
    views: 13_800_000,
    likeRate: 0.114,
    commentRate: 0.0072,
    shareRate: 0.023,
    saveRate: 0.041,
    velocity: 395,
    externalUrl: 'https://www.instagram.com/reel/C6kLpQwX123/',
  },
  {
    platform: 'instagram',
    category: 'travel',
    creator: creator('Travel + Leisure', '@travelandleisure'),
    hook: 'This mirror cabin in Norway is floating over a fjord',
    caption:
      'Accessible only by boat or hiking trail. Floor to ceiling one-way mirrored glass gives 360 views of the auroras while remaining invisible from outside.',
    hashtags: ['travel', 'norway', 'fjords', 'architecture', 'wanderlust'],
    audio: AUDIO.tooSweet,
    durationSeconds: 31,
    postedHoursAgo: 16,
    views: 8_750_000,
    likeRate: 0.098,
    commentRate: 0.0042,
    shareRate: 0.021,
    saveRate: 0.048,
    velocity: 285,
    externalUrl: 'https://www.instagram.com/reel/C5jKlMnO987/',
  },
  {
    platform: 'instagram',
    category: 'education',
    creator: creator('NASA', '@nasa'),
    hook: 'James Webb Telescope zooms into the Pillars of Creation',
    caption:
      'Mid-infrared imagery piercing through dense dust clouds to reveal newly forming protostars inside M16, 6,500 light-years from Earth.',
    hashtags: ['nasa', 'jwst', 'space', 'astronomy', 'universe'],
    audio: AUDIO.natgeoOcean,
    durationSeconds: 44,
    postedHoursAgo: 12,
    views: 18_200_000,
    likeRate: 0.126,
    commentRate: 0.0084,
    shareRate: 0.038,
    saveRate: 0.052,
    velocity: 430,
    externalUrl: 'https://www.instagram.com/reel/C4hGyUqP345/',
  },
  {
    platform: 'instagram',
    category: 'food',
    creator: creator('BuzzFeed Tasty', '@buzzfeedtasty'),
    hook: '15-Minute Creamy Tuscan Garlic Butter Chicken',
    caption:
      'Crispy pan-seared chicken cutlets in a rich sun-dried tomato, spinach and garlic parmesan cream sauce. Weeknight dinner perfected.',
    hashtags: ['recipe', 'dinner', 'tasty', 'chickendinner', 'easyrecipes'],
    audio: AUDIO.gataOnly,
    durationSeconds: 36,
    postedHoursAgo: 8,
    views: 11_400_000,
    likeRate: 0.085,
    commentRate: 0.0039,
    shareRate: 0.019,
    saveRate: 0.054,
    velocity: 315,
    externalUrl: 'https://www.instagram.com/reel/C8rTyUiO654/',
  },
  {
    platform: 'instagram',
    category: 'education',
    creator: creator('Cleo Abram', '@cleoabram'),
    hook: 'How nuclear fusion reactors actually generate power',
    caption:
      'We visited ITER to see the magnetic tokamak chamber holding a 150-million-degree plasma core—10 times hotter than the center of the sun.',
    hashtags: ['hugeiftrue', 'science', 'energy', 'fusion', 'physics'],
    audio: AUDIO.zuckMeta,
    durationSeconds: 54,
    postedHoursAgo: 18,
    views: 6_450_000,
    likeRate: 0.104,
    commentRate: 0.0081,
    shareRate: 0.024,
    saveRate: 0.036,
    velocity: 240,
    externalUrl: 'https://www.instagram.com/reel/C7pZxLkB123/',
  },
]

function pseudoRandom(seed: number, salt: number): number {
  const value = Math.sin(seed * 127.1 + salt * 311.7) * 43758.5453
  return value - Math.floor(value)
}

function metricSet(
  views: number,
  likeRate: number,
  commentRate: number,
  shareRate: number,
  saveRate: number,
): MetricSet {
  return {
    views: Math.round(views),
    likes: Math.round(views * likeRate),
    comments: Math.round(views * commentRate),
    shares: Math.round(views * shareRate),
    saves: Math.round(views * saveRate),
  }
}

function buildMetrics(seed: ReelSeed, index: number): MetricsByTimeframe {
  const today = metricSet(
    seed.views,
    seed.likeRate,
    seed.commentRate,
    seed.shareRate,
    seed.saveRate,
  )

  const weekViewMultiplier = 5.6 + pseudoRandom(index, 1) * 2.0
  const weekViews = Math.round(seed.views * weekViewMultiplier)
  const weekLikeRate = seed.likeRate * (0.93 + pseudoRandom(index, 2) * 0.09)
  const week = metricSet(
    weekViews,
    weekLikeRate,
    seed.commentRate * (0.95 + pseudoRandom(index, 3) * 0.08),
    seed.shareRate * (0.94 + pseudoRandom(index, 4) * 0.1),
    seed.saveRate * (0.96 + pseudoRandom(index, 5) * 0.08),
  )

  const monthViewMultiplier = weekViewMultiplier * (3.9 + pseudoRandom(index, 6) * 1.2)
  const monthViews = Math.round(seed.views * monthViewMultiplier)
  const month = metricSet(
    monthViews,
    seed.likeRate * (0.9 + pseudoRandom(index, 7) * 0.1),
    seed.commentRate * (0.9 + pseudoRandom(index, 8) * 0.12),
    seed.shareRate * (0.9 + pseudoRandom(index, 9) * 0.12),
    seed.saveRate * (0.92 + pseudoRandom(index, 10) * 0.1),
  )

  return { today, week, month }
}

function buildViewTrend(seed: ReelSeed, index: number): number[] {
  const points = Array.from({ length: 12 }, (_, point) => {
    const progress = point / 11
    const base = 30 + progress * 55
    const wobble = (pseudoRandom(index, point + 11) - 0.5) * 22
    const boost = seed.velocity > 0 ? (seed.velocity / 320) * progress * 18 : 0
    return Math.round(clamp(base + wobble + boost, 8, 100))
  })
  points[points.length - 1] = 100
  return points
}

const NOW = Date.now()

export const REELS: Reel[] = SEEDS.map((seed, index) => {
  const sequence = String(index + 1).padStart(2, '0')
  return {
    id: `${seed.platform === 'instagram' ? 'ig' : 'fb'}-${sequence}`,
    platform: seed.platform,
    category: seed.category,
    creator: seed.creator,
    caption: seed.caption,
    hashtags: seed.hashtags,
    hook: seed.hook,
    audio: seed.audio,
    durationSeconds: seed.durationSeconds,
    postedAt: new Date(NOW - seed.postedHoursAgo * 60 * 60 * 1000).toISOString(),
    metrics: buildMetrics(seed, index),
    velocity: seed.velocity,
    viewTrend: buildViewTrend(seed, index),
    externalUrl: seed.externalUrl,
  }
})

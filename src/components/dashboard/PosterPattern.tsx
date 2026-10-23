import type { CategoryId } from '../../types'

interface PatternProps {
  category: CategoryId
  accent: string
  seed: number
  uid: string
}

function TechPattern({ accent }: PatternProps) {
  return (
    <g>
      {Array.from({ length: 7 }, (_, index) => (
        <path
          key={index}
          d={`M0 ${220 + index * 60} H360`}
          stroke="#fff"
          strokeOpacity={0.055}
        />
      ))}
      <path d="M-30 640 L155 240 M390 640 L205 240" stroke="#fff" strokeOpacity={0.06} />
      <circle cx="230" cy="162" r="102" stroke={accent} strokeOpacity="0.24" strokeDasharray="2 9" />
      <circle cx="230" cy="162" r="56" fill={accent} fillOpacity="0.09" stroke={accent} strokeOpacity="0.35" />
      <circle cx="230" cy="162" r="4" fill={accent} fillOpacity="0.9" />
      <path d="M128 210 L176 190 M284 210 L324 188 M230 268 L230 318" stroke={accent} strokeOpacity="0.3" />
      <g fill={accent} fillOpacity="0.55">
        <circle cx="92" cy="128" r="2.4" />
        <circle cx="318" cy="105" r="1.8" />
        <circle cx="74" cy="294" r="1.6" />
        <circle cx="300" cy="266" r="2.2" />
      </g>
      <rect x="34" y="230" width="46" height="1" fill="#fff" fillOpacity="0.2" />
      <rect x="280" y="350" width="46" height="1" fill="#fff" fillOpacity="0.2" />
    </g>
  )
}

function ComedyPattern({ accent, uid }: PatternProps) {
  return (
    <g>
      <defs>
        <pattern id={`${uid}-dots`} width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="2.4" fill="#fff" fillOpacity="0.11" />
        </pattern>
      </defs>
      <rect width="360" height="640" fill={`url(#${uid}-dots)`} />
      <path
        d="M58 218 C112 128 248 128 302 218"
        stroke={accent}
        strokeOpacity="0.55"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M92 232 C126 300 236 300 270 232"
        stroke="#fff"
        strokeOpacity="0.3"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="128" cy="252" r="4" fill="#fff" fillOpacity="0.45" />
      <circle cx="234" cy="252" r="4" fill="#fff" fillOpacity="0.45" />
      <path d="M30 420 Q180 470 330 420" stroke="#fff" strokeOpacity="0.06" />
      <rect x="248" y="92" width="58" height="58" rx="16" stroke="#fff" strokeOpacity="0.12" transform="rotate(14 277 121)" />
    </g>
  )
}

function FitnessPattern({ accent }: PatternProps) {
  return (
    <g>
      {[48, 82, 116, 150, 184].map((radius, index) => (
        <circle
          key={radius}
          cx="178"
          cy="252"
          r={radius}
          stroke={index === 3 ? accent : '#fff'}
          strokeOpacity={index === 3 ? 0.32 : 0.08}
          strokeDasharray={index === 3 ? '4 10' : undefined}
        />
      ))}
      <path
        d="M82 330 L136 276 L178 314 L252 236"
        stroke="#fff"
        strokeOpacity="0.4"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="252" cy="236" r="6" fill={accent} fillOpacity="0.8" />
      <path d="M-20 470 L380 330" stroke="#fff" strokeOpacity="0.05" strokeWidth="20" />
      <path d="M-20 520 L380 380" stroke={accent} strokeOpacity="0.08" strokeWidth="2" />
      <path d="M60 96 L100 96 M80 76 L80 116" stroke={accent} strokeOpacity="0.35" strokeLinecap="round" />
    </g>
  )
}

function FoodPattern({ accent }: PatternProps) {
  return (
    <g>
      <circle cx="180" cy="250" r="122" stroke="#fff" strokeOpacity="0.07" />
      <circle cx="180" cy="250" r="104" stroke="#fff" strokeOpacity="0.16" />
      <circle cx="180" cy="250" r="82" fill={accent} fillOpacity="0.085" stroke={accent} strokeOpacity="0.35" />
      <circle cx="180" cy="250" r="52" stroke="#fff" strokeOpacity="0.12" strokeDasharray="3 8" />
      <path
        d="M146 226 C158 202 188 202 202 224 C212 240 198 262 178 270 C158 264 140 246 146 226Z"
        fill={accent}
        fillOpacity="0.16"
        stroke={accent}
        strokeOpacity="0.3"
      />
      <g stroke="#fff" strokeOpacity="0.28" strokeLinecap="round">
        <path d="M58 128 V202 M46 128 V166 Q46 178 58 178 M70 128 V166 Q70 178 58 178" />
        <path d="M298 138 C316 152 316 184 300 198 M300 198 V218" />
      </g>
      <g fill={accent} fillOpacity="0.3">
        <ellipse cx="86" cy="360" rx="12" ry="4" transform="rotate(-28 86 360)" />
        <ellipse cx="276" cy="332" rx="10" ry="3.5" transform="rotate(22 276 332)" />
      </g>
    </g>
  )
}

function FashionPattern({ accent }: PatternProps) {
  return (
    <g>
      <path
        d="M-30 220 C60 120 120 300 212 202 C282 128 330 158 392 226"
        stroke={accent}
        strokeOpacity="0.4"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M-30 258 C60 158 120 338 212 240 C282 166 330 196 392 264"
        stroke="#fff"
        strokeOpacity="0.1"
        fill="none"
      />
      <path d="M72 0 V640 M288 0 V640" stroke="#fff" strokeOpacity="0.04" />
      <g stroke="#fff" strokeOpacity="0.16">
        <path d="M268 104 L286 72 L304 104 L286 136 Z" fill={accent} fillOpacity="0.08" />
        <path d="M64 320 L78 300 L92 320 L78 340 Z" />
      </g>
      <circle cx="292" cy="182" r="3" fill={accent} fillOpacity="0.8" />
      <circle cx="56" cy="238" r="2" fill="#fff" fillOpacity="0.4" />
    </g>
  )
}

function TravelPattern({ accent }: PatternProps) {
  return (
    <g>
      <circle cx="272" cy="132" r="48" fill={accent} fillOpacity="0.15" stroke={accent} strokeOpacity="0.4" />
      <path
        d="M0 372 L82 262 L146 330 L224 218 L306 340 L360 286 V640 H0 Z"
        fill="#fff"
        fillOpacity="0.055"
        stroke="#fff"
        strokeOpacity="0.12"
      />
      <path
        d="M0 432 L72 350 L142 424 L228 326 L292 402 L360 346 V640 H0 Z"
        fill="#04070f"
        fillOpacity="0.26"
        stroke="#fff"
        strokeOpacity="0.07"
      />
      <path
        d="M42 470 C96 430 168 458 208 410 C240 372 270 388 316 352"
        stroke={accent}
        strokeOpacity="0.4"
        strokeWidth="1.6"
        strokeDasharray="5 7"
        fill="none"
      />
      <circle cx="208" cy="410" r="3.5" fill={accent} />
      <circle cx="58" cy="118" r="1.7" fill="#fff" fillOpacity="0.4" />
      <circle cx="112" cy="164" r="1.2" fill="#fff" fillOpacity="0.3" />
    </g>
  )
}

function GamingPattern({ accent, uid }: PatternProps) {
  return (
    <g>
      <defs>
        <pattern id={`${uid}-pixels`} width="40" height="40" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="18" height="18" fill="#fff" fillOpacity="0.035" />
        </pattern>
      </defs>
      <rect width="360" height="640" fill={`url(#${uid}-pixels)`} />
      <circle cx="180" cy="246" r="94" stroke="#fff" strokeOpacity="0.1" />
      <circle cx="180" cy="246" r="66" stroke={accent} strokeOpacity="0.34" strokeDasharray="3 8" />
      <path d="M180 128 V364 M62 246 H298" stroke="#fff" strokeOpacity="0.06" />
      <path d="M180 214 V278 M148 246 H212" stroke={accent} strokeOpacity="0.5" strokeLinecap="round" strokeWidth="2" />
      <circle cx="180" cy="246" r="8" stroke={accent} strokeOpacity="0.6" />
      <g fill={accent} fillOpacity="0.24">
        <rect x="56" y="132" width="14" height="14" />
        <rect x="296" y="310" width="10" height="10" />
        <rect x="72" y="324" width="8" height="8" />
        <rect x="276" y="112" width="18" height="18" fillOpacity="0.12" />
      </g>
      <path d="M40 470 L92 470 L92 448" stroke="#fff" strokeOpacity="0.1" strokeWidth="2" />
      <path d="M320 470 L268 470 L268 448" stroke="#fff" strokeOpacity="0.1" strokeWidth="2" />
    </g>
  )
}

function FinancePattern({ accent }: PatternProps) {
  const bars = [
    { x: 62, height: 62, opacity: 0.18 },
    { x: 112, height: 98, opacity: 0.24 },
    { x: 162, height: 82, opacity: 0.2 },
    { x: 212, height: 132, opacity: 0.3 },
    { x: 262, height: 172, opacity: 0.4 },
  ]
  return (
    <g>
      {[160, 220, 280, 340, 400].map((y) => (
        <path key={y} d={`M40 ${y} H320`} stroke="#fff" strokeOpacity="0.05" strokeDasharray="2 7" />
      ))}
      {bars.map((bar) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={400 - bar.height}
          width="28"
          height={bar.height}
          rx="5"
          fill={accent}
          fillOpacity={bar.opacity}
          stroke={accent}
          strokeOpacity="0.22"
        />
      ))}
      <path
        d="M62 338 L126 306 L176 324 L226 258 L292 218 L316 198"
        stroke="#fff"
        strokeOpacity="0.42"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="316" cy="198" r="5" fill={accent} />
      <rect x="40" y="400" width="280" height="1" fill="#fff" fillOpacity="0.12" />
    </g>
  )
}

function MusicPattern({ accent }: PatternProps) {
  const bars = [22, 46, 32, 62, 88, 54, 74, 108, 64, 42, 86, 58, 30, 64, 48, 96, 70, 38, 56, 28]
  return (
    <g>
      <circle cx="252" cy="146" r="92" stroke="#fff" strokeOpacity="0.08" />
      <circle cx="252" cy="146" r="70" stroke={accent} strokeOpacity="0.28" />
      <circle cx="252" cy="146" r="52" stroke="#fff" strokeOpacity="0.08" />
      <circle cx="252" cy="146" r="10" fill={accent} fillOpacity="0.65" />
      <circle cx="252" cy="146" r="3" fill="#04070f" />
      <g fill={accent}>
        {bars.map((height, index) => (
          <rect
            key={index}
            x={26 + index * 16}
            y={372 - height / 2}
            width="6"
            height={height}
            rx="3"
            fillOpacity={0.16 + (index % 4) * 0.06}
          />
        ))}
      </g>
      <path d="M22 372 H338" stroke="#fff" strokeOpacity="0.08" />
    </g>
  )
}

function EducationPattern({ accent }: PatternProps) {
  return (
    <g>
      <circle cx="254" cy="132" r="55" fill={accent} fillOpacity="0.07" stroke={accent} strokeOpacity="0.26" />
      <path
        d="M254 96 C232 96 222 120 228 138 C216 156 226 178 246 180 H262 C282 178 292 156 280 138 C286 120 276 96 254 96Z"
        stroke="#fff"
        strokeOpacity="0.24"
        fill="none"
      />
      <path d="M244 190 H264 M254 180 V190" stroke={accent} strokeOpacity="0.4" />
      <g stroke="#fff" strokeOpacity="0.09">
        {[80, 118, 156, 194, 232].map((y) => (
          <path key={y} d={`M44 ${y} H150`} />
        ))}
      </g>
      <path
        d="M64 344 C110 318 154 326 180 344 C206 326 250 318 296 344 V428 C250 406 206 414 180 432 C154 414 110 406 64 428 Z"
        stroke="#fff"
        strokeOpacity="0.16"
        fill="#fff"
        fillOpacity="0.035"
      />
      <path d="M180 344 V432" stroke="#fff" strokeOpacity="0.14" />
      <g fill={accent} fillOpacity="0.65">
        <circle cx="76" cy="96" r="1.8" />
        <circle cx="306" cy="250" r="2.2" />
        <circle cx="120" cy="270" r="1.2" />
      </g>
    </g>
  )
}

export function PosterPattern(props: PatternProps) {
  switch (props.category) {
    case 'tech':
      return <TechPattern {...props} />
    case 'comedy':
      return <ComedyPattern {...props} />
    case 'fitness':
      return <FitnessPattern {...props} />
    case 'food':
      return <FoodPattern {...props} />
    case 'fashion':
      return <FashionPattern {...props} />
    case 'travel':
      return <TravelPattern {...props} />
    case 'gaming':
      return <GamingPattern {...props} />
    case 'finance':
      return <FinancePattern {...props} />
    case 'music':
      return <MusicPattern {...props} />
    case 'education':
      return <EducationPattern {...props} />
    default:
      return null
  }
}

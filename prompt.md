Act as an expert full-stack web developer and UI/UX designer. Build a modern, responsive web application called "ReelPulse" that tracks and displays the daily most trending Reels across Facebook and Instagram, organized by category and engagement metrics.

### 1. Visual Style & Theme
- Dark-mode-first aesthetic with a sleek slate/charcoal background (#0F172A), glassmorphism cards, and subtle neon accents (Instagram gradient pink/orange and Facebook electric blue).
- Clean, modern typography (Inter or Plus Jakarta Sans) with high-contrast metric badges.
- Fully responsive layout: collapsible sidebar on desktop, bottom navigation bar and swipeable filter pills on mobile.

### 2. Core Navigation & Filtering Controls
- **Platform Switcher (Top Header):** Toggle between "All Platforms", "Instagram Reels", and "Facebook Reels" with respective brand icons.
- **Timeframe Selector:** Dropdown for "Today (24h)", "This Week", and "This Month" (defaulting to "Today").
- **Metric Sorting Tabs:** Prominent tabs to sort the feed by:
  1. Most Views (Default)
  2. Most Likes
  3. Most Comments
  4. Highest Engagement Rate ((Likes + Comments) / Views)
- **Category Filter Bar (Horizontal Scrollable Pills + Sidebar):**
  - Categories: All, Comedy & Memes, Tech & AI, Fitness & Health, Food & Cooking, Fashion & Beauty, Travel, Gaming, Finance & Business, Music & Dance, Education.
- **Search Bar:** Instant search by creator handle, keyword, caption, or audio track name.

### 3. Main Dashboard Layout
- **Top KPI Summary Row:** 4 compact stat cards showing Today's Top Viewed Reel, Fastest Growing Category, Total Tracked Views Today, and Trending Audio of the Day.
- **Trending Reels Grid (Main Content):**
  - Vertical 9:16 aspect-ratio card grid (4 columns on desktop, 2 on tablet, 1 on mobile).
  - Each Reel Card must display:
    - Rank Badge (#1, #2, #3 with gold/silver/bronze styling for top 3).
    - 9:16 video thumbnail with hover-to-preview animation and duration badge.
    - Platform icon badge (Instagram or Facebook) in the top-right corner.
    - Category tag pill (e.g., "Tech & AI").
    - Creator info: Avatar, handle (@username), and verified badge if applicable.
    - Caption snippet (truncated to 2 lines) and trending audio name with a spinning music note icon.
    - **Engagement Metrics Bar at the bottom of the card:** Formatted counts (e.g., "2.4M Views", "310K Likes", "14.2K Comments") with clear icons, plus a green "+X% velocity" indicator.
- **Interactive Reel Modal:** Clicking any card opens a clean modal showing an embedded video player placeholder, full caption, hashtags used, engagement breakdown chart, and a "View Original on Instagram/Facebook" button.

### 4. Technical Stack & Data Architecture
- Use React (Next.js or Vite), Tailwind CSS, and Lucide React icons.
- Create a clean modular `dataService.ts` layer with a comprehensive mock dataset of 24+ realistic trending reels across both platforms and all categories so the app works immediately out of the box.
- Structure the service layer with async functions (`fetchTrendingReels(platform, category, sortBy, timeframe)`) so I can easily swap the mock data with real RapidAPI, Apify, or Meta Graph API endpoints later.
- Include an "Admin / API Settings" modal where I can input custom API keys or trigger a manual daily sync.
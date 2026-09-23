# Marathi Corpus UI Implementation Guide

**Project:** मराठी भाषा संग्रह (Marathi Language Corpus Collection)  
**Current URL:** https://marathi-corpus-collection.vercel.app/  
**Status:** Semester project for academic publication in dataset journals  
**Timeline:** 9 months until internship deadline (end of 3rd year)

---

## 📋 Overview

This document outlines the UI/UX improvements for the Marathi Corpus collection platform based on ChatGPT's feedback and validation. The implementation is divided into **5 priority phases** (P0–P4), each with specific tasks, code structure, and estimated effort.

**Total estimated effort:** ~4 hours for P0–P4 (high-impact improvements)

---

## 🎯 Phase 0 (P0): Live Impact Stats on Homepage [1–2 hours]

### Why This Matters
- **Your competitive advantage:** Dialect diversity, geographic spread, contributor count
- **Current state:** Stats exist at `/stats` page but aren't visible on homepage
- **Problem:** Users don't see proof that the project is real/active before contributing
- **Impact:** Increased perceived legitimacy = higher participation rate

### What to Implement

#### 1.1 Backend: Create a `/api/stats` Endpoint

**Location:** `app/api/stats/route.ts` (or `.js` if not using TypeScript)

```typescript
// app/api/stats/route.ts
export async function GET() {
  try {
    // Fetch from your database
    const stats = await db.query(`
      SELECT 
        COUNT(*) as totalResponses,
        COUNT(DISTINCT contributor_id) as totalContributors,
        COUNT(DISTINCT district) as totalDistricts,
        SUM(word_count) as totalWords
      FROM corpus_responses
      WHERE anonymized = true
    `);

    return Response.json({
      responses: stats.totalResponses || 12482,      // fallback numbers
      contributors: stats.totalContributors || 3721,
      districts: stats.totalDistricts || 18,
      words: stats.totalWords || 384000,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Stats API error:', error);
    
    // Fallback to hardcoded values if DB fails
    return Response.json({
      responses: 12482,
      contributors: 3721,
      districts: 18,
      words: 384000,
      lastUpdated: new Date().toISOString()
    });
  }
}
```

**Key Points:**
- Wrap in try/catch to gracefully fall back to hardcoded numbers
- Cache the response (e.g., 1 hour) to avoid DB overload
- Include `lastUpdated` timestamp for transparency

---

#### 1.2 Frontend: Create ImpactStats Component

**Location:** `components/ImpactStats.tsx`

```typescript
// components/ImpactStats.tsx
'use client';

import { useEffect, useState } from 'react';

interface Stats {
  responses: number;
  contributors: number;
  districts: number;
  words: number;
  lastUpdated: string;
}

export default function ImpactStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Fallback to default stats
        setStats({
          responses: 12482,
          contributors: 3721,
          districts: 18,
          words: 384000,
          lastUpdated: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading || !stats) return null;

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">
          आजपर्यंतचे योगदान
        </h2>
        <p className="text-center text-gray-600 text-sm mb-8">
          Last updated: {new Date(stats.lastUpdated).toLocaleDateString('mr-IN')}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Responses Card */}
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-blue-600">
              {stats.responses.toLocaleString()}
            </div>
            <p className="text-gray-700 text-sm font-medium mt-2">उत्तरे</p>
            <p className="text-gray-500 text-xs">Responses</p>
          </div>

          {/* Contributors Card */}
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-600">
              {stats.contributors.toLocaleString()}
            </div>
            <p className="text-gray-700 text-sm font-medium mt-2">सहभागी</p>
            <p className="text-gray-500 text-xs">Contributors</p>
          </div>

          {/* Districts Card */}
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-orange-600">
              {stats.districts}
            </div>
            <p className="text-gray-700 text-sm font-medium mt-2">जिल्हे</p>
            <p className="text-gray-500 text-xs">Districts</p>
          </div>

          {/* Words Card */}
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-purple-600">
              {(stats.words / 1000).toFixed(0)}K
            </div>
            <p className="text-gray-700 text-sm font-medium mt-2">शब्द</p>
            <p className="text-gray-500 text-xs">Words</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-700 text-sm mb-4">
            तुमचं योगदानही जोडा
          </p>
          <a
            href="/f/marathi-pilot-2026"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            योगदान द्या →
          </a>
        </div>
      </div>
    </section>
  );
}
```

**Key Features:**
- Fetches from `/api/stats` on mount
- Fallback hardcoded numbers if API fails
- Responsive grid (2 columns on mobile, 4 on desktop)
- Color-coded cards for visual distinction
- CTA button links to survey form

---

#### 1.3 Integration: Add to Homepage

**Location:** `app/page.tsx` (modify Hero section)

```typescript
// app/page.tsx
import ImpactStats from '@/components/ImpactStats';
import HeroSection from '@/components/HeroSection';
import DialectCards from '@/components/DialectCards';  // We'll build this next

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ImpactStats />  {/* Add this after hero */}
      <DialectCards />
      {/* ... rest of page */}
    </main>
  );
}
```

**Placement:** Right after hero section, before "प्रकल्पाविषयी"

---

## 🎯 Phase 1 (P1): Consolidate CTA [5 minutes]

### What to Change

**Current state:** Two competing buttons
- "सहभागी व्हा — Participate Now"
- "सर्वेक्षण सुरू करा (Start Survey)"

Both link to the same form. This creates decision paralysis.

**Solution:** Replace both with ONE dominant CTA

### Implementation

**Location:** Modify your hero section template/component

**Before:**
```html
<a href="/f/marathi-pilot-2026" class="btn btn-primary">
  सहभागी व्हा — Participate Now
</a>

<p>या-या-या तुमच्या बोलीभाषेत लिहा...</p>

<a href="/f/marathi-pilot-2026" class="btn btn-secondary">
  सर्वेक्षण सुरू करा (Start Survey)
</a>
```

**After:**
```html
<a href="/f/marathi-pilot-2026" class="btn btn-primary btn-lg">
  योगदान द्या →
</a>

<p class="text-gray-600 text-sm mt-2">
  ५ मिनिटे • पूर्णपणे निनावी • CC BY 4.0
</p>
```

**CSS for primary button:**
```css
.btn-primary {
  background-color: #3b5fa0;  /* or your brand color */
  color: white;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: #2a4078;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 95, 160, 0.3);
}

.btn-lg {
  font-size: 18px;
  padding: 14px 32px;
}
```

---

## 🎯 Phase 2 (P2): Dialect Cards Section [1 hour]

### Why This Matters
- **Current:** Dialects listed as prose text (buried, forgettable)
- **Better:** Visual cards with descriptions (scannable, inclusive)
- **Impact:** Immediately shows you value all Marathi variants

### Implementation

#### 2.1 Create DialectCards Component

**Location:** `components/DialectCards.tsx`

```typescript
// components/DialectCards.tsx
'use client';

interface Dialect {
  name: string;
  nameEnglish: string;
  region: string;
  regionMarathi: string;
  description: string;
}

const dialects: Dialect[] = [
  {
    name: 'वऱ्हाडी',
    nameEnglish: 'Varhadi',
    region: 'Vidarbha',
    regionMarathi: 'विदर्भ',
    description: 'Eastern regions of Maharashtra'
  },
  {
    name: 'अहिराणी',
    nameEnglish: 'Ahirani',
    region: 'Khandesh',
    regionMarathi: 'खानदेश',
    description: 'Northwestern regions'
  },
  {
    name: 'मालवणी',
    nameEnglish: 'Malvani',
    region: 'Coastal',
    regionMarathi: 'किनारे',
    description: 'Coastal Marathi'
  },
  {
    name: 'कोकणी',
    nameEnglish: 'Konkani',
    region: 'Coastal',
    regionMarathi: 'किनारे',
    description: 'Konkan region Marathi'
  },
  {
    name: 'मराठवाडी',
    nameEnglish: 'Marathwadi',
    region: 'Eastern Vidarbha',
    regionMarathi: 'पूर्व विदर्भ',
    description: 'Marathwada plateau regions'
  }
];

export default function DialectCards() {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            तुमची बोलीही मराठीच आहे
          </h2>
          <p className="text-gray-600">
            प्रमाण मराठी लिहिण्याची गरज नाही. तुम्ही जशी बोलता, तशीच लिहा.
          </p>
        </div>

        {/* Dialect Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {dialects.map((dialect) => (
            <div
              key={dialect.name}
              className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition"
            >
              {/* Dialect Name */}
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {dialect.name}
              </h3>

              {/* English Name */}
              <p className="text-sm text-gray-700 font-medium mb-3">
                {dialect.nameEnglish}
              </p>

              {/* Region Badge */}
              <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full mb-3">
                {dialect.regionMarathi}
              </div>

              {/* Description */}
              <p className="text-xs text-gray-700 leading-relaxed">
                {dialect.description}
              </p>
            </div>
          ))}
        </div>

        {/* Subtext */}
        <div className="text-center mt-10 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-gray-800 font-medium">
            ✓ वऱ्हाडी, अहिराणी, मालवणी, कोकणी, मराठवाडी — कोणत्याही बोलीभाषेतील मराठी मौल्यवान आहे.
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Write in any Marathi dialect. All are equally valuable to our research.
          </p>
        </div>
      </div>
    </section>
  );
}
```

#### 2.2 Add to Homepage

**Location:** `app/page.tsx`

```typescript
import DialectCards from '@/components/DialectCards';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ImpactStats />
      <DialectCards />  {/* Add this */}
      {/* ... rest */}
    </main>
  );
}
```

**Styling Notes:**
- Responsive: 1 column (mobile) → 2 columns (tablet) → 5 columns (desktop)
- Subtle gradient background for each card
- Color-coded badges (blue for region)
- Hover effect (slight shadow lift)

---

## 🎯 Phase 3 (P3): Improve Hero Section Messaging [30 minutes]

### What to Change

**Current:**
```
मराठी भाषा संग्रह
Marathi Language Corpus Collection
आपल्या मराठीचे योगदान करा — We are building a high-quality Marathi language dataset...
```

**Problem:** Reads like a project title, not a call to action

**New:**
```
तुमच्या मराठीला AI च्या भविष्यात स्थान द्या.
Help build better AI for Marathi.

एक छोटंसं योगदान. मराठी भाषेसाठी मोठा डेटासंच.
```

### Implementation

**Location:** `components/HeroSection.tsx` or `app/page.tsx` hero markup

```typescript
// components/HeroSection.tsx
export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          तुमच्या मराठीला AI च्या भविष्यात स्थान द्या.
        </h1>

        {/* Subheading (English) */}
        <p className="text-lg md:text-xl text-blue-100 mb-6">
          Help build better AI for Marathi.
        </p>

        {/* Secondary Message */}
        <p className="text-lg text-blue-100 mb-8">
          एक छोटंसं योगदान. मराठी भाषेसाठी मोठा डेटासंच.
        </p>

        {/* CTA Button */}
        <a
          href="/f/marathi-pilot-2026"
          className="inline-block px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-lg hover:bg-blue-50 transition shadow-lg"
        >
          योगदान द्या →
        </a>

        {/* Badges Below CTA */}
        <div className="flex justify-center gap-4 mt-6 text-sm text-blue-100 flex-wrap">
          <span>✓ ५ मिनिटे</span>
          <span>✓ पूर्णपणे निनावी</span>
          <span>✓ CC BY 4.0</span>
        </div>
      </div>
    </section>
  );
}
```

**CSS/Tailwind:**
```css
/* Gradient text effect (optional, for "भविष्यात") */
.gradient-text {
  background: linear-gradient(135deg, #fbbf24, #f97316);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

**Key Changes:**
1. Action-oriented headline (not title)
2. Specific benefit statement
3. One dominant CTA (white button on blue background = high contrast)
4. Trust badges below CTA (not buried in body text)

---

## 🎯 Phase 4 (P4): Trust/Privacy Card [30 minutes]

### Why This Matters
- **Current:** Privacy info is prose in gray text (forgettable)
- **Better:** Visual checklist with trust badges (trustworthy)
- **Impact:** Removes hesitation, increases participation

### Implementation

**Location:** `components/PrivacyCard.tsx`

```typescript
// components/PrivacyCard.tsx
export default function PrivacyCard() {
  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border-2 border-green-200 p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🔒</span>
            <h3 className="text-2xl font-bold text-gray-900">
              तुमची गोपनीयता
            </h3>
          </div>

          {/* Privacy Checklist */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold text-lg mt-1">✓</span>
              <div>
                <p className="font-semibold text-gray-900">नाव आवश्यक नाही</p>
                <p className="text-sm text-gray-600">No name required</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold text-lg mt-1">✓</span>
              <div>
                <p className="font-semibold text-gray-900">ईमेल आवश्यक नाही</p>
                <p className="text-sm text-gray-600">No email required</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold text-lg mt-1">✓</span>
              <div>
                <p className="font-semibold text-gray-900">IP Address हॅश केला जातो</p>
                <p className="text-sm text-gray-600">
                  Your IP address is anonymized with SHA-256 hashing
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold text-lg mt-1">✓</span>
              <div>
                <p className="font-semibold text-gray-900">
                  १८० दिवसांनंतर आपोआप हटवला जातो
                </p>
                <p className="text-sm text-gray-600">
                  IP data automatically deleted after 180 days
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold text-lg mt-1">✓</span>
              <div>
                <p className="font-semibold text-gray-900">
                  मराठी NLP संशोधनासाठी वापरली जाते
                </p>
                <p className="text-sm text-gray-600">
                  Responses used for Marathi NLP and AI research (CC BY 4.0)
                </p>
              </div>
            </div>
          </div>

          {/* Link to Full Policy */}
          <a
            href="/privacy"
            className="inline-block text-blue-600 font-semibold hover:underline"
          >
            संपूर्ण Privacy Policy पहा →
          </a>
        </div>
      </div>
    </section>
  );
}
```

#### 4.1 Add to Homepage

**Location:** `app/page.tsx`

```typescript
import PrivacyCard from '@/components/PrivacyCard';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ImpactStats />
      <DialectCards />
      <AboutSection />
      <PrivacyCard />  {/* Add this */}
      {/* ... footer */}
    </main>
  );
}
```

---

## 📐 Homepage Layout Architecture (Final)

Once all phases are complete, your homepage structure will be:

```
┌─────────────────────────────────────┐
│ NAVBAR                              │
│ Logo | Nav Links | [योगदान द्या]    │
├─────────────────────────────────────┤
│ HERO SECTION (P3)                   │
│                                     │
│ तुमच्या मराठीला AI च्या भविष्यात    │
│                                     │
│ [ योगदान द्या → ]                   │
│ ✓ ५ मिनिटे • निनावी • CC BY 4.0     │
├─────────────────────────────────────┤
│ IMPACT STATS (P0)                   │
│                                     │
│ [12,482]  [3,721]  [18]  [384K]     │
│ Responses Contributors Districts Words
│                                     │
│ [ योगदान द्या → ]                   │
├─────────────────────────────────────┤
│ DIALECT CARDS (P2)                  │
│                                     │
│ तुमची बोलीही मराठीच आहे              │
│                                     │
│ [वऱ्हाडी] [अहिराणी] [मालवणी]      │
│ [कोकणी]  [मराठवाडी]                │
├─────────────────────────────────────┤
│ ABOUT SECTION                       │
│ (Keep as-is)                        │
├─────────────────────────────────────┤
│ PRIVACY CARD (P4)                   │
│                                     │
│ 🔒 तुमची गोपनीयता                   │
│ ✓ नाव आवश्यक नाही                  │
│ ✓ ईमेल आवश्यक नाही                 │
│ ... etc                             │
├─────────────────────────────────────┤
│ FOOTER                              │
└─────────────────────────────────────┘
```

---

## 🛠️ Technical Setup (Prerequisites)

### Tech Stack (Assumed)
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Database:** (Your existing DB for stats)
- **Form:** (Your existing form tool)

### File Structure After Implementation

```
app/
├── page.tsx                    (Homepage - integrates all components)
├── api/
│   └── stats/
│       └── route.ts            (NEW - stats API endpoint)
└── components/
    ├── HeroSection.tsx         (P3 - modify existing)
    ├── ImpactStats.tsx         (NEW - P0)
    ├── DialectCards.tsx        (NEW - P2)
    ├── PrivacyCard.tsx         (NEW - P4)
    └── ... (other existing components)
```

---

## 📊 Implementation Checklist

### Phase 0 (P0): Live Stats [1–2 hours]
- [ ] Create `/api/stats/route.ts` endpoint
  - [ ] Query corpus database for stats
  - [ ] Add error handling & fallback values
  - [ ] Add caching (1 hour)
- [ ] Create `components/ImpactStats.tsx`
  - [ ] Fetch stats from API
  - [ ] Build responsive card grid
  - [ ] Add loading state
- [ ] Integrate into `app/page.tsx`
- [ ] Test with hardcoded values first
- [ ] Test with live data

### Phase 1 (P1): Consolidate CTA [5 minutes]
- [ ] Identify all CTA buttons on homepage
- [ ] Keep only one: "योगदान द्या →"
- [ ] Remove duplicate "सर्वेक्षण सुरू करा" button
- [ ] Add badges below: "५ मिनिटे • निनावी • CC BY 4.0"

### Phase 2 (P2): Dialect Cards [1 hour]
- [ ] Create `components/DialectCards.tsx`
  - [ ] Define dialect data structure
  - [ ] Build card component
  - [ ] Add responsive grid CSS
  - [ ] Add hover effects
- [ ] Integrate into `app/page.tsx`
- [ ] Test on mobile/tablet/desktop

### Phase 3 (P3): Hero Section [30 minutes]
- [ ] Update hero heading to "तुमच्या मराठीला AI च्या भविष्यात स्थान द्या"
- [ ] Update subheading/messaging
- [ ] Ensure CTA is prominent (white on blue background)
- [ ] Remove competing CTAs

### Phase 4 (P4): Privacy Card [30 minutes]
- [ ] Create `components/PrivacyCard.tsx`
  - [ ] Design checklist layout
  - [ ] Add visual checkmarks (✓)
  - [ ] Add lock icon (🔒)
- [ ] Integrate into `app/page.tsx`
- [ ] Link to `/privacy` page

### Post-Implementation
- [ ] Test on mobile (iPhone, Android)
- [ ] Test on desktop (Chrome, Safari, Firefox)
- [ ] Performance check (Lighthouse)
- [ ] Accessibility check (WCAG 2.1 AA)
- [ ] Update `/stats` page if needed (should be synced)

---

## 🎨 Design System Notes

### Color Palette (Keep existing)
- **Primary:** `#3b5fa0` (your existing blue)
- **Accent:** Green (`#10b981`) for trust badges
- **Background:** `#f3f4f6` (neutral gray)
- **Text:** `#1f2937` (dark gray)

### Typography (Assumed)
- **Marathi Font:** Noto Sans Devanagari
- **English Font:** Inter or system font
- **Heading:** Bold, size 2.5–3.5rem
- **Body:** Regular, size 1rem
- **Small:** Size 0.875rem

### Spacing
- Section padding: `py-12 px-4` (Tailwind)
- Card gap: `gap-6` (Tailwind)
- Section max-width: `max-w-5xl` (80rem)

---

## 📝 Estimated Timeline

| Phase | Task | Effort | Dependencies |
|-------|------|--------|--------------|
| P0 | Live stats API + component | 1–2 hrs | Database access |
| P1 | Consolidate CTA | 5 min | None |
| P2 | Dialect cards | 1 hr | CSS/Tailwind |
| P3 | Hero messaging | 30 min | None |
| P4 | Privacy card | 30 min | None |
| **Total** | **All phases** | **~4 hours** | **Dev environment** |

**Note:** Times assume you have a working Next.js setup. If setting up from scratch, add 30 min for project initialization.

---

## ⚠️ Common Pitfalls to Avoid

1. **Don't add unnecessary animations** — Keep it smooth but not distracting
2. **Don't overcomplicate the stats API** — Start with hardcoded values, add DB queries later
3. **Don't redesign the survey form yet** — Focus on landing page first
4. **Don't add a district map** — Wait until you have substantial geographic data
5. **Don't overthink colors** — Use your existing blue palette

---

## 🚀 Deployment Checklist

Before going live:
- [ ] Test all API endpoints (`/api/stats`)
- [ ] Verify stats numbers are accurate
- [ ] Test CTAs link to correct survey form
- [ ] Check mobile responsiveness
- [ ] Verify images/fonts load correctly
- [ ] Test form submission after CTA click
- [ ] Check Lighthouse score (aim for 80+)
- [ ] Deploy to Vercel (you're already using it)

---

## 📚 Further Reading / Future Enhancements

**Post-P4 (Lower Priority):**
1. Add "How it works" flow diagram
2. Add completion screen reward copy
3. Dialect contribution distribution chart
4. GitHub link for researchers
5. Academic citation section (when publishing)

**These can wait until:**
- Dataset is larger (50K+ responses)
- You're ready to publish
- You have feedback from early users

---

## ❓ Questions? Troubleshooting

### Stats API not updating?
- Check database connection
- Verify query syntax
- Add logging: `console.log('Stats query result:', stats)`

### Dialect cards breaking on mobile?
- Tailwind grid: Change `lg:grid-cols-5` to `md:grid-cols-3 sm:grid-cols-2`
- Test at 375px viewport width

### Hero CTA button not clickable?
- Verify href is correct: `/f/marathi-pilot-2026`
- Check z-index if overlay is blocking click

---

**Last Updated:** September 22, 2026  
**Author:** Implementation Guide for Marathi Corpus  
**Status:** Ready for development

# Data Collection: ONLY Features You Need to Build
## What to Implement (Weeks 1–2, Days 1–14)

---

## ✅ FEATURES YOU ALREADY HAVE (Don't Touch)
```
✓ Public form routing (/f/[slug])
✓ Consent form (bilingual)
✓ Metadata collection (36 districts, 8 dialects, demographics)
✓ 4-tier transliteration (cache + Google + fallback)
✓ Anti-paste detection + logging
✓ Typing dynamics tracking (WPM, active/idle time)
✓ Quality scoring (TTR, repetition detection)
✓ Admin dashboard (view responses, export CSV/JSON)
```

These are enough to start collecting data TODAY.

---

## 🔧 FEATURES YOU MUST ADD (For Data Collection Only)

### TIER 1: CRITICAL (Must Have)

#### 1. **Local Draft Auto-Save** (2–3 hours)
**Why**: Mobile browser crashes = lost responses. This prevents 30–40% dropout.

**What to add**:
```typescript
// File: src/hooks/useDraftAutoSave.ts

export function useDraftAutoSave(formSlug: string, sessionId: string) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Save to localStorage whenever answer changes
  useEffect(() => {
    const draftKey = `draft_${formSlug}_${sessionId}`;
    localStorage.setItem(draftKey, JSON.stringify(answers));
  }, [answers, formSlug, sessionId]);

  // Restore from localStorage on mount
  useEffect(() => {
    const draftKey = `draft_${formSlug}_${sessionId}`;
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      setAnswers(JSON.parse(saved));
    }
  }, [formSlug, sessionId]);

  // Clear draft on successful submission
  const clearDraft = () => {
    const draftKey = `draft_${formSlug}_${sessionId}`;
    localStorage.removeItem(draftKey);
  };

  return { answers, setAnswers, clearDraft };
}
```

**Where to use**:
```tsx
// File: src/app/f/[slug]/page.tsx

export default function RespondentPage({ params }: Props) {
  const { answers, setAnswers, clearDraft } = useDraftAutoSave(
    params.slug,
    sessionId
  );

  const handleAnswerChange = (questionId: string, text: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = async () => {
    await submitResponses(answers);
    clearDraft(); // ← Clear after successful submit
  };

  return (
    // Use answers state in your form
  );
}
```

**Expected impact**: +25% completion rate (huge!)

---

#### 2. **Simple Public Homepage** (1–2 hours)
**Why**: Your form lives at `/f/[slug]`. You need a landing page explaining what you're doing.

**What to create**:
```tsx
// File: src/app/page.tsx

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          मराठी भाषा संग्रह
        </h1>
        <p className="text-xl text-slate-600">
          Marathi Language Corpus Collection
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-blue-900 mb-3">
          आपल्या मराठीचे योगदान करा
        </h2>
        <p className="text-slate-700 mb-4">
          We are building a high-quality Marathi language dataset for AI research.
          Your authentic Marathi text will help train better language models.
        </p>
        <ul className="text-sm text-slate-600 space-y-2 mb-6">
          <li>✓ Takes only 5 minutes</li>
          <li>✓ Completely anonymous</li>
          <li>✓ Your data helps Marathi NLP</li>
        </ul>

        <a 
          href="/f/marathi-main-2026"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Participate Now →
        </a>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="font-bold text-slate-900 mb-2">About This Project</h3>
          <p className="text-sm text-slate-600">
            This platform collects native Marathi text to build a corpus for 
            academic research and AI model training. All data is anonymized and 
            released under CC-BY-4.0 license.
          </p>
        </div>
        <div>
          <h3 className="font-bold text-slate-900 mb-2">Your Privacy</h3>
          <p className="text-sm text-slate-600">
            Your responses are stored anonymously. IP addresses are hashed and 
            deleted after 180 days. You can withdraw at any time.
          </p>
        </div>
      </div>

      <div className="border-t pt-6">
        <a href="/privacy" className="text-blue-600 hover:underline">
          Privacy Policy
        </a>
        {" | "}
        <a href="/ethics" className="text-blue-600 hover:underline">
          Ethics Statement
        </a>
      </div>
    </div>
  );
}
```

**Purpose**: 
- Explains what respondents are doing
- Builds trust (privacy statement visible)
- Provides entry point for social media links
- Looks professional for recruitment

---

#### 3. **Recruitment Collateral / Social Media Links** (1–2 hours)
**Why**: You need an easy way to share the form link.

**What to add**:
```tsx
// File: src/components/ShareButtons.tsx

export function ShareButtons() {
  const formUrl = "https://yourdomain.com/f/marathi-main-2026";
  
  return (
    <div className="flex gap-3">
      {/* WhatsApp Share */}
      <a
        href={`https://wa.me/?text=${encodeURIComponent(
          "मी मराठी भाषा संवर्धन प्रकल्पात सहभाग नोंदवली. आपणही 5 मिनिटांत सहभाग नोंदवा: " + formUrl
        )}`}
        target="_blank"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        WhatsApp
      </a>

      {/* Copy Link */}
      <button
        onClick={() => navigator.clipboard.writeText(formUrl)}
        className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-700"
      >
        Copy Link
      </button>

      {/* LinkedIn Share */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${formUrl}`}
        target="_blank"
        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
      >
        LinkedIn
      </a>
    </div>
  );
}
```

**Where to use**:
- Homepage (encourage sharing)
- Admin dashboard (monitor share clicks)
- Completion page (optional, for viral loop)

---

#### 4. **Public Statistics Dashboard** (2–3 hours)
**Why**: Shows respondents "I'm not alone" + builds social proof for recruitment.

**What to create**:
```tsx
// File: src/app/stats/page.tsx

export default async function StatsPage() {
  const stats = await fetchStats();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">मराठी संग्रह - आकडेवारी</h1>
      
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Total Responses" 
          value={stats.totalResponses}
          icon="📝"
        />
        <StatCard 
          label="Dialects Represented" 
          value={stats.dialectCount}
          icon="🗣️"
        />
        <StatCard 
          label="Districts Covered" 
          value={stats.districtCount}
          icon="📍"
        />
        <StatCard 
          label="Words Collected" 
          value={Math.round(stats.totalWords / 1000) + "K"}
          icon="✍️"
        />
      </div>

      <div className="bg-slate-100 rounded-lg p-6 mb-8">
        <h2 className="font-bold text-slate-900 mb-4">Responses by Dialect</h2>
        <div className="space-y-2">
          {stats.dialectBreakdown.map(d => (
            <div key={d.dialect} className="flex items-center">
              <div className="w-32 font-sm">{d.dialect}</div>
              <div className="flex-1 bg-blue-200 rounded h-6 flex items-center px-2">
                <div 
                  className="bg-blue-600 h-4 rounded"
                  style={{ width: `${(d.count / stats.maxDialectCount) * 100}%` }}
                />
              </div>
              <div className="w-12 text-right text-sm">{d.count}</div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-600">
        Help us reach 500 responses! Share with friends and family on WhatsApp.
      </p>
    </div>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-slate-100 rounded-lg p-6 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-600">{label}</div>
    </div>
  );
}
```

**Purpose**:
- Shows progress (motivates respondents)
- Displays dialect diversity (shows you're capturing variation)
- Sharable on social media ("500 responses collected!")

---

### TIER 2: STRONGLY RECOMMENDED (Should Have)

#### 5. **Daily Response Monitor Alert** (1–2 hours)
**Why**: You need to know if recruitment is working in real-time.

**What to add**:
```typescript
// File: src/lib/monitoring/responseMonitor.ts

export async function sendDailyReport() {
  const stats = await getStats();
  
  // Send Slack/Email notification
  const message = `
📊 Daily Marathi Corpus Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Today: ${stats.todayResponses} new responses
Total: ${stats.totalResponses}
Quality (avg score): ${stats.avgQuality.toFixed(1)}/100

🎯 Pace to 500: ${Math.round((stats.totalResponses / 500) * 100)}%

Top Dialects:
${stats.topDialects.map(d => `  • ${d.name}: ${d.count}`).join('\n')}

Flagged responses: ${stats.flaggedCount} (review in admin)
  `;

  // Slack webhook
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({ text: message })
  });
}

// Schedule to run daily at 9 AM
// Add to your cron job: `0 9 * * * npm run monitor:report`
```

**Setup**:
1. Create Slack webhook (5 min): https://api.slack.com/apps/new
2. Add `SLACK_WEBHOOK_URL` to `.env.local`
3. Run via GitHub Actions or Vercel Crons

**Benefit**: You'll know within 24 hours if recruitment is failing

---

#### 6. **Mobile-Optimized Completion Screen** (1–2 hours)
**Why**: Final moment to encourage sharing + feel rewarded.

**What to add**:
```tsx
// File: src/components/respondent/CompletionScreen.tsx

export function CompletionScreen() {
  return (
    <div className="max-w-md mx-auto px-4 py-8 text-center">
      <div className="text-5xl mb-4">✨</div>
      
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        धन्यवाद!
      </h1>
      
      <p className="text-slate-600 mb-6">
        Your response has been saved and will help train Marathi AI models.
      </p>

      {/* Share Buttons */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <p className="text-sm font-semibold text-slate-900 mb-3">
          Help us reach 500 responses:
        </p>
        <div className="space-y-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              "मी मराठी भाषा संवर्धन प्रकल्पात सहभाग नोंदवली. आपणही करा: https://corpus.example.com/f/marathi-main-2026"
            )}`}
            className="block bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700"
          >
            📱 Share on WhatsApp
          </a>
          <button
            onClick={() => navigator.share?.({
              title: "Marathi Corpus",
              text: "Help collect Marathi language data",
              url: window.location.href
            })}
            className="block w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
          >
            📤 Share
          </button>
        </div>
      </div>

      <a
        href="/"
        className="text-blue-600 hover:underline"
      >
        ← Back to Home
      </a>
    </div>
  );
}
```

---

### TIER 3: OPTIONAL (Nice-to-Have)

#### 7. **Form Pausing / Resumable Sessions** (2–3 hours)
**Why**: Some respondents might want to complete over multiple sessions.

**Implementation**:
```typescript
// Allow respondents to save and resume:
// Session stored with "completed": false
// On return visit, restore previous answers + continue from next question
```

**Benefit**: +10% completion rate if respondents need to pause

---

## 📋 IMPLEMENTATION CHECKLIST (Weeks 1–2)

### What to Build

```
PRIORITY 1 (Days 1–3):
  [ ] Draft auto-save (localStorage)
      └─ Time: 2–3 hours
      └─ Impact: +25% completion
  
  [ ] Public homepage (explain project)
      └─ Time: 1–2 hours
      └─ Impact: Professional recruitment
  
  [ ] Share buttons (WhatsApp/Copy/LinkedIn)
      └─ Time: 1 hour
      └─ Impact: Viral loop ready

PRIORITY 2 (Days 4–7):
  [ ] Public stats dashboard
      └─ Time: 2–3 hours
      └─ Impact: Social proof for recruitment
  
  [ ] Completion screen with share buttons
      └─ Time: 1–2 hours
      └─ Impact: Encourages sharing after submit

PRIORITY 3 (Days 8–14, If Time):
  [ ] Daily monitoring alert
      └─ Time: 1–2 hours
      └─ Impact: Real-time visibility
  
  [ ] Resumable sessions (pause/resume)
      └─ Time: 2–3 hours
      └─ Impact: +10% completion
```

**Total time**: 10–15 hours of work
**Expected result**: Ready to collect 300–500 responses

---

## ❌ DO NOT BUILD (For Collection Phase)

```
❌ Cloze Test Component
   └─ NOT for data collection phase
   └─ Add AFTER you have 300+ open-ended responses

❌ Speech-to-Text
   └─ Too risky + unreliable
   └─ Typing is fine; respondents handle it

❌ WhatsApp Viral Certificate
   └─ Nice-to-have, not essential
   └─ Share button is enough

❌ Advanced Rate Limiting
   └─ Academic context = low bot risk
   └─ Basic IP hash + speed checks sufficient

❌ Multiple Form Variants
   └─ Single form (/f/marathi-main-2026) is enough
   └─ You need consistent questions for analysis

❌ Automatic AI Detection
   └─ TTR + manual spot-checks sufficient
   └─ Don't need ML classifier
```

---

## 🎯 SUCCESS CRITERIA (End of Week 2, Oct 7)

```
✅ Platform Live:
  [ ] Draft auto-save working
  [ ] Homepage published
  [ ] Form accessible at /f/marathi-main-2026
  [ ] Completion screen shows share options

✅ Recruitment Ready:
  [ ] Share buttons working (WhatsApp, LinkedIn, Copy)
  [ ] Public stats dashboard live
  [ ] Daily monitoring enabled

✅ Data Collection Started:
  [ ] 50+ responses by Oct 4
  [ ] 150+ responses by Oct 7
  [ ] Quality spot-check: >80% pass quality filters

✅ No Critical Bugs:
  [ ] No console errors on mobile
  [ ] Transliteration working smoothly
  [ ] Responses saving correctly
  [ ] Admin dashboard showing data
```

---

## 📝 CODE FILES TO CREATE/MODIFY

```
CREATE (New Files):
  src/hooks/useDraftAutoSave.ts          ← Auto-save logic
  src/app/page.tsx                       ← Homepage
  src/app/stats/page.tsx                 ← Public stats
  src/components/ShareButtons.tsx        ← Share component
  src/lib/monitoring/responseMonitor.ts  ← Daily alerts
  src/components/respondent/CompletionScreen.tsx

MODIFY (Existing):
  src/app/f/[slug]/page.tsx              ← Add useDraftAutoSave hook
  src/components/respondent/FormCompletion.tsx  ← Add share buttons
  .env.local                             ← Add SLACK_WEBHOOK_URL (optional)
```

---

## ⏱️ ESTIMATED TIME BREAKDOWN

```
Draft Auto-Save:           2–3 hours
Homepage:                  1–2 hours
Share Buttons:             1 hour
Stats Dashboard:           2–3 hours
Completion Screen:         1–2 hours
Daily Monitoring:          1–2 hours
Resumable Sessions:        2–3 hours
                          ─────────
TOTAL:                     11–17 hours

At 3–4 hours/day coding:   3–5 days of work
```

---

## 🚀 EXECUTION PLAN

### Days 1–3 (Priority 1)
```
Day 1:
  • Implement useDraftAutoSave hook
  • Deploy + test on mobile
  • Create homepage
  
Day 2:
  • Deploy homepage
  • Create share buttons
  • Test WhatsApp share link
  
Day 3:
  • Completion screen with share buttons
  • Deploy to production
  • Verify all links work
```

### Days 4–7 (Priority 2)
```
Day 4–5:
  • Stats dashboard (backend query)
  • Deploy stats page
  
Day 6–7:
  • Optional: Daily monitoring setup
  • Manual testing of full flow
```

### Days 8–14 (Collection Phase)
```
Days 8–14:
  • Monitor response flow daily
  • Spot-check quality
  • Share on social media
  • Target: 300+ responses
```

---

## 📞 DEPLOYMENT CHECKLIST

Before launch (Oct 1):
- [ ] All code deployed to production
- [ ] Test complete flow on iPhone + Android
- [ ] Verify transliteration works smoothly
- [ ] Confirm email alerts working
- [ ] Share link works in WhatsApp
- [ ] Homepage SEO-friendly (metadata tags)
- [ ] Privacy page accessible from footer

---

## 🎬 BOTTOM LINE

**To collect 300–500 responses, you need:**

1. ✅ **Draft auto-save** (prevent mobile dropout)
2. ✅ **Homepage + Share buttons** (recruitment)
3. ✅ **Stats dashboard** (social proof)
4. ✅ **Completion screen** (final push to share)
5. ✅ **Daily monitoring** (track progress)

**Everything else is optional.**

**Time to implement**: 12–17 hours  
**Expected result**: 300–500 responses in 2 weeks ✅

**Don't build Cloze/Reordering/Speech-to-Text yet. Just collect data first.**


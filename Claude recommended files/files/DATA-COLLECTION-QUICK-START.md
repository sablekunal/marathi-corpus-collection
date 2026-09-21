# Data Collection: Quick Start (Print This)

---

## 🎯 YOUR GOAL
Collect **300–500 Marathi responses** in **2 weeks (Oct 1–14)**.  
Then analyze + write paper in **2 weeks (Oct 15–28)** for **COLING Oct 12 deadline**.

---

## ✅ WHAT YOU HAVE (Don't Touch)
```
✓ Platform built (Next.js, 9-table DB, auth)
✓ Consent form (dual ethics)
✓ Metadata (36 districts, 8 dialects)
✓ Transliteration (4-tier)
✓ Anti-paste detection
✓ Typing dynamics
✓ Quality scoring
✓ Admin dashboard
```

**You're ready to collect.** Don't add anything else.

---

## 🔧 WHAT TO BUILD (Priority Order)

### PRIORITY 1 (Days 1–3) - Must Build

#### 1. Draft Auto-Save (2–3 hours)
**Why**: Prevents 30% dropout on mobile.

**File**: `src/hooks/useDraftAutoSave.ts`

```typescript
export function useDraftAutoSave(formSlug: string, sessionId: string) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const draftKey = `draft_${formSlug}_${sessionId}`;
    localStorage.setItem(draftKey, JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    const draftKey = `draft_${formSlug}_${sessionId}`;
    const saved = localStorage.getItem(draftKey);
    if (saved) setAnswers(JSON.parse(saved));
  }, [formSlug, sessionId]);

  return { answers, setAnswers, clearDraft: () => localStorage.removeItem(`draft_${formSlug}_${sessionId}`) };
}
```

**Use in**: `src/app/f/[slug]/page.tsx`

---

#### 2. Homepage (1–2 hours)
**Why**: Entry point + recruitment.

**File**: `src/app/page.tsx`

```tsx
export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-2">मराठी भाषा संग्रह</h1>
      <p className="text-xl text-slate-600 mb-6">Help build Marathi AI dataset</p>
      
      <a 
        href="/f/marathi-main-2026"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
      >
        Participate Now →
      </a>
      
      <div className="mt-8 text-sm text-slate-600">
        <p>✓ 5 minutes only | ✓ Anonymous | ✓ Helps Marathi NLP</p>
      </div>
    </div>
  );
}
```

---

#### 3. Share Buttons (1 hour)
**Why**: Viral loop.

**File**: `src/components/ShareButtons.tsx`

```tsx
export function ShareButtons() {
  const url = "https://yourdomain.com/f/marathi-main-2026";
  
  return (
    <div className="flex gap-3">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(
          "मी मराठी संवर्धन प्रकल्पात सहभाग नोंदवली. आपणही करा: " + url
        )}`}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        WhatsApp
      </a>
      <button
        onClick={() => navigator.clipboard.writeText(url)}
        className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-700"
      >
        Copy Link
      </button>
    </div>
  );
}
```

**Use in**: Homepage + completion screen

---

### PRIORITY 2 (Days 4–7) - Should Build

#### 4. Public Stats Dashboard (2–3 hours)
**Why**: Social proof (shows progress).

**File**: `src/app/stats/page.tsx`

```tsx
export default async function StatsPage() {
  const stats = await fetchStats();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">मराठी संग्रह - आकडेवारी</h1>
      
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Responses" value={stats.total} icon="📝" />
        <StatCard label="Dialects" value={stats.dialects} icon="🗣️" />
        <StatCard label="Districts" value={stats.districts} icon="📍" />
        <StatCard label="Words" value={Math.round(stats.words / 1000) + "K"} icon="✍️" />
      </div>

      <p className="text-center text-slate-600">
        Help us reach 500 responses! Share on WhatsApp.
      </p>
    </div>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-slate-100 rounded p-6 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-slate-600">{label}</div>
    </div>
  );
}
```

---

#### 5. Completion Screen with Share (1–2 hours)
**Why**: Encourages sharing after submit.

**File**: Update `src/components/respondent/FormCompletion.tsx`

```tsx
export function CompletionScreen() {
  return (
    <div className="max-w-md mx-auto px-4 py-8 text-center">
      <div className="text-5xl mb-4">✨</div>
      <h1 className="text-2xl font-bold mb-2">धन्यवाद!</h1>
      <p className="text-slate-600 mb-6">Your response is saved.</p>

      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <p className="font-semibold mb-3">Help us reach 500 responses:</p>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(
            "मी मराठी संवर्धन प्रकल्पात सहभाग नोंदवली: " + window.location.origin + "/f/marathi-main-2026"
          )}`}
          className="block bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700"
        >
          📱 Share on WhatsApp
        </a>
      </div>

      <a href="/" className="text-blue-600 hover:underline">Back to Home</a>
    </div>
  );
}
```

---

### PRIORITY 3 (Days 8–14, Optional)

#### 6. Daily Monitoring Alert (1–2 hours)
**Why**: Know if recruitment is working.

**File**: `src/lib/monitoring/responseMonitor.ts`

```typescript
export async function sendDailyReport() {
  const stats = await getStats();
  
  const message = `📊 Marathi Corpus Report
━━━━━━━━━━━━━━━━━━━━━━━━━
Today: ${stats.todayResponses} new responses
Total: ${stats.totalResponses}
Quality: ${stats.avgQuality.toFixed(1)}/100
Target: 500 (${Math.round((stats.totalResponses / 500) * 100)}%)
  `;

  // Send via Slack webhook
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({ text: message })
  });
}
```

**Setup**: Add to GitHub Actions or Vercel Crons to run daily at 9 AM.

---

## 📊 QUESTION BANK (Ready to Import)

**File**: `questions-bulk-import.json` (30 questions ready to go)

**Categories**:
- Opinion (8 questions)
- Experience (8 questions)
- Descriptive (7 questions)
- Cultural (7 questions)

**How to import**:
1. Go to `/admin/questions`
2. Click "Import JSON"
3. Paste `questions-bulk-import.json`
4. Done ✅

**Expected result**: 
- 6–10 questions per respondent
- 5–10 minutes per respondent
- ~3,000 total responses across categories
- ~165K–195K words corpus

---

## 🚀 DEPLOYMENT CHECKLIST

### Before Going Live (Oct 1)

- [ ] Draft auto-save tested on iPhone + Android
- [ ] Homepage deployed and looks good
- [ ] Share buttons working (test WhatsApp)
- [ ] Questions imported into admin panel
- [ ] Form published at `/f/marathi-main-2026`
- [ ] Stats page live at `/stats`
- [ ] Completion screen shows share buttons
- [ ] All links verified working
- [ ] Daily monitoring setup (optional)

---

## 📢 RECRUITMENT CHANNELS (Days 1–14)

**Post on**:
- WhatsApp groups (VIT, friends, family)
- Reddit r/marathi
- Marathi language learner communities
- LinkedIn (post + tag Marathi influencers)
- Email (Marathi professors at PUNE, NAGPUR)

**Message template** (Marathi):
```
आपल्या मराठी भाषेचं योगदान करा! 
5 मिनिटांत आपल्या स्वाभाविक मराठी लिहा.
✓ पूर्णपणे गोपनीय
✓ शोध व कृत्रिम बुद्धिमत्तेसाठी
✓ महाराष्ट्र सर्वेक्षण

लिंक: https://corpus.example.com/f/marathi-main-2026

#MarathiNLP #MaharashtraLanguage #नेमकंमराठी
```

---

## 📈 EXPECTED RESULTS (End of Week 2, Oct 14)

```
TARGET:
✓ 300–500 responses collected
✓ >80% quality score
✓ All 8+ dialects represented
✓ TTR 0.35–0.65
✓ 0 obvious spam

FALLBACK:
✓ 200–250 responses: Publishable (with caveat)
✓ >70% quality: Acceptable
```

---

## ⏱️ TIME BREAKDOWN

```
Draft auto-save:        2–3 hours
Homepage:               1–2 hours
Share buttons:          1 hour
Stats dashboard:        2–3 hours
Completion screen:      1–2 hours
Daily monitoring:       1–2 hours
TOTAL:                  10–15 hours

At 3–4 hours/day:       3–5 days of work
```

---

## ❌ DO NOT BUILD (Before Oct 14)

```
❌ Cloze test (add after you have 300+ responses)
❌ Speech-to-text (unreliable)
❌ WhatsApp certificates (nice-to-have)
❌ Bot defense (unnecessary)
❌ Reordering task (too complex)
```

---

## 🎯 NEXT STEPS (After Oct 14)

1. **Oct 15–20**: Add Cloze test component (15–20 questions)
2. **Oct 21–24**: Build error analysis (confusion matrices)
3. **Oct 25–28**: Write 10-page paper
4. **Oct 29–30**: Submit to COLING ✅

---

## 💡 FINAL CHECKLIST

```
Days 1–3:
  [ ] Draft auto-save ✓
  [ ] Homepage ✓
  [ ] Share buttons ✓

Days 4–7:
  [ ] Stats dashboard ✓
  [ ] Completion screen ✓
  [ ] Questions imported ✓

Days 8–14:
  [ ] Monitor responses daily
  [ ] Spot-check quality
  [ ] Hit 300+ responses ✓

Oct 15:
  [ ] Start Cloze component
```

---

## 📞 QUICK LINKS

**Files created**:
- `QUESTION-BANK-COMPLETE.md` - Full details
- `questions-bulk-import.json` - Copy-paste JSON
- `DATA-COLLECTION-ONLY-FEATURES.md` - Full implementation guide
- `REVISED-IMPLEMENTATION-PLAN-25-DAYS.md` - Timeline + strategy

**Your form**: `/f/marathi-main-2026`  
**Admin panel**: `/admin`  
**Stats**: `/stats`

---

**Print this. Stick it on your monitor. Ship it.** 🚀


# Pre-Launch Feature Implementation & Launch Readiness Plan
**Marathi Corpus Collection Platform (मराठी भाषा संग्रह)**

This document details all discussed features and enhancements required before rolling out the platform to public respondents via WhatsApp, social media, and academic networks.

---

## 📌 Phase 1: Critical Pre-Launch Essentials (Immediate Must-Haves)

### 1.1. Local Draft Auto-Save & Crash Recovery
- **Problem**: Mobile users frequently refresh, switch to incoming calls, or have browsers reload in the background. Losing typed Marathi text causes immediate bounce and high drop-off.
- **Implementation**:
  - Store respondent progress (`answers`, `currentQuestionIndex`, `metadata`) in `localStorage` under `draft_${slug}_${sessionId}`.
  - Automatically restore drafts on component mount if session is active.
  - Clear draft storage upon successful final submission.
- **Target Files**:
  - `src/app/f/[slug]/page.tsx`
  - `src/components/respondent/QuestionCard.tsx`

### 1.2. Viral WhatsApp Sharing & Social Referral Loop
- **Problem**: Voluntary academic data collection relies on organic distribution. Completed respondents are most motivated to share.
- **Implementation**:
  - Add a one-tap WhatsApp share button on the completion screen (`/f/[slug]` completion step).
  - Pre-fill an inviting Marathi message with the form URL:
    > *"मी मराठी भाषा संवर्धन व AI प्रकल्पात सहभाग नोंदवून माझी बोलीभाषा नोंदवली आहे. आपणही ५ मिनिटांत सहभाग नोंदवून मराठी भाषेच्या संवर्धनास हातभार लावा: [URL]"*
  - Add standard Web Share API (`navigator.share`) for native iOS/Android sharing sheet.
- **Target Files**:
  - `src/components/respondent/FormCompletion.tsx`

### 1.3. Digital Certificate of Contribution (Downloadable / Shareable)
- **Problem**: Respondents need a tangible incentive and pride of participation to post on WhatsApp status or LinkedIn.
- **Implementation**:
  - Generate an on-the-fly digital certificate using HTML5 Canvas or SVG rendering.
  - Certificate details: Participant name (or anonymous contributor ID), dialect, district, contribution date, and official verification seal/stamp.
  - 1-click download as PNG or direct image share.
- **Target Files**:
  - `src/components/respondent/CertificateModal.tsx`
  - `src/components/respondent/FormCompletion.tsx`

### 1.4. Low-Friction Onboarding & Reassurance Microcopy
- **Problem**: Users hesitate if they fear their Marathi isn't "grammatically correct" or "pure" (*प्रमाण भाषा*).
- **Implementation**:
  - Add prominent guidance banner before answering:
    > *"तुम्ही तुमच्या घरगुती, स्थानिक किंवा दैनंदिन बोलीभाषेत लिहू शकता. व्याकरणाच्या किंवा शुद्धलेखनाच्या चुकांची काळजी करू नका."*
  - Provide short dialect prompt samples (e.g., Ahirani, Varhadi, Konkani snippets).
- **Target Files**:
  - `src/components/respondent/MetadataForm.tsx`
  - `src/components/respondent/QuestionCard.tsx`

---

## 📌 Phase 2: Engagement & Multi-Format Question Engine

### 2.1. Diagnostic Benchmark Tasks (Cloze Test & Sentence Ordering)
- **Problem**: Writing 3 consecutive essays of 50–100 words causes $>60\%$ mobile fatigue.
- **Implementation**:
  - Introduce **Type A: Cloze Test (MCQ)** for morphological case markers (*विभक्ती प्रत्यय*) and dialectal idioms (30s).
  - Introduce **Type B: Sentence Word Reordering** with interactive tap/drag chips for SOV syntax structure (30s).
  - Limit **Type C: Open-Ended Generative Writing** to 1 prompt (approx. 40–60 words) per session (2 mins).
  - Total time reduced to 3.5–4 mins while tripling diagnostic and grammatical benchmark value.
- **Target Files**:
  - `src/lib/db/schema.ts` (extend question types: `essay | cloze | reorder`)
  - `src/components/respondent/ClozeQuestionCard.tsx`
  - `src/components/respondent/ReorderQuestionCard.tsx`
  - `src/app/admin/questions/page.tsx`

### 2.2. Marathi Speech-to-Text / Audio Dictation (Optional)
- **Problem**: Rural or older native speakers find mobile typing cumbersome.
- **Implementation**:
  - Integrate Web Speech API (`webkitSpeechRecognition`) set to `mr-IN` (Marathi - India).
  - Add a microphone toggle next to the transliteration bar so users can speak naturally and have it transcribe into the textarea.
- **Target Files**:
  - `src/components/respondent/TransliterateTextarea.tsx`

---

## 📌 Phase 3: Data Quality, Trust & Scientific Integrity

### 3.1. Machine Translation / AI Generated Content Flagging
- **Problem**: Some respondents may use ChatGPT or Google Translate to generate artificial text.
- **Implementation**:
  - Add heuristic checks for hyper-formal Sanskritized phrasing, standard AI disclaimer phrases translated into Marathi, and perplexity scoring.
  - Flag suspiciously structured bullet-point formatting.
- **Target Files**:
  - `src/lib/quality/checks.ts`

### 3.2. Rate Limiting & Anti-Spam Safeguards
- **Problem**: Malicious or repetitive bot submissions skewing academic distributions.
- **Implementation**:
  - Add IP hashing + browser fingerprinting checks to prevent rapid repeated submissions.
  - Implement minimum answering time thresholds per question to filter instant bot clicks.
- **Target Files**:
  - `src/app/api/forms/[slug]/submit/route.ts`

### 3.3. Transparency & Data Privacy Modal
- **Problem**: Participants wonder how their data will be used.
- **Implementation**:
  - A clean "माहिती व उद्दिष्ट" modal explaining that data will be open-sourced for non-commercial academic research and AI language modeling.
- **Target Files**:
  - `src/app/privacy/page.tsx`
  - `src/app/f/[slug]/page.tsx`

---

## 🚀 Recommended Rollout Sequence

1. **Sprint 1 (Immediate)**:
   - [x] Local draft auto-save and restore (`localStorage`).
   - [x] WhatsApp 1-tap share button with pre-filled Marathi message.
   - [x] Digital Certificate of Appreciation generation on completion.
   - [x] Dialect reassurance microcopy.
2. **Sprint 2 (Pre-Launch Testing)**:
   - [ ] Multi-Format Question Engine (MCQ Cloze + Reordering).
   - [ ] Voice Dictation (`mr-IN` Web Speech API).
   - [ ] AI-generation & duplicate submission defense.

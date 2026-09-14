import Link from 'next/link'
import { BookOpen, BarChart3, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[oklch(0.97_0.01_250)] to-[oklch(0.93_0.03_250)] px-4">
      <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in-up">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-[oklch(0.42_0.16_250)] rounded-2xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="font-marathi text-4xl font-bold text-[oklch(0.20_0.04_250)]">
            मराठी भाषा संग्रह
          </h1>
          <p className="text-lg text-[oklch(0.42_0.10_250)] font-medium">
            Marathi Corpus Collection Platform
          </p>
          <p className="text-[oklch(0.52_0.04_250)] text-sm max-w-lg mx-auto leading-relaxed">
            A research platform for collecting high-quality Marathi text data
            for Large Language Model training and evaluation.
          </p>
        </div>

        {/* CTA Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <Link
            href="/admin"
            className="group bg-[oklch(0.42_0.16_250)] text-white rounded-xl p-5 text-left hover:bg-[oklch(0.35_0.14_250)] transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5"
          >
            <BarChart3 className="w-5 h-5 mb-3 opacity-80" />
            <div className="font-semibold text-base">Admin Dashboard</div>
            <div className="text-xs opacity-70 mt-1">Manage forms, questions & analytics</div>
            <ArrowRight className="w-4 h-4 mt-3 opacity-70 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/f/marathi-pilot-2026"
            className="group bg-white rounded-xl p-5 text-left border border-[oklch(0.88_0.02_250)] hover:border-[oklch(0.42_0.16_250)] shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            <BookOpen className="w-5 h-5 mb-3 text-[oklch(0.42_0.16_250)]" />
            <div className="font-semibold text-base text-[oklch(0.20_0.04_250)]">
              Respondent Form (प्रतिसाद फॉर्म)
            </div>
            <div className="text-xs text-[oklch(0.52_0.04_250)] mt-1">
              सहभागी व्हा व मराठी भाषा संवर्धनास हातभार लावा
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-[oklch(0.42_0.16_250)] font-medium">
              <span>सर्वेक्षण सुरू करा (Start Survey)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center pt-6">
          <Link
            href="/privacy"
            className="text-xs text-[oklch(0.52_0.04_250)] hover:text-[oklch(0.35_0.14_250)] underline transition-colors"
          >
            गोपनीयता धोरण व डेटा प्रशासन (Privacy Policy & Ethics)
          </Link>
        </div>
      </div>
    </main>
  )
}

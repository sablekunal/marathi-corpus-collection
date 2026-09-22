export default function HeroSection({ formSlug }: { formSlug: string }) {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12 md:py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 font-marathi">
          तुमच्या मराठीला <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">AI च्या भविष्यात</span> स्थान द्या.
        </h1>

        {/* Subheading (English) */}
        <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-4 md:mb-6">
          Help build better AI for Marathi.
        </p>

        {/* Secondary Message */}
        <p className="text-base sm:text-lg text-blue-100 mb-6 md:mb-8 font-marathi">
          एक छोटंसं योगदान. मराठी भाषेसाठी मोठा डेटासंच.
        </p>

        {/* CTA Button */}
        <a
          href={`/f/${formSlug}`}
          className="inline-block px-8 py-4 md:px-10 md:py-5 bg-white text-blue-600 font-bold text-lg md:text-2xl rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:-translate-y-1 hover:shadow-2xl font-marathi"
        >
          योगदान द्या →
        </a>

        {/* Badges Below CTA */}
        <div className="flex justify-center gap-2 sm:gap-4 mt-6 text-xs sm:text-sm text-blue-100 flex-wrap font-marathi">
          <span>✓ ५ मिनिटे</span>
          <span>✓ पूर्णपणे निनावी</span>
          <span>✓ CC BY 4.0</span>
        </div>
      </div>
    </section>
  );
}

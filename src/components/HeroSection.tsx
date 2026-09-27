export default function HeroSection({ formSlug }: { formSlug: string }) {
  return (
    <section className="border-b border-gray-200 bg-white text-gray-900 py-10 md:py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 font-marathi leading-tight">
          तुमच्या मराठीला AI च्या भविष्यात स्थान द्या.
        </h1>

        {/* Subheading (English) */}
        <p className="text-lg text-gray-700 mb-3">
          Help build better AI for Marathi.
        </p>

        {/* Secondary Message */}
        <p className="text-base text-gray-600 mb-6 font-marathi">
          एक छोटंसं योगदान. मराठी भाषेसाठी मोठा डेटासंच.
        </p>

        {/* CTA Button */}
        <div className="flex justify-center w-full px-4 sm:px-0">
          <a
            href={`/f/${formSlug}`}
            className="inline-flex items-center justify-center w-full sm:w-auto min-h-12 px-8 py-3 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition-colors font-marathi"
          >
            योगदान द्या →
          </a>
        </div>

        {/* Badges Below CTA */}
        <div className="flex justify-center gap-3 sm:gap-6 mt-6 text-base text-gray-600 flex-wrap font-marathi">
          <span>✓ ५ मिनिटे</span>
          <span>✓ पूर्णपणे निनावी</span>
          <span>✓ CC BY 4.0</span>
        </div>
      </div>
    </section>
  );
}

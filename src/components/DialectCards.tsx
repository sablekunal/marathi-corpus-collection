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
          <h2 className="text-3xl font-bold text-gray-900 mb-2 font-marathi">
            तुमची बोलीही मराठीच आहे
          </h2>
          <p className="text-gray-600 font-marathi">
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
              <h3 className="text-lg font-bold text-gray-900 mb-1 font-marathi">
                {dialect.name}
              </h3>

              {/* English Name */}
              <p className="text-sm text-gray-700 font-medium mb-3">
                {dialect.nameEnglish}
              </p>

              {/* Region Badge */}
              <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full mb-3 font-marathi">
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
          <p className="text-gray-800 font-medium font-marathi">
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

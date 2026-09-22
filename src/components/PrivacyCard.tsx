export default function PrivacyCard() {
  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border-2 border-green-200 p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🔒</span>
            <h3 className="text-2xl font-bold text-gray-900 font-marathi">
              तुमची गोपनीयता
            </h3>
          </div>

          {/* Privacy Checklist */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold text-lg mt-1">✓</span>
              <div>
                <p className="font-semibold text-gray-900 font-marathi">नाव आवश्यक नाही</p>
                <p className="text-sm text-gray-600">No name required</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold text-lg mt-1">✓</span>
              <div>
                <p className="font-semibold text-gray-900 font-marathi">ईमेल आवश्यक नाही</p>
                <p className="text-sm text-gray-600">No email required</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold text-lg mt-1">✓</span>
              <div>
                <p className="font-semibold text-gray-900 font-marathi">IP Address हॅश केला जातो</p>
                <p className="text-sm text-gray-600">
                  Your IP address is anonymized with SHA-256 hashing
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold text-lg mt-1">✓</span>
              <div>
                <p className="font-semibold text-gray-900 font-marathi">
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
                <p className="font-semibold text-gray-900 font-marathi">
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
            className="inline-block text-blue-600 font-semibold hover:underline font-marathi"
          >
            संपूर्ण Privacy Policy पहा →
          </a>
        </div>
      </div>
    </section>
  );
}

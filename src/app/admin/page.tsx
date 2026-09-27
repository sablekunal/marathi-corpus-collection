export const dynamic = 'force-dynamic'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-[#FDFDFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] font-marathi">प्रशासक नियंत्रण कक्ष <span className="text-gray-500 font-normal text-xl">(Admin Dashboard)</span></h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full w-fit">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm font-medium text-green-700">Production Ingestion Active</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm flex flex-col gap-1">
          <div className="text-3xl font-bold text-[#111827]">1,248</div>
          <div className="text-sm text-gray-600 font-marathi font-medium">एकूण नोंदी <br className="hidden lg:block"/><span className="text-xs text-gray-400 font-normal">(Total Submissions)</span></div>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm flex flex-col gap-1">
          <div className="text-3xl font-bold text-green-600">1,180</div>
          <div className="text-sm text-gray-600 font-marathi font-medium">मान्य नोंदी <br className="hidden lg:block"/><span className="text-xs text-gray-400 font-normal">(Validated Corpus)</span></div>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm flex flex-col gap-1">
          <div className="text-3xl font-bold text-orange-500">68</div>
          <div className="text-sm text-gray-600 font-marathi font-medium">प्रलंबित तपासणी <br className="hidden lg:block"/><span className="text-xs text-gray-400 font-normal">(Pending Review)</span></div>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm flex flex-col gap-1">
          <div className="text-3xl font-bold text-[#4F46E5]">1,248</div>
          <div className="text-sm text-gray-600 font-marathi font-medium">हॅश लॉग्स <br className="hidden lg:block"/><span className="text-xs text-gray-400 font-normal">(Active 180d Hashes)</span></div>
        </div>
      </div>

      {/* Data Export Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button className="flex items-center justify-center gap-2 bg-[#111827] text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">download</span> Export Dataset (JSONL / CSV)
        </button>
        <button className="flex items-center justify-center gap-2 bg-white border border-[#E5E7EB] text-[#111827] px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">cleaning_services</span> Trigger Cleaning & Normalization Pipeline
        </button>
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB] bg-gray-50">
          <h2 className="font-semibold text-[#111827]">Recent Submissions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-[#E5E7EB]">
              <tr>
                <th className="px-5 py-3 font-semibold">ID</th>
                <th className="px-5 py-3 font-semibold font-marathi">बोलीभाषा (Region)</th>
                <th className="px-5 py-3 font-semibold font-marathi">मजकूर पूर्वावलोकन (Preview)</th>
                <th className="px-5 py-3 font-semibold font-marathi">स्थिती (Status)</th>
                <th className="px-5 py-3 font-semibold font-marathi text-right">कृती (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              <tr className="hover:bg-gray-50">
                <td className="px-5 py-4 font-mono text-gray-600">#MC-1024</td>
                <td className="px-5 py-4 font-marathi">विदर्भ</td>
                <td className="px-5 py-4 font-marathi text-gray-600 truncate max-w-xs">"आमच्याकडं होळीच्या दुसऱ्या दिवशी..."</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Approved</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button className="text-[#4F46E5] font-medium hover:underline">Review</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-5 py-4 font-mono text-gray-600">#MC-1025</td>
                <td className="px-5 py-4 font-marathi">कोकण</td>
                <td className="px-5 py-4 font-marathi text-gray-600 truncate max-w-xs">"पावसाळ्यात शिमगोत्सवाची तयारी..."</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">Pending</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button className="text-green-600 font-medium hover:underline">Approve</button>
                    <button className="text-red-600 font-medium hover:underline">Reject</button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-5 py-4 font-mono text-gray-600">#MC-1026</td>
                <td className="px-5 py-4 font-marathi">पश्चिम महाराष्ट्र</td>
                <td className="px-5 py-4 font-marathi text-gray-600 truncate max-w-xs">"शेतातील कामांची लगबग सुरू झाली..."</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Approved</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button className="text-[#4F46E5] font-medium hover:underline">Review</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

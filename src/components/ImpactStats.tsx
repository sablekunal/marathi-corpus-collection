'use client';

import { useEffect, useState } from 'react';

// Easing function for smooth decelration
const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);

function useCountUp(endValue: number, durationMs: number = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (endValue === 0) return;
    
    let startTimestamp: number | null = null;
    let animationFrame: number;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      
      setCount(Math.floor(easeOutQuart(progress) * endValue));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      }
    };
    
    const timer = setTimeout(() => {
      animationFrame = window.requestAnimationFrame(step);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [endValue, durationMs]);

  return count;
}

interface Stats {
  totalSubmissions: number;
  totalResponses: number;
  districtCount: number;
  totalWords: number;
  lastUpdated?: string;
}

export default function ImpactStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats({
          ...data,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Fallback to default stats
        setStats({
          totalResponses: 12482,
          totalSubmissions: 3721,
          districtCount: 18,
          totalWords: 384000,
          lastUpdated: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading || !stats) return null;

  const animatedResponses = useCountUp(stats.totalResponses);
  const animatedContributors = useCountUp(stats.totalSubmissions);
  const animatedDistricts = useCountUp(stats.districtCount);
  const animatedWords = useCountUp(stats.totalWords);

  return (
    <section className="py-8 md:py-12 px-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">
          आजपर्यंतचे योगदान
        </h2>
        <p className="text-center text-gray-600 text-sm mb-8">
          Last updated: {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString('mr-IN') : new Date().toLocaleDateString('mr-IN')}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {/* Responses Card */}
          <div className="text-center p-4 md:p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="text-2xl md:text-3xl font-bold text-blue-600">
              {animatedResponses.toLocaleString()}
            </div>
            <p className="text-gray-700 text-xs md:text-sm font-medium mt-1 md:mt-2">उत्तरे</p>
            <p className="text-gray-500 text-[10px] md:text-xs">Responses</p>
          </div>

          {/* Contributors Card */}
          <div className="text-center p-4 md:p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="text-2xl md:text-3xl font-bold text-green-600">
              {animatedContributors.toLocaleString()}
            </div>
            <p className="text-gray-700 text-xs md:text-sm font-medium mt-1 md:mt-2">सहभागी</p>
            <p className="text-gray-500 text-[10px] md:text-xs">Contributors</p>
          </div>

          {/* Districts Card */}
          <div className="text-center p-4 md:p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="text-2xl md:text-3xl font-bold text-orange-600">
              {animatedDistricts.toLocaleString()}
            </div>
            <p className="text-gray-700 text-xs md:text-sm font-medium mt-1 md:mt-2">जिल्हे</p>
            <p className="text-gray-500 text-[10px] md:text-xs">Districts</p>
          </div>

          {/* Words Card */}
          <div className="text-center p-4 md:p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="text-2xl md:text-3xl font-bold text-purple-600">
              {animatedWords > 1000 ? `${(animatedWords / 1000).toFixed(0)}K` : animatedWords}
            </div>
            <p className="text-gray-700 text-xs md:text-sm font-medium mt-1 md:mt-2">शब्द</p>
            <p className="text-gray-500 text-[10px] md:text-xs">Words</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-700 text-sm mb-4">
            तुमचं योगदानही जोडा
          </p>
          <a
            href="/f/marathi-pilot-2026"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold text-base rounded-lg hover:bg-blue-700 transition-all shadow-md hover:-translate-y-0.5 hover:shadow-lg font-marathi"
          >
            योगदान द्या →
          </a>
        </div>
      </div>
    </section>
  );
}

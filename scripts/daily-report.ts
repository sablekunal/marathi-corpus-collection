/**
 * CLI runner for the daily monitoring report.
 * Run: npm run monitor:report
 * 
 * Schedule via cron, GitHub Actions, or Vercel Crons:
 *   0 9 * * * cd /path/to/project && npm run monitor:report
 */
import { sendDailyReport } from '../src/lib/monitoring/responseMonitor'

sendDailyReport()
  .then(() => {
    console.log('\n🎉 Daily report complete.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ Daily report failed:', err)
    process.exit(1)
  })

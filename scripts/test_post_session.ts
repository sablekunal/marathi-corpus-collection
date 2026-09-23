async function run() {
  const res = await fetch('http://localhost:3000/api/forms/marathi-pilot-2026/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metadata: { district: 'Pune', dialect: 'Standard', ageGroup: '18-24', gender: 'Male', education: 'Graduate', nativeSpeaker: 'Yes' }
    })
  })
  console.log('STATUS:', res.status)
  console.log('BODY:', await res.text())
}
run()

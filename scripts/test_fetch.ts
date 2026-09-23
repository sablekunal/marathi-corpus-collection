async function run() {
  const res1 = await fetch('http://localhost:3000/api/admin/forms')
  console.log('ADMIN FORMS:', await res1.text())

  const res2 = await fetch('http://localhost:3000/api/forms/marathi-pilot-2026/session')
  console.log('SESSION STATUS:', res2.status)
  console.log('SESSION BODY:', await res2.text())
}
run()

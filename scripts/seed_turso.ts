import { config } from 'dotenv'
config({ path: '.env.local' })

// MUST be imported after config() using dynamic import or require
async function run() {
  const { db } = await import('../src/lib/db')
  const { forms, questions, formQuestionRules } = await import('../src/lib/db/schema')
  const { nanoid } = await import('nanoid')
  
  console.log('Seeding Turso DB at:', process.env.DATABASE_URL)
  
  // Re-create the form since it was only in local.db
  const formId = '121GSlrVmrpDrtqFQsewj' // Using same ID as local to be consistent
  try {
    await db.insert(forms).values({
      id: formId,
      title: 'मराठी भाषा संशोधन सर्वेक्षण २०२६',
      description: 'मराठी भाषेच्या अत्याधुनिक संगणकीय संशोधनासाठी १-२ वाक्यांत आपली मते नोंदवा.',
      slug: 'marathi-pilot-2026',
      isPublished: true,
      isClosed: false,
      transliterationEnabled: true,
      antiPasteEnabled: true,
      metadataConfig: JSON.stringify({
        district: true,
        dialect: true,
        ageGroup: true,
        gender: true,
        education: true,
        nativeSpeaker: true,
      }),
      commentsEnabled: false,
      questionsPerForm: 4,
      maxResponses: 0,
    })
    console.log('Inserted form!')
  } catch (err: any) {
    if (err.message.includes('UNIQUE')) {
       console.log('Form already exists!')
    } else {
       console.error('Error inserting form', err)
    }
  }

  // Now seed questions by importing the seed logic we wrote before, or just re-running it.
  // Actually, I can just copy the seed generation logic here!
  const generatedQuestions: any[] = []

  function addQuestion(cat: string, q: string, desc: string = '') {
    generatedQuestions.push({
      id: nanoid(),
      category: cat,
      question: q,
      description: desc,
      enabled: true,
      minWords: 8,
      maxWords: 150,
      estimatedTime: 30,
      required: true,
      difficulty: 'easy'
    })
  }

  // 1. Handcrafted Core Questions
  const handcrafted = [
    { c: 'Experience', q: 'तुमच्या आयुष्यातील सर्वात अविस्मरणीय प्रवासाबद्दल सांगा.', d: 'कोणत्याही एका प्रवासाचा सविस्तर अनुभव.' },
    { c: 'Opinion', q: 'आजच्या काळात सोशल मीडियाचे फायदे जास्त आहेत की तोटे? तुमचे मत मांडा.', d: 'सविस्तर मत मांडा.' },
    { c: 'Descriptive', q: 'तुमच्या गावाचे किंवा शहराचे वर्णन तुमच्या शब्दांत करा.', d: 'भौगोलिक, सांस्कृतिक किंवा वैयक्तिक वर्णन.' },
    { c: 'Imagination', q: 'जर तुम्हाला एक दिवसासाठी अदृश्य होण्याची शक्ती मिळाली, तर तुम्ही काय कराल?', d: 'कल्पनाशक्तीचा वापर करा.' },
    { c: 'Philosophical', q: 'तुमच्या मते "यश" म्हणजे नक्की काय?', d: 'यशाची तुमची व्याख्या सांगा.' },
    { c: 'Cultural', q: 'मराठी संस्कृतीत कुटुंबाचे महत्त्व काय आहे?', d: 'एकत्र कुटुंब आणि विभक्त कुटुंब.' },
    { c: 'Experience', q: 'तुम्ही पहिल्यांदा सायकल किंवा गाडी चालवायला शिकलात तो प्रसंग सांगा.', d: 'लहानपणीची आठवण.' },
    { c: 'Opinion', q: 'शाळेत दिले जाणारे गृहपाठ (Homework) खरोखरच गरजेचे असते का?', d: 'मुलांच्या विकासात गृहपाठाचा वाटा.' },
    { c: 'Descriptive', q: 'तुमच्या सर्वात आवडत्या पुस्तकाचे किंवा चित्रपटाचे वर्णन करा.', d: 'कथा आणि पात्रे.' },
    { c: 'Cultural', q: 'महाराष्ट्रातील वारकरी संप्रदायाचे महत्त्व काय आहे?', d: 'संस्कृती आणि विचार.' },
    { c: 'Imagination', q: 'जर तुम्ही भारताचे पंतप्रधान झालात, तर कोणता पहिला निर्णय घ्याल?', d: 'तुमची दृष्टी.' }
  ]

  handcrafted.forEach(h => addQuestion(h.c, h.q, h.d))

  const festivals = ['दिवाळी', 'गुढीपाडवा', 'गणेशोत्सव', 'होळी', 'मकर संक्रांत', 'दसरा', 'पोळा', 'वटपौर्णिमा', 'रक्षाबंधन', 'नागपंचमी']
  const foods = ['पुरणपोळी', 'मिसळ पाव', 'वडा पाव', 'थालीपीठ', 'मोदक', 'झुणका भाकर', 'पावभाजी', 'श्रीखंड', 'कोल्हापुरी तांबडा पांढरा रस्सा', 'कांदा पोहे', 'साबुदाणा खिचडी', 'मासे (Fish fry)']
  const leaders = ['छत्रपती शिवाजी महाराज', 'डॉ. बाबासाहेब आंबेडकर', 'महात्मा ज्योतीराव फुले', 'सावित्रीबाई फुले', 'लोकमान्य टिळक', 'स्वातंत्र्यवीर सावरकर']
  const places = ['पुणे', 'मुंबई', 'कोकण', 'रायगड', 'महाबळेश्वर', 'अजिंठा-वेरूळ', 'पंढरपूर', 'सिंहगड', 'नागपूर', 'कोल्हापूर']
  const concepts = ['सोशल मीडिया', 'ऑनलाइन शिक्षण', 'निसर्ग संवर्धन', 'वाढते शहरीकरण', 'कृत्रिम बुद्धिमत्ता (AI)', 'वाचन संस्कृती', 'वेळ व्यवस्थापन', 'राजकारण', 'व्यायाम आणि आरोग्य', 'सेंद्रिय शेती']
  const relationships = ['आई', 'वडील', 'मित्र', 'शिक्षक', 'आजी-आजोबा']

  festivals.forEach(f => {
    addQuestion('Cultural', `${f} हा सण तुम्ही कसा साजरा करता?`, 'सविस्तर अनुभव सांगा.')
    addQuestion('Opinion', `आजकाल ${f} साजरा करण्याच्या पद्धतीत काय बदल झाले आहेत असे तुम्हाला वाटते?`, 'तुमचे मत मांडा.')
    addQuestion('Descriptive', `${f} या सणाचे महत्त्व तुमच्या शब्दांत सांगा.`, 'सांस्कृतिक महत्त्व.')
  })

  foods.forEach(f => {
    addQuestion('Descriptive', `${f} हा पदार्थ कसा बनवतात याची कृती (Recipe) थोडक्यात सांगा.`, 'तुमच्या घरची पद्धत.')
    addQuestion('Experience', `${f} हा पदार्थ खातानाची तुमची एखादी खास आठवण सांगा.`, 'आवड किंवा आठवण.')
  })

  leaders.forEach(l => {
    addQuestion('Opinion', `${l} यांच्या विचारांची आजच्या काळात काय प्रासंगिकता आहे?`, 'तुमचे मत मांडा.')
    addQuestion('Descriptive', `${l} यांच्या जीवनातील तुम्हाला सर्वात भावलेला प्रसंग कोणता?`, 'प्रसंगाचे वर्णन करा.')
  })

  places.forEach(p => {
    addQuestion('Descriptive', `${p} या ठिकाणाचे वर्णन करा. तुम्ही तिथे गेला आहात का?`, 'वैशिष्ट्ये सांगा.')
    addQuestion('Experience', `${p} ला दिलेल्या भेटीचा तुमचा अनुभव कसा होता?`, 'प्रवासाचा अनुभव.')
  })

  concepts.forEach(c => {
    addQuestion('Opinion', `${c} मुळे आपल्या समाजात कोणते चांगले किंवा वाईट बदल घडले आहेत?`, 'सविस्तर मत मांडा.')
    addQuestion('Philosophical', `पुढील १० वर्षांत ${c} चे स्वरूप कसे असेल असे तुम्हाला वाटते?`, 'भविष्याचा वेध.')
    addQuestion('Experience', `तुमच्या वैयक्तिक आयुष्यात '${c}' चा काय प्रभाव पडला ভাগে पडला आहे?`, 'तुमचा अनुभव.')
  })

  relationships.forEach(r => {
    addQuestion('Experience', `तुमच्या ${r} सोबतची सर्वात सुंदर आठवण कोणती?`, 'भावना व्यक्त करा.')
    addQuestion('Descriptive', `तुमच्या ${r} चे वर्णन एका परिच्छेदात करा.`, 'त्यांच्याबद्दल लिहा.')
  })

  const situations = [
    'जर अचानक वीज गेली आणि मोबाईलची बॅटरी संपली',
    'जर तुम्हाला लॉटरी लागली',
    'जर तुम्ही वेळेत मागे (Time Travel) जाऊ शकलात',
    'जर तुम्हाला प्राण्यांची भाषा समजायला लागली',
    'जर तुम्हाला चंद्रावर जाण्याची संधी मिळाली'
  ]

  situations.forEach(s => {
    addQuestion('Imagination', `${s}, तर तुम्ही काय कराल? सविस्तर सांगा.`, 'कल्पना करा आणि लिहा.')
  })

  const generalOpinions = [
    'शालेय शिक्षणात व्यावसायिक कौशल्यांचा समावेश',
    'प्लास्टिक बंदी',
    'महिला सक्षमीकरण',
    'बेरोजगारीची समस्या',
    'पाणी टंचाई',
    'पारंपरिक खेळ विरुद्ध व्हिडिओ गेम्स',
    'वृद्धाश्रमांची वाढती संख्या',
    'विभक्त कुटुंब पद्धती',
    'शेतकरी आत्महत्या',
    'भ्रष्टाचार'
  ]

  generalOpinions.forEach(go => {
    addQuestion('Opinion', `'${go}' या विषयावर तुमचे स्पष्ट मत मांडा.`, 'कारणे आणि उपाय.')
  })

  for (let i = 0; i < 200; i++) {
    const randomPlace = places[i % places.length]
    const randomFood = foods[i % foods.length]
    const randomFestival = festivals[i % festivals.length]
    const randomConcept = concepts[i % concepts.length]
    
    if (i % 5 === 0) {
      addQuestion('Opinion', `जर तुम्हाला '${randomPlace}' मधील एक गोष्ट बदलण्याची संधी मिळाली, तर तुम्ही काय बदलाल?`, 'तुमचे मत.')
    } else if (i % 5 === 1) {
      addQuestion('Experience', `${randomFestival}च्या दिवशी ${randomFood} खाण्याचा बेत असेल, तर तुमची प्रतिक्रिया काय असेल?`, 'अनुभव.')
    } else if (i % 5 === 2) {
      addQuestion('Descriptive', `'${randomConcept}' चा वापर करून '${randomPlace}' चा विकास कसा करता येईल?`, 'तुमच्या संकल्पना सांगा.')
    } else if (i % 5 === 3) {
      addQuestion('Philosophical', `जर '${randomFood}' हा जगातील एकमेव अन्नपदार्थ उरला, तर काय होईल?`, 'कल्पना करा.')
    } else {
      addQuestion('Cultural', `महाराष्ट्राच्या बाहेर राहणाऱ्या मराठी माणसाने '${randomFestival}' कसा साजरा करावा?`, 'सांस्कृतिक जतन.')
    }
  }

  const uniqueQuestions = Array.from(new Map(generatedQuestions.map(q => [q.question, q])).values())
  console.log(`Generated ${uniqueQuestions.length} unique questions.`)

  const chunkSize = 50
  let inserted = 0
  
  for (let i = 0; i < uniqueQuestions.length; i += chunkSize) {
    const chunk = uniqueQuestions.slice(i, i + chunkSize)
    await db.insert(questions).values(chunk).onConflictDoNothing()
    inserted += chunk.length
    console.log(`Inserted ${inserted} / ${uniqueQuestions.length}`)
  }

  console.log('Successfully seeded Turso!')
}

run().catch(console.error)

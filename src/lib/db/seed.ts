import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'
import { nanoid } from 'nanoid'

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
})

const db = drizzle(client, { schema })

const SAMPLE_QUESTIONS = [
  // Opinion
  {
    category: 'Opinion',
    question: 'ऑनलाइन शिक्षणाचे फायदे आणि तोटे याविषयी तुमचे मत सविस्तर मांडा.',
    description: 'विद्यार्थी, पालक आणि शिक्षक यांच्या दृष्टिकोनातून विचार करा.',
    minWords: 40,
    maxWords: 200,
    difficulty: 'easy',
  },
  {
    category: 'Opinion',
    question: 'सोशल मीडियाचा आजच्या तरुण पिढीच्या मानसिक आरोग्यावर काय परिणाम होत आहे?',
    description: 'सकारात्मक व नकारात्मक अशा दोन्ही बाजू स्पष्ट करा.',
    minWords: 45,
    maxWords: 250,
    difficulty: 'medium',
  },
  // Description
  {
    category: 'Description',
    question: 'तुमच्या गावातील किंवा शहरातील आठवडे बाजाराचे सजीव वर्णन करा.',
    description: 'भाजीपाल्याचे स्टॉल्स, माणसांची लगबग, आवाज आणि वातावरण यांचे चित्रण करा.',
    minWords: 50,
    maxWords: 250,
    difficulty: 'medium',
  },
  {
    category: 'Description',
    question: 'महाराष्ट्रातील कोणत्याही एका ऐतिहासिक किल्ल्याचे भौगोलिक व ऐतिहासिक वर्णन करा.',
    description: 'किल्ल्याचे प्रवेशद्वार, तटबंदी आणि निसर्गरम्य दृश्य यावर लिहा.',
    minWords: 45,
    maxWords: 250,
    difficulty: 'medium',
  },
  // Experience
  {
    category: 'Experience',
    question: 'तुम्ही केलेल्या एका अविस्मरणीय प्रवासाचा किंवा सहलीचा अनुभव सांगा.',
    description: 'तो प्रवास का खास ठरला आणि त्यातून तुम्हाला काय शिकायला मिळाले?',
    minWords: 50,
    maxWords: 250,
    difficulty: 'easy',
  },
  {
    category: 'Experience',
    question: 'पावसाळ्यातील पहिल्या पावसाचा तुमच्या मनावर आणि परिसरावर झालेला अनुभव लिहा.',
    description: 'मातीचा सुगंध, झाडांची ताजी पाने आणि तुमची वैयक्तिक भावना व्यक्त करा.',
    minWords: 40,
    maxWords: 200,
    difficulty: 'easy',
  },
  // Imagination
  {
    category: 'Imagination',
    question: 'जर तुम्हाला एका दिवसासाठी अदृश्य होण्याची शक्ती मिळाली, तर तुम्ही काय कराल?',
    description: 'तुमच्या कल्पकतेला पूर्ण वाव देऊन मजेशीर प्रसंग लिहा.',
    minWords: 45,
    maxWords: 250,
    difficulty: 'medium',
  },
  {
    category: 'Imagination',
    question: 'वर्ष 2050 मधील महाराष्ट्रातील शाळा आणि शिक्षण पद्धती कशी असेल?',
    description: 'रोबोट शिक्षक, आभासी वर्ग आणि आधुनिक तंत्रज्ञान यावर कल्पना करा.',
    minWords: 50,
    maxWords: 250,
    difficulty: 'medium',
  },
  // Instruction
  {
    category: 'Instruction',
    question: 'घरी चवदार आणि पारंपारिक कांदेपोहे बनवण्याची संपूर्ण कृती पायरीनुसार सांगा.',
    description: 'लागणारे साहित्य, फोडणीची पद्धत आणि सजवण्याची कृती स्पष्ट लिहा.',
    minWords: 40,
    maxWords: 200,
    difficulty: 'easy',
  },
  // Dialogue
  {
    category: 'Dialogue',
    question: 'दुकानदार आणि ग्राहक यांच्यात भाजीपाल्याच्या दरावरून झालेला मजेशीर संवाद लिहा.',
    description: 'दोघांच्या संवादात स्थानिक भाषेचा गोडवा असावा.',
    minWords: 40,
    maxWords: 200,
    difficulty: 'medium',
  },
  // Regional
  {
    category: 'Regional',
    question: 'तुमच्या परिसरातील किंवा जिल्ह्यातील कोणत्याही एका प्रसिद्ध सणाबद्दल सविस्तर माहिती द्या.',
    description: 'सण साजरा करण्याची पद्धत, पारंपारिक खाद्यपदार्थ आणि स्थानिक प्रथा यावर प्रकाश टाका.',
    minWords: 50,
    maxWords: 250,
    difficulty: 'medium',
  },
  // Comparison
  {
    category: 'Comparison',
    question: 'गावाकडचे जीवन आणि शहरामधील धावपळीचे जीवन यामधील फरक आणि साम्य स्पष्ट करा.',
    description: 'शांतता, प्रदूषण, सुविधा आणि नातेसंबंध या मुद्द्यांवर तुलना करा.',
    minWords: 50,
    maxWords: 250,
    difficulty: 'medium',
  },
  // Future
  {
    category: 'Future',
    question: 'कृत्रिम बुद्धिमत्ता (AI) मुळे भविष्यात मराठी भाषेचा वापर आणि डिजिटल स्वरूप कसे बदलेल?',
    description: 'मराठी भाषा तंत्रज्ञान, अनुवाद आणि शिक्षण क्षेत्रातील बदलांवर विचार मांडा.',
    minWords: 50,
    maxWords: 250,
    difficulty: 'hard',
  },
]

async function seed() {
  console.log('Seeding Marathi Corpus database...')

  // Insert sample questions
  for (const q of SAMPLE_QUESTIONS) {
    const qId = nanoid()
    await db.insert(schema.questions).values({
      id: qId,
      category: q.category,
      question: q.question,
      description: q.description,
      required: true,
      minWords: q.minWords,
      maxWords: q.maxWords,
      language: 'marathi',
      enabled: true,
      difficulty: q.difficulty,
      estimatedTime: 90,
      tags: JSON.stringify([q.category.toLowerCase(), 'sample']),
    })
  }

  console.log(`Inserted ${SAMPLE_QUESTIONS.length} sample questions across 9 categories.`)

  // Create default Pilot Form
  const formId = nanoid()
  const formSlug = 'marathi-pilot-2026'

  await db.insert(schema.forms).values({
    id: formId,
    title: 'मराठी भाषा संशोधन सर्वेक्षण २०२६',
    description: 'मराठी भाषेच्या अत्याधुनिक संगणकीय भाषिक संशोधनासाठी आपला सहभाग नोंदवा.',
    slug: formSlug,
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
    questionsPerForm: 3,
  })

  // Assign rules: 1 Opinion, 1 Experience, 1 Description
  const rules = [
    { category: 'Opinion', count: 1 },
    { category: 'Experience', count: 1 },
    { category: 'Description', count: 1 },
  ]

  for (const r of rules) {
    await db.insert(schema.formQuestionRules).values({
      id: nanoid(),
      formId,
      category: r.category,
      count: r.count,
    })
  }

  console.log(`Created default form "/f/${formSlug}" with 3 randomized rules.`)
  console.log('Seeding completed successfully.')
}

seed().catch(err => {
  console.error('Seed error:', err)
  process.exit(1)
})

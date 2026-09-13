import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'
import { nanoid } from 'nanoid'

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
})

const db = drizzle(client, { schema })

export const SAMPLE_QUESTIONS = [
  // Opinion (मत)
  {
    category: 'Opinion',
    question: 'आजच्या काळात लोकांची वाचनाची सवय का कमी होत चालली आहे?',
    description: 'आपले मत १ किंवा २ वाक्यांत स्पष्ट करा.',
    minWords: 8,
    maxWords: 45,
    difficulty: 'easy',
    estimatedTime: 30,
  },
  {
    category: 'Opinion',
    question: 'सोशल मीडियामुळे माणसांमधील प्रत्यक्ष भेटणे आणि संवाद कमी झाला आहे का?',
    description: 'तुमचे स्पष्ट मत १ ते २ वाक्यांत नोंदवा.',
    minWords: 8,
    maxWords: 45,
    difficulty: 'easy',
    estimatedTime: 30,
  },
  {
    category: 'Opinion',
    question: 'शहरात राहणे अधिक आवडते की गावामध्ये, आणि का?',
    description: 'कारणासह आपले मत १ किंवा २ वाक्यांत सांगा.',
    minWords: 8,
    maxWords: 45,
    difficulty: 'easy',
    estimatedTime: 30,
  },

  // Experience (अनुभव)
  {
    category: 'Experience',
    question: 'पावसाळ्यातील पहिल्या पावसाचा तुमच्या मनावर काय परिणाम होतो?',
    description: 'तुमची उत्स्फूर्त भावना १ किंवा २ वाक्यांत सांगा.',
    minWords: 8,
    maxWords: 45,
    difficulty: 'easy',
    estimatedTime: 30,
  },
  {
    category: 'Experience',
    question: 'लहानपणीचा कोणता खेळ किंवा खोडी तुम्हाला आजही आठवते?',
    description: 'ती आठवण १ किंवा २ वाक्यांत लिहा.',
    minWords: 8,
    maxWords: 45,
    difficulty: 'easy',
    estimatedTime: 30,
  },
  {
    category: 'Experience',
    question: 'तुम्ही नुकताच अनुभवलेला एखादा मनाला आनंद देणारा प्रसंग कोणता?',
    description: 'त्या प्रसंगाविषयी १ ते २ वाक्यांत सांगा.',
    minWords: 8,
    maxWords: 45,
    difficulty: 'easy',
    estimatedTime: 30,
  },

  // Description (वर्णन)
  {
    category: 'Description',
    question: 'तुमच्या घराच्या खिडकीतून किंवा दारातून दिसणाऱ्या सकाळच्या वातावरणाचे वर्णन करा.',
    description: 'सकाळचे दृश्य १ किंवा २ वाक्यांत शब्दबद्ध करा.',
    minWords: 8,
    maxWords: 45,
    difficulty: 'easy',
    estimatedTime: 30,
  },
  {
    category: 'Description',
    question: 'संध्याकाळचा सूर्यास्त पाहताना निसर्गात कोणते बदल दिसतात?',
    description: 'आकाश आणि वातावरण १ किंवा २ वाक्यांत वर्णन करा.',
    minWords: 8,
    maxWords: 45,
    difficulty: 'easy',
    estimatedTime: 30,
  },
  {
    category: 'Description',
    question: 'तुमच्या आवडत्या गरमागरम चहाची किंवा कॉफीची चव कशी वाटते?',
    description: 'त्या अनुभवाचे १ किंवा २ वाक्यांत वर्णन करा.',
    minWords: 8,
    maxWords: 45,
    difficulty: 'easy',
    estimatedTime: 30,
  },

  // Regional (स्थानिक संस्कृती व भाषा)
  {
    category: 'Regional',
    question: 'तुमच्या गावातील किंवा शहराची सर्वात प्रसिद्ध ओळख कोणती आहे?',
    description: 'स्थानिक वैशिष्ट्य १ किंवा २ वाक्यांत सांगा.',
    minWords: 8,
    maxWords: 45,
    difficulty: 'easy',
    estimatedTime: 30,
  },
  {
    category: 'Regional',
    question: 'तुमच्या भागात खूप आनंद किंवा नवल वाटल्यावर कोणता स्थानिक शब्द वापरतात?',
    description: 'तो शब्द किंवा वाक्प्रचार १ ते २ वाक्यांत सांगा.',
    minWords: 8,
    maxWords: 45,
    difficulty: 'easy',
    estimatedTime: 30,
  },
  {
    category: 'Regional',
    question: 'तुमचा सर्वात आवडता पारंपारिक महाराष्ट्रीयन खाद्यपदार्थ कोणता आणि तो का आवडतो?',
    description: 'त्याचे कारण १ किंवा २ वाक्यांत स्पष्ट करा.',
    minWords: 8,
    maxWords: 45,
    difficulty: 'easy',
    estimatedTime: 30,
  },

  // Imagination (कल्पकता)
  {
    category: 'Imagination',
    question: 'जर तुम्हाला हवे तिथे एका क्षणात पोहोचण्याची अदृश्य शक्ती मिळाली, तर कुठे जाल?',
    description: 'तुमची कल्पकता १ किंवा २ वाक्यांत मांडा.',
    minWords: 8,
    maxWords: 45,
    difficulty: 'easy',
    estimatedTime: 30,
  },
  {
    category: 'Imagination',
    question: 'भविष्यात रोबोट किंवा AI मानवाची सर्व कामे करू शकेल का?',
    description: 'तुमचा विचार एका किंवा दोन वाक्यांत स्पष्ट करा.',
    minWords: 8,
    maxWords: 45,
    difficulty: 'medium',
    estimatedTime: 30,
  },

  // Dialogue (संवाद व म्हणी)
  {
    category: 'Dialogue',
    question: 'घरी रात्री उशीर झाल्यावर आई किंवा वडील सामान्यतः काय म्हणतात?',
    description: 'तो घरगुती संवाद १ किंवा २ वाक्यांत लिहा.',
    minWords: 8,
    maxWords: 45,
    difficulty: 'easy',
    estimatedTime: 30,
  },
  {
    category: 'Dialogue',
    question: 'तुमची सर्वात आवडती मराठी म्हण कोणती आणि ती कोणत्या प्रसंगी वापरली जाते?',
    description: 'म्हण आणि तिचा प्रसंग १ ते २ वाक्यांत सांगा.',
    minWords: 8,
    maxWords: 45,
    difficulty: 'easy',
    estimatedTime: 30,
  },
]

async function seed() {
  console.log('Seeding Marathi Corpus database with short 1-2 sentence questions...')

  // Clear existing rules, assignments, responses, and questions for a clean seed
  try {
    await db.delete(schema.formQuestionRules)
    await db.delete(schema.assignedQuestionSets)
    await db.delete(schema.responses)
    await db.delete(schema.questions)
    await db.delete(schema.forms)
    console.log('Cleared existing pilot tables for fresh 1-2 sentence questions.')
  } catch (cleanErr) {
    console.warn('Note during clean:', cleanErr)
  }

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
      estimatedTime: q.estimatedTime,
      tags: JSON.stringify([q.category.toLowerCase(), 'sample', 'concise']),
    })
  }

  console.log(`Inserted ${SAMPLE_QUESTIONS.length} concise 1-2 sentence questions across 6 categories.`)

  // Create default Pilot Form
  const formId = nanoid()
  const formSlug = 'marathi-pilot-2026'

  await db.insert(schema.forms).values({
    id: formId,
    title: 'मराठी भाषा संशोधन सर्वेक्षण २०२६',
    description: 'मराठी भाषेच्या अत्याधुनिक संगणकीय संशोधनासाठी १-२ वाक्यांत आपली मते नोंदवा.',
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
  console.log('Seeding completed successfully with short 1-2 sentence questions.')
}

seed().catch(err => {
  console.error('Seed error:', err)
  process.exit(1)
})

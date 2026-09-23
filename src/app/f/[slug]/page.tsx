import { db } from '@/lib/db'
import { forms } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ClientFormShell } from '@/components/respondent/ClientFormShell'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const [form] = await db.select().from(forms).where(eq(forms.slug, slug))
  
  if (!form) {
    return { title: 'Form Not Found' }
  }
  
  return {
    title: `${form.title} | Marathi Corpus`,
    description: form.description || 'Contribute to the Marathi language LLM dataset.',
  }
}

export default async function FormRespondentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  const [form] = await db.select().from(forms).where(eq(forms.slug, slug))
  
  if (!form) {
    return notFound()
  }
  
  if (!form.isPublished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-marathi">
        <div className="bg-white border border-rose-200 rounded-2xl p-8 max-w-md w-full text-center shadow-lg space-y-4">
          <h2 className="text-lg font-bold text-slate-800">माहिती (Info)</h2>
          <p className="text-sm text-slate-600">हा फॉर्म सध्या प्रकाशित झालेला नाही. (This form is not published yet.)</p>
        </div>
      </div>
    )
  }
  
  if (form.isClosed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-marathi">
        <div className="bg-white border border-rose-200 rounded-2xl p-8 max-w-md w-full text-center shadow-lg space-y-4">
          <h2 className="text-lg font-bold text-slate-800">माहिती (Info)</h2>
          <p className="text-sm text-slate-600">हा फॉर्म आता बंद झाला आहे. (This form is now closed.)</p>
        </div>
      </div>
    )
  }

  return <ClientFormShell slug={slug} initialForm={form} />
}

'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle } from 'lucide-react'

export default function PromotePage() {
  const [status, setStatus] = useState('Tekshirilmoqda...')
  const router = useRouter()

  useEffect(() => {
    async function promote() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setStatus("Siz tizimga kirmagansiz. Iltimos login qiling.")
        return
      }

      const userId = session.user.id
      
      setStatus("Sizga admin huquqi berilmoqda...")
      
      const { error } = await supabase
        .from('users')
        .update({ role: 'super_admin' })
        .eq('id', userId)

      if (error) {
        setStatus("Xatolik yuz berdi: " + error.message)
      } else {
        setStatus("Tabriklaymiz! Siz endi Super Adminsiz.")
        setTimeout(() => {
          router.push('/admin/courses')
        }, 2000)
      }
    }
    
    promote()
  }, [router])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <h1 className="admin-h1" style={{ marginBottom: '20px' }}>Huquqlarni yangilash</h1>
      <p className="admin-text" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {status.includes('Tabriklaymiz') ? <CheckCircle color="#22c55e" /> : <Loader2 className="animate-spin" />}
        {status}
      </p>
    </div>
  )
}

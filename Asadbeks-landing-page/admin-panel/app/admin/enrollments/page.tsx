'use client'
import { useEffect, useState } from 'react'
import { supabase, Enrollment, Course } from '@/lib/supabase'
import { Check, X, Trash2, Download, Loader2, Filter, InboxIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { sendTelegramNotification } from '@/lib/telegram'

function EmptyState({ icon: Icon, title, subtitle, action }: any) {
  return (
    <div className="empty-state">
      <div className="icon"><Icon /></div>
      <h4>{title}</h4>
      <p>{subtitle}</p>
      {action}
    </div>
  )
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCourse, setFilterCourse] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const fetchData = async () => {
    let q = supabase.from('enrollments').select('*, courses(name)').order('created_at', { ascending: false })
    if (filterCourse) q = q.eq('course_id', filterCourse)
    if (filterStatus) q = q.eq('status', filterStatus)
    const { data, error } = await q
    if (error) {
      console.error("Enrollments fetch xatosi:", error)
      toast.error("Ma'lumotlarni yuklashda xato: " + error.message)
    }
    setEnrollments((data || []) as Enrollment[])
    const { data: cData } = await supabase.from('courses').select('*')
    setCourses((cData || []) as Course[])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [filterCourse, filterStatus])

  useEffect(() => {
    const channel = supabase.channel('enrollments-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments' }, () => fetchData())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const updateStatus = async (e: Enrollment, status: 'approved' | 'rejected') => {
    await supabase.from('enrollments').update({ status }).eq('id', e.id)
    if (status === 'approved') {
      const courseName = (e as any).courses?.name || 'Noma\'lum kurs'
      await sendTelegramNotification({ full_name: e.full_name, phone: e.phone, course_name: courseName, created_at: e.created_at, source_page: e.source_page, id: e.id })
      toast.success('Tasdiqlandi va Telegram ga xabar yuborildi!')
    } else {
      toast.success('Rad etildi!')
    }
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await supabase.from('enrollments').delete().eq('id', id)
    toast.success("O'chirildi!")
    fetchData()
  }

  const exportExcel = async () => {
    const xlsx = await import('xlsx')
    const ws = xlsx.utils.json_to_sheet(enrollments.map(e => ({
      'Ism': e.full_name, 'Telefon': e.phone,
      'Kurs': (e as any).courses?.name || '—',
      'Holat': e.status, 'Sahifa': e.source_page,
      'Vaqt': new Date(e.created_at).toLocaleString('uz-UZ'),
    })))
    const wb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(wb, ws, 'Yozilishlar')
    xlsx.writeFile(wb, 'yozilishlar.xlsx')
    toast.success('Excel yuklab olindi!')
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 className="admin-h1" style={{ fontSize: '24px' }}>Yozilishlar</h1>
          <p className="admin-text" style={{ fontSize: '14px', marginTop: '4px' }}>Yozilishlarni boshqarish</p>
        </div>
        <button className="btn-ghost" onClick={exportExcel}><Download size={16} />Excel</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          <Filter size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <select className="form-input" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
            style={{ paddingLeft: '36px', width: 'auto', minWidth: 180 }}>
            <option value="">Barcha kurslar</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <select className="form-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
          <option value="">Barcha holat</option>
          <option value="pending">Kutilmoqda</option>
          <option value="approved">Tasdiqlangan</option>
          <option value="rejected">Rad etilgan</option>
        </select>
        <div style={{ marginLeft: 'auto', background: 'rgba(34,197,94,0.1)', color: '#22C55E', padding: '8px 14px', borderRadius: 8, fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          ● Jonli yangilanish
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="admin-text" style={{ padding: '60px', textAlign: 'center' }}><Loader2 size={24} style={{ margin: '0 auto 8px' }} /><p>Yuklanmoqda...</p></div>
        ) : enrollments.length === 0 ? (
          <EmptyState icon={InboxIcon} title="Ma'lumot yo'q" subtitle="Hozircha hech kim yozilmagan" />
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Ism</th><th>Telefon</th><th>Kurs</th><th>Sahifa</th><th>Holat</th><th>Vaqt</th><th>Amallar</th></tr>
            </thead>
            <tbody>
              {enrollments.map(e => (
                <tr key={e.id}>
                  <td className="admin-text" style={{ fontWeight: 600 }}>{e.full_name}</td>
                  <td><a href={`tel:${e.phone}`} style={{ color: '#3B82F6', textDecoration: 'none' }}>{e.phone}</a></td>
                  <td className="admin-text">{(e as any).courses?.name || '—'}</td>
                  <td className="admin-text" style={{ fontSize: '12px' }}>{e.source_page || '—'}</td>
                  <td><span className={`badge badge-${e.status}`}>{e.status === 'pending' ? 'Kutilmoqda' : e.status === 'approved' ? 'Tasdiqlangan' : 'Rad etilgan'}</span></td>
                  <td className="admin-text" style={{ fontSize: '12px' }}>{new Date(e.created_at).toLocaleString('uz-UZ')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {e.status === 'pending' && <>
                        <button onClick={() => updateStatus(e, 'approved')} title="Tasdiqlash" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#22C55E' }}><Check size={14} /></button>
                        <button onClick={() => updateStatus(e, 'rejected')} title="Rad etish" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#EF4444' }}><X size={14} /></button>
                      </>}
                      <button onClick={() => handleDelete(e.id)} title="O'chirish" style={{ background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#94A3B8' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

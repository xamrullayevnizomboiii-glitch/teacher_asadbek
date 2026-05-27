'use client'
import { useEffect, useState } from 'react'
import { supabase, Course } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X, Loader2, Users, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

const emptyForm = { name: '', price: 0, schedule: '', students_count: 0, type: 'both' as 'online' | 'offline' | 'both', description: '', is_popular: false, is_active: true }

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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('created_at')
    setCourses((data || []) as Course[])
    setLoading(false)
  }
  useEffect(() => { fetchCourses() }, [])

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true) }
  const openEdit = (c: Course) => { setEditing(c); setForm({ name: c.name, price: c.price, schedule: c.schedule, students_count: c.students_count, type: c.type, description: c.description, is_popular: c.is_popular, is_active: c.is_active }); setModal(true) }

  const handleSave = async () => {
    setSaving(true)
    if (editing) {
      const { data, error } = await supabase.from('courses').update(form).eq('id', editing.id).select()
      if (error || !data || data.length === 0) { 
        console.error(error)
        toast.error('Saqlanmadi: ' + (error?.message || JSON.stringify(error) || "Ruxsat etilmagan (RLS) xatosi bo'lishi mumkin"))
        setSaving(false)
        return 
      }
      toast.success("Kurs yangilandi!")
    } else {
      const { data, error } = await supabase.from('courses').insert(form).select()
      if (error || !data || data.length === 0) { 
        console.error(error)
        toast.error('Qo\'shilmadi: ' + (error?.message || JSON.stringify(error) || "Ruxsat etilmagan (RLS) xatosi bo'lishi mumkin"))
        setSaving(false)
        return 
      }
      toast.success("Kurs qo'shildi!")
    }
    setSaving(false)
    setModal(false)
    fetchCourses()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await supabase.from('courses').delete().eq('id', id)
    toast.success("O'chirildi!")
    fetchCourses()
  }

  const toggleActive = async (id: string, val: boolean) => {
    // Optimistic update
    setCourses(prev => prev.map(c => c.id === id ? { ...c, is_active: !val } : c))
    const { data, error } = await supabase.from('courses').update({ is_active: !val }).eq('id', id).select()
    if (error || !data || data.length === 0) {
      console.error('Toggle error:', error, 'Data:', data)
      toast.error(`Xato: ${error ? JSON.stringify(error) : 'Baza bo\'sh qaytdi (RLS blokladi)'}`)
      fetchCourses() // Revert back
    } else {
      toast.success("Status o'zgardi!")
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 className="admin-h1" style={{ fontSize: '24px' }}>Kurslar</h1>
          <p className="admin-text" style={{ fontSize: '14px', marginTop: '4px' }}>Kurslarni boshqarish</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={16} />Kurs qo'shish</button>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="admin-text" style={{ padding: '60px', textAlign: 'center' }}><Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} /><p>Yuklanmoqda...</p></div>
        ) : courses.length === 0 ? (
          <EmptyState icon={BookOpen} title="Ma'lumot yo'q" subtitle="Hali hech qanday kurs qo'shilmagan" action={<button className="btn-primary" onClick={openAdd}><Plus size={16} />Birinchi kursni qo'shish</button>} />
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Kurs nomi</th><th>Narx</th><th>Vaqt</th><th>O'quvchilar</th><th>Tur</th><th>Mashhur</th><th>Status</th><th>Amallar</th></tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id}>
                  <td className="admin-text" style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ color: '#FF6B00', fontWeight: 700 }}>{c.price.toLocaleString()} so'm</td>
                  <td className="admin-text" style={{ fontSize: '13px' }}>{c.schedule}</td>
                  <td className="admin-text"><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={14} />{c.students_count}</div></td>
                  <td><span className="badge" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>{c.type}</span></td>
                  <td>{c.is_popular ? '⭐' : '—'}</td>
                  <td>
                    <label className="toggle">
                      <input type="checkbox" checked={c.is_active} onChange={() => toggleActive(c.id, c.is_active)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEdit(c)} style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#3B82F6' }}><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(c.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 className="admin-h3" style={{ fontSize: '18px' }}>{editing ? 'Kursni tahrirlash' : "Kurs qo'shish"}</h3>
              <button onClick={() => setModal(false)} className="admin-text" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { key: 'name', label: 'Kurs nomi', type: 'text', placeholder: 'CEFR Guruhi' },
                { key: 'price', label: 'Narxi (so\'m)', type: 'number', placeholder: '300000' },
                { key: 'schedule', label: 'Dars vaqti', type: 'text', placeholder: 'Har kuni 16:00-18:00' },
                { key: 'students_count', label: "O'quvchilar soni", type: 'number', placeholder: '45' },
                { key: 'description', label: 'Tavsif', type: 'text', placeholder: 'Kurs haqida...' },
              ].map(field => (
                <div key={field.key}>
                  <label className="form-label">{field.label}</label>
                  <input className="form-input" type={field.type} placeholder={field.placeholder}
                    value={(form as any)[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: field.type === 'number' ? +e.target.value : e.target.value }))} />
                </div>
              ))}
              <div>
                <label className="form-label">Tur</label>
                <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="both">Online va Offline</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                {[{ key: 'is_popular', label: 'Mashhur' }, { key: 'is_active', label: 'Faol' }].map(cb => (
                  <label key={cb.key} className="admin-text" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '14px' }}>
                    <input type="checkbox" checked={(form as any)[cb.key]} onChange={e => setForm(f => ({ ...f, [cb.key]: e.target.checked }))} style={{ accentColor: '#FF6B00', width: 16, height: 16 }} />
                    {cb.label}
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button className="btn-ghost" onClick={() => setModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Bekor qilish</button>
                <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}{saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

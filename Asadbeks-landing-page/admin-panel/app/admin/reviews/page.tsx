'use client'
import { useEffect, useState } from 'react'
import { supabase, Review } from '@/lib/supabase'
import { Check, X, Trash2, Plus, Loader2, Star } from 'lucide-react'
import toast from 'react-hot-toast'

const Stars = ({ n }: { n: number }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: '14px', color: i <= n ? '#EAB308' : '#334155' }}>★</span>)}
  </div>
)

const emptyForm = { full_name: '', course: '', rating: 5, comment: '' }

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

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchReviews = async () => {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
    setReviews((data || []) as Review[])
    setLoading(false)
  }
  useEffect(() => { fetchReviews() }, [])

  const toggleApprove = async (r: Review) => {
    await supabase.from('reviews').update({ is_approved: !r.is_approved }).eq('id', r.id)
    toast.success(r.is_approved ? 'Bekor qilindi!' : 'Tasdiqlandi!')
    fetchReviews()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await supabase.from('reviews').delete().eq('id', id)
    toast.success("O'chirildi!")
    fetchReviews()
  }

  const handleAdd = async () => {
    setSaving(true)
    const { error } = await supabase.from('reviews').insert({ ...form, is_approved: true })
    if (error) { toast.error('Xato!'); setSaving(false); return }
    toast.success("Sharh qo'shildi!")
    setModal(false); setForm(emptyForm); setSaving(false)
    fetchReviews()
  }

  const pending = reviews.filter(r => !r.is_approved)
  const approved = reviews.filter(r => r.is_approved)

  const ReviewCard = ({ r }: { r: Review }) => (
    <div className="admin-card" style={{ border: `1px solid ${r.is_approved ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)'}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p className="admin-text" style={{ fontWeight: 700, fontSize: '14px' }}>{r.full_name}</p>
          <p className="admin-text" style={{ fontSize: '12px' }}>{r.course}</p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => toggleApprove(r)} title={r.is_approved ? 'Bekor qilish' : 'Tasdiqlash'}
            style={{ background: r.is_approved ? 'rgba(234,179,8,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${r.is_approved ? 'rgba(234,179,8,0.2)' : 'rgba(34,197,94,0.2)'}`, borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: r.is_approved ? '#EAB308' : '#22C55E' }}>
            {r.is_approved ? <X size={14} /> : <Check size={14} />}
          </button>
          <button onClick={() => handleDelete(r.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={14} /></button>
        </div>
      </div>
      <Stars n={r.rating} />
      <p className="admin-text" style={{ fontSize: '13px', lineHeight: 1.6, fontStyle: 'italic' }}>"{r.comment}"</p>
      <p className="admin-text" style={{ fontSize: '11px', opacity: 0.7 }}>{new Date(r.created_at).toLocaleDateString('uz-UZ')}</p>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 className="admin-h1" style={{ fontSize: '24px' }}>Sharhlar</h1>
          <p className="admin-text" style={{ fontSize: '14px', marginTop: '4px' }}>O'quvchilar sharhlarini boshqarish</p>
        </div>
        <button className="btn-primary" onClick={() => setModal(true)}><Plus size={16} />Sharh qo'shish</button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}><Loader2 size={24} style={{ margin: '0 auto' }} /></div> : (
        <>
          {pending.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#EAB308' }}>Tasdiqlanmagan sharhlar</h2>
                <span style={{ background: 'rgba(234,179,8,0.1)', color: '#EAB308', padding: '2px 10px', borderRadius: 20, fontSize: '12px', fontWeight: 700 }}>{pending.length}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                {pending.map(r => <ReviewCard key={r.id} r={r} />)}
              </div>
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#22C55E' }}>Tasdiqlangan sharhlar</h2>
              <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', padding: '2px 10px', borderRadius: 20, fontSize: '12px', fontWeight: 700 }}>{approved.length}</span>
            </div>
            {approved.length === 0 && pending.length === 0 ? <EmptyState icon={Star} title="Ma'lumot yo'q" subtitle="Hali hech qanday sharh qo'shilmagan" /> : approved.length === 0 ? <p className="admin-text" style={{ fontSize: '14px' }}>Hali tasdiqlangan sharhlar yo'q</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                {approved.map(r => <ReviewCard key={r.id} r={r} />)}
              </div>
            )}
          </div>
        </>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 className="admin-h3" style={{ fontSize: '18px' }}>Sharh qo'shish</h3>
              <button onClick={() => setModal(false)} className="admin-text" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[{key:'full_name',label:"Ism",ph:"Ali Valiyev"},{key:'course',label:"Kurs",ph:"CEFR Guruhi"}].map(f => (
                <div key={f.key}><label className="form-label">{f.label}</label>
                  <input className="form-input" placeholder={f.ph} value={(form as any)[f.key]} onChange={e => setForm(p => ({...p,[f.key]:e.target.value}))} /></div>
              ))}
              <div>
                <label className="form-label">Reyting</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setForm(p => ({...p, rating: n}))}
                      style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', opacity: n <= form.rating ? 1 : 0.3 }}>★</button>
                  ))}
                </div>
              </div>
              <div><label className="form-label">Izoh</label>
                <textarea className="form-input" rows={4} placeholder="O'quvchining sharhi..." value={form.comment} onChange={e => setForm(p => ({...p, comment: e.target.value}))} style={{ resize: 'vertical' }} /></div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-ghost" onClick={() => setModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Bekor</button>
                <button className="btn-primary" onClick={handleAdd} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}{saving ? 'Saqlanmoqda...' : 'Qo\'shish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

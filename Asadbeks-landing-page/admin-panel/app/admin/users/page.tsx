'use client'
import { useEffect, useState } from 'react'
import { supabase, UserProfile } from '@/lib/supabase'
import { Plus, Trash2, X, Loader2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

const roleLabels: Record<string, { label: string, color: string, bg: string }> = {
  super_admin: { label: 'Super Admin', color: '#FF6B00', bg: 'rgba(255,107,0,0.1)' },
  admin: { label: 'Admin', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  moderator: { label: 'Moderator', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [form, setForm] = useState({ full_name: '', email: '', role: 'moderator' })
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data: me } = await supabase.from('users').select('*').eq('id', session.user.id).single()
      setCurrentUser(me as UserProfile)
      if (me?.role !== 'super_admin') { setLoading(false); return }
    }
    const { data } = await supabase.from('users').select('*').order('created_at')
    setUsers((data || []) as UserProfile[])
    setLoading(false)
  }
  useEffect(() => { fetchData() }, [])

  const handleAdd = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: 'Admin123!',
          full_name: form.full_name,
          role: form.role
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        toast.error("Xato: " + (data.error || "Foydalanuvchi yaratilmadi"))
      } else {
        toast.success("Yangi xodim muvaffaqiyatli qo'shildi!")
        setModal(false)
        setForm({ full_name: '', email: '', role: 'moderator' })
        fetchData()
      }
    } catch (err: any) {
      toast.error("Xato: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const updateRole = async (id: string, role: string) => {
    await supabase.from('users').update({ role }).eq('id', id)
    toast.success('Role yangilandi!')
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await supabase.from('users').delete().eq('id', id)
    toast.success("O'chirildi!")
    fetchData()
  }

  if (!loading && currentUser?.role !== 'super_admin') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <Shield size={48} color="#EF4444" style={{ margin: '0 auto 16px' }} />
        <h2 className="admin-h2" style={{ fontSize: '20px', marginBottom: '8px' }}>Ruxsat yo'q</h2>
        <p className="admin-text">Bu sahifa faqat Super Admin uchun.</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 className="admin-h1" style={{ fontSize: '24px' }}>Foydalanuvchilar</h1>
          <p className="admin-text" style={{ fontSize: '14px', marginTop: '4px' }}>Admin va moderatorlarni boshqarish</p>
        </div>
        <button className="btn-primary" onClick={() => setModal(true)}><Plus size={16} />Admin qo'shish</button>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="admin-text" style={{ padding: '60px', textAlign: 'center' }}><Loader2 size={24} style={{ margin: '0 auto' }} /></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Ism</th><th>Email</th><th>Role</th><th>Qo'shilgan sana</th><th>Amallar</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FF6B00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>{u.full_name?.charAt(0)}</div>
                    {u.full_name}
                  </td>
                  <td className="admin-text">{u.email}</td>
                  <td>
                    <select value={u.role} onChange={e => updateRole(u.id, e.target.value)}
                      style={{ background: roleLabels[u.role]?.bg || 'transparent', color: roleLabels[u.role]?.color || '#F0F4F8', border: `1px solid ${roleLabels[u.role]?.color || '#94A3B8'}40`, borderRadius: 8, padding: '4px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                    </select>
                  </td>
                  <td className="admin-text" style={{ fontSize: '12px' }}>{new Date(u.created_at).toLocaleDateString('uz-UZ')}</td>
                  <td><button onClick={() => handleDelete(u.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={14} /></button></td>
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
              <h3 className="admin-h3" style={{ fontSize: '18px' }}>Admin qo'shish</h3>
              <button onClick={() => setModal(false)} className="admin-text" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[{key:'full_name',label:"To'liq ism",ph:"Alijon Valiyev",type:'text'},{key:'email',label:"Email",ph:"admin@example.com",type:'email'}].map(f => (
                <div key={f.key}><label className="form-label">{f.label}</label>
                  <input className="form-input" type={f.type} placeholder={f.ph} value={(form as any)[f.key]} onChange={e => setForm(p => ({...p,[f.key]:e.target.value}))} /></div>
              ))}
              <div><label className="form-label">Role</label>
                <select className="form-input" value={form.role} onChange={e => setForm(p => ({...p,role:e.target.value}))}>
                  <option value="admin">Admin</option><option value="moderator">Moderator</option>
                </select>
              </div>
              <p className="admin-text" style={{ fontSize: '12px', background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 8, padding: '10px 14px' }}>⚠️ Dastlabki parol: <code style={{ color: '#EAB308' }}>Admin123!</code> — Foydalanuvchi birinchi kirishda o'zgartirsin.</p>
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

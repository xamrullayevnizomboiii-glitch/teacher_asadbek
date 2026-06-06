'use client'
import { useEffect, useState } from 'react'
import { supabase, Setting } from '@/lib/supabase'
import { Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const defaultSettings = [
  { key: 'teacher_name', label: 'Ustoz ismi', placeholder: 'Asadbek Arakulov' },
  { key: 'phone', label: 'Telefon raqam', placeholder: '+998 99 528 27 28' },
  { key: 'telegram', label: 'Telegram username', placeholder: '@Multilevel_instructor1' },
  { key: 'instagram', label: 'Instagram username', placeholder: 'teacher_arakulov' },
  { key: 'site_name', label: 'Sayt nomi', placeholder: 'Asadbek Arakulov' },
  { key: 'address', label: 'Manzil', placeholder: 'Jizzax viloyati, Forish tumani' },
  { key: 'years_experience', label: 'Tajriba (yil)', placeholder: '6' },
  { key: 'students_count', label: "Jami o'quvchilar", placeholder: '500' },
]

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('settings').select('*')
      const map: Record<string, string> = {}
      ;(data || []).forEach((s: Setting) => { map[s.key] = s.value })
      defaultSettings.forEach(s => { if (!map[s.key]) map[s.key] = '' })
      setValues(map)
      setLoading(false)
    }
    fetch()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const promises = Object.entries(values).map(([key, value]) =>
      supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    )
    await Promise.all(promises)
    toast.success("Sozlamalar saqlandi! Landing page ham yangilandi.")
    setSaving(false)
  }

  const groups = [
    { title: 'Ustoz ma\'lumotlari', keys: ['teacher_name', 'phone', 'telegram', 'instagram', 'years_experience', 'students_count'] },
    { title: 'Umumiy ma\'lumotlar', keys: ['site_name', 'address'] },
  ]

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: isMobile ? '12px' : '0', marginBottom: '28px' }}>
        <div>
          <h1 className="admin-h1" style={{ fontSize: '24px' }}>Sozlamalar</h1>
          <p className="admin-text" style={{ fontSize: '14px', marginTop: '4px' }}>Sayt ma'lumotlarini tahrirlash</p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}><Loader2 size={24} style={{ margin: '0 auto' }} /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {groups.map(group => (
            <div key={group.title} className="admin-card">
              <h3 className="admin-h3" style={{ fontSize: '15px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,107,0,0.1)' }}>
                {group.title}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {group.keys.map(key => {
                  const field = defaultSettings.find(s => s.key === key)
                  if (!field) return null
                  return (
                    <div key={key}>
                      <label className="form-label">{field.label}</label>
                      <input className="form-input" placeholder={field.placeholder} value={values[key] || ''}
                        onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))} />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Landing Page Integration Info */}
          <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#3B82F6', marginBottom: '12px' }}>🔗 Landing Page bilan integratsiya</h3>
            <p style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '16px', lineHeight: 1.6 }}>
              Saqlangan ma'lumotlar Supabase orqali landing page ga avtomatik uzatiladi. Landing page quyidagi skriptni o'z ichiga olishi kerak:
            </p>
            <pre style={{ background: '#0A1628', border: '1px solid rgba(255,107,0,0.1)', borderRadius: '10px', padding: '16px', fontSize: isMobile ? '11px' : '12px', color: '#94A3B8', overflow: 'auto', maxWidth: '100%', lineHeight: 1.8 }}>
{`<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
const sb = supabase.createClient(
  'https://cxbtauopxdywwcxhpnds.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
)
async function loadSettings() {
  const { data } = await sb.from('settings').select('*')
  data?.forEach(s => {
    document.querySelectorAll('[data-setting="'+s.key+'"]')
      .forEach(el => el.textContent = s.value)
  })
}
loadSettings()
</script>`}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

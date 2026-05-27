'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import {
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const COLORS = ['#FF6B00', '#3B82F6', '#22C55E', '#EAB308', '#A855F7']

export default function StatisticsPage() {
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.from('site_stats').select('*').order('date', { ascending: false }).limit(30)
      setStats((data || []).reverse())
      setLoading(false)
    }
    fetchStats()
  }, [])

  const mockDailyData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i))
    return { date: d.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' }), tashrif: Math.floor(Math.random() * 150) + 20, yozilish: Math.floor(Math.random() * 10) }
  })

  const pageData = [
    { name: 'Bosh sahifa', value: 42 },
    { name: 'Kurslar', value: 28 },
    { name: 'Mock Test', value: 18 },
    { name: 'Bog\'lanish', value: 12 },
  ]

  const cityData = [
    { city: 'Jizzax', soni: 85 },
    { city: 'Toshkent', soni: 45 },
    { city: 'Samarqand', soni: 32 },
    { city: 'Namangan', soni: 22 },
    { city: 'Boshqa', soni: 16 },
  ]

  const tooltipStyle = { background: '#162236', border: '1px solid rgba(255,107,0,0.2)', borderRadius: 8, color: '#F0F4F8', fontSize: 13 }

  const summaryCards = [
    { label: "O'rtacha kunlik tashrif", value: '87', unit: 'kishi' },
    { label: "Saytda o'tirish vaqti", value: '3:24', unit: 'daqiqa' },
    { label: "Qaytuvchi foydalanuvchilar", value: '34', unit: '%' },
    { label: "Konversiya darajasi", value: '8.2', unit: '%' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="admin-h1" style={{ fontSize: '24px' }}>Statistika</h1>
        <p className="admin-text" style={{ fontSize: '14px', marginTop: '4px' }}>Sayt ko'rsatkichlari va tahlil</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {summaryCards.map(c => (
          <div key={c.label} className="admin-card">
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#FF6B00' }}>{c.value}<span className="admin-text" style={{ fontSize: '16px', marginLeft: '4px' }}>{c.unit}</span></div>
            <div className="admin-text" style={{ fontSize: '13px', marginTop: '6px' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Daily Chart */}
      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <h3 className="admin-h3" style={{ fontSize: '15px', marginBottom: '20px' }}>So'nggi 30 kunlik tashrif</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={mockDailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,107,0,0.07)" />
            <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
            <Line type="monotone" dataKey="tashrif" stroke="#FF6B00" strokeWidth={2} dot={false} name="Tashrif" />
            <Line type="monotone" dataKey="yozilish" stroke="#22C55E" strokeWidth={2} dot={false} name="Yozilish" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Pie Chart */}
        <div className="admin-card">
          <h3 className="admin-h3" style={{ fontSize: '15px', marginBottom: '20px' }}>Ko'p ko'rilgan sahifalar</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* City Bar Chart */}
        <div className="admin-card">
          <h3 className="admin-h3" style={{ fontSize: '15px', marginBottom: '20px' }}>Shaharlar bo'yicha tashrif</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,107,0,0.07)" />
              <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="city" type="category" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="soni" fill="#FF6B00" radius={[0, 6, 6, 0]} name="Tashrif" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

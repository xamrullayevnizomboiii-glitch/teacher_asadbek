'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, BookOpen, Star, TrendingUp, InboxIcon, Package } from 'lucide-react'
import Link from 'next/link'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import type { Enrollment } from '@/lib/supabase'

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(0)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
    ref.current = 0
    const step = Math.max(1, Math.ceil(target / 40))
    const timer = setInterval(() => {
      ref.current += step
      if (ref.current >= target) { setCount(target); clearInterval(timer) }
      else setCount(ref.current)
    }, 30)
    return () => clearInterval(timer)
  }, [target])
  return <>{count.toLocaleString()}</>
}

function EmptyState({ icon: Icon, title, subtitle, action }: {
  icon: any, title: string, subtitle: string, action?: React.ReactNode
}) {
  return (
    <div className="empty-state">
      <div className="icon"><Icon /></div>
      <h4>{title}</h4>
      <p>{subtitle}</p>
      {action}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    newEnrollments: 0,
    pendingReviews: 0,
    totalStudents: 0,
    activeCourses: 0,
  })
  const [recentEnrollments, setRecentEnrollments] = useState<Enrollment[]>([])
  const [courseStats, setCourseStats] = useState<{ name: string; yozilish: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date().toISOString().split('T')[0]
      const [todayEnroll, pendingReviews, approvedTotal, courses, recentRes, courseEnrollRes] = await Promise.all([
        supabase.from('enrollments').select('*', { count: 'exact', head: true }).gte('created_at', today + 'T00:00:00'),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', false),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('enrollments').select('*, courses(name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('courses').select('id, name').eq('is_active', true),
      ])

      setStats({
        newEnrollments: todayEnroll.count || 0,
        pendingReviews: pendingReviews.count || 0,
        totalStudents: approvedTotal.count || 0,
        activeCourses: courses.count || 0,
      })
      setRecentEnrollments((recentRes.data || []) as Enrollment[])

      // Real enrollment count per course
      if (courseEnrollRes.data) {
        const counts = await Promise.all(
          courseEnrollRes.data.map(async (c) => {
            const { count } = await supabase
              .from('enrollments').select('*', { count: 'exact', head: true })
              .eq('course_id', c.id)
            return { name: c.name, yozilish: count || 0 }
          })
        )
        setCourseStats(counts)
      }
      setLoading(false)
    }
    fetchData()

    const channel = supabase.channel('dashboard-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'enrollments' }, payload => {
        setRecentEnrollments(prev => [payload.new as Enrollment, ...prev.slice(0, 4)])
        setStats(prev => ({ ...prev, newEnrollments: prev.newEnrollments + 1 }))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const statCards = [
    {
      label: "Bugungi yozilishlar",
      value: stats.newEnrollments,
      icon: Users,
      iconColor: '#22C55E',
      iconBg: 'rgba(34,197,94,0.12)',
      note: 'Bugun kelgan',
    },
    {
      label: "Tasdiqlangan o'quvchilar",
      value: stats.totalStudents,
      icon: BookOpen,
      iconColor: '#FF6B00',
      iconBg: 'rgba(255,107,0,0.12)',
      note: 'Jami',
    },
    {
      label: "Tasdiqlanmagan sharhlar",
      value: stats.pendingReviews,
      icon: Star,
      iconColor: '#EAB308',
      iconBg: 'rgba(234,179,8,0.12)',
      note: 'Ko\'rib chiqish kerak',
    },
    {
      label: "Faol kurslar",
      value: stats.activeCourses,
      icon: TrendingUp,
      iconColor: '#3B82F6',
      iconBg: 'rgba(59,130,246,0.12)',
      note: 'Hozir faol',
    },
  ]

  const tooltipStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 8, color: 'var(--text-main)', fontSize: 13
  }

  const CHART_COLORS = ['#FF6B00', '#3B82F6', '#22C55E', '#EAB308', '#A855F7']

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="admin-h1" style={{ fontSize: '24px', letterSpacing: '-0.5px' }}>Dashboard</h1>
        <p className="admin-text" style={{ fontSize: '14px', marginTop: '4px' }}>
          Real ma'lumotlar bazasidan olingan statistika
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {statCards.map(card => (
          <div key={card.label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '14px',
                background: card.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1.5px solid ${card.iconColor}30`
              }}>
                <card.icon size={22} color={card.iconColor} />
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 600, color: card.iconColor,
                background: card.iconBg, padding: '3px 8px', borderRadius: '20px'
              }}>{card.note}</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1, letterSpacing: '-1px' }}>
              {loading ? (
                <span style={{ fontSize: '20px', color: 'var(--text-muted)' }}>—</span>
              ) : card.value === 0 ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>0</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Ma'lumot yo'q</span>
                </span>
              ) : (
                <AnimatedCounter target={card.value} />
              )}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 500 }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Notice: No fake visitor counts */}
      <div style={{
        background: 'rgba(59,130,246,0.06)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: '12px', padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '24px', fontSize: '13px', color: 'var(--text-muted)'
      }}>
        <TrendingUp size={16} color="#3B82F6" />
        <span>Tashrif statistikasi Google Analytics yoki backend API ga ulanganidan keyin ko'rinadi. Hozircha faqat real ma'lumotlar ko'rsatilmoqda.</span>
      </div>

      {/* Charts */}
      {courseStats.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div className="card">
            <h3 className="admin-h3" style={{ fontSize: '15px', marginBottom: '20px' }}>
              Kurslar bo'yicha yozilish
            </h3>
            {courseStats.every(c => c.yozilish === 0) ? (
              <EmptyState icon={InboxIcon} title="Yozilishlar yo'q" subtitle="Kursga birinchi yozilish kelganda bu yerda ko'rinadi" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={courseStats} margin={{ left: 0, right: 16 }} barSize={80}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} />
                  <Bar dataKey="yozilish" radius={[8, 8, 0, 0]} name="Yozilish soni">
                    {courseStats.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Recent Enrollments */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 className="admin-h3" style={{ fontSize: '15px' }}>
            Oxirgi yozilishlar
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '12px', background: 'rgba(34,197,94,0.1)',
              color: '#16A34A', padding: '4px 10px', borderRadius: '20px', fontWeight: 600
            }}>● Jonli</span>
            <Link href="/admin/enrollments" style={{
              fontSize: '12px', color: '#FF6B00', textDecoration: 'none', fontWeight: 600
            }}>Barchasini ko'rish →</Link>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: '52px', background: 'var(--bg-table-header)', borderRadius: '8px', opacity: 0.5, animation: 'pulse 1.5s ease infinite' }} />
            ))}
          </div>
        ) : recentEnrollments.length === 0 ? (
          <EmptyState
            icon={InboxIcon}
            title="Hali yozilishlar yo'q"
            subtitle="Yangi yozilishlar bu yerda ko'rinadi"
            action={
              <Link href="/admin/courses">
                <button className="btn-primary" style={{ marginTop: '8px' }}>
                  <Package size={14} /> Kurslarni ko'rish
                </button>
              </Link>
            }
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Ism</th><th>Telefon</th><th>Kurs</th><th>Holat</th><th>Vaqt</th></tr>
            </thead>
            <tbody>
              {recentEnrollments.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600 }}>{e.full_name}</td>
                  <td>{e.phone}</td>
                  <td>{(e as any).courses?.name || '—'}</td>
                  <td>
                    <span className={`badge badge-${e.status}`}>
                      {e.status === 'pending' ? 'Kutilmoqda' : e.status === 'approved' ? 'Tasdiqlangan' : 'Rad etilgan'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {new Date(e.created_at).toLocaleString('uz-UZ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}

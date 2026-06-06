import { Bell, CheckCheck, FileCheck2, FlaskConical } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  read: boolean
  created_at: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

function typeIcon(type: string) {
  if (type === 'result_released') return <FileCheck2 className="h-4 w-4 text-[var(--ss-green)]" />
  if (type === 'analysis_started') return <FlaskConical className="h-4 w-4 text-[var(--ss-amber)]" />
  return <Bell className="h-3.5 w-3.5 text-[var(--ss-muted)]" />
}

export function NotificationsDropdown() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await supabase
        .from('notifications')
        .select('id, type, title, body, read, created_at')
        .eq('user_id', session!.user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      return (data ?? []) as Notification[]
    },
    enabled: !!session,
    refetchInterval: 30_000,
  })

  const markAllRead = useMutation({
    mutationFn: async () => {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', session!.user.id)
        .eq('read', false)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[var(--ss-border)] bg-white text-[var(--ss-muted)] transition hover:bg-[var(--ss-wash)] hover:text-[var(--ss-fg)]"
      >
        <Bell className="h-[16px] w-[16px]" strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[var(--ss-primary)] px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-[340px] overflow-hidden rounded-[10px] border border-[var(--ss-border)] bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-[var(--ss-border-2)] px-4 py-3">
            <h4 className="text-[13px] font-semibold text-[var(--ss-fg)]">Notificações</h4>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                className="flex items-center gap-1 text-[11px] font-medium text-[var(--ss-primary)] hover:underline"
              >
                <CheckCheck className="h-3 w-3" />Marcar lidas
              </button>
            )}
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {!notifications?.length ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Bell className="h-8 w-8 text-[var(--ss-border)]" />
                <p className="text-[12px] text-[var(--ss-muted)]">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => { if (!n.read) markRead.mutate(n.id) }}
                  className={`flex w-full items-start gap-3 border-b border-[var(--ss-border-2)] px-4 py-3 text-left transition last:border-0 hover:bg-[var(--ss-wash)] ${!n.read ? 'bg-[var(--ss-primary)]/[0.03]' : ''}`}
                >
                  <div className="mt-0.5 shrink-0">{typeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`flex-1 truncate text-[12.5px] ${!n.read ? 'font-semibold text-[var(--ss-fg)]' : 'text-[var(--ss-text)]'}`}>
                        {n.title}
                      </p>
                      <span className="shrink-0 font-mono text-[10px] text-[var(--ss-muted)]">{timeAgo(n.created_at)}</span>
                    </div>
                    {n.body && (
                      <p className="mt-0.5 truncate text-[11px] text-[var(--ss-muted)]">{n.body}</p>
                    )}
                  </div>
                  {!n.read && <span className="mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full bg-[var(--ss-primary)]" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

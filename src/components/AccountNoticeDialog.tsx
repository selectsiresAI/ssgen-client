import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface AccountNotice {
  id: string
  kind: string
  title: string
  body: string
  created_at: string
}

/**
 * Popup dirigido a contas especificas (tabela account_notices, RLS por user_id).
 * Mostra o aviso mais antigo ainda nao dispensado; "Entendi" grava dismissed_at.
 */
export function AccountNoticeDialog() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { data: notices } = useQuery({
    queryKey: ['account_notices'],
    queryFn: async () => {
      const { data } = await supabase
        .from('account_notices')
        .select('id, kind, title, body, created_at')
        .eq('user_id', session!.user.id)
        .is('dismissed_at', null)
        .order('created_at', { ascending: true })
        .limit(5)
      return (data ?? []) as AccountNotice[]
    },
    enabled: !!session,
    staleTime: 5 * 60_000,
  })

  const current = notices?.[0]

  useEffect(() => {
    setOpen(!!current)
  }, [current?.id])

  const dismiss = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('account_notices')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      setOpen(false)
      void queryClient.invalidateQueries({ queryKey: ['account_notices'] })
    },
  })

  if (!current) return null

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) dismiss.mutate(current.id) }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(220,38,38,.1)]">
            <ShieldCheck className="h-5 w-5 text-[#DC2626]" strokeWidth={1.8} />
          </div>
          <DialogTitle className="text-[16px] font-extrabold tracking-[-.2px]">{current.title}</DialogTitle>
          <DialogDescription className="whitespace-pre-line text-[13px] leading-relaxed text-[var(--ss-muted)]">
            {current.body}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="h-10 w-full bg-[#DC2626] text-white hover:bg-[#B91C1C] sm:w-auto"
            disabled={dismiss.isPending}
            onClick={() => dismiss.mutate(current.id)}
          >
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

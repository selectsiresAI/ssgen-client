import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import type { Paginated } from '@/lib/api'
import { useI18n } from '@/i18n'

interface PlatformClient {
  id: string // i18n-ignore
  cod_ssgen: string | null // i18n-ignore
  nome: string // i18n-ignore
  cidade: string | null // i18n-ignore
  estado: string | null // i18n-ignore
  status: string | null // i18n-ignore
}

interface ClientLink {
  id: string // i18n-ignore
  user_id: string // i18n-ignore
  platform_client_id: string // i18n-ignore
  client_name: string | null // i18n-ignore
  created_at: string // i18n-ignore
}

// ── Link Management ──

function LinkManagement() {
  const { t, formatDate } = useI18n()
  const queryClient = useQueryClient()
  const [userEmail, setUserEmail] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<PlatformClient | null>(null)
  const [breedSel, setBreedSel] = useState<'HO' | 'JE'>('HO')
  const [searchPage, setSearchPage] = useState(1)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Existing links
  const { data: links, isLoading: linksLoading } = useQuery({
    queryKey: ['admin-links'],
    queryFn: async () => {
      const { data } = await supabase
        .from('client_links')
        .select('*')
        .order('created_at', { ascending: false })
      return (data ?? []) as ClientLink[]
    },
  })

  // Search platform clients
  const { data: clientsResult, isLoading: clientsLoading } = useQuery({
    queryKey: ['admin-clients', clientSearch, searchPage],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-search-clients`)
      url.searchParams.set('search', clientSearch)
      url.searchParams.set('page', String(searchPage))

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      })
      return res.json() as Promise<Paginated<PlatformClient>>
    },
    enabled: clientSearch.length >= 2,
  })

  // Create link
  const createLink = useMutation({
    mutationFn: async () => {
      if (!selectedClient || !userEmail) throw new Error(t('admin.fillAllFields'))

      // Find user by email in profiles
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', userEmail.trim().toLowerCase())
        .single()

      if (error || !profile) throw new Error(t('admin.userNotFound'))

      const { error: linkError } = await supabase.from('client_links').insert({
        user_id: profile.id,
        platform_client_id: selectedClient.id,
        client_name: selectedClient.nome,
        linked_by: (await supabase.auth.getUser()).data.user?.id,
      })

      if (linkError) {
        if (linkError.code === '23505') throw new Error(t('admin.linkAlreadyExists'))
        throw new Error(linkError.message)
      }

      // Create welcome notification
      await supabase.from('notifications').insert({
        user_id: profile.id,
        type: 'welcome',
        title: t('admin.clientLinked'),
        body: t('admin.clientLinkedBody', { name: selectedClient.nome }),
        metadata: { client_id: selectedClient.id },
      })

      // Set the client's breed on the Platform (front não escreve a Platform direto)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-producer/set-breed`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ platform_client_id: selectedClient.id, breed: breedSel }),
        })
      }
    },
    onSuccess: () => {
      setMessage({ type: 'ok', text: t('admin.linkCreated') })
      setUserEmail('')
      setSelectedClient(null)
      void queryClient.invalidateQueries({ queryKey: ['admin-links'] })
    },
    onError: (err: Error) => {
      setMessage({ type: 'err', text: err.message })
    },
  })

  // Delete link
  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('client_links').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-links'] })
    },
  })

  return (
    <div className="space-y-6">
      {/* Create Link Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('admin.linkUserClient')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className={`p-3 rounded-md text-sm ${message.type === 'ok' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-2">
            <Label>{t('admin.userEmail')}</Label>
            <Input
              type="email"
              placeholder="usuario@email.com" // i18n-ignore
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('admin.searchClient')}</Label>
            <Input
              placeholder={t('admin.searchClientPlaceholder')}
              value={clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value)
                setSearchPage(1)
              }}
            />
          </div>

          {clientsLoading && <Skeleton className="h-20 w-full" />}

          {clientsResult?.data && clientsResult.data.length > 0 && (
            <div className="border rounded-md max-h-48 overflow-y-auto">
              {clientsResult.data.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedClient(c)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between ${
                    selectedClient?.id === c.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <div>
                    <p className="font-medium">{c.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.cidade}/{c.estado}
                      {c.cod_ssgen ? ` (${c.cod_ssgen})` : ''}
                    </p>
                  </div>
                  {selectedClient?.id === c.id && <Badge>{t('admin.selected')}</Badge>}
                </button>
              ))}
            </div>
          )}

          {selectedClient && (
            <p className="text-sm">
              {t('admin.selectedClient', { name: selectedClient.nome })}
            </p>
          )}

          <div className="space-y-2">
            <Label>{t('admin.herdBreed')}</Label>
            <div className="flex gap-2">
              {(['HO', 'JE'] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBreedSel(b)}
                  className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                    breedSel === b ? 'bg-primary/10 border-primary text-primary' : 'border-border text-foreground'
                  }`}
                >
                  {b === 'HO' ? t('admin.holstein') : 'Jersey'}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => createLink.mutate()}
            disabled={!userEmail || !selectedClient || createLink.isPending}
          >
            {createLink.isPending ? t('admin.linking') : t('admin.link')}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('admin.existingLinks')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.client')}</TableHead>
                <TableHead>User ID</TableHead> // i18n-ignore
                <TableHead>{t('admin.date')}</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {linksLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !links?.length ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    {t('admin.noLinks')}
                  </TableCell>
                </TableRow>
              ) : (
                links.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-sm font-medium">{l.client_name ?? l.platform_client_id}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{l.user_id.slice(0, 8)}...</TableCell>
                    <TableCell className="text-sm">{formatDate(l.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive text-xs"
                        onClick={() => {
                          if (confirm(t('admin.removeLink'))) deleteLink.mutate(l.id)
                        }}
                      >
                        {t('admin.remove')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Ingest Results ──

function IngestResults() {
  const { t } = useI18n()
  const [filePath, setFilePath] = useState('')
  const [clientId, setClientId] = useState('')
  const [serviceOrderId, setServiceOrderId] = useState('')
  const [result, setResult] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault()
    setResult(null)
    setLoading(true)
    try {
      const res = await api.ingestResults({
        file_path: filePath,
        client_id: clientId,
        service_order_id: serviceOrderId || undefined,
      })
      setResult({
        type: 'ok',
        text: t('admin.ingestSuccess', { inserted: res.inserted, total: res.total_rows, columns: res.mapped_columns.join(', '), errors: res.errors ? `. Erros: ${res.errors.join('; ')}` : '' }),
      })
    } catch (err: unknown) {
      setResult({ type: 'err', text: err instanceof Error ? err.message : t('admin.unknownError') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('admin.ingestTrackerResults')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { void handleIngest(e) }} className="space-y-4">
          {result && (
            <div className={`p-3 rounded-md text-sm ${result.type === 'ok' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
              {result.text}
            </div>
          )}

          <div className="space-y-2">
            <Label>{t('admin.filePath')}</Label>
            <Input
              placeholder="ex: os-123/resultados.xlsx" // i18n-ignore
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              {t('admin.filePathHint')}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t('admin.clientId')}</Label>
            <Input
              placeholder={t('admin.clientIdPlaceholder')}
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{t('admin.serviceOrderId')}</Label>
            <Input
              placeholder={t('admin.serviceOrderPlaceholder')}
              value={serviceOrderId}
              onChange={(e) => setServiceOrderId(e.target.value)}
            />
          </div>

          <Separator />

          <Button type="submit" disabled={loading || !filePath || !clientId}>
            {loading ? t('admin.processing') : t('admin.startIngestion')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ── Admin Page ──

export function AdminPage() {
  const { profile } = useAuth()
  const { t } = useI18n()

  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">{t('admin.restricted')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.title')}</h1>
        <p className="text-muted-foreground text-sm">
          {t('admin.description')}
        </p>
      </div>

      <Tabs defaultValue="links">
        <TabsList>
          <TabsTrigger value="links">{t('admin.links')}</TabsTrigger>
          <TabsTrigger value="ingest">{t('admin.ingestion')}</TabsTrigger>
        </TabsList>
        <TabsContent value="links" className="mt-4">
          <LinkManagement />
        </TabsContent>
        <TabsContent value="ingest" className="mt-4">
          <IngestResults />
        </TabsContent>
      </Tabs>
    </div>
  )
}

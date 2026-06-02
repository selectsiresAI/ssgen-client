import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: api.getDashboard,
  })
}

export function useFemalesFull(params?: {
  page?: number
  search?: string
  serviceOrderId?: string
}) {
  return useQuery({
    queryKey: ['females-full', params],
    queryFn: () =>
      api.getFemalesFull({
        page: String(params?.page ?? 1),
        search: params?.search ?? '',
        service_order_id: params?.serviceOrderId ?? '',
      }),
    placeholderData: keepPreviousData,
  })
}

export function useSemenInventory(params?: { search?: string }) {
  return useQuery({
    queryKey: ['semen-inventory', params],
    queryFn: () => api.getSemenInventory({ search: params?.search ?? '' }),
  })
}

export function useAuditoria(params: {
  step: string
  serviceOrderId?: string
  parentType?: string
  orderTrait?: string
  limit?: string
  traits?: string
}) {
  return useQuery({
    queryKey: ['auditoria', params],
    queryFn: () =>
      api.getAuditoria({
        step: params.step,
        service_order_id: params.serviceOrderId ?? '',
        parent_type: params.parentType ?? '',
        order_trait: params.orderTrait ?? '',
        limit: params.limit ?? '',
        traits: params.traits ?? '',
      }),
    enabled: !!params.step,
  })
}

export function useServiceOrderOptions() {
  return useQuery({
    queryKey: ['service-order-options'],
    queryFn: api.getServiceOrderOptions,
  })
}

export function useOrders(params?: { page?: number; status?: string }) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () =>
      api.getOrders({
        page: String(params?.page ?? 1),
        status: params?.status ?? '',
      }),
    placeholderData: keepPreviousData,
  })
}

export function useResults(params?: { page?: number; search?: string }) {
  return useQuery({
    queryKey: ['results', params],
    queryFn: () =>
      api.getResults({
        page: String(params?.page ?? 1),
        search: params?.search ?? '',
      }),
    placeholderData: keepPreviousData,
  })
}

export function useFemales(params?: {
  page?: number
  search?: string
  genotyped?: string
  breed?: string
}) {
  return useQuery({
    queryKey: ['females', params],
    queryFn: () =>
      api.getFemales({
        page: String(params?.page ?? 1),
        search: params?.search ?? '',
        genotyped: params?.genotyped ?? '',
        breed: params?.breed ?? '',
      }),
    placeholderData: keepPreviousData,
  })
}

export function useTechnicians() {
  return useQuery({
    queryKey: ['technicians'],
    queryFn: api.getTechnicians,
  })
}

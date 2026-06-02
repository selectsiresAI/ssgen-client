import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: api.getDashboard,
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

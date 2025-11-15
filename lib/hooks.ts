import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { Node, ApiResponse } from '@/lib/types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
})

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

// Auth Hooks
export function useRegister() {
  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const res = await api.post<ApiResponse<any>>('/api/auth/register', { username, password })
      return res.data.data
    },
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const res = await api.post<ApiResponse<any>>('/api/auth/login', { username, password })
      return res.data.data
    },
  })
}

export function useMe(token: string | null) {
  return useQuery({
    queryKey: ['me', token],
    queryFn: async () => {
      if (!token) return null
      const res = await api.get<ApiResponse<any>>('/api/auth/me')
      return res.data.data?.user || null
    },
    retry: (failureCount, error: any) => {
      // Only retry if we have a token
      if (!token) return false
      // Retry up to 2 times
      return failureCount < 2
    },
    enabled: !!token, // Only run query if token exists
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Posts Hooks
export function useGetTree() {
  return useQuery({
    queryKey: ['tree'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Node[]>>('/api/posts')
      return res.data.data || []
    },
    refetchInterval: 60000, // Refetch every 3 seconds for live updates
  })
}

export function useStartChain() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (value: number) => {
      const res = await api.post<ApiResponse<Node>>('/api/posts', {
        action: 'start',
        value,
      })
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tree'] })
    },
  })
}

export function useAddOperation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      parentId,
      opType,
      rightValue,
    }: {
      parentId: number
      opType: '+' | '-' | '*' | '/'
      rightValue: number
    }) => {
      const res = await api.post<ApiResponse<Node>>('/api/posts', {
        action: 'op',
        parentId,
        opType,
        rightValue,
      })
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tree'] })
    },
  })
}

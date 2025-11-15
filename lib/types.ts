export type User = {
  id: number
  username: string
  password: string
  created_at: number
}

export type Node = {
  id: number
  parent_id: number | null
  type: 'start' | 'op'
  op_type?: '+' | '-' | '*' | '/' | null
  left_value: number
  right_value?: number | null
  result: number
  author_id?: number | null
  created_at: number
  children?: Node[]
}

export type AuthPayload = {
  id: number
  username: string
}

export type ApiResponse<T> = {
  data?: T
  error?: string
}

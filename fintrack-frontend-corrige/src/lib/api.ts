const API_URL = import.meta.env.VITE_API_URL

function getToken() {
  return localStorage.getItem('fintrack_token')
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    if (res.status === 401) {
      // Token absent/expiré/invalide : on nettoie pour forcer un nouveau login.
      clearToken()
    }
    const message = Array.isArray(data?.message) ? data.message[0] : data?.message
    throw new ApiError(message || 'Une erreur est survenue.', res.status)
  }
  return data
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body?: unknown) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path: string, body?: unknown) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) => request(path, { method: 'DELETE' }),
}

export function setToken(token: string) {
  localStorage.setItem('fintrack_token', token)
}
export function clearToken() {
  localStorage.removeItem('fintrack_token')
}
export function hasToken() {
  return !!getToken()
}

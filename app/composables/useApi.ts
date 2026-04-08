import type { UseFetchOptions } from 'nuxt/app'

/** 
 * Gunakan ini untuk mengambil/submit data dari dalam fungsi seperti onClick, handleSubmit, dsb. 
 * Ini adalah pembungkus (wrapper) untuk `$fetch` bawaan.
 */
export const $api = <T = any>(request: Parameters<typeof $fetch>[0], opts?: Parameters<typeof $fetch>[1]) => {
  const auth = useAuth()
  
  const customHeaders: Record<string, string> = {
    ...auth.getAuthHeaders()
  }

  // Preserve existing headers if they are a simple object
  if (opts?.headers && !Array.isArray(opts.headers) && !(opts.headers instanceof Headers)) {
    Object.assign(customHeaders, opts.headers)
  }

  return $fetch<T>(request, {
    ...opts,
    headers: customHeaders
  })
}

/**
 * Gunakan ini khusus untuk di dalam *setup component* (`<script setup>`) saat inisialisasi / fetching data reaktif SSR.
 * Ini adalah pembungkus (wrapper) untuk `useFetch` bawaan.
 */
export const useApiFetch: typeof useFetch = (request, opts?) => {
  const auth = useAuth()

  return useFetch(request, {
    ...opts,
    onRequest({ options }) {
      // Inisialisasi object kosongan jika headers belum ada
      options.headers = options.headers || {}

      if (auth.token.value) {
        const headers: any = options.headers
        if (headers instanceof Headers) {
          headers.set('Authorization', `Bearer ${auth.token.value}`)
        } else if (Array.isArray(headers)) {
          headers.push(['Authorization', `Bearer ${auth.token.value}`])
        } else {
          headers.Authorization = `Bearer ${auth.token.value}`
        }
      }
    }
  }) as any
}

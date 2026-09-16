import { ApiError } from './api-error';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
}

/**
 * Client HTTP centralisé avec injection automatique du JWT et gestion unifiée des erreurs.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, skipAuth = false, headers = {}, ...customConfig } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const reqHeaders = new Headers(headers);

  if (!reqHeaders.has('Content-Type') && !(customConfig.body instanceof FormData)) {
    reqHeaders.set('Content-Type', 'application/json');
  }

  if (!skipAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      reqHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  const config: RequestInit = {
    ...customConfig,
    headers: reqHeaders,
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401 && typeof window !== 'undefined' && !skipAuth) {
      // Déconnexion ou rafraîchissement si non autorisé
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      let errorData: unknown = null;
      try {
        errorData = await response.json();
        if (typeof errorData === 'object' && errorData !== null) {
          const errObj = errorData as { message?: string | string[]; error?: string };
          if (Array.isArray(errObj.message)) {
            errorMessage = errObj.message.join(', ');
          } else if (errObj.message) {
            errorMessage = errObj.message;
          } else if (errObj.error) {
            errorMessage = errObj.error;
          }
        }
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiError(errorMessage, response.status, errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const result = await response.json();
    return (result?.data !== undefined ? result.data : result) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Erreur réseau inattendue',
      0,
    );
  }
}

import type { ApiResponse, Book, Quiz } from '@teacher-helper/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            code: errorData.error?.code || 'HTTP_ERROR',
            message: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
          },
        };
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
      };
    }
  }

  // Books
  async getBooks(): Promise<ApiResponse<Book[]>> {
    return this.request<Book[]>('/api/v1/books');
  }

  async getBook(id: string): Promise<ApiResponse<Book>> {
    return this.request<Book>(`/api/v1/books/${id}`);
  }

  // Quizzes
  async getQuizzes(): Promise<ApiResponse<Quiz[]>> {
    return this.request<Quiz[]>('/api/v1/quizzes');
  }

  async getQuiz(id: string): Promise<ApiResponse<Quiz>> {
    return this.request<Quiz>(`/api/v1/quizzes/${id}`);
  }

  // Health
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient();

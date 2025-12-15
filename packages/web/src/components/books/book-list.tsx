'use client';

import { apiClient } from '../../lib/index.js';
import { useApi } from '../../hooks/index.js';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/index.js';
import type { Book } from '@teacher-helper/shared';

export function BookList() {
  const { data: books, loading, error } = useApi<Book[]>(() => apiClient.getBooks());

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading books...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">No books found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => (
        <Card key={book.id}>
          <CardHeader>
            <CardTitle className="text-lg">{book.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">Subject:</span> {book.subject}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Grade:</span> {book.gradeBand}
              </p>
              {book.edition && (
                <p className="text-gray-600">
                  <span className="font-medium">Edition:</span> {book.edition}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

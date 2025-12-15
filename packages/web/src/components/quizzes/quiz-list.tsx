'use client';

import { apiClient, formatDate } from '../../lib/index.js';
import { useApi } from '../../hooks/index.js';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/index.js';
import type { Quiz } from '@teacher-helper/shared';

export function QuizList() {
  const { data: quizzes, loading, error } = useApi<Quiz[]>(() => apiClient.getQuizzes());

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading quizzes...</p>
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

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">No quizzes found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {quizzes.map((quiz) => (
        <Card key={quiz.id}>
          <CardHeader>
            <CardTitle className="text-lg">{quiz.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">Items:</span> {quiz.blueprint.totalItems}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Status:</span>{' '}
                <span className="capitalize">{quiz.status}</span>
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Created:</span> {formatDate(quiz.createdAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

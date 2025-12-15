import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              TeacherHelper
            </Link>
          </div>
          <nav className="flex space-x-6">
            <Link href="/books" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Books
            </Link>
            <Link href="/quizzes" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Quizzes
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

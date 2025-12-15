export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-600 mb-4">TeacherHelper</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          AI-powered lesson plan and assessment generator
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/books"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Browse Books
          </a>
          <a
            href="/quizzes"
            className="px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition"
          >
            Create Quiz
          </a>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
        <FeatureCard
          title="Knowledge Base"
          description="Upload and index your textbooks with GraphRAG for intelligent retrieval"
          icon="📚"
        />
        <FeatureCard
          title="Smart Generation"
          description="Generate quizzes and lesson plans grounded in your materials"
          icon="✨"
        />
        <FeatureCard
          title="Quality Assurance"
          description="Multi-agent verification ensures accuracy and citations"
          icon="✅"
        />
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

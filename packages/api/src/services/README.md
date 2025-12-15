# TeacherHelper API Services

This directory contains the core services for the TeacherHelper API.

## OpenRouter Service

The `OpenRouterService` provides a centralized AI gateway for all LLM calls in the application.

### Features

- **Unified API**: Single interface for multiple AI providers (Anthropic, OpenAI)
- **Model Routing**: Task-based model selection (high-reasoning, fast, embeddings)
- **Automatic Retries**: Exponential backoff with jitter for transient errors
- **Fallback Models**: Automatic fallback to alternative models on failure
- **Telemetry**: Detailed metrics for monitoring and debugging
- **Test Mode**: Mock responses for development without API key

### Configuration

Set these environment variables:

```bash
# Required (or use test mode)
OPENROUTER_API_KEY=your_api_key

# Optional (with defaults)
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_DEFAULT_MODEL=anthropic/claude-3.5-sonnet
OPENROUTER_TIMEOUT_MS=60000
OPENROUTER_MAX_RETRIES=3
OPENROUTER_APP_NAME=teacher-helper
OPENROUTER_TEST_MODE=false
```

### Usage

#### Basic Completion

```typescript
import { getOpenRouterService } from './services/openrouter.service.js';

const service = getOpenRouterService();

const response = await service.createCompletion({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' },
  ],
  temperature: 0.7,
  maxTokens: 2048,
});

console.log(response.choices[0].message.content);
```

#### Task-Based Model Selection

```typescript
// High-reasoning tasks (DGA, SVA) - Uses Claude 3.5 Sonnet
const quizResponse = await service.createCompletionByTaskType(
  'high-reasoning',
  [
    { role: 'system', content: 'Generate educational quizzes.' },
    { role: 'user', content: 'Create 5 MCQs about photosynthesis.' },
  ]
);

// Fast tasks (QAA) - Uses Claude 3 Haiku
const scoreResponse = await service.createCompletionByTaskType(
  'fast',
  [
    { role: 'system', content: 'Score quiz quality.' },
    { role: 'user', content: 'Rate this quiz...' },
  ]
);
```

#### With Custom Fallbacks

```typescript
const response = await service.createCompletion({
  model: 'anthropic/claude-3.5-sonnet',
  messages: [...],
  fallbackModels: ['openai/gpt-4-turbo'],
});
```

### Error Handling

The service provides structured errors:

```typescript
try {
  const response = await service.createCompletion({...});
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Handle rate limit (auto-retried, but may still fail)
  }
  if (error.code === 'INVALID_API_KEY') {
    // API key issue - not retryable
  }
  
  // Telemetry is available even on errors
  console.log(error.telemetry);
}
```

### Error Codes

| Code | Description | Retryable |
|------|-------------|-----------|
| `INVALID_API_KEY` | Authentication failed | No |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Yes |
| `MODEL_UNAVAILABLE` | Model not available | Yes (with fallback) |
| `TIMEOUT` | Request timed out | Yes |
| `NETWORK_ERROR` | Network connectivity issue | Yes |
| `VALIDATION_ERROR` | Invalid request | No |
| `UNKNOWN_ERROR` | Unexpected error | No |

### Telemetry

Every response includes telemetry data:

```typescript
interface TelemetryData {
  requestId: string;      // Unique request ID
  timestamp: Date;        // Request time
  modelRequested: string; // Originally requested model
  modelUsed: string;      // Actual model used (may differ)
  promptTokens: number;   // Input tokens
  completionTokens: number; // Output tokens
  totalTokens: number;    // Total tokens
  latencyMs: number;      // Total latency
  success: boolean;       // Request outcome
  retryCount: number;     // Number of retries
  fallbackUsed: boolean;  // Whether fallback was used
}
```

### Test Mode

Enable test mode for development without an API key:

```bash
OPENROUTER_TEST_MODE=true
```

In test mode:
- No real API calls are made
- Mock responses are returned
- Token counts are estimated
- Telemetry is still captured

### Model Configurations

Defined in `config/models.ts`:

| Task Type | Primary Model | Fallbacks |
|-----------|---------------|-----------|
| `high-reasoning` | `anthropic/claude-3.5-sonnet` | `claude-3-opus`, `gpt-4-turbo` |
| `fast` | `anthropic/claude-3-haiku` | `gpt-3.5-turbo` |
| `embeddings` | `openai/text-embedding-3-large` | `text-embedding-ada-002` |

## Other Services

- `BookService` - Book management operations
- `QuizService` - Quiz management operations

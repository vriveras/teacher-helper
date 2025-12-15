# Task #3 Dev Handoff: Configure OpenRouter Client for AI Gateway

## Assignment
**Assigned to**: dev-agent
**Priority**: HIGH (blocks 36 downstream tasks)
**Estimated effort**: 4-6 hours
**Started**: 2025-12-15

## Objective
Implement a production-ready OpenRouter client service that will serve as the centralized AI gateway for all LLM calls in the TeacherHelper application (DGA, SVA, QAA agents).

## Context & Background

### Why OpenRouter?
OpenRouter is an AI model gateway that provides:
- Unified OpenAI-compatible API across multiple providers (Anthropic, OpenAI, etc.)
- Model routing and fallback capabilities
- Built-in rate limiting and cost controls
- Provider redundancy and reliability

### Project Architecture
```
User Request
    ↓
API Endpoint
    ↓
DGA/SVA/QAA Agent ──→ OpenRouter Service ──→ OpenRouter API
                                                    ↓
                                        Anthropic/OpenAI/etc.
```

### Related Epics
- **Epic-OpenRouter-AI-Gateway-v1.md**: Full specifications for AI gateway
- **Epic-DGA-Generation-v1.md**: Will use this client for quiz generation
- **Epic-SVA-Source-Verification-v1.md**: Will use for citation verification
- **Epic-QAA-QA-Scoring-v1.md**: Will use for quality scoring

## Current State Analysis

### Already Implemented
✓ Monorepo structure (npm workspaces)
✓ packages/api with Fastify + TypeScript
✓ packages/shared for shared types
✓ Environment configuration framework (`config/env.ts`)
✓ Database clients (Prisma, Neo4j, Redis) in `lib/`
✓ Test framework (Vitest) configured

### Environment Variables Already Defined
From `.env.example`:
```
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

### Current Codebase Structure
```
C:\Users\virivera\source\repos\teacher-helper\
├── packages\api\src\
│   ├── config\env.ts (needs OpenRouter fields added)
│   ├── lib\
│   │   ├── neo4j.ts (reference implementation)
│   │   ├── prisma.ts (reference implementation)
│   │   └── redis.ts (reference implementation)
│   └── services\ (empty - your work goes here)
└── packages\shared\src\
    └── types\ (add openrouter.ts here)
```

## Implementation Checklist

### Phase 1: Dependencies & Types
- [ ] Install `openai` package in @teacher-helper/api
- [ ] Create `packages\shared\src\types\openrouter.ts` with:
  - OpenRouterConfig interface
  - ModelConfig interface
  - CompletionRequest interface
  - CompletionResponse interface
  - OpenRouterError interface
- [ ] Export types from `packages\shared\src\index.ts`

### Phase 2: Environment Configuration
- [ ] Update `packages\api\src\config\env.ts` to add:
  - OPENROUTER_API_KEY (required)
  - OPENROUTER_BASE_URL (default: https://openrouter.ai/api/v1)
  - OPENROUTER_APP_NAME (optional)
  - OPENROUTER_DEFAULT_MODEL (default: anthropic/claude-3.5-sonnet)
  - OPENROUTER_TIMEOUT_MS (default: 60000)
  - OPENROUTER_MAX_RETRIES (default: 3)
- [ ] Validate required fields are present at startup

### Phase 3: Model Routing Configuration
- [ ] Create `packages\api\src\config\models.ts`
- [ ] Define MODEL_CONFIGS with task-based routing:
  - `high-reasoning`: Claude 3.5 Sonnet for DGA/SVA
  - `fast`: Claude 3 Haiku for QAA
  - `embeddings`: OpenAI text-embedding-3-large

### Phase 4: Core Service Implementation
- [ ] Create `packages\api\src\services\openrouter.service.ts`
- [ ] Implement OpenRouterService class with:
  - Constructor: Initialize OpenAI client with custom baseURL
  - `createCompletion()`: Main method for chat completions
  - `withRetry()`: Retry logic with exponential backoff
  - `handleFallback()`: Model fallback on failures
  - `trackTelemetry()`: Capture request/response metrics
- [ ] Export singleton instance

### Phase 5: Error Handling & Resilience
- [ ] Implement retry logic:
  - Rate limit (429) → exponential backoff + jitter
  - Timeout → retry with same config
  - Model unavailable (503) → fallback to alternative model
  - Invalid auth (401) → fail fast, no retry
  - Network error → retry with backoff
- [ ] Add max retry limit (from env config)
- [ ] Proper error messages with context

### Phase 6: Testing
- [ ] Create `packages\api\tests\services\openrouter.service.test.ts`
- [ ] Write unit tests:
  - Client initializes correctly
  - Throws on missing API key
  - Successful completion
  - Retry on rate limit
  - Fallback on model unavailable
  - Fail after max retries
  - Timeout handling
  - Token counting
- [ ] Mock OpenAI SDK to avoid real API calls
- [ ] Aim for >90% test coverage

### Phase 7: Documentation
- [ ] Create `packages\api\src\services\README.md`
- [ ] Document:
  - Usage examples for DGA/SVA/QAA
  - Configuration options
  - Error handling patterns
  - Model selection guide
  - Telemetry data structure

## Technical Specifications

### OpenAI SDK Configuration
```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: env.OPENROUTER_API_KEY,
  baseURL: env.OPENROUTER_BASE_URL,
  defaultHeaders: {
    'HTTP-Referer': env.OPENROUTER_APP_NAME || 'teacher-helper',
    'X-Title': 'TeacherHelper',
  },
  timeout: env.OPENROUTER_TIMEOUT_MS,
});
```

### Retry Logic Pseudocode
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  fallbackModels?: string[]
): Promise<T> {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!isRetryable(error)) throw error;

      if (error.code === 'model_unavailable' && fallbackModels?.length) {
        // Try fallback model
        return await fn(/* with next fallback model */);
      }

      const delay = calculateBackoff(attempt);
      await sleep(delay);
    }
  }
  throw lastError;
}
```

### Telemetry Data Structure
```typescript
interface TelemetryData {
  requestId: string;
  timestamp: Date;
  modelRequested: string;
  modelUsed: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  success: boolean;
  error?: string;
  retryCount?: number;
  fallbackUsed?: boolean;
}
```

## Reference Implementations

### Example: Existing Client Pattern (lib/neo4j.ts)
```typescript
import neo4j from 'neo4j-driver';
import { getEnv } from '../config/env.js';

let driver: neo4j.Driver | null = null;

export function getNeo4jDriver(): neo4j.Driver {
  if (driver) return driver;

  const env = getEnv();
  if (!env.NEO4J_URI) {
    throw new Error('NEO4J_URI not configured');
  }

  driver = neo4j.driver(
    env.NEO4J_URI,
    neo4j.auth.basic(env.NEO4J_USER || '', env.NEO4J_PASSWORD || '')
  );

  return driver;
}
```

Follow this singleton pattern for OpenRouter service.

### Example: Test Pattern (tests/setup.ts)
```typescript
import { beforeEach } from 'vitest';
import { resetEnvCache } from '../src/config/env';

beforeEach(() => {
  resetEnvCache();
  // Set test env vars
  process.env.OPENROUTER_API_KEY = 'test-key';
  process.env.DATABASE_URL = 'postgresql://test';
});
```

## Acceptance Criteria (Detailed)

### Must Have (P0)
✓ OpenRouter client initializes with valid configuration
✓ Environment validation fails fast on missing API key
✓ `createCompletion()` makes successful API call
✓ Retry logic handles rate limits (429) with exponential backoff
✓ Fallback to alternative model on 503/model unavailable
✓ Unit tests cover all error scenarios
✓ Test coverage > 90%
✓ Type safety - all inputs/outputs typed

### Should Have (P1)
✓ Telemetry captures model, tokens, latency, success/failure
✓ Clear error messages with actionable context
✓ Documentation with usage examples
✓ Support for model override per request

### Nice to Have (P2)
- Request/response logging (debug level)
- Cost estimation (future Phase)
- Streaming support (future Phase)

## File Paths (Absolute)

All file paths are absolute for clarity:

**New Files:**
- `C:\Users\virivera\source\repos\teacher-helper\packages\api\src\services\openrouter.service.ts`
- `C:\Users\virivera\source\repos\teacher-helper\packages\api\src\config\models.ts`
- `C:\Users\virivera\source\repos\teacher-helper\packages\shared\src\types\openrouter.ts`
- `C:\Users\virivera\source\repos\teacher-helper\packages\api\tests\services\openrouter.service.test.ts`
- `C:\Users\virivera\source\repos\teacher-helper\packages\api\src\services\README.md`

**Modified Files:**
- `C:\Users\virivera\source\repos\teacher-helper\packages\api\src\config\env.ts`
- `C:\Users\virivera\source\repos\teacher-helper\packages\shared\src\index.ts`
- `C:\Users\virivera\source\repos\teacher-helper\packages\api\package.json`

## Testing Instructions

### Unit Tests
```bash
# Run tests for this service
npm run test -- openrouter.service.test.ts

# Run with coverage
npm run test:coverage -- openrouter.service.test.ts
```

### Manual Testing (After Implementation)
```bash
# Set up environment
cp .env.example .env
# Edit .env and add real OPENROUTER_API_KEY

# Start API server
npm run dev:api

# Test in Node REPL or create test script
node --loader tsx <<EOF
import { openRouterService } from './packages/api/src/services/openrouter.service.ts';

const response = await openRouterService.createCompletion({
  messages: [{ role: 'user', content: 'Say hello!' }],
  model: 'anthropic/claude-3-haiku',
  maxTokens: 50
});

console.log(response);
EOF
```

## Dependencies & Blockers

### Prerequisites (Already Complete)
✓ Task #1: Monorepo setup
✓ Task #2: Project structure

### External Dependencies
⚠ OpenRouter API Key - dev-agent will need to obtain from https://openrouter.ai/
  For testing, can use mock/test mode initially

### Blocks Downstream Tasks
This task blocks 36 tasks:
- **Immediate**: Task #8 (embeddings), Task #14 (DGA prompts)
- **Critical Path**: Tasks #15-31 (all agent implementations)

## Support & Resources

### Documentation
- OpenRouter API Docs: https://openrouter.ai/docs
- OpenAI SDK (Node.js): https://github.com/openai/openai-node
- Epic specification: `C:\Users\virivera\source\repos\teacher-helper\project-plans\epics\Epic-OpenRouter-AI-Gateway-v1.md`

### Reference Files
- Environment config pattern: `packages\api\src\config\env.ts`
- Client pattern: `packages\api\src\lib\neo4j.ts`
- Test setup: `packages\api\tests\setup.ts`

### Model IDs (OpenRouter)
- Claude 3.5 Sonnet: `anthropic/claude-3.5-sonnet`
- Claude 3 Opus: `anthropic/claude-3-opus`
- Claude 3 Haiku: `anthropic/claude-3-haiku`
- GPT-4 Turbo: `openai/gpt-4-turbo`
- GPT-3.5 Turbo: `openai/gpt-3.5-turbo`
- Embeddings: `openai/text-embedding-3-large`

## Definition of Done

- [ ] All files created/modified as specified
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] `npm run test` passes with >90% coverage
- [ ] Manual test with real OpenRouter API succeeds
- [ ] Code reviewed (self-review checklist below)
- [ ] Documentation complete
- [ ] Status updated in `.claude\in-progress\status.md`
- [ ] Task marked DONE in `.claude\in-progress\backlog.md`
- [ ] Task added to `.claude\in-progress\completed.md`

## Self-Review Checklist

Before marking complete:
- [ ] Error handling covers all edge cases
- [ ] No hardcoded secrets or API keys
- [ ] Types exported from shared package
- [ ] Singleton pattern used correctly
- [ ] Retry logic has max attempts
- [ ] Fallback models configured
- [ ] Tests don't make real API calls
- [ ] Code follows existing patterns (see lib/ files)
- [ ] No console.log (use logger if needed)
- [ ] TypeScript strict mode passes

## Questions or Issues?
If blocked or unclear on requirements, update status.md with blocker details and tag pm-agent for clarification.

---

**Ready to start?** Begin with Phase 1 (dependencies & types) and work sequentially through the phases. Good luck!

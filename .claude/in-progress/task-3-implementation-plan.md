# Task #3: Configure OpenRouter Client for AI Gateway

## Overview
Configure OpenRouter as the centralized AI gateway for all LLM calls (DGA, SVA, QAA agents). OpenRouter provides OpenAI-compatible API with multi-provider routing, fallback, and cost controls.

## Context
- **Epic**: OpenRouter AI Gateway v1 (Epic-OpenRouter-AI-Gateway-v1.md)
- **Phase**: Phase 0 - Hello World Vertical Slice
- **Dependencies**: Task #1 (monorepo setup), Task #2 (project structure)
- **Blocks**: Task #8 (vector embeddings), Task #14 (DGA prompts), all agent implementations

## Acceptance Criteria
- [ ] OpenRouter client SDK configured and tested
- [ ] Environment variables for API key and base URL validated in env schema
- [ ] Type-safe client wrapper with comprehensive error handling
- [ ] Support for model selection and routing configuration
- [ ] Basic retry/fallback logic implemented
- [ ] Unit tests for client initialization and basic calls
- [ ] Documentation for usage patterns and examples

## Technical Requirements

### 1. Dependencies
```json
{
  "openai": "^4.x" // OpenRouter uses OpenAI-compatible API
}
```

### 2. Environment Variables
Update `packages/api/src/config/env.ts`:
```typescript
{
  OPENROUTER_API_KEY: z.string().min(1),
  OPENROUTER_BASE_URL: z.string().url().default('https://openrouter.ai/api/v1'),
  OPENROUTER_APP_NAME: z.string().optional(),
  OPENROUTER_DEFAULT_MODEL: z.string().default('anthropic/claude-3.5-sonnet'),
  OPENROUTER_TIMEOUT_MS: z.string().transform(Number).default('60000'),
  OPENROUTER_MAX_RETRIES: z.string().transform(Number).default('3'),
}
```

### 3. Type Definitions
Create `packages/shared/src/types/openrouter.ts`:
```typescript
export interface OpenRouterConfig {
  apiKey: string;
  baseURL: string;
  appName?: string;
  defaultModel: string;
  timeoutMs: number;
  maxRetries: number;
}

export interface ModelConfig {
  modelId: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  fallbackModels?: string[];
}

export interface CompletionRequest {
  model?: string; // Optional override
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface CompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    message: { role: string; content: string };
    finishReason: string;
  }>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface OpenRouterError {
  code: string;
  message: string;
  statusCode?: number;
  retryable: boolean;
}
```

### 4. Client Service
Create `packages/api/src/services/openrouter.service.ts`:

**Core functionality:**
- Initialize OpenAI client with OpenRouter base URL
- Wrap chat completions with error handling
- Implement retry logic with exponential backoff
- Support model fallback on failures
- Track telemetry (model used, tokens, latency)
- Validate responses

**Error handling:**
- Rate limit errors → retry with backoff
- Model unavailable → fallback to alternative
- Timeout → retry with shorter context
- Invalid API key → fail fast
- Network errors → retry

**Telemetry:**
- Request ID
- Model requested vs. model used
- Token counts (prompt, completion, total)
- Latency (ms)
- Success/failure status
- Error details if failed

### 5. Model Routing Configuration
Create `packages/api/src/config/models.ts`:
```typescript
export const MODEL_CONFIGS = {
  // High-reasoning tasks (DGA, SVA analysis)
  'high-reasoning': {
    primary: 'anthropic/claude-3.5-sonnet',
    fallbacks: ['anthropic/claude-3-opus', 'openai/gpt-4-turbo'],
    maxTokens: 4096,
    temperature: 0.7,
  },

  // Fast tasks (QAA scoring, simple validation)
  'fast': {
    primary: 'anthropic/claude-3-haiku',
    fallbacks: ['openai/gpt-3.5-turbo'],
    maxTokens: 2048,
    temperature: 0.3,
  },

  // Embeddings
  'embeddings': {
    primary: 'openai/text-embedding-3-large',
    fallbacks: ['openai/text-embedding-ada-002'],
  },
} as const;
```

### 6. Unit Tests
Create `packages/api/tests/services/openrouter.service.test.ts`:

**Test cases:**
- ✓ Client initializes with valid config
- ✓ Client throws on missing API key
- ✓ Successful completion request
- ✓ Retry on rate limit error
- ✓ Fallback to alternative model on 503
- ✓ Fail after max retries
- ✓ Timeout handling
- ✓ Token counting accuracy
- ✓ Telemetry data structure

## Implementation Subtasks

### Subtask 3.1: Install Dependencies
**Files**: `packages/api/package.json`
```bash
npm install openai --workspace=@teacher-helper/api
```

### Subtask 3.2: Update Environment Schema
**Files**:
- `packages/api/src/config/env.ts`
- `.env.example`

**Changes**:
- Add OpenRouter environment variables to Zod schema
- Update .env.example with OpenRouter fields
- Add validation for required vs optional fields

### Subtask 3.3: Define Types
**Files**: `packages/shared/src/types/openrouter.ts`

**Changes**:
- Create OpenRouter type definitions
- Export from `packages/shared/src/index.ts`

### Subtask 3.4: Create Client Service
**Files**: `packages/api/src/services/openrouter.service.ts`

**Changes**:
- Initialize OpenAI client wrapper
- Implement `createCompletion()` method
- Add retry logic with exponential backoff
- Implement model fallback
- Add telemetry tracking
- Export singleton instance

### Subtask 3.5: Add Model Routing Config
**Files**: `packages/api/src/config/models.ts`

**Changes**:
- Define model configurations by task type
- Export MODEL_CONFIGS constant

### Subtask 3.6: Implement Retry/Fallback Logic
**Files**: `packages/api/src/services/openrouter.service.ts`

**Changes**:
- Add retry decorator with exponential backoff
- Implement fallback model selection
- Handle rate limits, timeouts, model unavailable

### Subtask 3.7: Create Unit Tests
**Files**: `packages/api/tests/services/openrouter.service.test.ts`

**Changes**:
- Test initialization
- Test successful completions
- Test error scenarios
- Test retry logic
- Test fallback behavior
- Mock OpenAI SDK

### Subtask 3.8: Add Documentation
**Files**:
- `packages/api/src/services/README.md` (new)
- Update main README if needed

**Content**:
- Usage examples
- Configuration options
- Error handling patterns
- Model selection guide

## File Structure
```
packages/
├── api/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts (UPDATE)
│   │   │   └── models.ts (NEW)
│   │   └── services/
│   │       ├── openrouter.service.ts (NEW)
│   │       └── README.md (NEW)
│   ├── tests/
│   │   └── services/
│   │       └── openrouter.service.test.ts (NEW)
│   └── package.json (UPDATE)
└── shared/
    └── src/
        └── types/
            └── openrouter.ts (NEW)
```

## Risks and Mitigations

### Risk 1: API Key Security
**Mitigation**:
- Validate API key at startup
- Never log API key
- Use environment variables only
- Add to .gitignore for .env files

### Risk 2: Rate Limiting
**Mitigation**:
- Implement exponential backoff
- Respect retry-after headers
- Add jitter to retries
- Monitor rate limit usage

### Risk 3: Model Availability
**Mitigation**:
- Configure fallback models
- Test fallback logic
- Monitor model status
- Clear error messages

### Risk 4: Cost Controls
**Mitigation** (Future - not in Phase 0):
- Track token usage
- Set max tokens per request
- Implement budget limits
- Alert on high usage

## Testing Strategy

### Unit Tests
- Mock OpenAI SDK responses
- Test error paths
- Verify retry logic
- Validate telemetry

### Integration Tests (Future)
- Real API calls in CI (with test key)
- Verify model availability
- Test fallback chains
- Monitor latency

### Manual Testing
- Test with real OpenRouter API key
- Verify different model selections
- Test error scenarios
- Check telemetry output

## Dependencies and Blockers

### Dependencies
- Task #1: Monorepo setup ✓
- Task #2: Project structure ✓
- OpenRouter API key (dev must obtain)

### Blocks
- Task #8: Vector embeddings generation (needs OpenRouter client)
- Task #14: DGA prompt templates (needs OpenRouter client)
- Tasks #15-31: All agent implementations (need OpenRouter client)

## Success Metrics
- Client initializes without errors
- Unit test coverage > 90%
- Successful API call to OpenRouter
- Retry logic handles transient failures
- Fallback works on model unavailable
- Telemetry captures required data
- Documentation is clear and complete

## Usage Example (Post-Implementation)
```typescript
import { openRouterService } from './services/openrouter.service';
import { MODEL_CONFIGS } from './config/models';

// High-reasoning task (DGA)
const quizResponse = await openRouterService.createCompletion({
  model: MODEL_CONFIGS['high-reasoning'].primary,
  messages: [
    { role: 'system', content: 'You are a quiz generation assistant.' },
    { role: 'user', content: 'Generate 5 MCQs about photosynthesis.' }
  ],
  temperature: 0.7,
  maxTokens: 2048,
});

// Fast task (QAA scoring)
const scoreResponse = await openRouterService.createCompletion({
  model: MODEL_CONFIGS['fast'].primary,
  messages: [
    { role: 'system', content: 'You are a QA scoring assistant.' },
    { role: 'user', content: 'Score this quiz for grounding...' }
  ],
  temperature: 0.3,
  maxTokens: 1024,
});
```

## Next Steps After Completion
1. Update status.md to mark Task #3 as DONE
2. Update completed.md with Task #3 entry
3. Begin Task #4: Define Book and Chunk data models/schemas
4. Or begin Task #14: Create DGA prompt templates (can run in parallel)

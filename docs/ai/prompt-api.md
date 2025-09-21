# Prompt API Documentation

## Overview

The Prompt API allows developers to send natural language requests to Gemini Nano directly in the browser. It enables AI-powered features like personalized content, intelligent search, content classification, and multimodal analysis without sending data to external servers.

## Browser Support

- Chrome 138+ (Origin Trial)
- Available on Windows 10/11, macOS 13+, Linux, ChromeOS
- Requires 22+ GB free storage and >4 GB VRAM
- Unmetered network connection recommended

## Hardware Requirements

### Supported Platforms
- Windows 10/11
- macOS 13+ (Ventura)
- Linux
- ChromeOS (Platform 16389.0.0+) on Chromebook Plus

### Minimum Specifications
- 22 GB free storage space
- >4 GB VRAM
- Unmetered network connection for model download

## Feature Detection

Check if the Prompt API is available in the current environment:

```javascript
if ('LanguageModel' in self) {
  // Prompt API is supported
  console.log('Prompt API is available');
} else {
  console.log('Prompt API is not supported');
}
```

## Availability Check

Before creating a language model session, check the availability status:

```javascript
const availability = await LanguageModel.availability();

switch (availability) {
  case 'no':
    console.log('Prompt API is not available');
    break;
  case 'after-download':
    console.log('Prompt API will be available after model download');
    break;
  case 'readily':
    console.log('Prompt API is ready to use immediately');
    break;
}
```

## Creating a Language Model Session

### Basic Creation

```javascript
const session = await LanguageModel.create();
```

### Advanced Configuration

```javascript
const options = {
  temperature: 0.8,           // Creativity level (0.0 - 1.0)
  topK: 40,                   // Vocabulary diversity (1-40)
  systemPrompt: 'You are a helpful assistant that provides concise answers.',
  signal: abortController.signal
};

const session = await LanguageModel.create(options);
```

### With Download Progress Monitoring

```javascript
const session = await LanguageModel.create({
  temperature: 0.7,
  topK: 20,
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded}/${e.total} bytes`);
    });
  }
});
```

## Prompting the Model

### Non-Streaming Prompts

```javascript
const userQuestion = "What are the benefits of renewable energy?";

const response = await session.prompt(userQuestion);
console.log(response);
```

### Streaming Prompts

```javascript
const stream = session.promptStreaming("Write a detailed explanation of photosynthesis");

let fullResponse = '';
for await (const chunk of stream) {
  fullResponse += chunk;
  console.log('Streaming chunk:', chunk);
}

console.log('Complete response:', fullResponse);
```

### Prompts with Context

```javascript
const response = await session.prompt(
  "Explain quantum computing",
  {
    context: "The user is a high school student learning about physics"
  }
);
```

## Multimodal Input

### Image Analysis

```javascript
// Analyze an image
const imageInput = [
  {
    role: 'user',
    content: [
      { type: 'text', value: 'What do you see in this image?' },
      { type: 'image', value: imageBlob }
    ]
  }
];

const response = await session.prompt(imageInput);
console.log(response);
```

### Audio Analysis

```javascript
// Analyze audio content
const audioInput = [
  {
    role: 'user',
    content: [
      { type: 'text', value: 'Transcribe this audio and summarize the content:' },
      { type: 'audio', value: audioBlob }
    ]
  }
];

const response = await session.prompt(audioInput);
```

### Combined Multimodal Input

```javascript
const multimodalInput = [
  {
    role: 'user',
    content: [
      { type: 'text', value: 'Compare the visual content with the audio description:' },
      { type: 'image', value: imageBlob },
      { type: 'audio', value: audioBlob }
    ]
  }
];

const response = await session.prompt(multimodalInput);
```

## Structured Output

### Boolean Response

```javascript
const booleanSchema = { "type": "boolean" };

const result = await session.prompt(
  'Is this post about technology?',
  { responseConstraint: booleanSchema }
);

console.log(typeof result); // boolean
```

### JSON Object Response

```javascript
const objectSchema = {
  "type": "object",
  "properties": {
    "sentiment": { "type": "string", "enum": ["positive", "negative", "neutral"] },
    "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
    "keywords": {
      "type": "array",
      "items": { "type": "string" },
      "maxItems": 5
    }
  },
  "required": ["sentiment", "confidence"]
};

const analysis = await session.prompt(
  'Analyze the sentiment of this text: "I love this new feature!"',
  { responseConstraint: objectSchema }
);

console.log(analysis);
// { sentiment: "positive", confidence: 0.95, keywords: ["love", "feature"] }
```

### Array Response

```javascript
const arraySchema = {
  "type": "array",
  "items": { "type": "string" },
  "maxItems": 10
};

const suggestions = await session.prompt(
  'Give me 5 creative writing prompts',
  { responseConstraint: arraySchema }
);

console.log(suggestions); // Array of strings
```

## Session Management

### Conversation Context

```javascript
// Create session with system prompt
const session = await LanguageModel.create({
  systemPrompt: 'You are a cooking assistant. Provide recipe suggestions and cooking tips.'
});

// First interaction
const response1 = await session.prompt('I want to cook something healthy');

// Follow-up - maintains context
const response2 = await session.prompt('Make it vegetarian and quick to prepare');

// The model remembers the previous conversation
```

### Cloning Sessions

```javascript
const originalSession = await LanguageModel.create({
  temperature: 0.7,
  systemPrompt: 'You are a helpful assistant'
});

// Clone the session to preserve state
const clonedSession = await originalSession.clone();

// Both sessions maintain separate conversation histories
```

### Destroying Sessions

```javascript
// Clean up when done
session.destroy();
```

## Configuration Options

### Temperature
Controls the randomness of responses:
- `0.0`: Deterministic, focused responses
- `0.5`: Balanced creativity and consistency
- `1.0`: Maximum creativity and randomness

### TopK
Controls vocabulary diversity:
- Lower values (1-10): More focused, predictable responses
- Higher values (20-40): More diverse vocabulary choices

## Complete Example

```javascript
async function demonstratePromptAPI() {
  // Check if API is supported
  if (!('LanguageModel' in self)) {
    console.error('Prompt API not supported');
    return;
  }

  // Check availability
  const availability = await LanguageModel.availability();
  if (availability === 'no') {
    console.error('Prompt API not available');
    return;
  }

  try {
    // Create language model session
    const session = await LanguageModel.create({
      temperature: 0.7,
      topK: 20,
      systemPrompt: 'You are a helpful educational assistant.'
    });

    // Simple text prompt
    const basicResponse = await session.prompt('Explain photosynthesis in simple terms');
    console.log('Basic response:', basicResponse);

    // Structured output example
    const schema = {
      "type": "object",
      "properties": {
        "topic": { "type": "string" },
        "difficulty": { "type": "string", "enum": ["beginner", "intermediate", "advanced"] },
        "keyPoints": {
          "type": "array",
          "items": { "type": "string" },
          "maxItems": 3
        }
      }
    };

    const structuredResponse = await session.prompt(
      'Analyze this topic: machine learning basics',
      { responseConstraint: schema }
    );
    console.log('Structured response:', structuredResponse);

    // Streaming example
    console.log('Streaming response:');
    const stream = session.promptStreaming('Write a short story about space exploration');
    for await (const chunk of stream) {
      process.stdout.write(chunk);
    }

    // Clean up
    session.destroy();

  } catch (error) {
    console.error('Error using Prompt API:', error);
  }
}

// Run the demonstration
demonstratePromptAPI();
```

## Error Handling

```javascript
try {
  const session = await LanguageModel.create();
  const response = await session.prompt(userInput);
  console.log(response);
} catch (error) {
  if (error.name === 'NotSupportedError') {
    console.error('Prompt API is not supported in this browser');
  } else if (error.name === 'InvalidStateError') {
    console.error('Language model session is not in a valid state');
  } else if (error.name === 'NotReadableError') {
    console.error('Model download failed or was interrupted');
  } else if (error.name === 'AbortError') {
    console.error('Request was aborted');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Permissions and Security

### Cross-Origin Support

The Prompt API supports cross-origin iframes when enabled via Permissions Policy:

```html
<iframe src="https://example.com" allow="prompt-api"></iframe>
```

### Limitations

- Not available in Web Workers
- Requires user activation for security
- Limited to top-level windows and same-origin iframes by default
- All processing happens locally on the device

## Best Practices

1. **Always check availability** before creating a session
2. **Handle errors gracefully** with comprehensive try-catch blocks
3. **Clean up resources** by calling `destroy()` when done
4. **Use appropriate temperature** for your use case
5. **Provide clear system prompts** for consistent behavior
6. **Consider user privacy** - all processing happens locally
7. **Test with various input types** and edge cases
8. **Use structured output** when you need specific data formats
9. **Monitor model download progress** for better user experience
10. **Implement proper conversation management** for multi-turn interactions

## Use Cases

### Content Classification

```javascript
const classifier = await LanguageModel.create({
  systemPrompt: 'You are a content classifier. Respond only with the category name.',
  temperature: 0.1
});

const category = await session.prompt(
  'Classify this article: "Scientists discover new planet in distant galaxy"',
  {
    responseConstraint: {
      "type": "string",
      "enum": ["science", "technology", "sports", "politics", "entertainment"]
    }
  }
);
```

### Personalized Recommendations

```javascript
const recommender = await LanguageModel.create({
  systemPrompt: 'You provide personalized recommendations based on user preferences.',
  temperature: 0.6
});

const recommendations = await session.prompt(
  'User likes sci-fi movies and puzzle games. Recommend 3 items.',
  {
    responseConstraint: {
      "type": "array",
      "items": { "type": "string" },
      "maxItems": 3
    }
  }
);
```

### Smart Search Enhancement

```javascript
const searchAssistant = await LanguageModel.create({
  systemPrompt: 'You help enhance search queries and provide context.',
  temperature: 0.4
});

const enhancedQuery = await session.prompt(
  `User searched for: "${userQuery}". Suggest related terms and context.`
);
```

## TypeScript Interface

```typescript
interface LanguageModelCreateOptions {
  temperature?: number;          // 0.0 - 1.0
  topK?: number;                // 1 - 40
  systemPrompt?: string;
  signal?: AbortSignal;
  monitor?: (monitor: EventTarget) => void;
}

interface PromptOptions {
  context?: string;
  signal?: AbortSignal;
  responseConstraint?: JSONSchema;
}

interface MultimodalContent {
  role: 'user' | 'assistant';
  content: Array<{
    type: 'text' | 'image' | 'audio';
    value: string | Blob;
  }>;
}

declare class LanguageModel {
  static availability(): Promise<'no' | 'after-download' | 'readily'>;
  static create(options?: LanguageModelCreateOptions): Promise<LanguageModel>;

  prompt(input: string | MultimodalContent[], options?: PromptOptions): Promise<string>;
  promptStreaming(input: string | MultimodalContent[], options?: PromptOptions): ReadableStream<string>;
  clone(): Promise<LanguageModel>;
  destroy(): void;
}
```

## Performance Considerations

- First prompt may be slower as the model initializes
- Subsequent prompts are faster due to model caching
- Large inputs may take longer to process
- Streaming is recommended for long responses
- Clone sessions to preserve conversation state without reinitialization

## Resources

- [Chrome AI Overview](https://developer.chrome.com/docs/ai/built-in)
- [Writing Assistance APIs](https://webmachinelearning.github.io/writing-assistance-apis)
- [People + AI Guidebook](https://pair.withgoogle.com/guidebook/)
- [Origin Trial Registration](https://developer.chrome.com/origintrials/#/view_trial/2003875230052335617)
- [Gemini Nano Model Information](https://ai.google.dev/gemini-api/docs/models/gemini#gemini-nano)
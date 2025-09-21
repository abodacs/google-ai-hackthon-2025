# Writer API Documentation

## Overview

The Writer API is part of Chrome's built-in AI Writing Assistance APIs that enables developers to create new content based on user prompts. It uses the Gemini Nano model to generate various types of content including reviews, blog posts, emails, and other written materials.

## Browser Support

- Chrome 137+ (Origin Trial)
- Available on Windows 10/11, macOS 13+, Linux, ChromeOS
- Requires 22+ GB free storage and >4 GB VRAM
- Unmetered network connection recommended

## Feature Detection

Check if the Writer API is available in the current environment:

```javascript
if ('Writer' in self) {
  // Writer API is supported
  console.log('Writer API is available');
} else {
  console.log('Writer API is not supported');
}
```

## Availability Check

Before creating a writer, check the availability status:

```javascript
const availability = await Writer.availability();

switch (availability) {
  case 'no':
    console.log('Writer API is not available');
    break;
  case 'after-download':
    console.log('Writer will be available after model download');
    break;
  case 'readily':
    console.log('Writer is ready to use immediately');
    break;
}
```

## Creating a Writer

### Basic Creation

```javascript
const writer = await Writer.create();
```

### Advanced Configuration

```javascript
const options = {
  tone: 'formal',           // Options: 'formal', 'neutral', 'casual'
  format: 'markdown',       // Options: 'markdown', 'plain-text'
  length: 'medium',         // Options: 'short', 'medium', 'long'
  sharedContext: 'This is a business communication context for professional emails.'
};

const writer = await Writer.create(options);
```

### With Download Progress Monitoring

```javascript
const writer = await Writer.create({
  tone: 'casual',
  format: 'plain-text',
  length: 'short',
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded}/${e.total} bytes`);
      console.log(`Progress: ${(e.loaded / e.total * 100).toFixed(2)}%`);
    });
  }
});
```

## Writing Content

### Non-Streaming Write

```javascript
const prompt = "Write a professional email to schedule a meeting with the marketing team.";

const result = await writer.write(prompt, {
  context: "The meeting should be for next week and discuss the Q4 campaign strategy."
});

console.log(result);
```

### Streaming Write

```javascript
const prompt = "Create a product review for a new smartphone.";

const stream = writer.writeStreaming(prompt, {
  context: "Focus on camera quality, battery life, and user experience."
});

let generatedContent = '';
for await (const chunk of stream) {
  generatedContent += chunk;
  console.log('Streaming chunk:', chunk);
  // Update UI progressively
}

console.log('Final content:', generatedContent);
```

## Configuration Options

### Tone Options

- `'formal'`: Professional, business-appropriate language
- `'neutral'`: Balanced, neither too formal nor casual
- `'casual'`: Relaxed, conversational tone

### Format Options

- `'markdown'`: Output formatted with Markdown syntax
- `'plain-text'`: Simple text without special formatting

### Length Options

- `'short'`: Concise, brief content
- `'medium'`: Standard length content
- `'long'`: Detailed, comprehensive content

## Complete Example

```javascript
async function demonstrateWriter() {
  // Check if API is supported
  if (!('Writer' in self)) {
    console.error('Writer API not supported');
    return;
  }

  // Check availability
  const availability = await Writer.availability();
  if (availability === 'no') {
    console.error('Writer API not available');
    return;
  }

  try {
    // Create writer with specific configuration
    const writer = await Writer.create({
      tone: 'professional',
      format: 'markdown',
      length: 'medium',
      sharedContext: 'Content for a technology blog targeting developers'
    });

    // Generate content
    const prompt = "Explain the benefits of using AI APIs in web development";

    const content = await writer.write(prompt, {
      context: "Focus on productivity improvements and user experience enhancements"
    });

    console.log('Generated content:');
    console.log(content);

    // Clean up
    writer.destroy();

  } catch (error) {
    console.error('Error using Writer API:', error);
  }
}

// Run the demonstration
demonstrateWriter();
```

## Advanced Usage Examples

### Blog Post Generation

```javascript
const blogWriter = await Writer.create({
  tone: 'casual',
  format: 'markdown',
  length: 'long',
  sharedContext: 'Technology blog for general audience'
});

const blogPost = await blogWriter.write(
  "The future of artificial intelligence in everyday applications",
  {
    context: "Include practical examples and avoid technical jargon"
  }
);
```

### Email Templates

```javascript
const emailWriter = await Writer.create({
  tone: 'formal',
  format: 'plain-text',
  length: 'short',
  sharedContext: 'Business email communication'
});

const emailContent = await emailWriter.write(
  "Write a follow-up email after a client meeting",
  {
    context: "Thank them for their time and summarize next steps"
  }
);
```

### Product Descriptions

```javascript
const productWriter = await Writer.create({
  tone: 'neutral',
  format: 'markdown',
  length: 'medium',
  sharedContext: 'E-commerce product descriptions'
});

const description = await productWriter.write(
  "Describe a wireless noise-canceling headphone",
  {
    context: "Highlight key features, benefits, and target audience"
  }
);
```

## Error Handling

```javascript
async function safeWriterUsage() {
  try {
    const writer = await Writer.create({
      tone: 'neutral',
      format: 'plain-text',
      length: 'medium'
    });

    const result = await writer.write("Your prompt here");
    return result;

  } catch (error) {
    if (error.name === 'NotSupportedError') {
      console.error('Writer API is not supported');
    } else if (error.name === 'InvalidStateError') {
      console.error('Writer is not in a valid state');
    } else if (error.name === 'QuotaExceededError') {
      console.error('API quota exceeded');
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}
```

## Aborting Operations

```javascript
const controller = new AbortController();

const writer = await Writer.create({
  signal: controller.signal
});

// Start writing
const writePromise = writer.write("Long content prompt", {
  signal: controller.signal
});

// Abort after 5 seconds if needed
setTimeout(() => {
  controller.abort();
}, 5000);

try {
  const result = await writePromise;
  console.log(result);
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Operation was aborted');
  }
}
```

## Permissions and Security

### Cross-Origin Support

The Writer API supports cross-origin iframes when enabled via Permissions Policy:

```html
<iframe src="https://example.com" allow="writer-api"></iframe>
```

### Limitations

- Not available in Web Workers
- Requires user activation for security
- Limited to top-level windows and same-origin iframes by default

## Best Practices

1. **Check availability first**: Always verify API availability before use
2. **Provide clear prompts**: Specific, detailed prompts yield better results
3. **Use appropriate context**: Additional context improves content relevance
4. **Choose suitable configuration**: Match tone, format, and length to your use case
5. **Handle errors gracefully**: Implement proper error handling and fallbacks
6. **Manage resources**: Call `destroy()` when finished to free up resources
7. **Consider user experience**: Use streaming for long content generation
8. **Respect quotas**: Be mindful of API usage limits

## Prompt Engineering Tips

### Effective Prompts

```javascript
// Good: Specific and detailed
const goodPrompt = "Write a 2-paragraph product announcement for a new fitness tracking app that helps users set and achieve their health goals";

// Poor: Too vague
const poorPrompt = "Write something about fitness";
```

### Using Context Effectively

```javascript
const writer = await Writer.create({
  tone: 'casual',
  sharedContext: 'Health and wellness blog for millennials'
});

const content = await writer.write(
  "Benefits of morning workouts",
  {
    context: "Include practical tips and focus on busy professionals who have limited time"
  }
);
```

## TypeScript Interface

```typescript
interface WriterCreateOptions {
  tone?: 'formal' | 'neutral' | 'casual';
  format?: 'markdown' | 'plain-text';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
  signal?: AbortSignal;
  monitor?: (monitor: EventTarget) => void;
}

interface WriteOptions {
  context?: string;
  signal?: AbortSignal;
}

declare class Writer {
  static availability(): Promise<'no' | 'after-download' | 'readily'>;
  static create(options?: WriterCreateOptions): Promise<Writer>;

  write(input: string, options?: WriteOptions): Promise<string>;
  writeStreaming(input: string, options?: WriteOptions): ReadableStream<string>;
  destroy(): void;
}
```

## Performance Considerations

- **Model Loading**: First use may require model download (22+ GB)
- **Memory Usage**: Requires >4 GB VRAM for optimal performance
- **Network**: Unmetered connection recommended for model download
- **Caching**: Models are cached locally after initial download

## Common Use Cases

1. **Content Generation**: Blog posts, articles, product descriptions
2. **Email Templates**: Professional communications, newsletters
3. **Creative Writing**: Story outlines, character descriptions
4. **Technical Documentation**: API descriptions, user guides
5. **Marketing Copy**: Ad text, social media posts, landing pages
6. **Educational Content**: Lesson plans, study guides, explanations

## Resources

- [Chrome AI Overview](https://developer.chrome.com/docs/ai/built-in)
- [Writing Assistance APIs Specification](https://webmachinelearning.github.io/writing-assistance-apis)
- [People + AI Guidebook](https://pair.withgoogle.com/guidebook/)
- [Origin Trial Registration](https://developer.chrome.com/origintrials/#/view_trial/2003875230052335617)
- [AI Capabilities Detection](https://developer.chrome.com/docs/ai/built-in#feature_detection)
# Rewriter API Documentation

## Overview

The Rewriter API is part of Chrome's built-in AI Writing Assistance APIs that allows developers to revise and restructure text programmatically. It uses the Gemini Nano model to modify text tone, length, and formatting.

## Browser Support

- Chrome 137+ (Origin Trial)
- Available on Windows 10/11, macOS 13+, Linux, ChromeOS
- Requires 22+ GB free storage and >4 GB VRAM
- Unmetered network connection recommended

## Feature Detection

Check if the Rewriter API is available in the current environment:

```javascript
if ('Rewriter' in self) {
  // Rewriter API is supported
  console.log('Rewriter API is available');
} else {
  console.log('Rewriter API is not supported');
}
```

## Availability Check

Before creating a rewriter, check the availability status:

```javascript
const availability = await Rewriter.availability();

switch (availability) {
  case 'no':
    console.log('Rewriter API is not available');
    break;
  case 'after-download':
    console.log('Rewriter will be available after model download');
    break;
  case 'readily':
    console.log('Rewriter is ready to use immediately');
    break;
}
```

## Creating a Rewriter

### Basic Creation

```javascript
const rewriter = await Rewriter.create();
```

### Advanced Configuration

```javascript
const options = {
  sharedContext: 'This is an email to acquaintances about an upcoming event.',
  tone: 'more-casual',      // Options: 'more-formal', 'as-is', 'more-casual'
  format: 'plain-text',     // Options: 'as-is', 'markdown', 'plain-text'
  length: 'shorter',        // Options: 'shorter', 'as-is', 'longer'
};

const rewriter = await Rewriter.create(options);
```

### With Download Progress Monitoring

```javascript
const rewriter = await Rewriter.create({
  sharedContext: 'Context for rewriting',
  tone: 'more-casual',
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded}/${e.total} bytes`);
    });
  }
});
```

## Rewriting Text

### Non-Streaming Rewrite

```javascript
const inputText = "Hello, I hope you're doing well. I wanted to let you know about our upcoming meeting scheduled for next Tuesday at 2 PM.";

const result = await rewriter.rewrite(inputText, {
  context: "Make this sound more urgent and professional"
});

console.log(result);
// Output: "I hope this message finds you well. I'm writing to inform you about our important meeting scheduled for next Tuesday at 2 PM."
```

### Streaming Rewrite

```javascript
const stream = rewriter.rewriteStreaming(inputText, {
  context: "Make this more casual and friendly"
});

let rewrittenText = '';
for await (const chunk of stream) {
  rewrittenText += chunk;
  console.log('Streaming chunk:', chunk);
}

console.log('Final result:', rewrittenText);
```

## Configuration Options

### Tone Options

- `'more-formal'`: Makes text more professional and formal
- `'as-is'`: Maintains current tone
- `'more-casual'`: Makes text more relaxed and conversational

### Format Options

- `'as-is'`: Maintains current formatting
- `'markdown'`: Converts to Markdown format
- `'plain-text'`: Converts to plain text

### Length Options

- `'shorter'`: Condenses the text
- `'as-is'`: Maintains current length
- `'longer'`: Expands the text with more detail

## Complete Example

```javascript
async function demonstrateRewriter() {
  // Check if API is supported
  if (!('Rewriter' in self)) {
    console.error('Rewriter API not supported');
    return;
  }

  // Check availability
  const availability = await Rewriter.availability();
  if (availability === 'no') {
    console.error('Rewriter API not available');
    return;
  }

  try {
    // Create rewriter with options
    const rewriter = await Rewriter.create({
      sharedContext: 'Professional email communication',
      tone: 'more-formal',
      format: 'plain-text',
      length: 'as-is'
    });

    // Original text
    const originalText = "Hey there! Just wanted to check in and see how things are going. Hope we can catch up soon!";

    // Rewrite the text
    const rewrittenText = await rewriter.rewrite(originalText, {
      context: "Convert to professional business communication"
    });

    console.log('Original:', originalText);
    console.log('Rewritten:', rewrittenText);

    // Clean up
    rewriter.destroy();

  } catch (error) {
    console.error('Error using Rewriter API:', error);
  }
}

// Run the demonstration
demonstrateRewriter();
```

## Error Handling

```javascript
try {
  const rewriter = await Rewriter.create();
  const result = await rewriter.rewrite(inputText);
  console.log(result);
} catch (error) {
  if (error.name === 'NotSupportedError') {
    console.error('Rewriter API is not supported');
  } else if (error.name === 'InvalidStateError') {
    console.error('Rewriter is not in a valid state');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Permissions and Security

### Cross-Origin Support

The Rewriter API supports cross-origin iframes when enabled via Permissions Policy:

```html
<iframe src="https://example.com" allow="rewriter-api"></iframe>
```

### Limitations

- Not available in Web Workers
- Requires user activation for security
- Limited to top-level windows and same-origin iframes by default

## Best Practices

1. **Always check availability** before creating a rewriter
2. **Handle errors gracefully** with proper try-catch blocks
3. **Clean up resources** by calling `destroy()` when done
4. **Provide context** for better rewriting results
5. **Consider user privacy** - all processing happens locally
6. **Test across different text types** to ensure quality results

## TypeScript Interface

```typescript
interface RewriterCreateOptions {
  sharedContext?: string;
  tone?: 'more-formal' | 'as-is' | 'more-casual';
  format?: 'as-is' | 'markdown' | 'plain-text';
  length?: 'shorter' | 'as-is' | 'longer';
  signal?: AbortSignal;
  monitor?: (monitor: EventTarget) => void;
}

interface RewriteOptions {
  context?: string;
  signal?: AbortSignal;
}

declare class Rewriter {
  static availability(): Promise<'no' | 'after-download' | 'readily'>;
  static create(options?: RewriterCreateOptions): Promise<Rewriter>;

  rewrite(input: string, options?: RewriteOptions): Promise<string>;
  rewriteStreaming(input: string, options?: RewriteOptions): ReadableStream<string>;
  destroy(): void;
}
```

## Resources

- [Chrome AI Overview](https://developer.chrome.com/docs/ai/built-in)
- [Writing Assistance APIs](https://webmachinelearning.github.io/writing-assistance-apis)
- [People + AI Guidebook](https://pair.withgoogle.com/guidebook/)
- [Origin Trial Registration](https://developer.chrome.com/origintrials/#/view_trial/2003875230052335617)
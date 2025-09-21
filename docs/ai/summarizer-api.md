# Summarizer API Documentation

## Overview

The Summarizer API is part of Chrome's built-in AI Writing Assistance APIs that allows developers to generate concise summaries of text programmatically. It uses the Gemini Nano model to create summaries in various formats and lengths.

## Browser Support

- Chrome 138+ (Fully supported)
- Edge (Behind a flag)
- Firefox (Not supported)
- Safari (Not supported)
- Available on Windows 10/11, macOS 13+, Linux, ChromeOS
- Requires 22+ GB free storage and >4 GB VRAM
- Unmetered network connection recommended

## Feature Detection

Check if the Summarizer API is available in the current environment:

```javascript
if ('Summarizer' in self) {
  // Summarizer API is supported
  console.log('Summarizer API is available');
} else {
  console.log('Summarizer API is not supported');
}
```

## Availability Check

Before creating a summarizer, check the availability status:

```javascript
const availability = await Summarizer.availability();

switch (availability) {
  case 'no':
    console.log('Summarizer API is not available');
    break;
  case 'after-download':
    console.log('Summarizer will be available after model download');
    break;
  case 'readily':
    console.log('Summarizer is ready to use immediately');
    break;
}
```

## Creating a Summarizer

### Basic Creation

```javascript
const summarizer = await Summarizer.create();
```

### Advanced Configuration

```javascript
const options = {
  type: 'key-points',      // Options: 'key-points', 'tldr', 'teaser', 'headline'
  format: 'markdown',      // Options: 'markdown', 'plain-text'
  length: 'medium',        // Options: 'short', 'medium', 'long'
  sharedContext: 'This is a technical article about web development'
};

const summarizer = await Summarizer.create(options);
```

### With Download Progress Monitoring

```javascript
const summarizer = await Summarizer.create({
  type: 'key-points',
  format: 'markdown',
  length: 'medium',
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded}/${e.total} bytes`);
    });
  }
});
```

## Summarizing Text

### Non-Streaming Summarization

```javascript
const longText = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
sunt in culpa qui officia deserunt mollit anim id est laborum.
`;

const summary = await summarizer.summarize(longText, {
  context: "Summarize this for a general audience"
});

console.log(summary);
```

### Streaming Summarization

```javascript
const stream = summarizer.summarizeStreaming(longText, {
  context: "Create a technical summary for developers"
});

let fullSummary = '';
for await (const chunk of stream) {
  fullSummary += chunk;
  console.log('Streaming chunk:', chunk);
}

console.log('Final summary:', fullSummary);
```

## Configuration Options

### Summary Types

- `'key-points'`: Extract important points as a bullet list
- `'tldr'`: Quick overview summary (Too Long; Didn't Read)
- `'teaser'`: Intriguing highlights to generate interest
- `'headline'`: Single-sentence main point summary

### Format Options

- `'markdown'`: Returns summary in Markdown format
- `'plain-text'`: Returns summary as plain text

### Length Options

- `'short'`: Minimal, concise summary
- `'medium'`: Standard length summary (default)
- `'long'`: Comprehensive, detailed summary

## Complete Example

```javascript
async function demonstrateSummarizer() {
  // Check if API is supported
  if (!('Summarizer' in self)) {
    console.error('Summarizer API not supported');
    return;
  }

  // Check availability
  const availability = await Summarizer.availability();
  if (availability === 'no') {
    console.error('Summarizer API not available');
    return;
  }

  try {
    // Create summarizer with options
    const summarizer = await Summarizer.create({
      type: 'key-points',
      format: 'markdown',
      length: 'medium',
      sharedContext: 'Technical documentation for developers'
    });

    // Long article text
    const articleText = `
    Artificial Intelligence has revolutionized how we interact with technology.
    From machine learning algorithms that power recommendation systems to natural
    language processing that enables chatbots, AI is everywhere. The recent
    developments in large language models have opened new possibilities for
    creative applications, automated writing assistance, and intelligent
    code generation. However, these advances also bring challenges including
    ethical considerations, privacy concerns, and the need for responsible
    AI development practices.
    `;

    // Summarize the text
    const summary = await summarizer.summarize(articleText, {
      context: "Create a summary for a tech blog audience"
    });

    console.log('Original text:', articleText);
    console.log('Summary:', summary);

    // Clean up
    summarizer.destroy();

  } catch (error) {
    console.error('Error using Summarizer API:', error);
  }
}

// Run the demonstration
demonstrateSummarizer();
```

## Error Handling

```javascript
try {
  const summarizer = await Summarizer.create();
  const summary = await summarizer.summarize(inputText);
  console.log(summary);
} catch (error) {
  if (error.name === 'NotSupportedError') {
    console.error('Summarizer API is not supported');
  } else if (error.name === 'InvalidStateError') {
    console.error('Summarizer is not in a valid state');
  } else if (error.name === 'NotReadableError') {
    console.error('Model download failed or was interrupted');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Permissions and Security

### Cross-Origin Support

The Summarizer API supports cross-origin iframes when enabled via Permissions Policy:

```html
<iframe src="https://example.com" allow="summarizer-api"></iframe>
```

### Limitations

- Not available in Web Workers
- Requires user activation for security
- Limited to top-level windows and same-origin iframes by default

## Best Practices

1. **Always check availability** before creating a summarizer
2. **Handle errors gracefully** with proper try-catch blocks
3. **Clean up resources** by calling `destroy()` when done
4. **Remove HTML markup** before summarization using `innerText`
5. **Provide context** for better summarization results
6. **Consider user privacy** - all processing happens locally
7. **Test with various text types** to ensure quality results
8. **Review content guidelines** in the [People + AI Guidebook](https://pair.withgoogle.com/guidebook/)

## Working with Web Content

When summarizing web page content, use `innerText` to extract clean text:

```javascript
// Good: Extract clean text from webpage
const textContent = document.body.innerText;
const summary = await summarizer.summarize(textContent);

// Avoid: Using innerHTML with HTML markup
const htmlContent = document.body.innerHTML; // Contains HTML tags
```

## TypeScript Interface

```typescript
interface SummarizerCreateOptions {
  type?: 'key-points' | 'tldr' | 'teaser' | 'headline';
  format?: 'markdown' | 'plain-text';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
  signal?: AbortSignal;
  monitor?: (monitor: EventTarget) => void;
}

interface SummarizeOptions {
  context?: string;
  signal?: AbortSignal;
}

declare class Summarizer {
  static availability(): Promise<'no' | 'after-download' | 'readily'>;
  static create(options?: SummarizerCreateOptions): Promise<Summarizer>;

  summarize(input: string, options?: SummarizeOptions): Promise<string>;
  summarizeStreaming(input: string, options?: SummarizeOptions): ReadableStream<string>;
  destroy(): void;
}
```

## Performance Considerations

- The first summarization may be slower as the model initializes
- Subsequent summaries are faster due to model caching
- Large texts may take longer to process
- Streaming is recommended for long texts to provide user feedback

## Example Use Cases

### Article Summarization

```javascript
const articleSummarizer = await Summarizer.create({
  type: 'tldr',
  format: 'markdown',
  length: 'medium'
});

const summary = await articleSummarizer.summarize(articleContent, {
  context: 'Summarize this news article for quick reading'
});
```

### Key Points Extraction

```javascript
const keyPointsSummarizer = await Summarizer.create({
  type: 'key-points',
  format: 'markdown',
  length: 'short'
});

const keyPoints = await keyPointsSummarizer.summarize(documentContent, {
  context: 'Extract the main points from this technical document'
});
```

### Meeting Notes Summary

```javascript
const meetingSummarizer = await Summarizer.create({
  type: 'key-points',
  format: 'plain-text',
  length: 'medium'
});

const meetingSummary = await meetingSummarizer.summarize(meetingTranscript, {
  context: 'Summarize action items and decisions from this meeting'
});
```

## Resources

- [Chrome AI Overview](https://developer.chrome.com/docs/ai/built-in)
- [Writing Assistance APIs](https://webmachinelearning.github.io/writing-assistance-apis)
- [People + AI Guidebook](https://pair.withgoogle.com/guidebook/)
- [Origin Trial Registration](https://developer.chrome.com/origintrials/#/view_trial/2003875230052335617)
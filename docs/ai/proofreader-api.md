# Proofreader API Documentation

## Overview

The Proofreader API is part of Chrome's built-in AI Writing Assistance APIs that provides interactive proofreading capabilities for web applications and extensions. It offers grammar, spelling, and punctuation correction with error type labeling and explanations for corrections.

## Browser Support

- Chrome 141-145 (Origin Trial)
- Available on Windows 10/11, macOS 13+, Linux, ChromeOS (Chromebook Plus)
- Not available on mobile devices
- Requires 22+ GB free storage and >4 GB VRAM
- Unmetered network connection recommended

## Hardware Requirements

### Supported Platforms
- Windows 10/11
- macOS 13+ (Ventura)
- Linux
- ChromeOS (Chromebook Plus)

### Minimum Specifications
- 22 GB free storage space
- >4 GB VRAM
- Unmetered network connection for model download

## Feature Detection

Check if the Proofreader API is available in the current environment:

```javascript
if ('Proofreader' in self) {
  // Proofreader API is supported
  console.log('Proofreader API is available');
} else {
  console.log('Proofreader API is not supported');
}
```

## Availability Check

Before creating a proofreader, check the availability status:

```javascript
const availability = await Proofreader.availability();

switch (availability) {
  case 'no':
    console.log('Proofreader API is not available');
    break;
  case 'after-download':
    console.log('Proofreader will be available after model download');
    break;
  case 'readily':
    console.log('Proofreader is ready to use immediately');
    break;
}
```

## Creating a Proofreader

### Basic Creation

```javascript
const proofreader = await Proofreader.create();
```

### Advanced Configuration

```javascript
const options = {
  expectedInputLanguages: ['en'],  // Expected input languages
  signal: abortController.signal   // Optional abort signal
};

const proofreader = await Proofreader.create(options);
```

### With Download Progress Monitoring

```javascript
const proofreader = await Proofreader.create({
  expectedInputLanguages: ['en'],
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded}/${e.total} bytes`);
      console.log(`Progress: ${(e.loaded / e.total * 100).toFixed(1)}%`);
    });
  }
});
```

## Proofreading Text

### Basic Proofreading

```javascript
const textToProofread = "I seen him yesterday at the store, and he bought two loafs of bread.";

const proofreadResult = await proofreader.proofread(textToProofread);

console.log('Original:', textToProofread);
console.log('Corrections:', proofreadResult);
```

### With Context

```javascript
const proofreadResult = await proofreader.proofread(
  "Their going to the store tommorow.",
  {
    context: "This is a casual message to friends"
  }
);
```

### Processing Corrections

```javascript
const text = "I seen him yesterday at the store, and he bought two loafs of bread.";
const result = await proofreader.proofread(text);

// Process each correction
result.corrections.forEach((correction, index) => {
  console.log(`Correction ${index + 1}:`);
  console.log(`  Original: "${correction.original}"`);
  console.log(`  Suggested: "${correction.suggestion}"`);
  console.log(`  Type: ${correction.type}`);
  console.log(`  Explanation: ${correction.explanation}`);
  console.log(`  Position: ${correction.startIndex} - ${correction.endIndex}`);
});
```

## Correction Types

The API identifies various types of errors:

- **Grammar**: Subject-verb agreement, tense consistency
- **Spelling**: Misspelled words and typos
- **Punctuation**: Missing or incorrect punctuation marks
- **Style**: Writing style improvements
- **Clarity**: Suggestions for clearer expression

## Complete Example

```javascript
async function demonstrateProofreader() {
  // Check if API is supported
  if (!('Proofreader' in self)) {
    console.error('Proofreader API not supported');
    return;
  }

  // Check availability
  const availability = await Proofreader.availability();
  if (availability === 'no') {
    console.error('Proofreader API not available');
    return;
  }

  try {
    // Create proofreader with options
    const proofreader = await Proofreader.create({
      expectedInputLanguages: ['en'],
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          const progress = (e.loaded / e.total * 100).toFixed(1);
          console.log(`Downloading model: ${progress}%`);
        });
      }
    });

    // Text with various errors
    const textToProofread = `
      I seen the movie yesterday and it was really good. The actors was great,
      and the plot were very intresting. I would definately recommend it to
      anyone who like action films.
    `;

    console.log('Original text:', textToProofread);

    // Proofread the text
    const result = await proofreader.proofread(textToProofread.trim());

    // Display corrections
    if (result.corrections && result.corrections.length > 0) {
      console.log('\nFound corrections:');
      result.corrections.forEach((correction, index) => {
        console.log(`\n${index + 1}. ${correction.type.toUpperCase()}`);
        console.log(`   Original: "${correction.original}"`);
        console.log(`   Suggested: "${correction.suggestion}"`);
        console.log(`   Explanation: ${correction.explanation}`);
      });

      // Apply corrections to create corrected text
      let correctedText = textToProofread.trim();

      // Apply corrections in reverse order to maintain positions
      result.corrections
        .sort((a, b) => b.startIndex - a.startIndex)
        .forEach(correction => {
          correctedText =
            correctedText.slice(0, correction.startIndex) +
            correction.suggestion +
            correctedText.slice(correction.endIndex);
        });

      console.log('\nCorrected text:', correctedText);
    } else {
      console.log('No corrections needed!');
    }

    // Clean up
    proofreader.destroy();

  } catch (error) {
    console.error('Error using Proofreader API:', error);
  }
}

// Run the demonstration
demonstrateProofreader();
```

## Interactive Proofreading UI

```javascript
class InteractiveProofreader {
  constructor() {
    this.proofreader = null;
    this.currentCorrections = [];
  }

  async initialize() {
    if (!('Proofreader' in self)) {
      throw new Error('Proofreader API not supported');
    }

    const availability = await Proofreader.availability();
    if (availability === 'no') {
      throw new Error('Proofreader API not available');
    }

    this.proofreader = await Proofreader.create({
      expectedInputLanguages: ['en']
    });
  }

  async proofreadText(text) {
    if (!this.proofreader) {
      await this.initialize();
    }

    const result = await this.proofreader.proofread(text);
    this.currentCorrections = result.corrections || [];
    return this.currentCorrections;
  }

  applyCorrectionAtIndex(originalText, correctionIndex) {
    if (correctionIndex >= this.currentCorrections.length) {
      return originalText;
    }

    const correction = this.currentCorrections[correctionIndex];
    return (
      originalText.slice(0, correction.startIndex) +
      correction.suggestion +
      originalText.slice(correction.endIndex)
    );
  }

  applyAllCorrections(originalText) {
    let correctedText = originalText;

    // Apply corrections in reverse order to maintain positions
    this.currentCorrections
      .sort((a, b) => b.startIndex - a.startIndex)
      .forEach(correction => {
        correctedText =
          correctedText.slice(0, correction.startIndex) +
          correction.suggestion +
          correctedText.slice(correction.endIndex);
      });

    return correctedText;
  }

  destroy() {
    if (this.proofreader) {
      this.proofreader.destroy();
      this.proofreader = null;
    }
  }
}

// Usage example
const interactiveProofreader = new InteractiveProofreader();

async function proofreadUserInput(userText) {
  try {
    const corrections = await interactiveProofreader.proofreadText(userText);

    if (corrections.length > 0) {
      // Show corrections to user
      corrections.forEach((correction, index) => {
        console.log(`Suggestion ${index + 1}: Replace "${correction.original}" with "${correction.suggestion}"`);
        console.log(`Reason: ${correction.explanation}`);
      });

      // Apply all corrections
      const correctedText = interactiveProofreader.applyAllCorrections(userText);
      return correctedText;
    }

    return userText; // No corrections needed
  } catch (error) {
    console.error('Proofreading failed:', error);
    return userText;
  }
}
```

## Error Handling

```javascript
try {
  const proofreader = await Proofreader.create();
  const result = await proofreader.proofread(inputText);
  console.log(result);
} catch (error) {
  if (error.name === 'NotSupportedError') {
    console.error('Proofreader API is not supported');
  } else if (error.name === 'InvalidStateError') {
    console.error('Proofreader is not in a valid state');
  } else if (error.name === 'NotReadableError') {
    console.error('Model download failed or was interrupted');
  } else if (error.name === 'AbortError') {
    console.error('Proofreading was aborted');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Permissions and Security

### Cross-Origin Support

The Proofreader API supports cross-origin iframes when enabled via Permissions Policy:

```html
<iframe src="https://example.com" allow="proofreader-api"></iframe>
```

### Limitations

- Not available in Web Workers
- Not supported on mobile devices
- Requires user activation for security
- Limited to top-level windows and same-origin iframes by default
- All processing happens locally on the device

## Best Practices

1. **Always check availability** before creating a proofreader
2. **Handle errors gracefully** with comprehensive try-catch blocks
3. **Clean up resources** by calling `destroy()` when done
4. **Provide user feedback** during model download
5. **Consider user privacy** - all processing happens locally
6. **Test with various text types** and languages
7. **Apply corrections selectively** based on user preference
8. **Provide explanations** for corrections to help users learn
9. **Handle long texts** by breaking them into manageable chunks
10. **Review content guidelines** in the [People + AI Guidebook](https://pair.withgoogle.com/guidebook/)

## Use Cases

### Email Composition

```javascript
const emailProofreader = await Proofreader.create({
  expectedInputLanguages: ['en']
});

async function proofreadEmail(emailContent) {
  const result = await emailProofreader.proofread(emailContent, {
    context: 'Professional email communication'
  });

  return result.corrections.filter(correction =>
    ['grammar', 'spelling', 'punctuation'].includes(correction.type)
  );
}
```

### Document Review

```javascript
async function reviewDocument(documentText) {
  const proofreader = await Proofreader.create({
    expectedInputLanguages: ['en']
  });

  // Break long documents into chunks
  const chunks = documentText.match(/.{1,5000}/g) || [documentText];
  const allCorrections = [];

  for (const chunk of chunks) {
    const result = await proofreader.proofread(chunk);
    if (result.corrections) {
      allCorrections.push(...result.corrections);
    }
  }

  proofreader.destroy();
  return allCorrections;
}
```

### Real-time Text Editor

```javascript
class RealTimeProofreader {
  constructor(textArea) {
    this.textArea = textArea;
    this.proofreader = null;
    this.debounceTimer = null;
    this.init();
  }

  async init() {
    this.proofreader = await Proofreader.create({
      expectedInputLanguages: ['en']
    });

    this.textArea.addEventListener('input', () => {
      this.debounceProofread();
    });
  }

  debounceProofread() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.proofreadContent();
    }, 1000); // Wait 1 second after user stops typing
  }

  async proofreadContent() {
    const text = this.textArea.value;
    if (text.length < 10) return; // Skip very short texts

    try {
      const result = await this.proofreader.proofread(text);
      this.highlightCorrections(result.corrections);
    } catch (error) {
      console.error('Real-time proofreading failed:', error);
    }
  }

  highlightCorrections(corrections) {
    // Implementation would depend on your UI framework
    // This is a conceptual example
    corrections.forEach(correction => {
      console.log(`Highlight text from ${correction.startIndex} to ${correction.endIndex}`);
    });
  }
}
```

## TypeScript Interface

```typescript
interface ProofreaderCreateOptions {
  expectedInputLanguages?: string[];
  signal?: AbortSignal;
  monitor?: (monitor: EventTarget) => void;
}

interface ProofreadOptions {
  context?: string;
  signal?: AbortSignal;
}

interface ProofreadCorrection {
  original: string;
  suggestion: string;
  type: 'grammar' | 'spelling' | 'punctuation' | 'style' | 'clarity';
  explanation: string;
  startIndex: number;
  endIndex: number;
  confidence?: number;
}

interface ProofreadResult {
  corrections: ProofreadCorrection[];
}

declare class Proofreader {
  static availability(): Promise<'no' | 'after-download' | 'readily'>;
  static create(options?: ProofreaderCreateOptions): Promise<Proofreader>;

  proofread(input: string, options?: ProofreadOptions): Promise<ProofreadResult>;
  destroy(): void;
}
```

## Origin Trial Setup

To use the Proofreader API during the origin trial period:

1. **Register for the origin trial** at the Chrome Origin Trials page
2. **Add the trial token** to your web pages:

```html
<meta http-equiv="origin-trial" content="YOUR_TRIAL_TOKEN_HERE">
```

3. **For extensions**, add to manifest.json:

```json
{
  "trial_tokens": ["YOUR_TRIAL_TOKEN_HERE"]
}
```

## Performance Considerations

- First proofreading may be slower as the model initializes
- Subsequent operations are faster due to model caching
- Large texts may take longer to process
- Consider breaking very long texts into chunks
- Model download requires significant bandwidth and storage

## Resources

- [Chrome AI Overview](https://developer.chrome.com/docs/ai/built-in)
- [Writing Assistance APIs](https://webmachinelearning.github.io/writing-assistance-apis)
- [People + AI Guidebook](https://pair.withgoogle.com/guidebook/)
- [Origin Trial Registration](https://developer.chrome.com/origintrials/#/view_trial/2003875230052335617)
- [Generative AI Prohibited Uses Policy](https://policies.google.com/terms/generative-ai/use-policy)
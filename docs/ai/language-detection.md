# Language Detection API Documentation

## Overview

The Language Detection API is part of Chrome's built-in AI Writing Assistance APIs that provides client-side language detection capabilities. It can identify the language of input text without requiring server-side processing, making it ideal for privacy-conscious applications and offline functionality.

## Browser Support

- Chrome 138+ (Available)
- Edge (Not supported)
- Firefox (Not supported)
- Safari (Not supported)
- Available on Windows 10/11, macOS 13+, Linux, ChromeOS
- Smaller model size compared to other AI APIs

## Feature Detection

Check if the Language Detection API is available in the current environment:

```javascript
if ('LanguageDetector' in self) {
  // Language Detection API is supported
  console.log('Language Detection API is available');
} else {
  console.log('Language Detection API is not supported');
}
```

## Availability Check

Before creating a language detector, check the availability status:

```javascript
const availability = await LanguageDetector.availability();

switch (availability) {
  case 'no':
    console.log('Language Detection API is not available');
    break;
  case 'after-download':
    console.log('Language Detection will be available after model download');
    break;
  case 'readily':
    console.log('Language Detection is ready to use immediately');
    break;
}
```

## Creating a Language Detector

### Basic Creation

```javascript
const detector = await LanguageDetector.create();
```

### Advanced Configuration

```javascript
const options = {
  signal: abortController.signal  // Optional abort signal
};

const detector = await LanguageDetector.create(options);
```

### With Download Progress Monitoring

```javascript
const detector = await LanguageDetector.create({
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded}/${e.total} bytes`);
      console.log(`Progress: ${(e.loaded / e.total * 100).toFixed(1)}%`);
    });
  }
});
```

## Detecting Languages

### Basic Detection

```javascript
const textToDetect = "Hallo und herzlich willkommen!";

const results = await detector.detect(textToDetect);

// Results are sorted by confidence (highest first)
for (const result of results) {
  console.log(`Language: ${result.detectedLanguage}`);
  console.log(`Confidence: ${result.confidence}`);
}
```

### Processing Detection Results

```javascript
const text = "Bonjour, comment allez-vous aujourd'hui?";
const results = await detector.detect(text);

if (results.length > 0) {
  const topResult = results[0];

  if (topResult.confidence > 0.8) {
    console.log(`High confidence: Language is ${topResult.detectedLanguage}`);
  } else if (topResult.confidence > 0.5) {
    console.log(`Medium confidence: Language might be ${topResult.detectedLanguage}`);
  } else {
    console.log('Low confidence: Language detection uncertain');
  }
} else {
  console.log('No language detected');
}
```

### Multiple Language Candidates

```javascript
const mixedText = "Hello world! Bonjour le monde!";
const results = await detector.detect(mixedText);

console.log('Top language candidates:');
results.forEach((result, index) => {
  console.log(`${index + 1}. ${result.detectedLanguage} (${(result.confidence * 100).toFixed(1)}%)`);
});
```

## Complete Example

```javascript
async function demonstrateLanguageDetection() {
  // Check if API is supported
  if (!('LanguageDetector' in self)) {
    console.error('Language Detection API not supported');
    return;
  }

  // Check availability
  const availability = await LanguageDetector.availability();
  if (availability === 'no') {
    console.error('Language Detection API not available');
    return;
  }

  try {
    // Create language detector with progress monitoring
    const detector = await LanguageDetector.create({
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          const progress = (e.loaded / e.total * 100).toFixed(1);
          console.log(`Downloading language detection model: ${progress}%`);
        });
      }
    });

    // Test texts in different languages
    const testTexts = [
      "Hello, how are you doing today?",
      "Hola, ¿cómo estás hoy?",
      "Bonjour, comment allez-vous aujourd'hui?",
      "Hallo, wie geht es dir heute?",
      "Ciao, come stai oggi?",
      "こんにちは、今日はどうですか？",
      "Привет, как дела сегодня?",
      "مرحبا، كيف حالك اليوم؟"
    ];

    console.log('Detecting languages for various texts:');

    for (const text of testTexts) {
      const results = await detector.detect(text);

      console.log(`\nText: "${text}"`);

      if (results.length > 0) {
        const topResult = results[0];
        console.log(`Detected: ${topResult.detectedLanguage} (${(topResult.confidence * 100).toFixed(1)}% confidence)`);

        // Show additional candidates if available
        if (results.length > 1) {
          console.log('Other candidates:');
          results.slice(1, 3).forEach(result => {
            console.log(`  - ${result.detectedLanguage} (${(result.confidence * 100).toFixed(1)}%)`);
          });
        }
      } else {
        console.log('No language detected');
      }
    }

    // Clean up
    detector.destroy();

  } catch (error) {
    console.error('Error using Language Detection API:', error);
  }
}

// Run the demonstration
demonstrateLanguageDetection();
```

## Language Detection Utility Class

```javascript
class LanguageDetectionService {
  constructor(options = {}) {
    this.detector = null;
    this.confidenceThreshold = options.confidenceThreshold || 0.5;
    this.maxCandidates = options.maxCandidates || 3;
  }

  async initialize() {
    if (!this.detector) {
      if (!('LanguageDetector' in self)) {
        throw new Error('Language Detection API not supported');
      }

      const availability = await LanguageDetector.availability();
      if (availability === 'no') {
        throw new Error('Language Detection API not available');
      }

      this.detector = await LanguageDetector.create();
    }
  }

  async detectLanguage(text, options = {}) {
    await this.initialize();

    const results = await this.detector.detect(text);
    const threshold = options.confidenceThreshold || this.confidenceThreshold;
    const maxResults = options.maxCandidates || this.maxCandidates;

    // Filter by confidence and limit results
    const filteredResults = results
      .filter(result => result.confidence >= threshold)
      .slice(0, maxResults);

    return {
      success: filteredResults.length > 0,
      primary: filteredResults[0] || null,
      candidates: filteredResults,
      allResults: results
    };
  }

  async detectPrimaryLanguage(text, minConfidence = 0.7) {
    const detection = await this.detectLanguage(text, {
      confidenceThreshold: minConfidence,
      maxCandidates: 1
    });

    return detection.primary?.detectedLanguage || null;
  }

  async isLanguage(text, expectedLanguage, minConfidence = 0.7) {
    const detection = await this.detectLanguage(text, {
      confidenceThreshold: minConfidence,
      maxCandidates: 1
    });

    return detection.primary?.detectedLanguage === expectedLanguage;
  }

  async detectBatch(texts, options = {}) {
    await this.initialize();

    const results = [];
    for (const text of texts) {
      try {
        const detection = await this.detectLanguage(text, options);
        results.push({
          text,
          detection,
          success: true
        });
      } catch (error) {
        results.push({
          text,
          detection: null,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  destroy() {
    if (this.detector) {
      this.detector.destroy();
      this.detector = null;
    }
  }
}

// Usage example
const languageService = new LanguageDetectionService({
  confidenceThreshold: 0.6,
  maxCandidates: 3
});

async function analyzeUserContent() {
  const userTexts = [
    "This is a sample English text.",
    "Esto es un texto de muestra en español.",
    "Ceci est un exemple de texte en français."
  ];

  const batchResults = await languageService.detectBatch(userTexts);

  batchResults.forEach(({ text, detection, success }) => {
    if (success && detection.primary) {
      console.log(`"${text}" -> ${detection.primary.detectedLanguage} (${(detection.primary.confidence * 100).toFixed(1)}%)`);
    } else {
      console.log(`"${text}" -> Language not detected`);
    }
  });

  languageService.destroy();
}
```

## Smart Translation Integration

```javascript
class SmartTranslationService {
  constructor() {
    this.detector = null;
    this.translators = new Map();
  }

  async initialize() {
    this.detector = await LanguageDetector.create();
  }

  async translateWithDetection(text, targetLanguage, options = {}) {
    if (!this.detector) {
      await this.initialize();
    }

    // Detect source language
    const detectionResults = await this.detector.detect(text);

    if (detectionResults.length === 0 || detectionResults[0].confidence < 0.7) {
      throw new Error('Could not reliably detect source language');
    }

    const sourceLanguage = detectionResults[0].detectedLanguage;

    // Skip translation if already in target language
    if (sourceLanguage === targetLanguage) {
      return {
        originalText: text,
        translatedText: text,
        sourceLanguage,
        targetLanguage,
        wasTranslated: false,
        confidence: detectionResults[0].confidence
      };
    }

    // Get or create translator for this language pair
    const translatorKey = `${sourceLanguage}-${targetLanguage}`;

    if (!this.translators.has(translatorKey)) {
      const translator = await Translator.create({
        sourceLanguage,
        targetLanguage
      });
      this.translators.set(translatorKey, translator);
    }

    const translator = this.translators.get(translatorKey);
    const translatedText = await translator.translate(text, options);

    return {
      originalText: text,
      translatedText,
      sourceLanguage,
      targetLanguage,
      wasTranslated: true,
      confidence: detectionResults[0].confidence,
      allDetectionResults: detectionResults
    };
  }

  destroy() {
    if (this.detector) {
      this.detector.destroy();
    }

    for (const translator of this.translators.values()) {
      translator.destroy();
    }
    this.translators.clear();
  }
}
```

## Content Classification by Language

```javascript
class LanguageBasedContentClassifier {
  constructor() {
    this.detector = null;
    this.languageHandlers = new Map();
  }

  async initialize() {
    this.detector = await LanguageDetector.create();
  }

  registerLanguageHandler(language, handler) {
    this.languageHandlers.set(language, handler);
  }

  async processContent(content) {
    if (!this.detector) {
      await this.initialize();
    }

    const detectionResults = await this.detector.detect(content);

    if (detectionResults.length === 0) {
      return { processed: false, reason: 'No language detected' };
    }

    const primaryLanguage = detectionResults[0].detectedLanguage;
    const confidence = detectionResults[0].confidence;

    if (confidence < 0.6) {
      return {
        processed: false,
        reason: 'Low confidence language detection',
        detectedLanguage: primaryLanguage,
        confidence
      };
    }

    // Check if we have a handler for this language
    if (this.languageHandlers.has(primaryLanguage)) {
      const handler = this.languageHandlers.get(primaryLanguage);
      const result = await handler(content, { confidence, allResults: detectionResults });

      return {
        processed: true,
        detectedLanguage: primaryLanguage,
        confidence,
        result
      };
    }

    // Default handler for unregistered languages
    return {
      processed: true,
      detectedLanguage: primaryLanguage,
      confidence,
      result: { message: `Content detected as ${primaryLanguage}, but no specific handler available` }
    };
  }

  destroy() {
    if (this.detector) {
      this.detector.destroy();
    }
  }
}

// Usage example
const classifier = new LanguageBasedContentClassifier();

// Register language-specific handlers
classifier.registerLanguageHandler('en', async (content) => {
  return { action: 'process_english', contentLength: content.length };
});

classifier.registerLanguageHandler('es', async (content) => {
  return { action: 'process_spanish', contentLength: content.length };
});

classifier.registerLanguageHandler('fr', async (content) => {
  return { action: 'process_french', contentLength: content.length };
});
```

## Error Handling

```javascript
try {
  const detector = await LanguageDetector.create();
  const results = await detector.detect(inputText);
  console.log(results);
} catch (error) {
  if (error.name === 'NotSupportedError') {
    console.error('Language Detection API is not supported');
  } else if (error.name === 'InvalidStateError') {
    console.error('Language detector is not in a valid state');
  } else if (error.name === 'NotReadableError') {
    console.error('Language detection model download failed');
  } else if (error.name === 'AbortError') {
    console.error('Language detection was aborted');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Permissions and Security

### Cross-Origin Support

The Language Detection API supports cross-origin iframes when enabled via Permissions Policy:

```html
<iframe src="https://example.com" allow="language-detector-api"></iframe>
```

### Limitations

- Not available in Web Workers
- Requires user activation for security
- Limited to top-level windows and same-origin iframes by default
- All processing happens locally on the device

## Best Practices

1. **Always check availability** before creating a detector
2. **Handle errors gracefully** with comprehensive try-catch blocks
3. **Clean up resources** by calling `destroy()` when done
4. **Set confidence thresholds** appropriate for your use case
5. **Avoid very short texts** for better accuracy
6. **Consider multiple candidates** for ambiguous content
7. **Test with various text types** and languages
8. **Handle low-confidence results** as uncertain
9. **Cache detector instances** for repeated use
10. **Provide fallback mechanisms** for unsupported languages

## Use Cases

### Automatic Translation Trigger

```javascript
async function autoTranslateIfNeeded(text, userLanguage) {
  const detector = await LanguageDetector.create();
  const results = await detector.detect(text);

  if (results.length > 0 && results[0].confidence > 0.8) {
    const detectedLanguage = results[0].detectedLanguage;

    if (detectedLanguage !== userLanguage) {
      // Trigger translation
      const translator = await Translator.create({
        sourceLanguage: detectedLanguage,
        targetLanguage: userLanguage
      });

      const translation = await translator.translate(text);
      translator.destroy();
      detector.destroy();

      return { translated: true, original: text, translation };
    }
  }

  detector.destroy();
  return { translated: false, original: text };
}
```

### Content Filtering by Language

```javascript
async function filterContentByLanguage(contents, allowedLanguages) {
  const detector = await LanguageDetector.create();
  const filteredContents = [];

  for (const content of contents) {
    const results = await detector.detect(content.text);

    if (results.length > 0 && results[0].confidence > 0.7) {
      const language = results[0].detectedLanguage;

      if (allowedLanguages.includes(language)) {
        filteredContents.push({
          ...content,
          detectedLanguage: language,
          confidence: results[0].confidence
        });
      }
    }
  }

  detector.destroy();
  return filteredContents;
}
```

## TypeScript Interface

```typescript
interface LanguageDetectorCreateOptions {
  signal?: AbortSignal;
  monitor?: (monitor: EventTarget) => void;
}

interface LanguageDetectionResult {
  detectedLanguage: string;
  confidence: number;  // 0.0 to 1.0
}

declare class LanguageDetector {
  static availability(): Promise<'no' | 'after-download' | 'readily'>;
  static create(options?: LanguageDetectorCreateOptions): Promise<LanguageDetector>;

  detect(input: string): Promise<LanguageDetectionResult[]>;
  destroy(): void;
}
```

## Performance Considerations

- Small model size compared to other AI APIs
- Fast detection for most common languages
- Results are sorted by confidence (highest first)
- Model download only happens once per browser session
- Very short texts may have lower accuracy

## Supported Languages

The Language Detection API supports a wide range of languages including:

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Chinese Simplified (zh)
- Chinese Traditional (zh-Hant)
- Arabic (ar)
- Hindi (hi)
- Dutch (nl)
- Swedish (sv)
- Norwegian (no)
- Danish (da)
- Finnish (fi)
- Polish (pl)
- Czech (cs)
- Hungarian (hu)
- Romanian (ro)
- Bulgarian (bg)
- Croatian (hr)
- Serbian (sr)
- Slovak (sk)
- Slovenian (sl)
- Estonian (et)
- Latvian (lv)
- Lithuanian (lt)
- Turkish (tr)
- Greek (el)
- Hebrew (he)
- Thai (th)
- Vietnamese (vi)
- Indonesian (id)
- Malay (ms)
- Filipino (fil)

*Note: The exact list of supported languages may vary and expand over time.*

## Resources

- [Chrome AI Overview](https://developer.chrome.com/docs/ai/built-in)
- [Writing Assistance APIs](https://webmachinelearning.github.io/writing-assistance-apis)
- [BCP 47 Language Codes](https://www.rfc-editor.org/info/bcp47)
- [People + AI Guidebook](https://pair.withgoogle.com/guidebook/)
- [Origin Trial Registration](https://developer.chrome.com/origintrials/#/view_trial/2003875230052335617)
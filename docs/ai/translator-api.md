# Translator API Documentation

## Overview

The Translator API is part of Chrome's built-in AI Writing Assistance APIs that enables client-side text translation using AI models directly in the browser. It provides high-quality translation without sending data to external servers, ensuring user privacy.

## Browser Support

- Chrome 138+ (Available)
- Edge (Not supported)
- Firefox (Not supported)
- Safari (Not supported)
- Available on Windows 10/11, macOS 13+, Linux, ChromeOS
- Requires sufficient storage for language model downloads

## Feature Detection

Check if the Translator API is available in the current environment:

```javascript
if ('Translator' in self) {
  // Translator API is supported
  console.log('Translator API is available');
} else {
  console.log('Translator API is not supported');
}
```

## Language Support

The Translator API uses [BCP 47](https://www.rfc-editor.org/info/bcp47) language codes:

- `'en'` - English
- `'es'` - Spanish
- `'fr'` - French
- `'de'` - German
- `'it'` - Italian
- `'pt'` - Portuguese
- `'ru'` - Russian
- `'ja'` - Japanese
- `'ko'` - Korean
- `'zh'` - Chinese (Simplified)
- `'zh-Hant'` - Chinese (Traditional)
- `'ar'` - Arabic
- `'hi'` - Hindi

## Availability Check

Before creating a translator, check if the language pair is supported:

```javascript
const availability = await Translator.availability({
  sourceLanguage: 'en',
  targetLanguage: 'es'
});

switch (availability) {
  case 'no':
    console.log('Translation not available for this language pair');
    break;
  case 'after-download':
    console.log('Translation will be available after model download');
    break;
  case 'readily':
    console.log('Translation is ready to use immediately');
    break;
}
```

## Creating a Translator

### Basic Creation

```javascript
const translator = await Translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'es'
});
```

### Advanced Configuration

```javascript
const options = {
  sourceLanguage: 'en',
  targetLanguage: 'fr',
  signal: abortController.signal  // Optional abort signal
};

const translator = await Translator.create(options);
```

### With Download Progress Monitoring

```javascript
const translator = await Translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'de',
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded}/${e.total} bytes`);
      console.log(`Progress: ${(e.loaded / e.total * 100).toFixed(1)}%`);
    });
  }
});
```

## Translating Text

### Basic Translation

```javascript
const englishText = "Hello, how are you today?";

const translation = await translator.translate(englishText);
console.log(translation); // "Hola, ¿cómo estás hoy?"
```

### Translation with Context

```javascript
const translation = await translator.translate(
  "The bank is closed on Sundays",
  {
    context: "Referring to a financial institution, not a river bank"
  }
);
```

### Streaming Translation

For longer texts, use streaming to provide real-time feedback:

```javascript
const longText = `
  This is a very long document that needs to be translated.
  It contains multiple paragraphs and sentences that will
  take some time to process completely.
`;

const stream = translator.translateStreaming(longText);

let fullTranslation = '';
for await (const chunk of stream) {
  fullTranslation += chunk;
  console.log('Translation chunk:', chunk);
  // Update UI with partial translation
}

console.log('Complete translation:', fullTranslation);
```

## Complete Example

```javascript
async function demonstrateTranslator() {
  // Check if API is supported
  if (!('Translator' in self)) {
    console.error('Translator API not supported');
    return;
  }

  try {
    // Check availability for English to Spanish translation
    const availability = await Translator.availability({
      sourceLanguage: 'en',
      targetLanguage: 'es'
    });

    if (availability === 'no') {
      console.error('English to Spanish translation not available');
      return;
    }

    // Create translator with download progress monitoring
    const translator = await Translator.create({
      sourceLanguage: 'en',
      targetLanguage: 'es',
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          const progress = (e.loaded / e.total * 100).toFixed(1);
          console.log(`Downloading translation model: ${progress}%`);
        });
      }
    });

    // Sample texts to translate
    const textsToTranslate = [
      "Good morning, how can I help you?",
      "The weather is beautiful today.",
      "I would like to order a coffee, please.",
      "Where is the nearest train station?"
    ];

    console.log('Translating texts from English to Spanish:');

    for (const text of textsToTranslate) {
      const translation = await translator.translate(text);
      console.log(`EN: ${text}`);
      console.log(`ES: ${translation}\n`);
    }

    // Example with streaming for longer text
    const longText = `
      Welcome to our restaurant! We offer a wide variety of delicious dishes
      made with fresh, local ingredients. Our menu includes appetizers, main
      courses, and desserts to satisfy all tastes. We also have a selection
      of wines and beverages to complement your meal.
    `;

    console.log('Streaming translation of longer text:');
    console.log('Original:', longText.trim());
    console.log('Translation:');

    const stream = translator.translateStreaming(longText.trim());
    let streamedTranslation = '';

    for await (const chunk of stream) {
      streamedTranslation += chunk;
      process.stdout.write(chunk);
    }

    console.log('\n\nComplete streamed translation:', streamedTranslation);

    // Clean up
    translator.destroy();

  } catch (error) {
    console.error('Error using Translator API:', error);
  }
}

// Run the demonstration
demonstrateTranslator();
```

## Multi-Language Translation

```javascript
class MultiLanguageTranslator {
  constructor() {
    this.translators = new Map();
  }

  async getTranslator(sourceLanguage, targetLanguage) {
    const key = `${sourceLanguage}-${targetLanguage}`;

    if (!this.translators.has(key)) {
      const availability = await Translator.availability({
        sourceLanguage,
        targetLanguage
      });

      if (availability === 'no') {
        throw new Error(`Translation from ${sourceLanguage} to ${targetLanguage} not supported`);
      }

      const translator = await Translator.create({
        sourceLanguage,
        targetLanguage
      });

      this.translators.set(key, translator);
    }

    return this.translators.get(key);
  }

  async translate(text, sourceLanguage, targetLanguage) {
    const translator = await this.getTranslator(sourceLanguage, targetLanguage);
    return await translator.translate(text);
  }

  async translateMultiple(texts, sourceLanguage, targetLanguage) {
    const translator = await this.getTranslator(sourceLanguage, targetLanguage);
    const translations = [];

    for (const text of texts) {
      const translation = await translator.translate(text);
      translations.push({
        original: text,
        translated: translation,
        sourceLanguage,
        targetLanguage
      });
    }

    return translations;
  }

  destroy() {
    for (const translator of this.translators.values()) {
      translator.destroy();
    }
    this.translators.clear();
  }
}

// Usage example
const multiTranslator = new MultiLanguageTranslator();

async function translateToMultipleLanguages() {
  const originalText = "Hello, welcome to our website!";
  const targetLanguages = ['es', 'fr', 'de', 'it'];

  const translations = await Promise.all(
    targetLanguages.map(async (lang) => ({
      language: lang,
      translation: await multiTranslator.translate(originalText, 'en', lang)
    }))
  );

  translations.forEach(({ language, translation }) => {
    console.log(`${language.toUpperCase()}: ${translation}`);
  });
}
```

## Language Detection Integration

```javascript
// Assuming you have the Language Detector API available
async function translateWithDetection(text, targetLanguage) {
  // Detect source language
  const detector = await LanguageDetector.create();
  const detectionResults = await detector.detect(text);

  if (detectionResults.length === 0) {
    throw new Error('Could not detect source language');
  }

  const sourceLanguage = detectionResults[0].detectedLanguage;
  console.log(`Detected source language: ${sourceLanguage}`);

  // Create translator
  const translator = await Translator.create({
    sourceLanguage,
    targetLanguage
  });

  // Translate
  const translation = await translator.translate(text);

  // Clean up
  detector.destroy();
  translator.destroy();

  return {
    originalText: text,
    detectedLanguage: sourceLanguage,
    targetLanguage,
    translation
  };
}
```

## Batch Translation

```javascript
class BatchTranslator {
  constructor(sourceLanguage, targetLanguage, options = {}) {
    this.sourceLanguage = sourceLanguage;
    this.targetLanguage = targetLanguage;
    this.batchSize = options.batchSize || 10;
    this.translator = null;
  }

  async initialize() {
    if (!this.translator) {
      this.translator = await Translator.create({
        sourceLanguage: this.sourceLanguage,
        targetLanguage: this.targetLanguage
      });
    }
  }

  async translateBatch(texts) {
    await this.initialize();

    const results = [];
    for (let i = 0; i < texts.length; i += this.batchSize) {
      const batch = texts.slice(i, i + this.batchSize);
      const batchResults = await Promise.all(
        batch.map(async (text) => ({
          original: text,
          translated: await this.translator.translate(text)
        }))
      );
      results.push(...batchResults);

      // Progress callback
      console.log(`Translated ${Math.min(i + this.batchSize, texts.length)}/${texts.length} texts`);
    }

    return results;
  }

  destroy() {
    if (this.translator) {
      this.translator.destroy();
      this.translator = null;
    }
  }
}

// Usage
const batchTranslator = new BatchTranslator('en', 'es', { batchSize: 5 });

const textsToTranslate = [
  "Hello world",
  "How are you?",
  "Good morning",
  "Thank you very much",
  "See you later"
];

const batchResults = await batchTranslator.translateBatch(textsToTranslate);
batchTranslator.destroy();
```

## Error Handling

```javascript
try {
  const translator = await Translator.create({
    sourceLanguage: 'en',
    targetLanguage: 'es'
  });

  const translation = await translator.translate(inputText);
  console.log(translation);
} catch (error) {
  if (error.name === 'NotSupportedError') {
    console.error('Translator API is not supported');
  } else if (error.name === 'InvalidStateError') {
    console.error('Translator is not in a valid state');
  } else if (error.name === 'NotReadableError') {
    console.error('Translation model download failed');
  } else if (error.name === 'AbortError') {
    console.error('Translation was aborted');
  } else if (error.message.includes('language')) {
    console.error('Unsupported language pair:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Permissions and Security

### Cross-Origin Support

The Translator API supports cross-origin iframes when enabled via Permissions Policy:

```html
<iframe src="https://example.com" allow="translator-api"></iframe>
```

### Limitations

- Not available in Web Workers
- Requires user activation for security
- Limited to top-level windows and same-origin iframes by default
- All processing happens locally on the device
- Sequential translation processing (one at a time per translator instance)

## Best Practices

1. **Always check availability** before creating a translator
2. **Handle errors gracefully** with comprehensive try-catch blocks
3. **Clean up resources** by calling `destroy()` when done
4. **Use streaming for long texts** to provide user feedback
5. **Cache translator instances** for repeated use of the same language pair
6. **Provide download progress feedback** for better user experience
7. **Consider user privacy** - all processing happens locally
8. **Test with various text types** and languages
9. **Handle sequential translations** with proper loading states
10. **Use appropriate context** for ambiguous terms

## Use Cases

### Website Localization

```javascript
class WebsiteTranslator {
  constructor() {
    this.currentTranslator = null;
    this.originalTexts = new Map();
  }

  async translatePage(targetLanguage) {
    // Store original texts
    const textElements = document.querySelectorAll('[data-translate]');
    textElements.forEach(element => {
      if (!this.originalTexts.has(element)) {
        this.originalTexts.set(element, element.textContent);
      }
    });

    // Create translator
    this.currentTranslator = await Translator.create({
      sourceLanguage: 'en',
      targetLanguage
    });

    // Translate each element
    for (const element of textElements) {
      const originalText = this.originalTexts.get(element);
      const translation = await this.currentTranslator.translate(originalText);
      element.textContent = translation;
    }
  }

  restoreOriginal() {
    this.originalTexts.forEach((originalText, element) => {
      element.textContent = originalText;
    });

    if (this.currentTranslator) {
      this.currentTranslator.destroy();
      this.currentTranslator = null;
    }
  }
}
```

### Chat Translation

```javascript
class ChatTranslator {
  constructor() {
    this.translators = new Map();
  }

  async translateMessage(message, fromLanguage, toLanguage) {
    const key = `${fromLanguage}-${toLanguage}`;

    if (!this.translators.has(key)) {
      const translator = await Translator.create({
        sourceLanguage: fromLanguage,
        targetLanguage: toLanguage
      });
      this.translators.set(key, translator);
    }

    const translator = this.translators.get(key);
    return await translator.translate(message);
  }

  async translateConversation(messages, userLanguage, partnerLanguage) {
    const translatedMessages = [];

    for (const message of messages) {
      const shouldTranslate = message.language !== userLanguage;

      if (shouldTranslate) {
        const translation = await this.translateMessage(
          message.text,
          message.language,
          userLanguage
        );

        translatedMessages.push({
          ...message,
          originalText: message.text,
          translatedText: translation,
          isTranslated: true
        });
      } else {
        translatedMessages.push({
          ...message,
          isTranslated: false
        });
      }
    }

    return translatedMessages;
  }

  destroy() {
    for (const translator of this.translators.values()) {
      translator.destroy();
    }
    this.translators.clear();
  }
}
```

## TypeScript Interface

```typescript
interface TranslatorCreateOptions {
  sourceLanguage: string;
  targetLanguage: string;
  signal?: AbortSignal;
  monitor?: (monitor: EventTarget) => void;
}

interface TranslateOptions {
  context?: string;
  signal?: AbortSignal;
}

interface AvailabilityOptions {
  sourceLanguage: string;
  targetLanguage: string;
}

declare class Translator {
  static availability(options: AvailabilityOptions): Promise<'no' | 'after-download' | 'readily'>;
  static create(options: TranslatorCreateOptions): Promise<Translator>;

  translate(input: string, options?: TranslateOptions): Promise<string>;
  translateStreaming(input: string, options?: TranslateOptions): ReadableStream<string>;
  destroy(): void;
}
```

## Performance Considerations

- Model download may take time on first use
- Subsequent translations are faster due to model caching
- Translations are processed sequentially per translator instance
- Create separate translator instances for concurrent translation needs
- Large texts benefit from streaming translation

## Resources

- [Chrome AI Overview](https://developer.chrome.com/docs/ai/built-in)
- [Writing Assistance APIs](https://webmachinelearning.github.io/writing-assistance-apis)
- [BCP 47 Language Codes](https://www.rfc-editor.org/info/bcp47)
- [People + AI Guidebook](https://pair.withgoogle.com/guidebook/)
- [Origin Trial Registration](https://developer.chrome.com/origintrials/#/view_trial/2003875230052335617)
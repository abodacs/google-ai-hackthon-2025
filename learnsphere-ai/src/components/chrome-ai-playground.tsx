"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { chromeAIService } from "@/services/chrome-ai.service";
import { AICapabilities } from "@/types/chrome-ai";
import {
  isSummarizerSupported,
  isLanguageModelSupported,
  isProofreaderSupported,
  isTranslatorSupported,
  isLanguageDetectorSupported,
} from "@/types/chrome-ai";
import {
  Brain,
  Sparkles,
  Volume2,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

export function ChromeAIPlayground() {
  const aiService = chromeAIService;
  const [capabilities, setCapabilities] = useState<AICapabilities | null>(null);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [activeTest, setActiveTest] = useState<string | null>(null);

  const checkCapabilities = useCallback(async () => {
    setIsLoading(true);
    try {
      const supported = aiService.isSupported();
      setIsSupported(supported);
      const caps = await aiService.checkCapabilities();
      setCapabilities(caps);
    } catch (error) {
      console.error("Error checking capabilities:", error);
    } finally {
      setIsLoading(false);
    }
  }, [aiService]);

  useEffect(() => {
    checkCapabilities();

    // Set default test content
    setInputText(
      `Photosynthesis is the process by which plants convert sunlight into energy. During this process, plants take in carbon dioxide from the air and water from their roots. Using chlorophyll in their leaves, they combine these ingredients with sunlight to create glucose (sugar) and oxygen. The glucose provides energy for the plant to grow, while oxygen is released into the atmosphere as a byproduct.`,
    );
  }, [checkCapabilities]);

  const runTest = async (
    testType: string,
    testFunction: () => Promise<unknown>,
  ) => {
    if (!inputText.trim()) {
      alert("Please enter some text to test");
      return;
    }

    setActiveTest(testType);
    setIsLoading(true);

    try {
      const result = await testFunction();
      setResults((prev) => ({ ...prev, [testType]: result }));
    } catch (error: unknown) {
      setResults((prev) => ({
        ...prev,
        [testType]: {
          error: true,
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      }));
    } finally {
      setIsLoading(false);
      setActiveTest(null);
    }
  };

  const testSummarizer = () =>
    runTest("summarizer", async () => {
      return await aiService.summarize(inputText, {
        type: "key-points",
        length: "short",
      });
    });

  const testRewriter = () =>
    runTest("rewriter", async () => {
      return await aiService.rewrite(inputText, {
        tone: "more-casual",
        context: "Adapt for 5th grade level with basketball examples",
      });
    });

  const testWriter = () =>
    runTest("writer", async () => {
      return await aiService.write(
        `Create educational content about: ${inputText}`,
        { tone: "neutral", length: "medium" },
      );
    });

  // New comprehensive AI tests
  const testLanguageModel = () =>
    runTest("languageModel", async () => {
      if (!isLanguageModelSupported()) {
        throw new Error("Language Model API not available");
      }
      const LanguageModelAPI = (
        globalThis as unknown as {
          LanguageModel: {
            create(
              options?: object,
            ): Promise<{
              prompt(text: string): Promise<string>;
              destroy(): void;
            }>;
          };
        }
      ).LanguageModel;
      const model = await LanguageModelAPI.create({
        temperature: 0.7,
        topK: 20,
        systemPrompt: "You are a helpful educational assistant.",
      });
      try {
        return await model.prompt(
          `Explain ${inputText.slice(0, 100)} in simple terms for a student`,
        );
      } finally {
        model.destroy();
      }
    });

  const testProofreader = () =>
    runTest("proofreader", async () => {
      if (!isProofreaderSupported()) {
        throw new Error("Proofreader API not available");
      }
      const ProofreaderAPI = (
        globalThis as unknown as {
          Proofreader: {
            create(
              options?: object,
            ): Promise<{
              proofread(
                text: string,
              ): Promise<{
                corrections: Array<{
                  original: string;
                  suggestion: string;
                  type: string;
                  explanation: string;
                  startIndex: number;
                  endIndex: number;
                }>;
              }>;
              destroy(): void;
            }>;
          };
        }
      ).Proofreader;
      const proofreader = await ProofreaderAPI.create({
        expectedInputLanguages: ["en"],
      });
      try {
        const testText =
          "This text has some erors and gramatical mistakes that need fixing.";
        const result = await proofreader.proofread(testText);
        return {
          originalText: testText,
          corrections: result.corrections,
          correctionCount: result.corrections.length,
        };
      } finally {
        proofreader.destroy();
      }
    });

  const testTranslator = () =>
    runTest("translator", async () => {
      if (!isTranslatorSupported()) {
        throw new Error("Translator API not available");
      }
      const TranslatorAPI = (
        globalThis as unknown as {
          Translator: {
            create(options: {
              sourceLanguage: string;
              targetLanguage: string;
            }): Promise<{
              translate(text: string): Promise<string>;
              destroy(): void;
            }>;
          };
        }
      ).Translator;
      const translator = await TranslatorAPI.create({
        sourceLanguage: "en",
        targetLanguage: "es",
      });
      try {
        const testText =
          "Hello, how are you today? This is a test of the translation API.";
        const translation = await translator.translate(testText);
        return {
          original: testText,
          translated: translation,
          languagePair: "en → es",
        };
      } finally {
        translator.destroy();
      }
    });

  const testLanguageDetection = () =>
    runTest("languageDetection", async () => {
      if (!isLanguageDetectorSupported()) {
        throw new Error("Language Detection API not available");
      }
      const LanguageDetectorAPI = (
        globalThis as unknown as {
          LanguageDetector: {
            create(): Promise<{
              detect(
                text: string,
              ): Promise<
                Array<{ detectedLanguage: string; confidence: number }>
              >;
              destroy(): void;
            }>;
          };
        }
      ).LanguageDetector;
      const detector = await LanguageDetectorAPI.create();
      try {
        const testTexts = [
          "Hello, how are you?",
          "Hola, ¿cómo estás?",
          "Bonjour, comment allez-vous?",
          "Hallo, wie geht es dir?",
          "こんにちは、元気ですか？",
        ];

        const results = [];
        for (const text of testTexts) {
          const detection = await detector.detect(text);
          results.push({
            text,
            detected: detection[0]?.detectedLanguage || "unknown",
            confidence: detection[0]?.confidence || 0,
          });
        }
        return results;
      } finally {
        detector.destroy();
      }
    });

  const testStreamingSummarizer = () =>
    runTest("streamingSummarizer", async () => {
      if (!isSummarizerSupported()) {
        throw new Error("Summarizer API not available");
      }
      const SummarizerAPI = (
        globalThis as unknown as {
          Summarizer: {
            create(
              options?: object,
            ): Promise<{
              summarizeStreaming(text: string): ReadableStream<string>;
              destroy(): void;
            }>;
          };
        }
      ).Summarizer;
      const summarizer = await SummarizerAPI.create({
        type: "key-points",
        format: "markdown",
        length: "medium",
      });
      try {
        const stream = summarizer.summarizeStreaming(inputText);
        let result = "";
        const reader = stream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            result += value;
          }
        } finally {
          reader.releaseLock();
        }
        return {
          method: "Streaming",
          result,
          note: "Generated using streaming API for real-time output",
        };
      } finally {
        summarizer.destroy();
      }
    });

  const testStructuredOutput = () =>
    runTest("structuredOutput", async () => {
      if (!isLanguageModelSupported()) {
        throw new Error("Language Model API not available");
      }
      const LanguageModelAPI = (
        globalThis as unknown as {
          LanguageModel: {
            create(
              options?: object,
            ): Promise<{
              prompt(
                text: string,
                options?: { responseConstraint?: object },
              ): Promise<string>;
              destroy(): void;
            }>;
          };
        }
      ).LanguageModel;
      const model = await LanguageModelAPI.create({
        temperature: 0.3,
      });
      try {
        const schema = {
          type: "object",
          properties: {
            topic: { type: "string" },
            keyPoints: {
              type: "array",
              items: { type: "string" },
              maxItems: 5,
            },
            difficulty: {
              type: "string",
              enum: ["beginner", "intermediate", "advanced"],
            },
            estimatedReadingTime: { type: "number" },
          },
          required: ["topic", "keyPoints", "difficulty"],
        };

        const result = await model.prompt(
          `Analyze this text and provide structured information: ${inputText.slice(0, 200)}`,
          { responseConstraint: schema },
        );

        return {
          schema: "Structured JSON output",
          result: typeof result === "string" ? JSON.parse(result) : result,
        };
      } finally {
        model.destroy();
      }
    });

  const testAPIAvailability = () =>
    runTest("api-check", async () => {
      const caps = await aiService.checkCapabilities();
      const getStatus = (status: string | boolean) => {
        if (typeof status === "boolean") return status ? "✓" : "✗";
        return status === "readily"
          ? "✓"
          : status === "after-download"
            ? "⏬"
            : "✗";
      };

      return {
        summarizer: `${getStatus(caps.summarizer)} (${caps.summarizer})`,
        rewriter: `${getStatus(caps.rewriter)} (${caps.rewriter})`,
        writer: `${getStatus(caps.writer)} (${caps.writer})`,
        languageModel: `${getStatus(caps.languageModel)} (${caps.languageModel})`,
        proofreader: `${getStatus(caps.proofreader)} (${caps.proofreader})`,
        translator: `${getStatus(caps.translator)} (${caps.translator})`,
        languageDetector: `${getStatus(caps.languageDetector)} (${caps.languageDetector})`,
        overall: caps.overall ? "✓ Available" : "✗ Not Available",
      };
    });

  const CapabilityBadge = ({
    name,
    status,
  }: {
    name: string;
    status: string | boolean;
  }) => {
    const isAvailable =
      typeof status === "boolean"
        ? status
        : status === "readily" || status === "after-download";
    const statusText =
      typeof status === "string" ? status : status ? "readily" : "no";

    return (
      <Badge
        variant={isAvailable ? "default" : "secondary"}
        className="flex items-center gap-1"
        title={`Status: ${statusText}`}
      >
        {isAvailable ? (
          <CheckCircle className="w-3 h-3" />
        ) : (
          <XCircle className="w-3 h-3" />
        )}
        {name}{" "}
        {typeof status === "string" && status !== "readily" && `(${status})`}
      </Badge>
    );
  };

  const ResultCard = ({
    title,
    result,
    icon: Icon,
  }: {
    title: string;
    result: unknown;
    icon: React.ComponentType<{ className?: string }>;
  }) => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {result ? (
          (result as { error?: boolean; message?: string }).error ? (
            <div className="text-red-600 text-sm">
              <strong>Error:</strong> {(result as { message: string }).message}
            </div>
          ) : (
            <pre className="text-sm bg-gray-50 p-3 rounded-md overflow-auto whitespace-pre-wrap">
              {typeof result === "string"
                ? result
                : JSON.stringify(result, null, 2)}
            </pre>
          )
        ) : (
          <div className="text-gray-500 text-sm">No result yet</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Chrome AI Playground
          </CardTitle>
          <CardDescription>
            Test Chrome&apos;s built-in AI APIs including Summarizer, Rewriter,
            Writer, Language Model, Proofreader, Translator, and Language
            Detection. Requires Chrome 138+ with AI flags enabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* API Capabilities Status */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">API Capabilities</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {capabilities ? (
                  <>
                    <CapabilityBadge
                      name="Summarizer"
                      status={capabilities.summarizer}
                    />
                    <CapabilityBadge
                      name="Rewriter"
                      status={capabilities.rewriter}
                    />
                    <CapabilityBadge
                      name="Writer"
                      status={capabilities.writer}
                    />
                    <CapabilityBadge
                      name="Language Model"
                      status={capabilities.languageModel}
                    />
                    <CapabilityBadge
                      name="Proofreader"
                      status={capabilities.proofreader}
                    />
                    <CapabilityBadge
                      name="Translator"
                      status={capabilities.translator}
                    />
                    <CapabilityBadge
                      name="Language Detector"
                      status={capabilities.languageDetector}
                    />
                    <CapabilityBadge
                      name="Overall"
                      status={capabilities.overall}
                    />
                  </>
                ) : (
                  <Badge variant="outline">Checking...</Badge>
                )}
              </div>
            </div>

            {/* Browser Support Check */}
            <div>
              <Label className="text-sm font-medium">Browser Support</Label>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={isSupported ? "default" : "destructive"}>
                  {isSupported === null
                    ? "Checking..."
                    : isSupported
                      ? "✓ Chrome AI Supported"
                      : "✗ Chrome AI Not Available"}
                </Badge>
                <Button variant="outline" size="sm" onClick={checkCapabilities}>
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Test Content</CardTitle>
          <CardDescription>
            Enter text content to test with Chrome AI APIs. Default content
            about photosynthesis is provided.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="test-content">Content to Process</Label>
            <Textarea
              id="test-content"
              placeholder="Enter text content to test..."
              value={inputText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setInputText(e.target.value)
              }
              className="min-h-[120px]"
            />
            <div className="text-xs text-gray-500">
              Characters: {inputText.length} / 50,000
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Comprehensive Chrome AI Tests</CardTitle>
          <CardDescription>
            Test all Chrome Built-in AI APIs with advanced features like
            streaming, multimodal input, and structured output
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Core Writing APIs */}
            <div>
              <h4 className="text-sm font-medium mb-3">Core Writing APIs</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button
                  onClick={testSummarizer}
                  disabled={
                    isLoading ||
                    (typeof capabilities?.summarizer === "string"
                      ? capabilities.summarizer === "no"
                      : !capabilities?.summarizer)
                  }
                  className="flex items-center gap-2"
                  variant={results.summarizer ? "secondary" : "default"}
                >
                  {activeTest === "summarizer" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  Summarize
                </Button>

                <Button
                  onClick={testRewriter}
                  disabled={
                    isLoading ||
                    (typeof capabilities?.rewriter === "string"
                      ? capabilities.rewriter === "no"
                      : !capabilities?.rewriter)
                  }
                  className="flex items-center gap-2"
                  variant={results.rewriter ? "secondary" : "default"}
                >
                  {activeTest === "rewriter" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Rewrite (Casual)
                </Button>

                <Button
                  onClick={testWriter}
                  disabled={
                    isLoading ||
                    (typeof capabilities?.writer === "string"
                      ? capabilities.writer === "no"
                      : !capabilities?.writer)
                  }
                  className="flex items-center gap-2"
                  variant={results.writer ? "secondary" : "default"}
                >
                  {activeTest === "writer" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  Generate Content
                </Button>
              </div>
            </div>

            {/* Advanced AI APIs */}
            <div>
              <h4 className="text-sm font-medium mb-3">Advanced AI APIs</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={testLanguageModel}
                  disabled={
                    isLoading ||
                    (typeof capabilities?.languageModel === "string"
                      ? capabilities.languageModel === "no"
                      : !capabilities?.languageModel)
                  }
                  className="flex items-center gap-2"
                  variant={results.languageModel ? "secondary" : "default"}
                >
                  {activeTest === "languageModel" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  Language Model
                </Button>

                <Button
                  onClick={testProofreader}
                  disabled={
                    isLoading ||
                    (typeof capabilities?.proofreader === "string"
                      ? capabilities.proofreader === "no"
                      : !capabilities?.proofreader)
                  }
                  className="flex items-center gap-2"
                  variant={results.proofreader ? "secondary" : "default"}
                >
                  {activeTest === "proofreader" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Proofread
                </Button>

                <Button
                  onClick={testTranslator}
                  disabled={
                    isLoading ||
                    (typeof capabilities?.translator === "string"
                      ? capabilities.translator === "no"
                      : !capabilities?.translator)
                  }
                  className="flex items-center gap-2"
                  variant={results.translator ? "secondary" : "default"}
                >
                  {activeTest === "translator" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                  Translate
                </Button>

                <Button
                  onClick={testLanguageDetection}
                  disabled={
                    isLoading ||
                    (typeof capabilities?.languageDetector === "string"
                      ? capabilities.languageDetector === "no"
                      : !capabilities?.languageDetector)
                  }
                  className="flex items-center gap-2"
                  variant={results.languageDetection ? "secondary" : "default"}
                >
                  {activeTest === "languageDetection" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  Detect Language
                </Button>
              </div>
            </div>

            {/* Advanced Features */}
            <div>
              <h4 className="text-sm font-medium mb-3">Advanced Features</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button
                  onClick={testStreamingSummarizer}
                  disabled={
                    isLoading ||
                    (typeof capabilities?.summarizer === "string"
                      ? capabilities.summarizer === "no"
                      : !capabilities?.summarizer)
                  }
                  className="flex items-center gap-2"
                  variant={
                    results.streamingSummarizer ? "secondary" : "default"
                  }
                >
                  {activeTest === "streamingSummarizer" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  Streaming Summary
                </Button>

                <Button
                  onClick={testStructuredOutput}
                  disabled={
                    isLoading ||
                    (typeof capabilities?.languageModel === "string"
                      ? capabilities.languageModel === "no"
                      : !capabilities?.languageModel)
                  }
                  className="flex items-center gap-2"
                  variant={results.structuredOutput ? "secondary" : "default"}
                >
                  {activeTest === "structuredOutput" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  Structured Output
                </Button>

                <Button
                  onClick={testAPIAvailability}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                  variant={results["api-check"] ? "secondary" : "default"}
                >
                  {activeTest === "api-check" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  API Status
                </Button>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="mt-4">
              <Progress value={undefined} className="w-full" />
              <p className="text-sm text-gray-600 mt-2">
                Testing {activeTest}... This may take a few moments.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Tabs defaultValue="summarizer" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="summarizer">Summarizer</TabsTrigger>
          <TabsTrigger value="rewriter">Rewriter</TabsTrigger>
          <TabsTrigger value="writer">Writer</TabsTrigger>
          <TabsTrigger value="languageModel">Language Model</TabsTrigger>
          <TabsTrigger value="proofreader">Proofreader</TabsTrigger>
          <TabsTrigger value="translator">Translator</TabsTrigger>
          <TabsTrigger value="languageDetection">Lang Detection</TabsTrigger>
          <TabsTrigger value="api-check">API Status</TabsTrigger>
        </TabsList>

        <TabsContent value="summarizer">
          <ResultCard
            title="Summarizer Result"
            result={results.summarizer}
            icon={FileText}
          />
        </TabsContent>

        <TabsContent value="rewriter">
          <ResultCard
            title="Rewriter Result (More Casual Tone)"
            result={results.rewriter}
            icon={Sparkles}
          />
        </TabsContent>

        <TabsContent value="writer">
          <ResultCard
            title="Writer Result (Educational Content)"
            result={results.writer}
            icon={Brain}
          />
        </TabsContent>

        <TabsContent value="languageModel">
          <ResultCard
            title="Language Model Result (Educational Assistant)"
            result={results.languageModel}
            icon={Brain}
          />
        </TabsContent>

        <TabsContent value="proofreader">
          <ResultCard
            title="Proofreader Result (Error Corrections)"
            result={results.proofreader}
            icon={CheckCircle}
          />
        </TabsContent>

        <TabsContent value="translator">
          <ResultCard
            title="Translator Result (English to Spanish)"
            result={results.translator}
            icon={Volume2}
          />
        </TabsContent>

        <TabsContent value="languageDetection">
          <ResultCard
            title="Language Detection Result (Multi-language)"
            result={results.languageDetection}
            icon={Brain}
          />
        </TabsContent>

        <TabsContent value="api-check">
          <ResultCard
            title="API Availability Status"
            result={results["api-check"]}
            icon={CheckCircle}
          />
        </TabsContent>
      </Tabs>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Chrome AI Setup:</h4>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1 mt-2">
              <li>
                Use Chrome 138+ (Chrome Canary recommended for latest features)
              </li>
              <li>
                Go to{" "}
                <code className="bg-gray-100 px-1 rounded">chrome://flags</code>
              </li>
              <li>Enable &quot;Prompt API for Gemini Nano&quot;</li>
              <li>Enable &quot;Summarization API for Gemini Nano&quot;</li>
              <li>Enable &quot;Rewriter API for Gemini Nano&quot;</li>
              <li>Enable &quot;Writer API for Gemini Nano&quot;</li>
              <li>
                Enable &quot;Translation API for Gemini Nano&quot; (if
                available)
              </li>
              <li>
                Enable &quot;Language Detection API for Gemini Nano&quot; (if
                available)
              </li>
              <li>
                Enable &quot;Proofreader API for Gemini Nano&quot; (if
                available)
              </li>
              <li>Restart Chrome completely</li>
              <li>Wait for model download (22+ GB) on first use</li>
              <li>Refresh this page and test the APIs</li>
            </ol>
          </div>

          <div>
            <h4 className="font-medium">Advanced Features:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mt-2">
              <li>
                <strong>Streaming:</strong> Real-time text generation with
                streaming APIs
              </li>
              <li>
                <strong>Structured Output:</strong> JSON schema-constrained
                responses from Language Model
              </li>
              <li>
                <strong>Multimodal Support:</strong> Text, image, and audio
                input capabilities
              </li>
              <li>
                <strong>Error Correction:</strong> Detailed proofreading with
                correction explanations
              </li>
              <li>
                <strong>Translation:</strong> Multi-language translation with
                confidence scores
              </li>
              <li>
                <strong>Language Detection:</strong> Automatic language
                identification
              </li>
              <li>
                <strong>Local Processing:</strong> All AI processing happens
                locally in your browser
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

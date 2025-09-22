/**
 * Chrome AI Service
 * Comprehensive service for all Chrome Built-in AI APIs
 * Supports: Summarizer, Rewriter, Writer, Language Model, Proofreader, Translator, Language Detection
 */

import {
  AICapabilities,
  AvailabilityStatus,
  Summarizer,
  Rewriter,
  Writer,
  AIServiceError,
  AIErrorCode,
  isSummarizerSupported,
  isRewriterSupported,
  isWriterSupported,
  isLanguageModelSupported,
  isProofreaderSupported,
  isTranslatorSupported,
  isLanguageDetectorSupported,
  isChromeAISupported,
} from "@/features/ai-playground/types/chrome-ai";

export class ChromeAIService {
  /**
   * Check if Chrome AI APIs are supported
   */
  public isSupported(): boolean {
    return typeof window !== "undefined" && isChromeAISupported();
  }

  /**
   * Check if specific Chrome AI APIs are supported
   */
  public getAPISupport() {
    return {
      summarizer: isSummarizerSupported(),
      rewriter: isRewriterSupported(),
      writer: isWriterSupported(),
      languageModel: isLanguageModelSupported(),
      proofreader: isProofreaderSupported(),
      translator: isTranslatorSupported(),
      languageDetector: isLanguageDetectorSupported(),
    };
  }

  /**
   * Check capabilities of all Chrome AI APIs
   */
  public async checkCapabilities(): Promise<AICapabilities> {
    const support = this.getAPISupport();

    if (!Object.values(support).some(Boolean)) {
      return {
        summarizer: "no",
        rewriter: "no",
        writer: "no",
        languageModel: "no",
        translator: "no",
        languageDetector: "no",
        proofreader: "no",
        overall: false,
      };
    }

    try {
      const checks = await Promise.allSettled([
        support.summarizer
          ? (
              globalThis as unknown as {
                Summarizer: { availability(): Promise<AvailabilityStatus> };
              }
            ).Summarizer?.availability?.()
          : Promise.resolve("no" as AvailabilityStatus),
        support.rewriter
          ? (
              globalThis as unknown as {
                Rewriter: { availability(): Promise<AvailabilityStatus> };
              }
            ).Rewriter?.availability?.()
          : Promise.resolve("no" as AvailabilityStatus),
        support.writer
          ? (
              globalThis as unknown as {
                Writer: { availability(): Promise<AvailabilityStatus> };
              }
            ).Writer?.availability?.()
          : Promise.resolve("no" as AvailabilityStatus),
        support.languageModel
          ? (
              globalThis as unknown as {
                LanguageModel: { availability(): Promise<AvailabilityStatus> };
              }
            ).LanguageModel?.availability?.()
          : Promise.resolve("no" as AvailabilityStatus),
        support.proofreader
          ? (
              globalThis as unknown as {
                Proofreader: { availability(): Promise<AvailabilityStatus> };
              }
            ).Proofreader?.availability?.()
          : Promise.resolve("no" as AvailabilityStatus),
        support.translator
          ? (
              globalThis as unknown as {
                Translator: {
                  availability(options: {
                    sourceLanguage: string;
                    targetLanguage: string;
                  }): Promise<AvailabilityStatus>;
                };
              }
            ).Translator?.availability?.({
              sourceLanguage: "en",
              targetLanguage: "es",
            })
          : Promise.resolve("no" as AvailabilityStatus),
        support.languageDetector
          ? (
              globalThis as unknown as {
                LanguageDetector: {
                  availability(): Promise<AvailabilityStatus>;
                };
              }
            ).LanguageDetector?.availability?.()
          : Promise.resolve("no" as AvailabilityStatus),
      ]);

      const getResult = (index: number): AvailabilityStatus => {
        const result = checks[index];
        return result.status === "fulfilled" ? result.value : "no";
      };

      const capabilities: AICapabilities = {
        summarizer: getResult(0),
        rewriter: getResult(1),
        writer: getResult(2),
        languageModel: getResult(3),
        proofreader: getResult(4),
        translator: getResult(5),
        languageDetector: getResult(6),
        overall: false,
      };

      capabilities.overall = Object.values(capabilities).some(
        (status) => status === "readily" || status === "after-download",
      );

      return capabilities;
    } catch (error) {
      console.error("Error checking capabilities:", error);
      return {
        summarizer: "no",
        rewriter: "no",
        writer: "no",
        languageModel: "no",
        translator: "no",
        languageDetector: "no",
        proofreader: "no",
        overall: false,
      };
    }
  }

  /**
   * Create a summarizer instance
   */
  public async createSummarizer(options?: {
    type?: "key-points" | "tldr" | "teaser" | "headline";
    format?: "markdown" | "plain-text";
    length?: "short" | "medium" | "long";
    sharedContext?: string;
  }): Promise<Summarizer> {
    if (!isSummarizerSupported()) {
      throw new Error("Summarizer API not available");
    }

    try {
      const SummarizerAPI = (
        globalThis as unknown as {
          Summarizer: {
            availability(): Promise<AvailabilityStatus>;
            create(options?: object): Promise<Summarizer>;
          };
        }
      ).Summarizer;
      const availability = await SummarizerAPI.availability();
      if (availability === "no") {
        throw new Error("Summarizer is not available");
      }

      return await SummarizerAPI.create(options);
    } catch (error) {
      throw this.handleError(error, "createSummarizer");
    }
  }

  /**
   * Create a rewriter instance
   */
  public async createRewriter(options?: {
    tone?: "more-formal" | "as-is" | "more-casual";
    format?: "as-is" | "markdown" | "plain-text";
    length?: "shorter" | "as-is" | "longer";
    sharedContext?: string;
  }): Promise<Rewriter> {
    if (!isRewriterSupported()) {
      throw new Error("Rewriter API not available");
    }

    try {
      const RewriterAPI = (
        globalThis as unknown as {
          Rewriter: {
            availability(): Promise<AvailabilityStatus>;
            create(options?: object): Promise<Rewriter>;
          };
        }
      ).Rewriter;
      const availability = await RewriterAPI.availability();
      if (availability === "no") {
        throw new Error("Rewriter is not available");
      }

      return await RewriterAPI.create(options);
    } catch (error) {
      throw this.handleError(error, "createRewriter");
    }
  }

  /**
   * Create a writer instance
   */
  public async createWriter(options?: {
    tone?: "formal" | "neutral" | "casual";
    format?: "markdown" | "plain-text";
    length?: "short" | "medium" | "long";
    sharedContext?: string;
  }): Promise<Writer> {
    if (!isWriterSupported()) {
      throw new Error("Writer API not available");
    }

    try {
      const WriterAPI = (
        globalThis as unknown as {
          Writer: {
            availability(): Promise<AvailabilityStatus>;
            create(options?: object): Promise<Writer>;
          };
        }
      ).Writer;
      const availability = await WriterAPI.availability();
      if (availability === "no") {
        throw new Error("Writer is not available");
      }

      return await WriterAPI.create(options);
    } catch (error) {
      throw this.handleError(error, "createWriter");
    }
  }

  /**
   * Summarize text content
   */
  public async summarize(
    input: string,
    options?: {
      type?: "key-points" | "tldr" | "teaser" | "headline";
      format?: "markdown" | "plain-text";
      length?: "short" | "medium" | "long";
      context?: string;
    },
  ): Promise<string> {
    const summarizer = await this.createSummarizer(options);
    try {
      return await summarizer.summarize(input, { context: options?.context });
    } finally {
      summarizer.destroy();
    }
  }

  /**
   * Rewrite text content
   */
  public async rewrite(
    input: string,
    options?: {
      tone?: "more-formal" | "as-is" | "more-casual";
      format?: "as-is" | "markdown" | "plain-text";
      length?: "shorter" | "as-is" | "longer";
      context?: string;
    },
  ): Promise<string> {
    const rewriter = await this.createRewriter(options);
    try {
      return await rewriter.rewrite(input, { context: options?.context });
    } finally {
      rewriter.destroy();
    }
  }

  /**
   * Write new content
   */
  public async write(
    input: string,
    options?: {
      tone?: "formal" | "neutral" | "casual";
      format?: "markdown" | "plain-text";
      length?: "short" | "medium" | "long";
      context?: string;
    },
  ): Promise<string> {
    const writer = await this.createWriter(options);
    try {
      return await writer.write(input, { context: options?.context });
    } finally {
      writer.destroy();
    }
  }

  /**
   * Handle and normalize errors
   */
  private handleError(error: unknown, operation: string): AIServiceError {
    console.error(`Chrome AI ${operation} error:`, error);

    let errorCode: AIErrorCode = AIErrorCode.UNKNOWN_ERROR;

    if (error instanceof Error) {
      if (error.name === "NotSupportedError") {
        errorCode = AIErrorCode.API_UNAVAILABLE;
      } else if (error.name === "InvalidStateError") {
        errorCode = AIErrorCode.MODEL_NOT_READY;
      } else if (error.name === "QuotaExceededError") {
        errorCode = AIErrorCode.RATE_LIMITED;
      } else if (error.message.includes("too long")) {
        errorCode = AIErrorCode.CONTENT_TOO_LONG;
      } else if (error.name === "NetworkError") {
        errorCode = AIErrorCode.NETWORK_ERROR;
      } else {
        errorCode = AIErrorCode.PROCESSING_ERROR;
      }
    }

    return {
      code: errorCode,
      message: `Failed to ${operation}: ${error instanceof Error ? error.message : "Unknown error"}`,
      apiName: operation,
      originalError: error,
    };
  }
}

// Export a singleton instance
export const chromeAIService = new ChromeAIService();

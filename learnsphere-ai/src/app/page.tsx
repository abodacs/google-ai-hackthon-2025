'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const [content, setContent] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  const handleStartLearning = () => {
    if (content.trim().length < 50) {
      alert('Please enter at least 50 characters of text to continue.');
      return;
    }

    setIsStarting(true);
    // Store content in sessionStorage to pass to v0
    sessionStorage.setItem('learningContent', content);
    router.push('/v0');
  };

  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: 'linear-gradient(135deg, #FAF9F6 0%, #E4C87F 100%)',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <Card
          className="shadow-lg border-2 mt-8"
          style={{
            borderColor: '#D9534F',
            backgroundColor: '#FAF9F6',
          }}
        >
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image
                src="/logo.svg"
                alt="LearnSphere AI Logo"
                className="w-12 h-12"
                width={48}
                height={48}
              />
              <CardTitle
                className="text-3xl font-bold"
                style={{ color: '#414833' }}
              >
                LearnSphere AI
              </CardTitle>
            </div>
            <p
              className="text-lg"
              style={{ color: '#414833' }}
            >
              Transform any text into personalized learning experiences
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="relative">
              <div className="text-center mb-4">
                {!content && (
                  <div className="text-6xl mb-2">📝</div>
                )}
                <label
                  htmlFor="content-textarea"
                  className="block text-lg font-medium mb-4"
                  style={{ color: '#414833' }}
                >
                  Paste your text here
                </label>
              </div>

              <textarea
                id="content-textarea"
                className="w-full h-48 p-4 border-2 rounded-lg resize-none text-lg focus:ring-2 focus:border-transparent"
                style={{
                  borderColor: '#D3D3CB',
                  backgroundColor: '#FAF9F6',
                  color: '#414833',
                }}
                onFocus={(e) => {
                  e.target.style.outline = '2px solid #6A7B54';
                }}
                onBlur={(e) => {
                  e.target.style.outline = 'none';
                }}
                placeholder="Enter the text you want to learn about... (minimum 50 characters)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              <div className="flex justify-between items-center mt-3">
                <span
                  className="text-sm"
                  style={{ color: '#414833' }}
                >
                  {content.length} characters
                </span>
                {content.length > 0 && content.length < 50 && (
                  <span style={{ color: '#D9534F' }} className="text-sm">
                    Minimum 50 characters required
                  </span>
                )}
                {content.length > 50000 && (
                  <span style={{ color: '#D9534F' }} className="text-sm">
                    Content too long (max 50,000 characters)
                  </span>
                )}
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={handleStartLearning}
                disabled={content.trim().length < 50 || content.length > 50000 || isStarting}
                className="px-8 py-3 text-lg font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                style={{
                  backgroundColor: '#6A7B54',
                  color: '#FAF9F6',
                }}
              >
                {isStarting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" />
                    Starting...
                  </>
                ) : (
                  <>
                    ✨ Start Learning ✨
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm mb-4" style={{ color: '#414833' }}>
            Need to test Chrome AI APIs?
          </p>
          <Button
            variant="outline"
            onClick={() => router.push('/playground')}
            style={{
              borderColor: '#6A7B54',
              color: '#6A7B54',
            }}
          >
            Visit AI Playground
          </Button>
        </div>
      </div>
    </div>
  );
}

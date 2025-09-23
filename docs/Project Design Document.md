## LearnSphere AI: Project Design Document

**Transforming Text into Interactive, Personalized Learning Experiences**

This document outlines the project design for LearnSphere AI, a progressive web application that leverages Chrome's built-in AI APIs to convert any text-based content into a dynamic and personalized learning journey. By adapting to individual learning styles, grade levels, and interests, LearnSphere AI aims to make learning more engaging, effective, and accessible. All processing is handled client-side, ensuring user privacy and enabling offline functionality.

### 1. System Overview

LearnSphere AI will be a browser-based platform that takes user-provided text or uploaded documents and transforms them into a suite of interactive learning modules. The core of the application will utilize Chrome's integrated AI APIs, powered by Gemini Nano, for tasks such as summarization and content analysis. This on-device processing ensures that user data remains private and the application can be used without a constant internet connection.

The platform will cater to a wide range of learners, from grade 1 to the undergraduate level, by adapting the complexity of the content. Users will also be able to select from 16 predefined interests to personalize the learning materials further, making topics like physics and history more relatable and engaging.

### 2. Core Features

#### **v1: Foundational Learning Tools**

*   **Section-Adaptive Bloom's Taxonomy Quizzes:** To gauge comprehension and provide targeted feedback, LearnSphere AI will generate quizzes based on Bloom's Taxonomy. AI-powered tools like Questgen and the Quizizz AI-Toolkit can be leveraged to create questions that assess different cognitive levels, from remembering to creating. These quizzes will adapt to the learner's progress, providing personalized feedback and mnemonic aids to reinforce concepts. JavaScript libraries such as QuizLib and SurveyJS can be used to implement the quiz interface.

#### **v2: Visual Learning**

*   **Interactive Mind Maps:** To help users visualize and organize information, the platform will generate interactive mind maps from the text content. These mind maps will allow users to zoom in and out, exploring the hierarchical relationships between concepts. Several JavaScript libraries and AI-powered tools are available for this purpose, including AmyMind, MindMap AI, and DHTMLX Diagram, which can convert text into mind maps.

#### **v3: Auditory Learning**

*   **Audio Conversations with an AI Teacher:** To cater to auditory learners and provide a more interactive experience, LearnSphere AI will feature an AI-powered "teacher" with whom students can have audio conversations. This will allow students to articulate their understanding of the material and receive verbal feedback. The Web Speech API can be utilized for speech recognition and synthesis. For more advanced audio processing and communication, libraries like Howler.js and tools for real-time audio streaming can be integrated.

#### **v4: Immersive Text and Document Integration**

*   **PDF Upload and Analysis:** Users will be able to upload PDF documents for transformation into interactive learning experiences.
*   **Immersive Text with Embedded Questions:** The core text content will be augmented with dynamically generated questions embedded within the material. This transforms passive reading into an active learning process, providing immediate feedback and reinforcing concepts.
*   **Personalized Content Rewriting:** The platform will rewrite the source material to align with the learner's specific personal attributes and interests, making the content more engaging and easier to understand.
*   **Markdown Rendering:** For displaying the enriched text and embedded questions, a robust Markdown renderer is required. While `react-markdown` is a popular choice, `streamdown` presents a compelling alternative. As a drop-in replacement for `react-markdown`, `streamdown` is specifically designed to handle streaming AI responses, which aligns perfectly with the dynamic and interactive nature of LearnSphere AI. This will ensure a smooth and seamless user experience as the AI generates and embeds questions in real-time.

### 3. Learning Science Principles

The design of LearnSphere AI is grounded in key learning science principles:

*   **Inspire Active Learning:** By incorporating interactive elements like quizzes and embedded questions, the platform encourages active engagement with the material.
*   **Manage Cognitive Load:** Content is broken down into manageable chunks and presented in multiple modalities (text, visual, audio) to prevent cognitive overload.
*   **Adapt to Learner:** The platform personalizes the learning experience based on the user's grade level, interests, and performance on assessments.
*   **Stimulate Curiosity:** By making content relatable and interactive, LearnSphere AI aims to foster a sense of curiosity and a desire for deeper understanding.
*   **Deepen Metacognition:** The platform will help learners become more aware of their own learning processes by providing feedback on their understanding and encouraging them to reflect on their knowledge gaps.

### 4. Technical Architecture

LearnSphere AI will be developed as a Progressive Web App (PWA) to ensure a seamless experience across devices and enable offline functionality. The core of the application will be built using a modern JavaScript framework like React.

The client-side architecture will heavily rely on **Chrome's built-in AI APIs**. These on-device models will handle tasks like:

*   **Summarization:** The Summarizer API will be used to generate concise overviews of the text content.
*   **Language Detection:** The LanguageDetector API can be used to identify the language of the input text, a foundational step for any further processing.
*   **Content Adaptation and Question Generation (via Prompt API):** The experimental Prompt API, powered by Gemini Nano, will be explored for more complex tasks like rewriting content based on user interests and generating adaptive quiz questions.

For features not directly supported by the built-in APIs, the application will integrate third-party JavaScript libraries and, where necessary, leverage server-side processing for more intensive AI tasks while still prioritizing client-side functionality for privacy and offline use. A hybrid approach, using client-side AI for immediate feedback and server-side for more complex analysis, can be adopted.

### 5. Implementation Roadmap

The development of LearnSphere AI will follow a phased approach, starting with the foundational features and progressively adding more advanced capabilities.

*   **Version 1:** Focus on implementing the core functionality of text input, grade/interest selection, and the generation of adaptive Bloom's Taxonomy quizzes.
*   **Version 2:** Integrate the interactive mind mapping feature.
*   **Version 3:** Develop the audio conversation component with the AI teacher.
*   **Version 4:** Implement PDF upload, immersive text with embedded questions, and personalized content rewriting, utilizing an advanced markdown renderer like `streamdown`.

By following this roadmap, LearnSphere AI will evolve into a comprehensive and powerful tool for personalized learning, empowering users to engage with any text-based content in a more meaningful and effective way.
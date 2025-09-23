
### **UX/UI Design Document: LearnSphere AI**

**1. Introduction**
This document outlines the user experience (UX) and user interface (UI) design for the LearnSphere AI platform. The core objective is to create a clean, intuitive, and user-centric interface that reduces cognitive load and empowers students by providing control and flexibility over their learning journey. All design decisions are guided by the principle of transforming passive content consumption into an active, engaging, and effective educational experience.

**2. Design Philosophy & Guiding Principles**
The design is built upon a set of core principles derived from the project's vision:

*   **User-Centric & Intuitive:** The interface will be immediately understandable to its target audience (students, grade 1-undergrad). We will prioritize conventional, highly intuitive components to ensure there is no learning curve to use the tool itself.
*   **Clarity and Simplicity:** The visual design will be clean and uncluttered, utilizing a light color palette, generous whitespace, and a clear typographic hierarchy. This approach is intended to create an approachable learning environment and reduce cognitive load, allowing the user to focus on the content.
*   **User Control & Flexibility:** The "Learn Your Way" concept is central to the UX. The design must empower users to easily switch between different learning modalities (text, mind map, audio), fostering a sense of autonomy and catering to diverse learning styles.
*   **Structure & Guidance:** The layout will provide a clear information architecture. Users should always know where they are in the lesson, what they have completed, and what they need to do next. The interface will provide clear navigation and actionable feedback to guide the user forward.
*   **Seamless Integration of AI:** AI-generated elements, such as illustrations and embedded questions, must feel like a natural part of the learning experience, not a disjointed feature. They will be used to chunk content, provide context, and encourage interaction.

**3. Target Audience & Personas**
The design will be tailored to be accessible and engaging for all users, with a primary focus on making it feel modern and friendly for the K-12 segment.
*   **Primary Persona:** "Middle School Maya" (Grade 6). The design must be visually appealing and simple enough for her to use independently.
*   **Secondary Personas:** "High School Henry" & "College Chloe." The design must be sophisticated and efficient enough to be a powerful study tool for them, free of unnecessary ornamentation.

**4. Information Architecture & User Flow**

The user's journey through the application is designed to be linear and logical:

1.  **Start Screen:** User is presented with a clear call-to-action to input content.
2.  **Content Input:** User pastes text or uploads a PDF (v4). They select their grade level and interests.
3.  **Generate:** Upon clicking "Generate," the user is taken directly to the Learning Dashboard.
4.  **Learning Dashboard:**
    *   The platform defaults to the "Immersive Text" view.
    *   The user can read the content, interact with embedded questions (v4), and view AI-generated illustrations.
    *   The user can switch between learning modes using the "Learn Your Way" tabs at any time.
    *   The left-hand navigation shows their progress.
5.  **Final Assessment:** The user clicks on the "Practice Quiz" in the left navigation to begin the final assessment.
6.  **Results Screen:** The user receives immediate feedback and their score.

**5. Wireframes & Screen Layouts**

#### **Screen 5.1: Home / Content Input**
*   **Layout:** A single-column, centered layout focused on one task.
*   **Components:**
    *   **Header:** App logo (LearnSphere AI).
    *   **Content Area:** A large, prominent text area for pasting content. Below it, a clear "Or Upload PDF" button (v4).
    *   **Preference Selectors:** Simple, clean dropdown for "Grade Level" and a multi-select component for "Interests."
    *   **Primary Action:** A large, inviting button with the text "Create My Lesson."

#### **Screen 5.2: The Learning Dashboard (Core Experience)**
This screen implements the two-column layout described in the guiding principles.

*   **Left Column (Navigation & Progress Tracker):**
    *   **Width:** Fixed, occupying ~25-30% of the screen width.
    *   **Content:** A structured table of contents generated from the text (e.g., "Introduction," "Core Concept 1," "Conclusion").
    *   **Progress Indicators:** Each section has a status. Initially, they are "unread." As the user scrolls past a section, it gets a checkmark. The final item is "Practice Quiz" with a status like "Take quiz to complete." This provides clear, actionable feedback.

*   **Right Column (Main Content View):**
    *   **Width:** Flexible, occupying the remaining ~70-75% of the screen.
    *   **Header: "Learn Your Way" Tabs:** A prominent set of tabs at the top of this column.
        *   **v1:** "Immersive Text", "Practice Quiz"
        *   **v2 adds:** "Mindmap"
        *   **v3 adds:** "Audio Lesson"
        *   The active tab is visually distinct (e.g., underlined, different background color).
    *   **Content Canvas:** The area below the tabs displays the content for the selected mode.
        *   **Immersive Text (Default):** Displays the formatted text. AI-generated illustrations are integrated between paragraphs. Embedded questions (v4) appear inline with a slightly different background to distinguish them.
        *   **Mindmap View (v2):** The canvas displays the interactive mind map, with controls for zoom and pan.
        *   **Audio Lesson View (v3):** Displays simple controls: a profile icon for the AI teacher, a text area showing the current question, and a prominent "Record Your Answer" button with a microphone icon.

#### **Screen 5.3: Practice Quiz View**
*   **Layout:** A focused, single-column view to minimize distractions. The left-hand navigation is still visible to keep the user oriented.
*   **Components:**
    *   **Progress Bar:** At the top (e.g., "Question 2/5").
    *   **Question Stem:** Clearly displayed question text.
    *   **Answer Options:** Standard radio buttons for multiple-choice answers. Ample spacing for easy clicking/tapping.
    *   **Feedback:** Upon submission, the selected answer is immediately highlighted green (correct) or red (incorrect), with the correct answer also highlighted. A small text box appears below with a brief explanation.

**6. Key UI Components**

*   **Buttons:** Rounded corners. A primary, solid-fill style for main CTAs ("Create My Lesson," "Submit Answer") and a secondary, outline style for other actions.
*   **Tabs ("Learn Your Way"):** Clear, text-based tabs. The active tab has a bold font and a colored accent underline.
*   **Interactive Elements:**
    *   **Embedded Questions:** Appear as a distinct block within the text. Use standard radio buttons or a text input field.
    *   **Mind Map Nodes:** Clean, rounded rectangles connected by smooth lines. Text is legible even when zoomed out.
*   **Forms:** All form inputs (dropdowns, radio buttons) will be clean, modern, and have high contrast for accessibility.


**7. Visual Design System**

*   **Color Palette:**
    The color palette is designed around a central olive green to create a calm, earthy, and focused atmosphere. The supporting colors are chosen to be warm and natural, ensuring high readability and a welcoming user experience.

    *   **Primary Action (Olive):** `#6A7B54`
        *   **Usage:** Used for primary buttons ("Create My Lesson," "Submit Answer"), active tabs, and key calls-to-action. This color is calming yet distinct enough to guide the user.
    *   **Background (Soft Off-White):** `#FAF9F6`
        *   **Usage:** Used as the main background for content areas. This warm off-white is softer on the eyes than stark white and complements the olive green, creating a more cohesive and gentle aesthetic.
    *   **Text (Charcoal Slate):** `#414833`
        *   **Usage:** The primary color for all body text and headings. This very dark, warm gray with a hint of green is less harsh than pure black and harmonizes beautifully with the overall palette.
    *   **Accent - Success (Leaf Green):** `#5CB85C`
        *   **Usage:** For success messages, checkmarks, and indicating correct answers. It's a clear, positive green that is visually distinct from the primary olive.
    *   **Accent - Error (Terracotta Red):** `#D9534F`
        *   **Usage:** For error messages and indicating incorrect answers. This muted, warm red is less jarring than a bright primary red and fits well within the earthy color scheme.
    *   **Accent - Highlight (Warm Sand):** `#E4C87F`
        *   **Usage:** For highlighting important notes, AI-generated insights, or secondary interactive elements. This warm, golden color provides a gentle highlight without creating visual clutter.
    *   **Borders & Dividers (Light Taupe):** `#D3D3CB`
        *   **Usage:** For subtle borders around input fields, cards, and section dividers.

*   **Typography:**
    *   **Headings:** A modern, rounded sans-serif font like **Poppins** or **Nunito** to feel friendly and engaging. The Charcoal Slate color will be used.
    *   **Body Text:** A highly readable sans-serif font like **Inter** or **Lato** for clarity in long-form text. The Charcoal Slate color will be used.
    *   **Hierarchy:** Clear size and weight distinctions between H1, H2, body text, and helper text to guide the user's eye and structure the information effectively.

*   **Iconography:**
    *   A consistent set of simple, line-art icons (e.g., for navigation arrows, microphone, zoom controls). Icons will use the **Charcoal Slate (`#414833`)** color by default, with the **Primary Olive (`#6A7B54`)** used for active or hover states.

**8. Accessibility (WCAG 2.1 AA Compliance)**
*   **Color Contrast:** All text and UI elements will meet a minimum 4.5:1 contrast ratio.
*   **Keyboard Navigation:** All interactive elements (buttons, links, form fields, tabs) will be fully navigable and operable using only a keyboard.
*   **Screen Reader Support:** The application will use semantic HTML. All images and AI-generated illustrations will have descriptive alt text.
*   **Focus States:** Clear and visible focus states will be designed for all interactive elements.
# Screen 01: Landing - Text Input

**Screen Type**: Landing/Home Screen
**User Flow Stage**: Initial content input (MLP: Text-only)
**Purpose**: Entry point for text transformation experience

## Visual Description

### Layout & Design
- **Background**: Clean, minimalist design with a soft gradient background transitioning from light pink/beige at the top to darker tones at the bottom
- **Main Container**: Large rounded rectangle with a subtle orange/coral border taking up most of the screen space
- **Color Scheme**: Warm, welcoming colors with soft pastels

### Key UI Elements

#### Text Input Area (MLP Update)
- **Text Area**: Large rounded rectangle with soft border in center of screen
- **Purpose**: Direct text input - no file upload for MLP phase
- **Visual Cues**: Clear placeholder text "Paste your text here" with text icon
- **Design**: Clean, accessible textarea that scales with content

#### Text Input Icon
- **Icon**: Simple text/document icon (📝) centered in empty textarea
- **Purpose**: Visual cue for text input, no upload functionality in MLP
- **Meaning**: Indicates text-based content input only

#### Call-to-Action Button
- **Button**: "Start learning" button with sparkle/star icons
- **Position**: Bottom center of the main container
- **Style**: Rounded gray button with white text
- **Visual Enhancement**: Decorative sparkle icons flanking the text to suggest magic/transformation


## Functional Analysis

### User Intent
This screen is the **initial landing screen** where users begin their learning journey by:
1. **Text Input**: Pasting educational content directly into the text area (MLP: no file uploads)
2. **Action Initiation**: Using the "Start learning" button to begin Chrome AI transformation workflow

### UX Flow Position
- **Stage**: Entry point of the application
- **Previous**: None (landing page)
- **Next**: Likely transitions to grade level and interest selection

### Accessibility Features
- **High Contrast**: Clear visual hierarchy with distinct elements
- **Large Target Areas**: Generous click/touch targets for the upload zone and button
- **Clear Iconography**: Intuitive document and plus icons

## Technical Implementation Notes

### Components Implied
```typescript
// Primary components for MLP text-only version
- TextInputArea (large textarea with placeholder)
- TextInputIcon (📝 icon for visual cue)
- PrimaryButton ("Start learning" with sparkles)
- PageContainer (main layout wrapper with gradient background)
```

### Interaction States
- **Default State**: Empty textarea with placeholder text and icon
- **Focus State**: Textarea highlights when clicked, placeholder text disappears
- **Filled State**: Text content visible, "Start learning" button becomes active
- **Loading State**: Button shows processing state after click (Chrome AI transformation)

### Responsive Design
- **Layout**: Centered design that would scale well across devices
- **Breakpoints**: Single-column layout suitable for mobile, tablet, and desktop

## User Experience Considerations

### Onboarding
- **Simplicity**: Very clean, non-intimidating interface for first-time users
- **Clear Action**: Single primary action ("Start learning") reduces cognitive load
- **Visual Feedback**: Upload zone provides clear affordance for file dropping

### User Psychology
- **Trust**: Warm, friendly colors create a welcoming atmosphere
- **Confidence**: Simple interface suggests ease of use
- **Expectation**: Sparkle icons hint at magical/transformative experience ahead

## Alignment with Specifications

### Requirements Fulfilled
- **FR-001**: Supports content input (upload area visible)
- **UI Consistency**: Matches design system with rounded corners and warm colors
- **Accessibility**: Clear visual hierarchy and large interactive elements

### Next Steps in Flow
Based on specifications, this screen would lead to:
1. Content processing/validation
2. Grade level selection (1-12, undergrad)
3. Interest selection (from 16 predefined categories)
4. Learning materials generation

## Notes for Implementation (MLP Text-Only)
- Large, accessible textarea with proper ARIA labeling
- content validation
- Chrome AI availability detection and graceful degradation
- Error handling for empty content or Chrome AI unavailability
- Responsive textarea sizing for mobile optimization
- Smooth transition to transformation/processing screen
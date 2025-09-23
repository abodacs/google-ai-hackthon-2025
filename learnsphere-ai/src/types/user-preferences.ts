/**
 * User Preferences Types
 * Interfaces and enums for user learning preferences
 */

export enum GradeLevel {
  GRADE_1 = '1',
  GRADE_2 = '2',
  GRADE_3 = '3',
  GRADE_4 = '4',
  GRADE_5 = '5',
  GRADE_6 = '6',
  GRADE_7 = '7',
  GRADE_8 = '8',
  GRADE_9 = '9',
  GRADE_10 = '10',
  GRADE_11 = '11',
  GRADE_12 = '12',
  UNDERGRAD = 'undergrad'
}

export enum Interest {
  READING = 'reading',
  SCIENCE = 'science',
  ART = 'art',
  WRITING = 'writing',
  PHOTOGRAPHY = 'photography',
  NATURE = 'nature',
  SOCCER = 'soccer',
  CYCLING = 'cycling',
  COOKING = 'cooking',
  GAMING = 'gaming',
  BASKETBALL = 'basketball',
  FOOTBALL = 'football',
  TABLE_TENNIS = 'table_tennis',
  TENNIS = 'tennis',
  TECHNOLOGY = 'technology',
  SKATEBOARDING = 'skateboarding'
}
export const PROMPT = `
Personalize this chapter on Newton's laws for a basketball fan.
Include examples like dribbling and shooting.
Generate: 
1) A mind map summary,
2) An audio-style script with teacher-student dialogue, 
3) An interactive quiz that adapts to wrong answers. 
Ensure accuracy and use real psychopedagogy principles."
`;

export enum LearningStyle {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic',
  READING = 'reading'
}

export interface UserPreferences {
  gradeLevel: GradeLevel;
  interest: Interest;
  learningStyle?: LearningStyle[];
  language?: string;
}

export interface PreferencesMetadata {
  lastUpdated: Date;
  version: string;
  isDefault: boolean;
  source: 'user_selection' | 'auto_detected' | 'default';
}

export interface PreferencesWithMetadata {
  preferences: UserPreferences;
  metadata: PreferencesMetadata;
}

export interface GradeLevelInfo {
  grade: GradeLevel;
  displayName: string;
  description: string;
  ageRange: string;
  complexity: 'elementary' | 'middle' | 'high' | 'college';
  order: number;
}

export interface InterestInfo {
  interest: Interest;
  displayName: string;
  description: string;
  category: 'academic' | 'sports' | 'creative' | 'technology' | 'lifestyle';
  analogyExamples: string[];
}

export interface LearningStyleInfo {
  style: LearningStyle;
  displayName: string;
  description: string;
  characteristics: string[];
  recommendedFeatures: string[];
}

export const GRADE_LEVEL_INFO: Record<GradeLevel, GradeLevelInfo> = {
  [GradeLevel.GRADE_1]: {
    grade: GradeLevel.GRADE_1,
    displayName: 'Grade 1',
    description: 'First grade level with simple vocabulary',
    ageRange: '6-7 years',
    complexity: 'elementary',
    order: 1
  },
  [GradeLevel.GRADE_2]: {
    grade: GradeLevel.GRADE_2,
    displayName: 'Grade 2',
    description: 'Second grade level with basic concepts',
    ageRange: '7-8 years',
    complexity: 'elementary',
    order: 2
  },
  [GradeLevel.GRADE_3]: {
    grade: GradeLevel.GRADE_3,
    displayName: 'Grade 3',
    description: 'Third grade level with expanding vocabulary',
    ageRange: '8-9 years',
    complexity: 'elementary',
    order: 3
  },
  [GradeLevel.GRADE_4]: {
    grade: GradeLevel.GRADE_4,
    displayName: 'Grade 4',
    description: 'Fourth grade level with more complex ideas',
    ageRange: '9-10 years',
    complexity: 'elementary',
    order: 4
  },
  [GradeLevel.GRADE_5]: {
    grade: GradeLevel.GRADE_5,
    displayName: 'Grade 5',
    description: 'Fifth grade level with intermediate concepts',
    ageRange: '10-11 years',
    complexity: 'elementary',
    order: 5
  },
  [GradeLevel.GRADE_6]: {
    grade: GradeLevel.GRADE_6,
    displayName: 'Grade 6',
    description: 'Sixth grade level transitioning to middle school',
    ageRange: '11-12 years',
    complexity: 'middle',
    order: 6
  },
  [GradeLevel.GRADE_7]: {
    grade: GradeLevel.GRADE_7,
    displayName: 'Grade 7',
    description: 'Seventh grade level with abstract thinking',
    ageRange: '12-13 years',
    complexity: 'middle',
    order: 7
  },
  [GradeLevel.GRADE_8]: {
    grade: GradeLevel.GRADE_8,
    displayName: 'Grade 8',
    description: 'Eighth grade level preparing for high school',
    ageRange: '13-14 years',
    complexity: 'middle',
    order: 8
  },
  [GradeLevel.GRADE_9]: {
    grade: GradeLevel.GRADE_9,
    displayName: 'Grade 9',
    description: 'Freshman level with complex analysis',
    ageRange: '14-15 years',
    complexity: 'high',
    order: 9
  },
  [GradeLevel.GRADE_10]: {
    grade: GradeLevel.GRADE_10,
    displayName: 'Grade 10',
    description: 'Sophomore level with advanced concepts',
    ageRange: '15-16 years',
    complexity: 'high',
    order: 10
  },
  [GradeLevel.GRADE_11]: {
    grade: GradeLevel.GRADE_11,
    displayName: 'Grade 11',
    description: 'Junior level with specialized knowledge',
    ageRange: '16-17 years',
    complexity: 'high',
    order: 11
  },
  [GradeLevel.GRADE_12]: {
    grade: GradeLevel.GRADE_12,
    displayName: 'Grade 12',
    description: 'Senior level preparing for college',
    ageRange: '17-18 years',
    complexity: 'high',
    order: 12
  },
  [GradeLevel.UNDERGRAD]: {
    grade: GradeLevel.UNDERGRAD,
    displayName: 'Undergraduate',
    description: 'College level with academic depth',
    ageRange: '18+ years',
    complexity: 'college',
    order: 13
  }
};

export const INTEREST_INFO: Record<Interest, InterestInfo> = {
  [Interest.READING]: {
    interest: Interest.READING,
    displayName: 'Reading',
    description: 'Books, literature, and storytelling',
    category: 'academic',
    analogyExamples: ['like chapters in a book', 'similar to plot development', 'as in a story narrative']
  },
  [Interest.SCIENCE]: {
    interest: Interest.SCIENCE,
    displayName: 'Science',
    description: 'Scientific discovery and experimentation',
    category: 'academic',
    analogyExamples: ['like a scientific experiment', 'similar to laboratory research', 'as in hypothesis testing']
  },
  [Interest.ART]: {
    interest: Interest.ART,
    displayName: 'Art',
    description: 'Visual arts, creativity, and design',
    category: 'creative',
    analogyExamples: ['like painting a masterpiece', 'similar to artistic composition', 'as in creative expression']
  },
  [Interest.WRITING]: {
    interest: Interest.WRITING,
    displayName: 'Writing',
    description: 'Creative writing and communication',
    category: 'creative',
    analogyExamples: ['like writing a story', 'similar to crafting sentences', 'as in editing a draft']
  },
  [Interest.PHOTOGRAPHY]: {
    interest: Interest.PHOTOGRAPHY,
    displayName: 'Photography',
    description: 'Capturing moments and visual storytelling',
    category: 'creative',
    analogyExamples: ['like framing a perfect shot', 'similar to adjusting camera settings', 'as in capturing the moment']
  },
  [Interest.NATURE]: {
    interest: Interest.NATURE,
    displayName: 'Nature',
    description: 'Outdoor exploration and environmental awareness',
    category: 'lifestyle',
    analogyExamples: ['like exploring a forest', 'similar to observing wildlife', 'as in ecosystem balance']
  },
  [Interest.SOCCER]: {
    interest: Interest.SOCCER,
    displayName: 'Soccer',
    description: 'Football/soccer strategy and teamwork',
    category: 'sports',
    analogyExamples: ['like scoring a goal', 'similar to team coordination', 'as in strategic positioning']
  },
  [Interest.CYCLING]: {
    interest: Interest.CYCLING,
    displayName: 'Cycling',
    description: 'Bicycle riding and endurance sports',
    category: 'sports',
    analogyExamples: ['like pedaling uphill', 'similar to maintaining momentum', 'as in finding the right gear']
  },
  [Interest.COOKING]: {
    interest: Interest.COOKING,
    displayName: 'Cooking',
    description: 'Culinary arts and food preparation',
    category: 'lifestyle',
    analogyExamples: ['like following a recipe', 'similar to mixing ingredients', 'as in timing the cooking process']
  },
  [Interest.GAMING]: {
    interest: Interest.GAMING,
    displayName: 'Gaming',
    description: 'Video games and interactive entertainment',
    category: 'technology',
    analogyExamples: ['like leveling up a character', 'similar to completing a quest', 'as in strategic gameplay']
  },
  [Interest.BASKETBALL]: {
    interest: Interest.BASKETBALL,
    displayName: 'Basketball',
    description: 'Basketball strategy and teamwork',
    category: 'sports',
    analogyExamples: ['like shooting a three-pointer', 'similar to team plays', 'as in defensive strategy']
  },
  [Interest.FOOTBALL]: {
    interest: Interest.FOOTBALL,
    displayName: 'Football',
    description: 'American football strategy and tactics',
    category: 'sports',
    analogyExamples: ['like executing a play', 'similar to quarterback strategy', 'as in touchdown celebration']
  },
  [Interest.TABLE_TENNIS]: {
    interest: Interest.TABLE_TENNIS,
    displayName: 'Table Tennis',
    description: 'Ping pong skill and precision',
    category: 'sports',
    analogyExamples: ['like a perfect serve', 'similar to quick reflexes', 'as in precise paddle control']
  },
  [Interest.TENNIS]: {
    interest: Interest.TENNIS,
    displayName: 'Tennis',
    description: 'Tennis technique and competition',
    category: 'sports',
    analogyExamples: ['like an ace serve', 'similar to baseline strategy', 'as in match point pressure']
  },
  [Interest.TECHNOLOGY]: {
    interest: Interest.TECHNOLOGY,
    displayName: 'Technology',
    description: 'Digital innovation and computing',
    category: 'technology',
    analogyExamples: ['like programming code', 'similar to software algorithms', 'as in system optimization']
  },
  [Interest.SKATEBOARDING]: {
    interest: Interest.SKATEBOARDING,
    displayName: 'Skateboarding',
    description: 'Skateboarding tricks and culture',
    category: 'sports',
    analogyExamples: ['like landing a trick', 'similar to finding balance', 'as in mastering the board']
  }
};

export const LEARNING_STYLE_INFO: Record<LearningStyle, LearningStyleInfo> = {
  [LearningStyle.VISUAL]: {
    style: LearningStyle.VISUAL,
    displayName: 'Visual',
    description: 'Learning through seeing and visualizing',
    characteristics: ['Prefers diagrams and charts', 'Learns from images and videos', 'Benefits from color coding'],
    recommendedFeatures: ['Mind maps', 'Infographics', 'Visual summaries', 'Charts and diagrams']
  },
  [LearningStyle.AUDITORY]: {
    style: LearningStyle.AUDITORY,
    displayName: 'Auditory',
    description: 'Learning through hearing and listening',
    characteristics: ['Prefers spoken explanations', 'Benefits from discussions', 'Remembers through repetition'],
    recommendedFeatures: ['Audio lessons', 'Narrated content', 'Discussion prompts', 'Verbal summaries']
  },
  [LearningStyle.KINESTHETIC]: {
    style: LearningStyle.KINESTHETIC,
    displayName: 'Kinesthetic',
    description: 'Learning through hands-on activities',
    characteristics: ['Prefers active participation', 'Learns by doing', 'Benefits from movement'],
    recommendedFeatures: ['Interactive exercises', 'Simulations', 'Practice activities', 'Real-world examples']
  },
  [LearningStyle.READING]: {
    style: LearningStyle.READING,
    displayName: 'Reading/Writing',
    description: 'Learning through text and written materials',
    characteristics: ['Prefers written information', 'Learns through note-taking', 'Benefits from text-based content'],
    recommendedFeatures: ['Text summaries', 'Written exercises', 'Note templates', 'Reading materials']
  }
};
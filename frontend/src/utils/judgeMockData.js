// Mock data for judge dashboard
export const mockJudgeProfile = {
  id: 1,
  name: "Dr. Sarah Chen",
  email: "sarah.chen@techuniversity.edu",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  expertise: ["Artificial Intelligence", "Machine Learning", "Computer Vision"],
  experience: "15+ years in AI research and industry",
  organization: "Tech University",
  position: "Professor of Computer Science",
  totalReviews: 127,
  averageScore: 4.2,
  reviewAccuracy: 95.8,
  assignedEvents: [1, 2, 4], // Event IDs
  isActive: true,
  lastActive: "2024-03-01T16:30:00Z"
};

export const mockScoringCriteria = [
  {
    id: 1,
    name: "Innovation & Creativity",
    description: "Originality and creative approach to solving the problem",
    weight: 25,
    maxScore: 10,
    category: "Innovation"
  },
  {
    id: 2,
    name: "Technical Quality",
    description: "Code quality, architecture, and technical implementation",
    weight: 30,
    maxScore: 10,
    category: "Technical"
  },
  {
    id: 3,
    name: "User Experience",
    description: "Usability, design, and user interface quality",
    weight: 20,
    maxScore: 10,
    category: "Design"
  },
  {
    id: 4,
    name: "Feasibility & Scalability",
    description: "Practical implementation and potential for growth",
    weight: 15,
    maxScore: 10,
    category: "Business"
  },
  {
    id: 5,
    name: "Presentation & Documentation",
    description: "Clarity of presentation and quality of documentation",
    weight: 10,
    maxScore: 10,
    category: "Communication"
  }
];

export const mockJudgeAssignments = [
  {
    id: 1,
    eventId: 1,
    eventTitle: "AI Innovation Challenge 2024",
    eventStatus: "active",
    submissionDeadline: "2024-03-17T18:00:00Z",
    judgingDeadline: "2024-03-20T18:00:00Z",
    totalSubmissions: 45,
    assignedSubmissions: 15,
    completedReviews: 8,
    pendingReviews: 7,
    averageScore: 4.3,
    isUrgent: false
  },
  {
    id: 2,
    eventId: 2,
    eventTitle: "Web3 & Blockchain Hackathon",
    eventStatus: "upcoming",
    submissionDeadline: "2024-04-07T18:00:00Z",
    judgingDeadline: "2024-04-10T18:00:00Z",
    totalSubmissions: 0,
    assignedSubmissions: 0,
    completedReviews: 0,
    pendingReviews: 0,
    averageScore: 0,
    isUrgent: false
  },
  {
    id: 3,
    eventId: 4,
    eventTitle: "Sustainability Tech Challenge",
    eventStatus: "upcoming",
    submissionDeadline: "2024-05-12T18:00:00Z",
    judgingDeadline: "2024-05-15T18:00:00Z",
    totalSubmissions: 0,
    assignedSubmissions: 0,
    completedReviews: 0,
    pendingReviews: 0,
    averageScore: 0,
    isUrgent: false
  }
];

export const mockAssignedSubmissions = [
  {
    id: 1,
    eventId: 1,
    eventTitle: "AI Innovation Challenge 2024",
    projectTitle: "AI-Powered Code Review Assistant",
    teamName: "Quantum Coders",
    teamMembers: ["Alex Johnson", "Sarah Chen", "Mike Rodriguez"],
    submissionDate: "2024-03-16T15:30:00Z",
    reviewStatus: "assigned", // assigned, in_progress, completed, flagged
    priority: "high", // low, medium, high, urgent
    deadline: "2024-03-20T18:00:00Z",
    timeSpent: 0, // minutes
    isUrgent: true,
    isApproachingDeadline: true,
    
    // Project Details
    description: "An intelligent code review tool that uses machine learning to analyze code quality, identify potential bugs, and suggest improvements.",
    githubUrl: "https://github.com/quantumcoders/ai-code-review",
    demoUrl: "https://ai-code-review-demo.vercel.app",
    videoUrl: "https://youtube.com/watch?v=example1",
    technologies: ["Python", "TensorFlow", "React", "Node.js", "PostgreSQL"],
    
    // Files
    files: [
      { name: "presentation.pdf", url: "#", size: "2.5 MB", type: "presentation" },
      { name: "documentation.pdf", url: "#", size: "1.8 MB", type: "documentation" },
      { name: "demo_video.mp4", url: "#", size: "15.2 MB", type: "video" }
    ],
    
    // Review Data
    scores: null,
    feedback: null,
    submittedAt: null,
    lastUpdated: null
  },
  {
    id: 2,
    eventId: 1,
    eventTitle: "AI Innovation Challenge 2024",
    projectTitle: "Smart Healthcare Monitoring System",
    teamName: "HealthTech Innovators",
    teamMembers: ["Emma Wilson", "David Kim", "Lisa Park"],
    submissionDate: "2024-03-16T12:15:00Z",
    reviewStatus: "in_progress",
    priority: "medium",
    deadline: "2024-03-20T18:00:00Z",
    timeSpent: 45,
    isUrgent: false,
    isApproachingDeadline: true,
    
    description: "IoT-based health monitoring system that tracks vital signs and provides early warning alerts for medical conditions.",
    githubUrl: "https://github.com/healthtech/health-monitor",
    demoUrl: "https://health-monitor-demo.vercel.app",
    videoUrl: "https://youtube.com/watch?v=example2",
    technologies: ["Arduino", "Python", "React Native", "AWS IoT", "MongoDB"],
    
    files: [
      { name: "project_report.pdf", url: "#", size: "3.2 MB", type: "report" },
      { name: "technical_specs.pdf", url: "#", size: "2.1 MB", type: "documentation" }
    ],
    
    scores: {
      innovation: 8,
      technical: 7,
      ux: 6,
      feasibility: 8,
      presentation: 7
    },
    feedback: "Strong technical implementation with good innovation. UX could be improved for better user adoption.",
    submittedAt: null,
    lastUpdated: "2024-03-01T14:30:00Z"
  },
  {
    id: 3,
    eventId: 1,
    eventTitle: "AI Innovation Challenge 2024",
    projectTitle: "Autonomous Drone Navigation",
    teamName: "SkyTech Solutions",
    teamMembers: ["Tom Anderson", "Rachel Green", "Chris Lee"],
    submissionDate: "2024-03-15T18:45:00Z",
    reviewStatus: "completed",
    priority: "low",
    deadline: "2024-03-20T18:00:00Z",
    timeSpent: 120,
    isUrgent: false,
    isApproachingDeadline: false,
    
    description: "AI-powered drone navigation system using computer vision and machine learning for autonomous flight and obstacle avoidance.",
    githubUrl: "https://github.com/skytech/drone-nav",
    demoUrl: "https://drone-nav-demo.vercel.app",
    videoUrl: "https://youtube.com/watch?v=example3",
    technologies: ["Python", "OpenCV", "TensorFlow", "ROS", "C++"],
    
    files: [
      { name: "final_report.pdf", url: "#", size: "4.1 MB", type: "report" },
      { name: "demo_video.mp4", url: "#", size: "22.8 MB", type: "video" }
    ],
    
    scores: {
      innovation: 9,
      technical: 8,
      ux: 7,
      feasibility: 7,
      presentation: 8
    },
    feedback: "Excellent innovation and technical execution. The autonomous navigation system shows great potential for real-world applications.",
    submittedAt: "2024-03-01T16:45:00Z",
    lastUpdated: "2024-03-01T16:45:00Z"
  },
  {
    id: 4,
    eventId: 1,
    eventTitle: "AI Innovation Challenge 2024",
    projectTitle: "Natural Language Code Generator",
    teamName: "CodeGen Masters",
    teamMembers: ["Alex Johnson", "Maria Garcia", "James Wilson"],
    submissionDate: "2024-03-16T09:20:00Z",
    reviewStatus: "assigned",
    priority: "high",
    deadline: "2024-03-20T18:00:00Z",
    timeSpent: 0,
    isUrgent: true,
    isApproachingDeadline: true,
    
    description: "AI system that generates code from natural language descriptions, making programming accessible to non-technical users.",
    githubUrl: "https://github.com/codegenmasters/nl-codegen",
    demoUrl: "https://nl-codegen-demo.vercel.app",
    videoUrl: "https://youtube.com/watch?v=example4",
    technologies: ["Python", "GPT-3", "React", "FastAPI", "PostgreSQL"],
    
    files: [
      { name: "project_overview.pdf", url: "#", size: "2.8 MB", type: "overview" },
      { name: "technical_documentation.pdf", url: "#", size: "3.5 MB", type: "documentation" }
    ],
    
    scores: null,
    feedback: null,
    submittedAt: null,
    lastUpdated: null
  }
];

export const mockReviewHistory = [
  {
    id: 1,
    submissionId: 3,
    projectTitle: "Autonomous Drone Navigation",
    teamName: "SkyTech Solutions",
    eventTitle: "AI Innovation Challenge 2024",
    submittedAt: "2024-03-01T16:45:00Z",
    totalScore: 39,
    maxScore: 50,
    criteria: [
      { name: "Innovation & Creativity", score: 9, weight: 25 },
      { name: "Technical Quality", score: 8, weight: 30 },
      { name: "User Experience", score: 7, weight: 20 },
      { name: "Feasibility & Scalability", score: 7, weight: 15 },
      { name: "Presentation & Documentation", score: 8, weight: 10 }
    ],
    feedback: "Excellent innovation and technical execution. The autonomous navigation system shows great potential for real-world applications. The computer vision implementation is particularly impressive.",
    canEdit: false, // Deadline passed
    timeSpent: 120
  },
  {
    id: 2,
    submissionId: 5,
    projectTitle: "Smart Home Energy Manager",
    teamName: "EcoSmart Team",
    eventTitle: "AI Innovation Challenge 2024",
    submittedAt: "2024-03-01T14:20:00Z",
    totalScore: 42,
    maxScore: 50,
    criteria: [
      { name: "Innovation & Creativity", score: 8, weight: 25 },
      { name: "Technical Quality", score: 9, weight: 30 },
      { name: "User Experience", score: 8, weight: 20 },
      { name: "Feasibility & Scalability", score: 9, weight: 15 },
      { name: "Presentation & Documentation", score: 8, weight: 10 }
    ],
    feedback: "Very well-executed project with strong technical foundation. The energy optimization algorithms are innovative and the user interface is intuitive.",
    canEdit: false,
    timeSpent: 95
  }
];

export const mockJudgeAnalytics = {
  totalReviews: 127,
  completedReviews: 119,
  pendingReviews: 8,
  averageScore: 4.2,
  averageTimePerReview: 85, // minutes
  completionRate: 93.7,
  scoreDistribution: {
    "5.0": 15,
    "4.5": 28,
    "4.0": 35,
    "3.5": 22,
    "3.0": 12,
    "2.5": 8,
    "2.0": 3,
    "1.5": 2,
    "1.0": 0
  },
  monthlyStats: [
    { month: "Jan", reviews: 12, avgScore: 4.1 },
    { month: "Feb", reviews: 18, avgScore: 4.3 },
    { month: "Mar", reviews: 15, avgScore: 4.2 }
  ],
  criteriaPerformance: [
    { criteria: "Innovation & Creativity", avgScore: 4.4, weight: 25 },
    { criteria: "Technical Quality", avgScore: 4.1, weight: 30 },
    { criteria: "User Experience", avgScore: 3.9, weight: 20 },
    { criteria: "Feasibility & Scalability", avgScore: 4.0, weight: 15 },
    { criteria: "Presentation & Documentation", avgScore: 4.3, weight: 10 }
  ]
};

export const mockRecentActivity = [
  {
    id: 1,
    type: "review_submitted",
    title: "Review submitted for 'Autonomous Drone Navigation'",
    description: "Completed review for SkyTech Solutions team",
    timestamp: "2024-03-01T16:45:00Z",
    icon: "✅",
    color: "green"
  },
  {
    id: 2,
    type: "assignment_received",
    title: "New assignment: 'Natural Language Code Generator'",
    description: "Assigned to review CodeGen Masters submission",
    timestamp: "2024-03-01T15:30:00Z",
    icon: "📋",
    color: "blue"
  },
  {
    id: 3,
    type: "deadline_approaching",
    title: "Deadline approaching for AI Innovation Challenge",
    description: "3 days remaining to complete all reviews",
    timestamp: "2024-03-01T14:00:00Z",
    icon: "⏰",
    color: "orange"
  },
  {
    id: 4,
    type: "review_in_progress",
    title: "Review in progress: 'Smart Healthcare Monitoring'",
    description: "Started reviewing HealthTech Innovators submission",
    timestamp: "2024-03-01T13:15:00Z",
    icon: "📝",
    color: "purple"
  }
];


// Mock data for participant dashboard
export const mockEvents = [
  {
    id: 1,
    title: "AI Innovation Challenge 2024",
    description: "Build the next generation of AI-powered applications. Focus on machine learning, natural language processing, and computer vision.",
    category: "Artificial Intelligence",
    startDate: "2024-03-15T09:00:00Z",
    endDate: "2024-03-17T18:00:00Z",
    registrationDeadline: "2024-03-10T23:59:59Z",
    maxParticipants: 200,
    currentParticipants: 156,
    prize: "$25,000",
    location: "San Francisco, CA",
    isOnline: false,
    status: "upcoming",
    rules: [
      "Teams of 2-4 participants",
      "All code must be written during the hackathon",
      "Use of open-source libraries is allowed",
      "Projects must be original and not previously published",
      "Final submission must include working demo"
    ],
    timeline: [
      { date: "2024-03-15", event: "Opening Ceremony & Team Formation" },
      { date: "2024-03-16", event: "Coding & Development" },
      { date: "2024-03-17", event: "Project Presentations & Judging" }
    ],
    isRegistered: true,
    registrationDate: "2024-02-20T10:30:00Z"
  },
  {
    id: 2,
    title: "Web3 & Blockchain Hackathon",
    description: "Create decentralized applications, smart contracts, and blockchain solutions. Explore DeFi, NFTs, and Web3 infrastructure.",
    category: "Blockchain",
    startDate: "2024-04-05T09:00:00Z",
    endDate: "2024-04-07T18:00:00Z",
    registrationDeadline: "2024-03-30T23:59:59Z",
    maxParticipants: 150,
    currentParticipants: 89,
    prize: "$20,000",
    location: "Austin, TX",
    isOnline: false,
    status: "upcoming",
    rules: [
      "Teams of 2-5 participants",
      "Must use blockchain technology",
      "Smart contracts must be audited",
      "Include security considerations",
      "Provide technical documentation"
    ],
    timeline: [
      { date: "2024-04-05", event: "Kickoff & Blockchain Workshop" },
      { date: "2024-04-06", event: "Development & Testing" },
      { date: "2024-04-07", event: "Demo Day & Awards" }
    ],
    isRegistered: false
  },
  {
    id: 3,
    title: "Mobile App Development Sprint",
    description: "Build innovative mobile applications for iOS and Android. Focus on user experience, performance, and creativity.",
    category: "Mobile Development",
    startDate: "2024-03-22T09:00:00Z",
    endDate: "2024-03-24T18:00:00Z",
    registrationDeadline: "2024-03-18T23:59:59Z",
    maxParticipants: 120,
    currentParticipants: 120,
    prize: "$15,000",
    location: "Online",
    isOnline: true,
    status: "full",
    rules: [
      "Individual or team of 2-3",
      "Must work on both platforms",
      "Include accessibility features",
      "Performance optimization required",
      "App store submission ready"
    ],
    timeline: [
      { date: "2024-03-22", event: "Virtual Kickoff & API Access" },
      { date: "2024-03-23", event: "Development & Testing" },
      { date: "2024-03-24", event: "Virtual Presentations" }
    ],
    isRegistered: false
  },
  {
    id: 4,
    title: "Sustainability Tech Challenge",
    description: "Develop technology solutions for environmental challenges. Focus on renewable energy, waste reduction, and climate monitoring.",
    category: "Sustainability",
    startDate: "2024-05-10T09:00:00Z",
    endDate: "2024-05-12T18:00:00Z",
    registrationDeadline: "2024-05-05T23:59:59Z",
    maxParticipants: 180,
    currentParticipants: 67,
    prize: "$30,000",
    location: "Seattle, WA",
    isOnline: false,
    status: "upcoming",
    rules: [
      "Teams of 3-6 participants",
      "Must address real environmental issues",
      "Include impact measurement",
      "Scalability considerations",
      "Partnership with environmental orgs encouraged"
    ],
    timeline: [
      { date: "2024-05-10", event: "Opening & Environmental Workshops" },
      { date: "2024-05-11", event: "Solution Development" },
      { date: "2024-05-12", event: "Impact Presentations & Awards" }
    ],
    isRegistered: true,
    registrationDate: "2024-02-25T14:20:00Z"
  },
  {
    id: 5,
    title: "Game Development Jam",
    description: "Create innovative games across all platforms. Focus on gameplay mechanics, storytelling, and technical innovation.",
    category: "Game Development",
    startDate: "2024-04-20T09:00:00Z",
    endDate: "2024-04-22T18:00:00Z",
    registrationDeadline: "2024-04-15T23:59:59Z",
    maxParticipants: 100,
    currentParticipants: 78,
    prize: "$18,000",
    location: "Los Angeles, CA",
    isOnline: false,
    status: "upcoming",
    rules: [
      "Individual or team of 2-4",
      "All assets must be original",
      "Include sound design",
      "Playable demo required",
      "Cross-platform compatibility preferred"
    ],
    timeline: [
      { date: "2024-04-20", event: "Game Design Workshop & Kickoff" },
      { date: "2024-04-21", event: "Development & Asset Creation" },
      { date: "2024-04-22", event: "Game Showcase & Judging" }
    ],
    isRegistered: false
  }
];

export const mockTeams = [
  {
    id: 1,
    name: "Quantum Coders",
    description: "A team of passionate developers focused on AI and machine learning solutions.",
    hackathonId: 1,
    hackathonTitle: "AI Innovation Challenge 2024",
    members: [
      {
        id: 1,
        name: "Alex Johnson",
        email: "alex.johnson@email.com",
        role: "Team Lead",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        skills: ["Python", "TensorFlow", "ML", "Leadership"]
      },
      {
        id: 2,
        name: "Sarah Chen",
        email: "sarah.chen@email.com",
        role: "Frontend Developer",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        skills: ["React", "JavaScript", "UI/UX", "Design"]
      },
      {
        id: 3,
        name: "Mike Rodriguez",
        email: "mike.rodriguez@email.com",
        role: "Backend Developer",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        skills: ["Node.js", "Python", "API Design", "Database"]
      }
    ],
    maxMembers: 4,
    createdAt: "2024-02-15T10:00:00Z",
    status: "active",
    invitationCode: "QUANTUM2024",
    progress: {
      projectName: "AI-Powered Code Review Assistant",
      completion: 75,
      lastUpdated: "2024-03-01T16:30:00Z"
    }
  },
  {
    id: 2,
    name: "EcoTech Pioneers",
    description: "Building sustainable technology solutions for a greener future.",
    hackathonId: 4,
    hackathonTitle: "Sustainability Tech Challenge",
    members: [
      {
        id: 1,
        name: "Alex Johnson",
        email: "alex.johnson@email.com",
        role: "Team Lead",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        skills: ["Project Management", "IoT", "Sustainability", "Leadership"]
      },
      {
        id: 4,
        name: "Emma Wilson",
        email: "emma.wilson@email.com",
        role: "Hardware Engineer",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        skills: ["Arduino", "Raspberry Pi", "Sensors", "Electronics"]
      },
      {
        id: 5,
        name: "David Kim",
        email: "david.kim@email.com",
        role: "Data Scientist",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        skills: ["Python", "Data Analysis", "ML", "Statistics"]
      }
    ],
    maxMembers: 6,
    createdAt: "2024-02-20T14:00:00Z",
    status: "active",
    invitationCode: "ECOTECH2024",
    progress: {
      projectName: "Smart Waste Management System",
      completion: 45,
      lastUpdated: "2024-03-01T12:15:00Z"
    }
  }
];

export const mockSubmissions = [
  {
    id: 1,
    hackathonId: 1,
    hackathonTitle: "AI Innovation Challenge 2024",
    projectName: "AI-Powered Code Review Assistant",
    description: "An intelligent code review tool that uses machine learning to analyze code quality, identify potential bugs, and suggest improvements.",
    githubUrl: "https://github.com/quantumcoders/ai-code-review",
    demoUrl: "https://ai-code-review-demo.vercel.app",
    videoUrl: "https://youtube.com/watch?v=example1",
    files: [
      { name: "presentation.pdf", url: "#", size: "2.5 MB" },
      { name: "documentation.pdf", url: "#", size: "1.8 MB" }
    ],
    technologies: ["Python", "TensorFlow", "React", "Node.js", "PostgreSQL"],
    teamId: 1,
    teamName: "Quantum Coders",
    status: "submitted",
    submittedAt: "2024-03-16T15:30:00Z",
    updatedAt: "2024-03-16T15:30:00Z",
    deadline: "2024-03-17T18:00:00Z",
    canEdit: true
  },
  {
    id: 2,
    hackathonId: 4,
    hackathonTitle: "Sustainability Tech Challenge",
    projectName: "Smart Waste Management System",
    description: "IoT-based waste monitoring system that optimizes collection routes and promotes recycling through gamification.",
    githubUrl: "https://github.com/ecotechpioneers/smart-waste",
    demoUrl: "https://smart-waste-demo.vercel.app",
    videoUrl: "https://youtube.com/watch?v=example2",
    files: [
      { name: "project_report.pdf", url: "#", size: "3.2 MB" },
      { name: "technical_specs.pdf", url: "#", size: "2.1 MB" }
    ],
    technologies: ["Arduino", "Python", "React Native", "AWS IoT", "MongoDB"],
    teamId: 2,
    teamName: "EcoTech Pioneers",
    status: "in_progress",
    submittedAt: null,
    updatedAt: "2024-03-01T12:15:00Z",
    deadline: "2024-05-12T18:00:00Z",
    canEdit: true
  }
];

export const mockActivities = [
  {
    id: 1,
    type: "event_registration",
    title: "Registered for AI Innovation Challenge 2024",
    description: "Successfully registered for the AI Innovation Challenge hackathon",
    timestamp: "2024-02-20T10:30:00Z",
    icon: "🎯",
    color: "blue"
  },
  {
    id: 2,
    type: "team_creation",
    title: "Created team 'Quantum Coders'",
    description: "Formed a new team for the AI Innovation Challenge",
    timestamp: "2024-02-15T10:00:00Z",
    icon: "👥",
    color: "green"
  },
  {
    id: 3,
    type: "team_join",
    title: "Sarah Chen joined your team",
    description: "Sarah Chen joined Quantum Coders as Frontend Developer",
    timestamp: "2024-02-16T14:20:00Z",
    icon: "➕",
    color: "purple"
  },
  {
    id: 4,
    type: "submission_update",
    title: "Updated project submission",
    description: "Updated AI-Powered Code Review Assistant submission",
    timestamp: "2024-03-01T16:30:00Z",
    icon: "📝",
    color: "orange"
  },
  {
    id: 5,
    type: "event_registration",
    title: "Registered for Sustainability Tech Challenge",
    description: "Successfully registered for the Sustainability Tech Challenge",
    timestamp: "2024-02-25T14:20:00Z",
    icon: "🎯",
    color: "blue"
  },
  {
    id: 6,
    type: "team_creation",
    title: "Created team 'EcoTech Pioneers'",
    description: "Formed a new team for the Sustainability Tech Challenge",
    timestamp: "2024-02-20T14:00:00Z",
    icon: "👥",
    color: "green"
  }
];

export const mockDeadlines = [
  {
    id: 1,
    title: "AI Innovation Challenge Submission Deadline",
    hackathonId: 1,
    hackathonTitle: "AI Innovation Challenge 2024",
    deadline: "2024-03-17T18:00:00Z",
    type: "submission",
    priority: "high",
    description: "Final project submission deadline"
  },
  {
    id: 2,
    title: "Web3 Hackathon Registration Deadline",
    hackathonId: 2,
    hackathonTitle: "Web3 & Blockchain Hackathon",
    deadline: "2024-03-30T23:59:59Z",
    type: "registration",
    priority: "medium",
    description: "Last day to register for the event"
  },
  {
    id: 3,
    title: "Mobile App Sprint Registration Deadline",
    hackathonId: 3,
    hackathonTitle: "Mobile App Development Sprint",
    deadline: "2024-03-18T23:59:59Z",
    type: "registration",
    priority: "medium",
    description: "Last day to register for the event"
  },
  {
    id: 4,
    title: "Sustainability Challenge Submission Deadline",
    hackathonId: 4,
    hackathonTitle: "Sustainability Tech Challenge",
    deadline: "2024-05-12T18:00:00Z",
    type: "submission",
    priority: "low",
    description: "Final project submission deadline"
  }
];

export const mockDashboardStats = {
  registeredEvents: 2,
  activeTeams: 2,
  completedSubmissions: 1,
  upcomingDeadlines: 4,
  totalPoints: 1250,
  rank: "Top 15%"
};

export const mockCategories = [
  "All Categories",
  "Artificial Intelligence",
  "Blockchain",
  "Mobile Development",
  "Sustainability",
  "Game Development",
  "Web Development",
  "IoT",
  "Cybersecurity",
  "Data Science"
];

export const mockPrizeRanges = [
  "All Prizes",
  "$0 - $5,000",
  "$5,000 - $15,000",
  "$15,000 - $25,000",
  "$25,000+"
];

// Helper functions for localStorage persistence
const getStoredData = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(`haxcode_${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const setStoredData = (key, data) => {
  try {
    localStorage.setItem(`haxcode_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Initialize mutable data with localStorage persistence (using defaults when absent)
let mutableEvents = getStoredData('events', mockEvents);
let mutableTeams = getStoredData('teams', mockTeams);
let mutableSubmissions = getStoredData('submissions', mockSubmissions);

// Data management functions
export const dataService = {
  // Event management
  getEvents: () => mutableEvents,
  
  registerForEvent: (eventId, userId, userName) => {
    const event = mutableEvents.find(e => e.id === eventId);
    if (!event) throw new Error('Event not found');
    
    if (event.registeredUsers.includes(userId)) {
      throw new Error('Already registered for this event');
    }
    
    if (event.currentParticipants >= event.maxParticipants) {
      throw new Error('Event is full');
    }
    
    event.currentParticipants += 1;
    event.registeredUsers.push(userId);
    event.isRegistered = true;
    
    setStoredData('events', mutableEvents);
    return event;
  },
  
  unregisterFromEvent: (eventId, userId) => {
    const event = mutableEvents.find(e => e.id === eventId);
    if (!event) throw new Error('Event not found');
    
    const userIndex = event.registeredUsers.indexOf(userId);
    if (userIndex === -1) {
      throw new Error('Not registered for this event');
    }
    
    event.currentParticipants -= 1;
    event.registeredUsers.splice(userIndex, 1);
    event.isRegistered = false;
    
    setStoredData('events', mutableEvents);
    return event;
  },
  
  // Team management
  getTeams: () => mutableTeams,
  
  createTeam: (teamData) => {
    const newTeam = {
      id: Date.now(),
      ...teamData,
      members: [{
        id: teamData.creatorId,
        name: teamData.creatorName,
        role: 'Team Lead',
        avatar: teamData.creatorAvatar
      }],
      createdAt: new Date().toISOString(),
      progress: {
        completion: 0,
        projectName: ''
      },
      messages: []
    };
    
    mutableTeams.push(newTeam);
    setStoredData('teams', mutableTeams);
    return newTeam;
  },
  
  joinTeam: (teamId, userId, userName, userAvatar) => {
    const team = mutableTeams.find(t => t.id === teamId);
    if (!team) throw new Error('Team not found');
    
    if (team.members.length >= team.maxMembers) {
      throw new Error('Team is full');
    }
    
    if (team.members.some(m => m.id === userId)) {
      throw new Error('Already a member of this team');
    }
    
    team.members.push({
      id: userId,
      name: userName,
      role: 'Member',
      avatar: userAvatar
    });
    
    setStoredData('teams', mutableTeams);
    return team;
  },
  
  deleteTeam: (teamId, userId) => {
    const teamIndex = mutableTeams.findIndex(t => t.id === teamId);
    if (teamIndex === -1) throw new Error('Team not found');
    
    const team = mutableTeams[teamIndex];
    const isTeamLead = team.members.some(m => m.id === userId && m.role === 'Team Lead');
    
    if (!isTeamLead) {
      throw new Error('Only team lead can delete the team');
    }
    
    mutableTeams.splice(teamIndex, 1);
    setStoredData('teams', mutableTeams);
    return true;
  },
  
  addTeamMessage: (teamId, senderId, senderName, message) => {
    const team = mutableTeams.find(t => t.id === teamId);
    if (!team) throw new Error('Team not found');
    
    const newMessage = {
      id: Date.now(),
      senderId,
      senderName,
      message,
      timestamp: new Date().toISOString()
    };
    
    team.messages.push(newMessage);
    setStoredData('teams', mutableTeams);
    return newMessage;
  },
  
  // Submission management
  getSubmissions: () => mutableSubmissions,
  
  createSubmission: (submissionData) => {
    const newSubmission = {
      id: Date.now(),
      ...submissionData,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      canEdit: false
    };
    
    mutableSubmissions.push(newSubmission);
    setStoredData('submissions', mutableSubmissions);
    return newSubmission;
  },
  
  updateSubmission: (submissionId, updates) => {
    const submissionIndex = mutableSubmissions.findIndex(s => s.id === submissionId);
    if (submissionIndex === -1) throw new Error('Submission not found');
    
    mutableSubmissions[submissionIndex] = {
      ...mutableSubmissions[submissionIndex],
      ...updates,
      submittedAt: new Date().toISOString()
    };
    
    setStoredData('submissions', mutableSubmissions);
    return mutableSubmissions[submissionIndex];
  },
  
  deleteSubmission: (submissionId) => {
    const submissionIndex = mutableSubmissions.findIndex(s => s.id === submissionId);
    if (submissionIndex === -1) throw new Error('Submission not found');
    
    mutableSubmissions.splice(submissionIndex, 1);
    setStoredData('submissions', mutableSubmissions);
    return true;
  }
};

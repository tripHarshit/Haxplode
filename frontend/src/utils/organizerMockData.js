// Mock data for organizer dashboard
export const mockParticipants = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    registrationDate: "2024-02-20T10:30:00Z",
    teamStatus: "In Team",
    teamName: "Quantum Coders",
    hackathonId: 1,
    hackathonTitle: "AI Innovation Challenge 2024",
    skills: ["Python", "TensorFlow", "ML", "Leadership"],
    submissions: 1,
    lastActive: "2024-03-01T16:30:00Z"
  },
  {
    id: 2,
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    registrationDate: "2024-02-16T14:20:00Z",
    teamStatus: "In Team",
    teamName: "Quantum Coders",
    hackathonId: 1,
    hackathonTitle: "AI Innovation Challenge 2024",
    skills: ["React", "JavaScript", "UI/UX", "Design"],
    submissions: 0,
    lastActive: "2024-02-28T12:15:00Z"
  },
  {
    id: 3,
    name: "Mike Rodriguez",
    email: "mike.rodriguez@email.com",
    registrationDate: "2024-02-18T09:45:00Z",
    teamStatus: "In Team",
    teamName: "Quantum Coders",
    hackathonId: 1,
    hackathonTitle: "AI Innovation Challenge 2024",
    skills: ["Node.js", "Python", "API Design", "Database"],
    submissions: 0,
    lastActive: "2024-02-29T15:20:00Z"
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma.wilson@email.com",
    registrationDate: "2024-02-22T11:30:00Z",
    teamStatus: "In Team",
    teamName: "EcoTech Pioneers",
    hackathonId: 4,
    hackathonTitle: "Sustainability Tech Challenge",
    skills: ["Arduino", "Raspberry Pi", "Sensors", "Electronics"],
    submissions: 0,
    lastActive: "2024-03-01T12:15:00Z"
  },
  {
    id: 5,
    name: "David Kim",
    email: "david.kim@email.com",
    registrationDate: "2024-02-25T16:45:00Z",
    teamStatus: "In Team",
    teamName: "EcoTech Pioneers",
    hackathonId: 4,
    hackathonTitle: "Sustainability Tech Challenge",
    skills: ["Python", "Data Analysis", "ML", "Statistics"],
    submissions: 0,
    lastActive: "2024-03-01T12:15:00Z"
  },
  {
    id: 6,
    name: "Lisa Park",
    email: "lisa.park@email.com",
    registrationDate: "2024-02-28T13:20:00Z",
    teamStatus: "No Team",
    teamName: null,
    hackathonId: 2,
    hackathonTitle: "Web3 & Blockchain Hackathon",
    skills: ["Solidity", "React", "Web3", "Smart Contracts"],
    submissions: 0,
    lastActive: "2024-02-28T13:20:00Z"
  },
  {
    id: 7,
    name: "Tom Anderson",
    email: "tom.anderson@email.com",
    registrationDate: "2024-03-01T10:15:00Z",
    teamStatus: "No Team",
    teamName: null,
    hackathonId: 2,
    hackathonTitle: "Web3 & Blockchain Hackathon",
    skills: ["Ethereum", "JavaScript", "DeFi", "NFTs"],
    submissions: 0,
    lastActive: "2024-03-01T10:15:00Z"
  },
  {
    id: 8,
    name: "Rachel Green",
    email: "rachel.green@email.com",
    registrationDate: "2024-02-19T14:30:00Z",
    teamStatus: "No Team",
    teamName: null,
    hackathonId: 3,
    hackathonTitle: "Mobile App Development Sprint",
    skills: ["React Native", "iOS", "Android", "Mobile UI"],
    submissions: 0,
    lastActive: "2024-02-26T09:45:00Z"
  }
];

export const mockAnnouncements = [
  {
    id: 1,
    title: "Welcome to AI Innovation Challenge 2024!",
    content: "Welcome all participants to the AI Innovation Challenge 2024! We're excited to see your innovative AI solutions. Remember to form your teams by March 10th and submit your project proposals by March 15th.",
    targetAudience: "Participants",
    date: "2024-02-20T09:00:00Z",
    isUrgent: false,
    isImportant: true,
    createdBy: "Organizer Team"
  },
  {
    id: 2,
    title: "Team Formation Deadline Extended",
    content: "Due to popular demand, we've extended the team formation deadline to March 12th. This gives you extra time to find the perfect teammates for your AI project.",
    targetAudience: "Participants",
    date: "2024-02-25T14:30:00Z",
    isUrgent: true,
    isImportant: true,
    createdBy: "Organizer Team"
  },
  {
    id: 3,
    title: "Judging Criteria Announced",
    content: "The judging criteria for the AI Innovation Challenge has been announced. Projects will be evaluated on innovation (30%), technical implementation (25%), business potential (20%), and presentation (25%).",
    targetAudience: "Judges",
    date: "2024-02-28T11:00:00Z",
    isUrgent: false,
    isImportant: true,
    createdBy: "Organizer Team"
  },
  {
    id: 4,
    title: "Workshop Schedule Updated",
    content: "We've updated the workshop schedule for the AI Innovation Challenge. New workshops on 'Advanced ML Techniques' and 'AI Ethics' have been added. Check the updated schedule in your dashboard.",
    targetAudience: "All",
    date: "2024-03-01T16:00:00Z",
    isUrgent: false,
    isImportant: false,
    createdBy: "Organizer Team"
  },
  {
    id: 5,
    title: "Submission Portal Now Open",
    content: "The project submission portal is now open! You can start uploading your project files, documentation, and demo links. Remember to submit everything by the deadline on March 17th.",
    targetAudience: "Participants",
    date: "2024-03-15T08:00:00Z",
    isUrgent: true,
    isImportant: true,
    createdBy: "Organizer Team"
  }
];

export const mockEventStats = {
  "AI Innovation Challenge 2024": {
    totalParticipants: 156,
    maxParticipants: 200,
    teamsFormed: 52,
    submissionsReceived: 45,
    registrationTrend: [
      { date: "2024-02-15", count: 25 },
      { date: "2024-02-20", count: 67 },
      { date: "2024-02-25", count: 98 },
      { date: "2024-03-01", count: 134 },
      { date: "2024-03-05", count: 156 }
    ]
  },
  "Web3 & Blockchain Hackathon": {
    totalParticipants: 89,
    maxParticipants: 150,
    teamsFormed: 18,
    submissionsReceived: 0,
    registrationTrend: [
      { date: "2024-02-20", count: 15 },
      { date: "2024-02-25", count: 34 },
      { date: "2024-03-01", count: 67 },
      { date: "2024-03-05", count: 89 }
    ]
  },
  "Mobile App Development Sprint": {
    totalParticipants: 120,
    maxParticipants: 120,
    teamsFormed: 40,
    submissionsReceived: 38,
    registrationTrend: [
      { date: "2024-02-15", count: 20 },
      { date: "2024-02-20", count: 45 },
      { date: "2024-02-25", count: 78 },
      { date: "2024-03-01", count: 110 },
      { date: "2024-03-05", count: 120 }
    ]
  },
  "Sustainability Tech Challenge": {
    totalParticipants: 67,
    maxParticipants: 180,
    teamsFormed: 12,
    submissionsReceived: 0,
    registrationTrend: [
      { date: "2024-02-20", count: 12 },
      { date: "2024-02-25", count: 28 },
      { date: "2024-03-01", count: 45 },
      { date: "2024-03-05", count: 67 }
    ]
  },
  "Game Development Jam": {
    totalParticipants: 78,
    maxParticipants: 100,
    teamsFormed: 26,
    submissionsReceived: 0,
    registrationTrend: [
      { date: "2024-02-20", count: 18 },
      { date: "2024-02-25", count: 35 },
      { date: "2024-03-01", count: 58 },
      { date: "2024-03-05", count: 78 }
    ]
  }
};

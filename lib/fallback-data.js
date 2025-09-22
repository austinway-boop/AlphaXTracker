/**
 * Fallback data when Google Sheets is not configured
 * This ensures the app works immediately on deployment
 */

const DEFAULT_STUDENTS = [
  {
    id: 1,
    email: 'student1@alpha.school',
    password: 'Iloveschool',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    honors: false,
    groupID: 1,
    school: 'Alpha Academy',
    status: 'active',
    points: 100,
    lastActivity: new Date().toISOString()
  },
  {
    id: 2,
    email: 'student2@alpha.school',
    password: 'Iloveschool',
    firstName: 'Jane',
    lastName: 'Smith',
    fullName: 'Jane Smith',
    honors: true,
    groupID: 1,
    school: 'Alpha Academy',
    status: 'active',
    points: 150,
    lastActivity: new Date().toISOString()
  },
  {
    id: 3,
    email: 'demo@alpha.school',
    password: 'demo123',
    firstName: 'Demo',
    lastName: 'User',
    fullName: 'Demo User',
    honors: false,
    groupID: 2,
    school: 'Alpha Academy',
    status: 'active',
    points: 75,
    lastActivity: new Date().toISOString()
  }
];

const DEFAULT_PROFILES = {
  1: {
    studentId: 1,
    dailyGoal: 10,
    sessionGoal: 100,
    projectOneliner: 'Working on AI project',
    brainliftCompleted: false,
    dailyGoalCompleted: false,
    goalX: 5,
    goalYouTube: 3,
    goalTikTok: 2,
    goalInstagram: 2,
    platformX: '@johndoe',
    platformYouTube: 'johndoe_yt',
    platformTikTok: '@johndoe_tt',
    platformInstagram: '@johndoe_ig'
  },
  2: {
    studentId: 2,
    dailyGoal: 15,
    sessionGoal: 150,
    projectOneliner: 'Building a web app',
    brainliftCompleted: true,
    dailyGoalCompleted: false,
    goalX: 8,
    goalYouTube: 5,
    goalTikTok: 3,
    goalInstagram: 4,
    platformX: '@janesmith',
    platformYouTube: 'janesmith_yt',
    platformTikTok: '@janesmith_tt',
    platformInstagram: '@janesmith_ig'
  },
  3: {
    studentId: 3,
    dailyGoal: 5,
    sessionGoal: 50,
    projectOneliner: 'Demo project',
    brainliftCompleted: false,
    dailyGoalCompleted: false,
    goalX: 2,
    goalYouTube: 2,
    goalTikTok: 1,
    goalInstagram: 1,
    platformX: '@demo',
    platformYouTube: 'demo_yt',
    platformTikTok: '@demo_tt',
    platformInstagram: '@demo_ig'
  }
};

const DEFAULT_GROUPS = [
  {
    id: 1,
    name: 'Group A',
    description: 'Advanced students'
  },
  {
    id: 2,
    name: 'Group B',
    description: 'Regular students'
  }
];

module.exports = {
  DEFAULT_STUDENTS,
  DEFAULT_PROFILES,
  DEFAULT_GROUPS
};

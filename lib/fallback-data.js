/**
 * Fallback data when Google Sheets is not configured
 * Contains all students from the testing version
 */

const DEFAULT_STUDENTS = [
  // Honors Students (1-18)
  { id: 1, email: 'alex.mathew@alpha.school', password: 'Iloveschool', firstName: 'Alex', lastName: 'Mathew', fullName: 'Alex Mathew', honors: true, groupID: 1, school: 'Alpha High', status: 'active', points: 850 },
  { id: 2, email: 'austin.way@alpha.school', password: 'Iloveschool', firstName: 'Austin', lastName: 'Way', fullName: 'Austin Way', honors: true, groupID: 1, school: 'Alpha High', status: 'active', points: 920 },
  { id: 3, email: 'caleb.walker@alpha.school', password: 'Iloveschool', firstName: 'Caleb', lastName: 'Walker', fullName: 'Caleb Walker', honors: true, groupID: 1, school: 'Alpha High', status: 'active', points: 780 },
  { id: 4, email: 'cruce.saunders@alpha.school', password: 'Iloveschool', firstName: 'Cruce', lastName: 'Saunders', fullName: 'Cruce Saunders', honors: true, groupID: 1, school: 'Alpha High', status: 'active', points: 890 },
  { id: 5, email: 'ella.gremont@alpha.school', password: 'Iloveschool', firstName: 'Ella', lastName: 'Gremont', fullName: 'Ella Gremont', honors: true, groupID: 1, school: 'Alpha High', status: 'active', points: 950 },
  { id: 6, email: 'elle.liemandt@alpha.school', password: 'Iloveschool', firstName: 'Elle', lastName: 'Liemandt', fullName: 'Elle Liemandt', honors: true, groupID: 1, school: 'Alpha High', status: 'active', points: 820 },
  { id: 7, email: 'emma.cotner@alpha.school', password: 'Iloveschool', firstName: 'Emma', lastName: 'Cotner', fullName: 'Emma Cotner', honors: true, groupID: 1, school: 'Alpha High', status: 'active', points: 914 },
  { id: 8, email: 'geetesh.parelly@alpha.school', password: 'Iloveschool', firstName: 'Geetesh', lastName: 'Parelly', fullName: 'Geetesh Parelly', honors: true, groupID: 1, school: 'Alpha High', status: 'active', points: 760 },
  { id: 9, email: 'jackson.price@alpha.school', password: 'Iloveschool', firstName: 'Jackson', lastName: 'Price', fullName: 'Jackson Price', honors: true, groupID: 1, school: 'Alpha High', status: 'active', points: 880 },
  { id: 10, email: 'kavin.lingham@alpha.school', password: 'Iloveschool', firstName: 'Kavin', lastName: 'Lingham', fullName: 'Kavin Lingham', honors: true, groupID: 1, school: 'Alpha High', status: 'active', points: 795 },
  { id: 11, email: 'lincoln.thomas@alpha.school', password: 'Iloveschool', firstName: 'Lincoln', lastName: 'Thomas', fullName: 'Lincoln Thomas', honors: true, groupID: 1, school: 'Alpha High', status: 'active', points: 910 },
  { id: 12, email: 'maddie.price@alpha.school', password: 'Iloveschool', firstName: 'Maddie', lastName: 'Price', fullName: 'Maddie Price', honors: true, groupID: 1, school: 'Alpha High', status: 'active', points: 865 },
  { id: 13, email: 'michael.cai@alpha.school', password: 'Iloveschool', firstName: 'Michael', lastName: 'Cai', fullName: 'Michael Cai', honors: true, groupID: 1, school: 'Alpha High', status: 'active', points: 935 },
  { id: 14, email: 'reuben.runacres@alpha.school', password: 'Iloveschool', firstName: 'Reuben', lastName: 'Runacres', fullName: 'Reuben Runacres', honors: true, groupID: 1, school: 'Alpha High', status: 'active', points: 825 },
  { id: 15, email: 'sarabeth.way@alpha.school', password: 'Iloveschool', firstName: 'Sara Beth', lastName: 'Way', fullName: 'Sara Beth Way', honors: true, groupID: 1, school: 'Alpha High', status: 'active', points: 905 },
  { id: 16, email: 'sloane.price@alpha.school', password: 'Iloveschool', firstName: 'Sloane', lastName: 'Price', fullName: 'Sloane Price', honors: true, groupID: 1, school: 'Alpha High', status: 'active', points: 870 },
  { id: 17, email: 'sloka.vudumu@alpha.school', password: 'Iloveschool', firstName: 'Sloka', lastName: 'Vudumu', fullName: 'Sloka Vudumu', honors: true, groupID: 1, school: 'Alpha High', status: 'active', points: 840 },
  { id: 18, email: 'stella.cole@alpha.school', password: 'Iloveschool', firstName: 'Stella', lastName: 'Cole', fullName: 'Stella Cole', honors: true, groupID: 1, school: 'Alpha High', status: 'active', points: 895 },
  
  // Additional Students (19-45)
  { id: 19, email: 'emily.smith@alpha.school', password: 'Iloveschool', firstName: 'Emily', lastName: 'Smith', fullName: 'Emily Smith', honors: false, groupID: 2, school: 'Alpha High', status: 'active', points: 650 },
  { id: 20, email: 'lucia.scaletta@alpha.school', password: 'Iloveschool', firstName: 'Lucia', lastName: 'Scaletta', fullName: 'Lucia Scaletta', honors: false, groupID: 2, school: 'Alpha High', status: 'active', points: 720 },
  { id: 21, email: 'tatum.lemkau@alpha.school', password: 'Iloveschool', firstName: 'Tatum', lastName: 'Lemkau', fullName: 'Tatum Lemkau', honors: false, groupID: 2, school: 'Alpha High', status: 'active', points: 680 },
  { id: 22, email: 'jeremy.wang@alpha.school', password: 'Iloveschool', firstName: 'Jeremy', lastName: 'Wang', fullName: 'Jeremy Wang', honors: false, groupID: 2, school: 'Alpha High', status: 'active', points: 745 },
  { id: 23, email: 'madeleine.grams@alpha.school', password: 'Iloveschool', firstName: 'Madeleine', lastName: 'Grams', fullName: 'Madeleine Grams', honors: false, groupID: 2, school: 'Alpha High', status: 'active', points: 710 },
  { id: 24, email: 'malaika.negrete@alpha.school', password: 'Iloveschool', firstName: 'Malaika', lastName: 'Negrete', fullName: 'Malaika Negrete', honors: false, groupID: 2, school: 'Alpha High', status: 'active', points: 690 },
  { id: 25, email: 'paty.margain@alpha.school', password: 'Iloveschool', firstName: 'Paty', lastName: 'Margain-Junco', fullName: 'Paty Margain-Junco', honors: false, groupID: 2, school: 'Alpha High', status: 'active', points: 735 },
  { id: 26, email: 'aoife.huey@alpha.school', password: 'Iloveschool', firstName: 'Aoife', lastName: 'Huey', fullName: 'Aoife Huey', honors: false, groupID: 2, school: 'Alpha High', status: 'active', points: 665 },
  { id: 27, email: 'ella.dietz@alpha.school', password: 'Iloveschool', firstName: 'Ella', lastName: 'Dietz', fullName: 'Ella Dietz', honors: false, groupID: 2, school: 'Alpha High', status: 'active', points: 705 },
  { id: 28, email: 'mollie.mcdougald@alpha.school', password: 'Iloveschool', firstName: 'Mollie Anne', lastName: 'McDougald', fullName: 'Mollie Anne McDougald', honors: false, groupID: 2, school: 'Alpha High', status: 'active', points: 695 },
  { id: 29, email: 'stella.grams@alpha.school', password: 'Iloveschool', firstName: 'Stella', lastName: 'Grams', fullName: 'Stella Grams', honors: false, groupID: 2, school: 'Alpha High', status: 'active', points: 725 },
  { id: 30, email: 'adrienne.laswell@alpha.school', password: 'Iloveschool', firstName: 'Adrienne', lastName: 'Laswell', fullName: 'Adrienne Laswell', honors: false, groupID: 3, school: 'Alpha High', status: 'active', points: 640 },
  { id: 31, email: 'aheli.shah@alpha.school', password: 'Iloveschool', firstName: 'Aheli', lastName: 'Shah', fullName: 'Aheli Shah', honors: false, groupID: 3, school: 'Alpha High', status: 'active', points: 675 },
  { id: 32, email: 'ali.romman@alpha.school', password: 'Iloveschool', firstName: 'Ali', lastName: 'Romman', fullName: 'Ali Romman', honors: false, groupID: 3, school: 'Alpha High', status: 'active', points: 655 },
  { id: 33, email: 'benjamin.valles@alpha.school', password: 'Iloveschool', firstName: 'Benjamin', lastName: 'Valles', fullName: 'Benjamin Valles', honors: false, groupID: 3, school: 'Alpha High', status: 'active', points: 700 },
  { id: 34, email: 'branson.pfiester@alpha.school', password: 'Iloveschool', firstName: 'Branson', lastName: 'Pfiester', fullName: 'Branson Pfiester', honors: false, groupID: 3, school: 'Alpha High', status: 'active', points: 685 },
  { id: 35, email: 'erika.rigby@alpha.school', password: 'Iloveschool', firstName: 'Erika', lastName: 'Rigby', fullName: 'Erika Rigby', honors: false, groupID: 3, school: 'Alpha High', status: 'active', points: 715 },
  { id: 36, email: 'evan.klein@alpha.school', password: 'Iloveschool', firstName: 'Evan', lastName: 'Klein', fullName: 'Evan Klein', honors: false, groupID: 3, school: 'Alpha High', status: 'active', points: 670 },
  { id: 37, email: 'grady.swanson@alpha.school', password: 'Iloveschool', firstName: 'Grady', lastName: 'Swanson', fullName: 'Grady Swanson', honors: false, groupID: 3, school: 'Alpha High', status: 'active', points: 730 },
  { id: 38, email: 'greyson.walker@alpha.school', password: 'Iloveschool', firstName: 'Greyson', lastName: 'Walker', fullName: 'Greyson Walker', honors: false, groupID: 3, school: 'Alpha High', status: 'active', points: 660 },
  { id: 39, email: 'gus.castillo@alpha.school', password: 'Iloveschool', firstName: 'Gus', lastName: 'Castillo', fullName: 'Gus Castillo', honors: false, groupID: 3, school: 'Alpha High', status: 'active', points: 695 },
  { id: 40, email: 'jacob.kuchinsky@alpha.school', password: 'Iloveschool', firstName: 'Jacob', lastName: 'Kuchinsky', fullName: 'Jacob Kuchinsky', honors: false, groupID: 3, school: 'Alpha High', status: 'active', points: 705 },
  { id: 41, email: 'maxime.auvray@alpha.school', password: 'Iloveschool', firstName: 'Maxime', lastName: 'Auvray', fullName: 'Maxime Auvray', honors: false, groupID: 3, school: 'Alpha High', status: 'active', points: 680 },
  { id: 42, email: 'reece.knight@alpha.school', password: 'Iloveschool', firstName: 'Reece', lastName: 'Knight', fullName: 'Reece Knight', honors: false, groupID: 3, school: 'Alpha High', status: 'active', points: 710 },
  { id: 43, email: 'ross.margraves@alpha.school', password: 'Iloveschool', firstName: 'Ross', lastName: 'Margraves', fullName: 'Ross Margraves', honors: false, groupID: 3, school: 'Alpha High', status: 'active', points: 665 },
  { id: 44, email: 'vera.li@alpha.school', password: 'Iloveschool', firstName: 'Vera', lastName: 'Li', fullName: 'Vera Li', honors: false, groupID: 3, school: 'Alpha High', status: 'active', points: 720 },
  { id: 45, email: 'zayen.szpitalak@alpha.school', password: 'Iloveschool', firstName: 'Zayen', lastName: 'Szpitalak', fullName: 'Zayen Szpitalak', honors: false, groupID: 3, school: 'Alpha High', status: 'active', points: 690 },
  
  // Demo account
  { id: 99, email: 'demo@alpha.school', password: 'demo123', firstName: 'Demo', lastName: 'User', fullName: 'Demo User', honors: false, groupID: 2, school: 'Alpha High', status: 'active', points: 500 }
];

// Add timestamps to all students
DEFAULT_STUDENTS.forEach(s => s.lastActivity = new Date().toISOString());

// Create simple profiles
const DEFAULT_PROFILES = {};
DEFAULT_STUDENTS.forEach(s => {
  DEFAULT_PROFILES[s.id] = {
    studentId: s.id,
    dailyGoal: s.honors ? 15 : 10,
    sessionGoal: s.honors ? 150 : 100,
    projectOneliner: `Working on ${s.honors ? 'advanced' : 'standard'} project`,
    brainliftCompleted: false,
    dailyGoalCompleted: false,
    goalX: s.honors ? 5 : 3,
    goalYouTube: 3,
    goalTikTok: 2,
    goalInstagram: 2,
    platformX: `@${s.firstName.toLowerCase()}`,
    platformYouTube: `${s.firstName.toLowerCase()}_yt`,
    platformTikTok: `@${s.firstName.toLowerCase()}`,
    platformInstagram: `${s.firstName.toLowerCase()}_ig`
  };
});

const DEFAULT_GROUPS = [
  { id: 1, name: 'Honors', description: 'High achieving honor students' },
  { id: 2, name: 'Regular', description: 'Regular track students' },
  { id: 3, name: 'Foundation', description: 'Foundation level students' }
];

module.exports = { DEFAULT_STUDENTS, DEFAULT_PROFILES, DEFAULT_GROUPS };

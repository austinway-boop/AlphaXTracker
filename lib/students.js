// Shared student data parsing function
export function parseStudentData() {
  // Define honors students based on the first line
  // Note: Using first names to match, Jackson Price is indeed honors
  const honorsStudents = new Set([
    'Alex', 'Austin', 'Caleb', 'Cruce', 'Ella', 'Elle', 'Emma', 
    'Geetesh', 'Jackson', 'Kavin', 'Lincoln', 'Maddie', 'Michael', 
    'Reuben', 'Sara Beth', 'Sloane', 'Sloka', 'Stella'
  ]);

  // Define all students from the Names.md file
  const allStudents = [
    ['Alex', 'Mathew'], ['Elle', 'Liemandt'], ['Emily', 'Smith'], ['Lucia', 'Scaletta'],
    ['Maddie', 'Price'], ['Reuben', 'Runacres'], ['Sloane', 'Price'], ['Tatum', 'Lemkau'],
    ['Austin', 'Way'], ['Caleb', 'Walker'], ['Cruce', 'Saunders'], ['Ella', 'Gremont'],
    ['Geetesh', 'Parelly'], ['Jeremy', 'Wang'], ['Madeleine', 'Grams'], ['Malaika', 'Negrete'],
    ['Paty', 'Margain-Junco'], ['Sara Beth', 'Way'], ['Sloka', 'Vudumu'], ['Aoife', 'Huey'],
    ['Ella', 'Dietz'], ['Emma', 'Cotner'], ['Jackson', 'Price'], ['Kavin', 'Lingham'],
    ['Lincoln', 'Thomas'], ['Michael', 'Cai'], ['Mollie Anne', 'McDougald'], ['Stella', 'Cole'],
    ['Stella', 'Grams'], ['Adrienne', 'Laswell'], ['Aheli', 'Shah'], ['Ali', 'Romman'],
    ['Benjamin', 'Valles'], ['Branson', 'Pfiester'], ['Erika', 'Rigby'], ['Evan', 'Klein'],
    ['Grady', 'Swanson'], ['Greyson', 'Walker'], ['Gus', 'Castillo'], ['Jacob', 'Kuchinsky'],
    ['Maxime', 'Auvray'], ['Reece', 'Knight'], ['Ross', 'Margraves'], ['Vera', 'Li'],
    ['Zayen', 'Szpitalak']
  ];

  const students = [];
  let studentId = 1;

  allStudents.forEach(([firstName, lastName]) => {
    const fullName = `${firstName} ${lastName}`;
    const isHonors = honorsStudents.has(firstName) || honorsStudents.has(fullName);
    
    students.push({
      id: studentId++,
      firstName: firstName,
      lastName: lastName,
      fullName: fullName,
      school: 'Alpha High School',
      status: isHonors ? 'Honors' : 'Active',
      honors: isHonors,
      points: isHonors ? Math.floor(Math.random() * 500) + 500 : Math.floor(Math.random() * 400) + 100,
      lastActivity: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
    });
  });

  // Sort by honors first, then by points
  students.sort((a, b) => {
    if (a.honors && !b.honors) return -1;
    if (!a.honors && b.honors) return 1;
    return b.points - a.points;
  });

  return students;
}

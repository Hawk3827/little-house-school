const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const databaseUrl = process.env.DATABASE_URL || '';
const isPostgres = databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://');

let prisma;
let pool;

if (isPostgres) {
  const { PrismaPg } = require('@prisma/adapter-pg');
  const { Pool } = require('pg');
  pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const adapter = new PrismaBetterSqlite3({
    url: databaseUrl || 'file:./dev.db',
  });
  prisma = new PrismaClient({ adapter });
}

async function main() {
  console.log('Seeding database...');

  // Clear existing data (in order of dependencies)
  await prisma.message.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.galleryItem.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.studentParent.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);
  const parentPassword = await bcrypt.hash('parent123', 10);

  // 1. Create Admins
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@school.com',
      password: adminPassword,
      role: 'ADMIN',
      profile: {
        create: {
          name: 'Haobam Chanu Ranjana',
          phone: '+1-555-0100',
          address: '100 School Lane, Education City',
        },
      },
    },
    include: { profile: true },
  });
  console.log('Created Admin:', adminUser.email);

  // 2. Create Teachers
  const teacher1 = await prisma.user.create({
    data: {
      email: 'teacher1@school.com',
      password: teacherPassword,
      role: 'TEACHER',
      profile: {
        create: {
          name: 'Sarah Jenkins',
          phone: '+1-555-0101',
          address: '12 Rosewood Ave, Education City',
        },
      },
    },
    include: { profile: true },
  });

  const teacher2 = await prisma.user.create({
    data: {
      email: 'teacher2@school.com',
      password: teacherPassword,
      role: 'TEACHER',
      profile: {
        create: {
          name: 'Michael Chang',
          phone: '+1-555-0102',
          address: '45 Pine Dr, Education City',
        },
      },
    },
    include: { profile: true },
  });
  console.log('Created Teachers:', teacher1.email, teacher2.email);

  // 3. Create Classes
  const class10A = await prisma.class.create({
    data: {
      name: 'Grade 10-A',
      description: 'Sophomore Class - Homeroom Teacher: Sarah Jenkins',
      teacherId: teacher1.id,
    },
  });

  const class11B = await prisma.class.create({
    data: {
      name: 'Grade 11-B',
      description: 'Junior Class - Homeroom Teacher: Michael Chang',
      teacherId: teacher2.id,
    },
  });
  console.log('Created Classes:', class10A.name, class11B.name);

  // Helper for generating users & profiles
  const createStudentAndParent = async ({
    studentEmail,
    studentName,
    parentEmail,
    parentName,
    targetClass,
  }) => {
    const sUser = await prisma.user.create({
      data: {
        email: studentEmail,
        password: studentPassword,
        role: 'STUDENT',
        profile: {
          create: {
            name: studentName,
            phone: '+1-555-0200',
            address: 'Student Ave, Education City',
          },
        },
      },
      include: { profile: true },
    });

    const pUser = await prisma.user.create({
      data: {
        email: parentEmail,
        password: parentPassword,
        role: 'PARENT',
        profile: {
          create: {
            name: parentName,
            phone: '+1-555-0300',
            address: 'Parent St, Education City',
          },
        },
      },
      include: { profile: true },
    });

    // Link enrollment
    await prisma.enrollment.create({
      data: {
        studentId: sUser.id,
        classId: targetClass.id,
      },
    });

    // Link Parent to Student
    await prisma.studentParent.create({
      data: {
        studentId: sUser.id,
        parentId: pUser.id,
      },
    });

    return { student: sUser, parent: pUser };
  };

  const pair1 = await createStudentAndParent({
    studentEmail: 'student1@school.com',
    studentName: 'Alice Cooper',
    parentEmail: 'parent1@school.com',
    parentName: 'Robert Cooper',
    targetClass: class10A,
  });

  const pair2 = await createStudentAndParent({
    studentEmail: 'student2@school.com',
    studentName: 'Bobby Smith',
    parentEmail: 'parent2@school.com',
    parentName: 'Linda Smith',
    targetClass: class10A,
  });

  const pair3 = await createStudentAndParent({
    studentEmail: 'student3@school.com',
    studentName: 'Charlie Brown',
    parentEmail: 'parent3@school.com',
    parentName: 'Sally Brown',
    targetClass: class11B,
  });

  const pair4 = await createStudentAndParent({
    studentEmail: 'student4@school.com',
    studentName: 'Diana Prince',
    parentEmail: 'parent4@school.com',
    parentName: 'Hippolyta Prince',
    targetClass: class11B,
  });
  console.log('Created Students & Parents pairs');

  // 4. Create Attendance records (past 5 days)
  const students = [pair1.student, pair2.student, pair3.student, pair4.student];
  const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE'];
  
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    for (const student of students) {
      // Teacher 1 marks Grade 10-A, Teacher 2 marks Grade 11-B
      const isClass10A = student.email === 'student1@school.com' || student.email === 'student2@school.com';
      const markerId = isClass10A ? teacher1.id : teacher2.id;
      
      // Random-ish status leaning PRESENT
      const statusIdx = (student.profile.name.length + i) % statuses.length;
      const status = statuses[statusIdx];

      await prisma.attendance.create({
        data: {
          studentId: student.id,
          date: date,
          status: status,
          markedById: markerId,
        },
      });
    }
  }
  console.log('Created Attendance records');

  // 5. Create Grades
  const subjects = ['Mathematics', 'Science', 'English Literature', 'History'];
  for (const student of students) {
    const isClass10A = student.email === 'student1@school.com' || student.email === 'student2@school.com';
    const gradingTeacherId = isClass10A ? teacher1.id : teacher2.id;

    for (const subject of subjects) {
      // Seed a couple of tests for each subject
      await prisma.grade.create({
        data: {
          studentId: student.id,
          subject: subject,
          score: 75 + Math.floor(Math.random() * 21), // 75 to 95
          maxScore: 100,
          assessmentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
          remarks: 'Good effort, showing consistent understanding.',
          teacherId: gradingTeacherId,
        },
      });

      await prisma.grade.create({
        data: {
          studentId: student.id,
          subject: subject,
          score: 80 + Math.floor(Math.random() * 19), // 80 to 98
          maxScore: 100,
          assessmentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          remarks: 'Excellent work in exams!',
          teacherId: gradingTeacherId,
        },
      });
    }
  }
  console.log('Created Grades');

  // 6. Create Announcements
  await prisma.announcement.create({
    data: {
      title: 'Welcome to the New Academic Year!',
      content: 'We are thrilled to welcome all new and returning students back to school. Let\'s make this year productive, engaging, and memorable. Remember to review our calendar for key dates and events.',
      audience: 'ALL',
      createdById: adminUser.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Annual Sports Meet Next Month',
      content: 'Preparations have begun for our Annual Sports Meet. Registrations for track and field events are open starting this Wednesday. Please contact the PE teacher for sign-up sheets.',
      audience: 'ALL',
      createdById: adminUser.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Midterm Exam Preparation Resources',
      content: 'Midterm exams are starting in two weeks. Study guides and practice papers have been uploaded. Teachers will host extra review sessions during study hall this week.',
      audience: 'STUDENTS',
      createdById: teacher1.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Parent-Teacher Conferences (PTC)',
      content: 'Our first PTC of the term will be held this Saturday. Please log in to book a time slot with your child\'s homeroom teacher. Your participation is vital to your child\'s academic growth.',
      audience: 'PARENTS',
      createdById: adminUser.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'History Assignment Deadline Extended',
      content: 'Hello class, the submission deadline for the History of Modern Europe project has been extended to Friday. Make sure to cite all sources properly.',
      audience: 'STUDENTS',
      classId: class10A.id,
      createdById: teacher1.id,
    },
  });
  console.log('Created Announcements');

  // 7. Create Gallery Items
  const galleryPhotos = [
    {
      title: 'Annual Science Fair',
      imageUrl: '/images/gallery/science-fair.jpg',
      description: 'Students presenting their innovative physics and chemistry experiments at the annual science exhibit.',
    },
    {
      title: 'Soccer Championship Victory',
      imageUrl: '/images/gallery/soccer.jpg',
      description: 'Our varsity school team celebrating their first place victory in the regional tournament.',
    },
    {
      title: 'Winter Music Concert',
      imageUrl: '/images/gallery/concert.jpg',
      description: 'The school choir and orchestra delivering a brilliant performance during the holidays.',
    },
    {
      title: 'Creative Art Exhibition',
      imageUrl: '/images/gallery/art-expo.jpg',
      description: 'A vibrant showcase of paintings, sculptures, and mixed media created by our fine arts students.',
    },
  ];

  for (const item of galleryPhotos) {
    await prisma.galleryItem.create({
      data: item,
    });
  }
  console.log('Created Gallery Items');

  // Seed Calendar Events
  const events = [
    {
      title: 'First Term Midterm Exams',
      description: 'Midterm assessments for grades 10 and 11. Schedules will be posted in portals.',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // in 5 days
      type: 'EXAM',
    },
    {
      title: 'Parent-Teacher Meeting',
      description: 'Mandatory discussion regarding first-term academic progression.',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8), // in 8 days
      type: 'MEETING',
    },
    {
      title: 'Annual Sports Day',
      description: 'Track and field events at the school main arena.',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12), // in 12 days
      type: 'SPORTS',
    },
    {
      title: 'Winter break holidays',
      description: 'School closed for winter breaks. Reopens on January 6th.',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20), // in 20 days
      type: 'HOLIDAY',
    },
  ];
  for (const ev of events) {
    await prisma.event.create({ data: ev });
  }
  console.log('Created Calendar Events');

  // Seed Messaging Threads
  await prisma.message.create({
    data: {
      senderId: pair1.parent.id,
      receiverId: teacher1.id,
      content: 'Hello Ms. Jenkins, I noticed Alice had a slight drop in her last math test. Is there any specific area she should focus on?',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    },
  });

  await prisma.message.create({
    data: {
      senderId: teacher1.id,
      receiverId: pair1.parent.id,
      content: 'Hello Robert! Alice is doing well, but she struggled slightly with quadratic equations on this test. I have given her some review sheets she can practice at home.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      read: true,
    },
  });

  await prisma.message.create({
    data: {
      senderId: pair1.parent.id,
      receiverId: teacher1.id,
      content: 'Thank you! I will review the sheets with her tonight.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    },
  });
  console.log('Created Sample Messaging threads');

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    if (pool) {
      await pool.end();
    }
  });

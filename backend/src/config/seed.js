require('dotenv').config();

const bcrypt = require('bcryptjs');
const connectDB = require('./db');

const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Settings = require('../models/Settings');

const seedUsers = async () => {
  const count = await User.countDocuments();
  if (count > 0) {
    console.log('Users already exist. Skipping users seed.');
    return await User.find();
  }

  const usersToCreate = [
    {
      name: 'System Admin',
      email: 'admin@vcc.com',
      password: 'Admin@123',
      role: 'admin',
    },
    {
      name: 'Faculty One',
      email: 'faculty@vcc.com',
      password: 'Faculty@123',
      role: 'faculty',
    },
    {
      name: 'Student One',
      email: 'student@vcc.com',
      password: 'Student@123',
      role: 'student',
    },
  ];

  const usersWithHashes = await Promise.all(
    usersToCreate.map(async (user) => ({
      name: user.name,
      email: user.email,
      passwordHash: await bcrypt.hash(user.password, 10),
      role: user.role,
      isActive: true,
    }))
  );

  const createdUsers = await User.insertMany(usersWithHashes);
  console.log('Seeded 3 users.');
  return createdUsers;
};

const seedCourses = async (facultyId) => {
  const count = await Course.countDocuments();
  if (count > 0) {
    console.log('Courses already exist. Skipping courses seed.');
    return await Course.find();
  }

  const coursesToCreate = [
    {
      title: 'Introduction to Programming',
      details: 'Basics of programming with JavaScript.',
      semester: 'Spring 2026',
      enrollStatus: 'Open',
      facultyId,
    },
    {
      title: 'Database Systems',
      details: 'Relational and NoSQL database concepts.',
      semester: 'Spring 2026',
      enrollStatus: 'Open',
      facultyId,
    },
    {
      title: 'Web Development',
      details: 'Frontend and backend web fundamentals.',
      semester: 'Spring 2026',
      enrollStatus: 'Waitlisted',
      facultyId,
    },
    {
      title: 'Data Structures',
      details: 'Core data structures and complexity.',
      semester: 'Fall 2026',
      enrollStatus: 'Closed',
      facultyId,
    },
    {
      title: 'Cloud Fundamentals',
      details: 'Cloud computing and deployment basics.',
      semester: 'Fall 2026',
      enrollStatus: 'Open',
      facultyId,
    },
  ];

  const createdCourses = await Course.insertMany(coursesToCreate);
  console.log('Seeded 5 courses.');
  return createdCourses;
};

const seedEnrollments = async (studentId, courses) => {
  const count = await Enrollment.countDocuments();
  if (count > 0) {
    console.log('Enrollments already exist. Skipping enrollments seed.');
    return;
  }

  if (!studentId) {
    console.log('No student found. Skipping enrollments seed.');
    return;
  }

  if (!Array.isArray(courses) || courses.length < 2) {
    console.log('Not enough courses found. Skipping enrollments seed.');
    return;
  }

  const enrollmentsToCreate = [
    {
      studentId,
      courseId: courses[0]._id,
      enrolledAt: new Date(),
      status: 'active',
      droppedAt: null,
    },
    {
      studentId,
      courseId: courses[1]._id,
      enrolledAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'dropped',
      droppedAt: new Date(),
    },
  ];

  await Enrollment.insertMany(enrollmentsToCreate);
  console.log('Seeded 2 enrollments.');
};

const seedSettings = async () => {
  const count = await Settings.countDocuments();
  if (count > 0) {
    console.log('Settings already exist. Skipping settings seed.');
    return;
  }

  await Settings.create({
    _id: Settings.SETTINGS_ID,
    allowSelfEnrollment: true,
    maintenanceMode: false,
    maxEnrollment: 50,
    activeSemesters: ['Spring 2026', 'Fall 2026'],
    updatedAt: new Date(),
  });

  console.log('Seeded 1 settings document.');
};

const seedDatabase = async () => {
  try {
    const users = await seedUsers();
    const faculty = users.find((user) => user.role === 'faculty') || (await User.findOne({ role: 'faculty' }));
    const student = users.find((user) => user.role === 'student') || (await User.findOne({ role: 'student' }));

    const courses = await seedCourses(faculty ? faculty._id : null);
    await seedEnrollments(student ? student._id : null, courses);
    await seedSettings();

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Seeding failed:', error.message);
    throw error;
  }
};

const runSeed = async () => {
  try {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

if (require.main === module) {
  runSeed();
}

module.exports = {
  seedDatabase,
};

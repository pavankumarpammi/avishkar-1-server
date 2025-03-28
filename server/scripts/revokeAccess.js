import mongoose from 'mongoose';
import { Course } from '../models/course.model.js';
import { CoursePurchase } from '../models/coursePurchase.model.js';
import { AccessRequest } from '../models/accessRequest.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv with the correct path
dotenv.config({ path: path.join(__dirname, '../.env') });

const revokeAccess = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get all paid courses
    const paidCourses = await Course.find({ coursePrice: { $gt: 0 } });
    console.log(`Found ${paidCourses.length} paid courses`);

    // For each paid course
    for (const course of paidCourses) {
      console.log(`Processing course: ${course.courseTitle}`);

      // Remove all students from enrolledStudents array
      const enrolledCount = course.enrolledStudents.length;
      course.enrolledStudents = [];
      await course.save();
      console.log(`Removed ${enrolledCount} students from course enrollment`);

      // Delete all completed purchases for this course
      const purchaseResult = await CoursePurchase.deleteMany({
        courseId: course._id,
        status: 'completed'
      });
      console.log(`Deleted ${purchaseResult.deletedCount} purchase records`);

      // Delete all approved access requests for this course
      const accessResult = await AccessRequest.deleteMany({
        courseId: course._id,
        status: 'approved'
      });
      console.log(`Deleted ${accessResult.deletedCount} access requests`);
    }

    console.log('Successfully revoked access to all paid courses');
    process.exit(0);
  } catch (error) {
    console.error('Error revoking access:', error);
    process.exit(1);
  }
};

revokeAccess(); 
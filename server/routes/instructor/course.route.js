import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import isAuthenticated from '../../middlewares/isAuthenticated.js';
import isAdmin from '../../middlewares/isAdmin.js';
import { uploadMedia } from '../../utils/cloudinary.js';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file) {
      cb(null, true);
      return;
    }
    
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed!'), false);
      return;
    }

    cb(null, true);
  }
});

// Get all courses for the instructor
router.get('/courses', isAuthenticated, async (req, res) => {
  try {
    const instructorId = req.user._id;
    console.log('Fetching courses for instructor:', instructorId);
    
    const Course = mongoose.model('Course');
    const courses = await Course.find({ creator: instructorId })
      .populate('enrolledStudents', 'name email')
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      courses: courses || []
    });
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch courses: ' + error.message
    });
  }
});

// Create a new course
router.post('/courses', isAuthenticated, upload.single('thumbnail'), async (req, res) => {
  try {
    const { courseTitle, subtitle, description, category, level, price, lectures } = req.body;
    
    if (!courseTitle || !category || !level) {
      return res.status(400).json({
        success: false,
        message: 'Course title, category, and level are required'
      });
    }
    
    const Course = mongoose.model('Course');
    
    let thumbnailUrl = null;
    if (req.file) {
      try {
        console.log('Uploading new thumbnail file to Cloudinary');
        // Convert buffer to base64 for Cloudinary
        const fileBuffer = req.file.buffer;
        const base64String = fileBuffer.toString('base64');
        const base64File = `data:${req.file.mimetype};base64,${base64String}`;
        
        // Call uploadMedia with the correct format
        const uploadResult = await uploadMedia(base64File);
        
        if (!uploadResult) {
          throw new Error('Upload failed - no result returned from Cloudinary');
        }
        
        console.log('Cloudinary upload complete:', uploadResult);
        
        if (uploadResult.url) {
          thumbnailUrl = uploadResult.url;
          console.log('New thumbnail URL from file upload:', thumbnailUrl);
        } else {
          throw new Error('No URL returned from Cloudinary upload');
        }
      } catch (uploadError) {
        console.error('Error uploading thumbnail:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload course thumbnail: ' + uploadError.message
        });
      }
    }
    
    // Parse lectures if they exist
    let parsedLectures = [];
    if (lectures) {
      try {
        parsedLectures = JSON.parse(lectures);
        // Transform lecture data to match schema
        parsedLectures = parsedLectures.map((lecture, index) => ({
          title: lecture.lectureTitle,
          description: lecture.lectureDescription || lecture.lectureTitle,
          videoUrl: lecture.videoUrl,
          order: index
        }));
      } catch (error) {
        console.error('Error parsing lectures:', error);
      }
    }
    
    const newCourse = new Course({
      courseTitle,
      subTitle: subtitle,
      description,
      category,
      courseLevel: level,
      coursePrice: price || 0,
      courseThumbnail: thumbnailUrl,
      creator: req.user._id,
      isPublished: false,
      status: 'draft',
      enrolledStudents: [],
      lectures: parsedLectures
    });
    
    await newCourse.save();
    
    return res.status(201).json({
      success: true,
      course: newCourse
    });
  } catch (error) {
    console.error('Error creating course:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create course: ' + error.message
    });
  }
});

// Get a single course
router.get('/courses/:courseId', isAuthenticated, async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user._id;
    
    const Course = mongoose.model('Course');
    const course = await Course.findOne({ _id: courseId, creator: instructorId })
      .populate('enrolledStudents', 'name email')
      .populate('creator', 'name email');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch course: ' + error.message
    });
  }
});

// Update a course
router.put('/courses/:courseId', isAuthenticated, upload.single('thumbnail'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { courseTitle, subtitle, description, category, level, price, courseThumbnailUrl, lectures } = req.body;
    
    console.log('Update course request body:', {
      courseId,
      hasFile: !!req.file,
      hasThumbnailUrl: !!courseThumbnailUrl,
      fileDetails: req.file ? { 
        mimetype: req.file.mimetype,
        size: req.file.size 
      } : 'No file uploaded'
    });
    
    const Course = mongoose.model('Course');
    const course = await Course.findOne({ _id: courseId, creator: req.user._id });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    console.log('Current thumbnail URL in database:', course.courseThumbnail);
    
    let thumbnailUrl = course.courseThumbnail;
    let thumbnailUpdated = false;
    
    // Handle file upload if a new file is provided
    if (req.file) {
      try {
        console.log('Uploading new thumbnail file to Cloudinary');
        // Convert buffer to base64 for Cloudinary
        const fileBuffer = req.file.buffer;
        const base64String = fileBuffer.toString('base64');
        const base64File = `data:${req.file.mimetype};base64,${base64String}`;
        
        // Call uploadMedia with the correct format
        const uploadResult = await uploadMedia(base64File);
        
        if (!uploadResult) {
          throw new Error('Upload failed - no result returned from Cloudinary');
        }
        
        console.log('Cloudinary upload complete:', uploadResult);
        
        if (uploadResult.url) {
          thumbnailUrl = uploadResult.url;
          thumbnailUpdated = true;
          console.log('New thumbnail URL from file upload:', thumbnailUrl);
        } else {
          throw new Error('No URL returned from Cloudinary upload');
        }
      } catch (uploadError) {
        console.error('Error uploading thumbnail:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload course thumbnail: ' + uploadError.message
        });
      }
    } 
    // Handle URL update if passed in the request body
    else if (courseThumbnailUrl) {
      console.log('Updating thumbnail with URL:', courseThumbnailUrl);
      thumbnailUrl = courseThumbnailUrl;
      thumbnailUpdated = true;
    }
    
    // Handle lectures update if provided
    let updatedLectures = course.lectures;
    if (lectures) {
      try {
        // Parse lectures JSON string
        console.log('Lectures data type:', typeof lectures);
        const parsedLectures = typeof lectures === 'string' ? JSON.parse(lectures) : lectures;
        console.log('Parsed lectures sample:', parsedLectures.length > 0 ? parsedLectures[0] : 'No lectures');
        updatedLectures = parsedLectures;
      } catch (error) {
        console.error('Error parsing lectures:', error);
        return res.status(400).json({
          success: false,
          message: 'Invalid lectures data format: ' + error.message
        });
      }
    }
    
    // Update course fields
    const updateFields = {
      ...(courseTitle && { courseTitle }),
      ...(subtitle !== undefined && { subTitle: subtitle }),
      ...(description !== undefined && { description }),
      ...(category && { category }),
      ...(level && { courseLevel: level }),
      ...(price !== undefined && { coursePrice: price }),
      ...(thumbnailUrl && { courseThumbnail: thumbnailUrl }),
      ...(updatedLectures && { lectures: updatedLectures })
    };

    console.log('Updating course with fields:', {
      ...updateFields,
      hasThumbnail: !!thumbnailUrl,
      thumbnailUpdated
    });

    // Update the course with the new fields
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $set: updateFields },
      { new: true }
    ).populate('creator', 'name email');
    
    console.log('Course updated successfully:', {
      id: updatedCourse._id,
      title: updatedCourse.courseTitle,
      thumbnail: updatedCourse.courseThumbnail,
      thumbnailUpdated
    });
    
    // Alert about database updates
    console.log('DATABASE UPDATE - Course ID: ' + courseId, {
      previousThumbnail: course.courseThumbnail,
      newThumbnail: updatedCourse.courseThumbnail,
      wasUpdated: thumbnailUpdated,
      fieldUpdated: thumbnailUpdated ? 'thumbnail' : 'other fields'
    });
    
    let message = 'Course updated successfully';
    if (thumbnailUpdated) {
      message += '. Thumbnail has been updated.';
    }
    
    return res.status(200).json({
      success: true,
      course: updatedCourse,
      message,
      thumbnailUpdated,
      thumbnailUrl: updatedCourse.courseThumbnail // Explicitly include the thumbnail URL
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update course: ' + error.message
    });
  }
});

// Delete a course
router.delete('/courses/:courseId', isAuthenticated, async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user._id;
    
    const Course = mongoose.model('Course');
    
    // Find the course and verify ownership
    const course = await Course.findOne({ _id: courseId, creator: instructorId });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission to delete it'
      });
    }
    
    // Delete the course
    await Course.deleteOne({ _id: courseId });
    
    return res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete course: ' + error.message
    });
  }
});

// Publish/Unpublish a course
router.put('/courses/:courseId/publish', isAuthenticated, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status } = req.body;
    
    const Course = mongoose.model('Course');
    const course = await Course.findOne({ _id: courseId, creator: req.user._id });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Validate if lectures exist before publishing
    if (status === "true" && (!course.lectures || course.lectures.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Please add at least one lecture before publishing the course"
      });
    }
    
    course.isPublished = status === "true";
    course.status = status === "true" ? "active" : "draft";
    
    await course.save();
    
    return res.status(200).json({
      success: true,
      message: status === "true" ? 'Course published successfully' : 'Course unpublished successfully',
      course
    });
  } catch (error) {
    console.error('Error updating course publish status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update course publish status: ' + error.message
    });
  }
});

// Update course lectures
router.put('/:courseId/lectures', isAuthenticated, async (req, res) => {
  try {
    const { lectures } = req.body;
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify instructor owns the course
    if (course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    // Update lectures
    course.lectures = lectures;
    await course.save();

    res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    console.error('Error updating course lectures:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course lectures'
    });
  }
});

export default router; 
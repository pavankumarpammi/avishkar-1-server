import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetCourseDetailWithStatusQuery, useEnrollFreeCourseMutation } from "@/features/api/purchaseApi";
import { Lock, PlayCircle, Loader2, Star, Clock, Award, Users, BookOpen, Calendar, MessageCircle, LockKeyhole } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock testimonials - replace with real data when available
const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    comment: "This course transformed my understanding of the subject. The instructor explains complex concepts in a simple way that anyone can understand.",
    date: "2023-10-15"
  },
  {
    id: 2,
    name: "Michael Chen",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 4,
    comment: "Great content and well-structured modules. I'd recommend this course to anyone looking to master this topic quickly.",
    date: "2023-11-22"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    avatar: "https://randomuser.me/api/portraits/women/63.jpg",
    rating: 5,
    comment: "The practical exercises were incredibly helpful. I feel confident applying these skills in real-world scenarios now.",
    date: "2024-01-05"
  }
];

const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useGetCourseDetailWithStatusQuery(courseId, {
    refetchOnMountOrArgChange: true
  });
  
  // Get current user from Redux state
  const user = useSelector(state => state.auth.user);
  const [hasAccess, setHasAccess] = useState(false);
  const [enrollFreeCourse, { isLoading: isEnrolling }] = useEnrollFreeCourseMutation();
  const [requestStatus, setRequestStatus] = useState('none'); // 'none', 'pending', 'approved'

  useEffect(() => {
    const loadCourseData = async () => {
      console.log("CourseDetail - Fetching course data...");
      await refetch();
      console.log("CourseDetail - Fetched data:", data);
    };
    
    loadCourseData();
    
    // Only poll if user doesn't have access yet
    let intervalId;
    if (!hasAccess) {
      intervalId = setInterval(() => {
        refetch();
      }, 5000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [refetch, hasAccess]);

  // Update the useEffect to handle approval and access state
  useEffect(() => {
    if (data?.course) {
      // Check if user has purchased the course
      const purchasedFromAPI = data.purchased || false;
      
      // Check if user is enrolled in the course
      const isUserEnrolled = data.course.enrolledStudents?.some(
        student => student._id === user?._id
      );
      
      // Check if user has an approved access request
      const hasApprovedRequest = data.accessRequest?.status === 'approved';
      
      // Calculate access based on all conditions
      const hasAccess = purchasedFromAPI || isUserEnrolled || hasApprovedRequest;
      
      console.log("Access calculation:", {
        purchasedFromAPI,
        isUserEnrolled,
        hasApprovedRequest,
        hasAccess,
        requestStatus: data.accessRequest?.status
      });
      
      setHasAccess(hasAccess);
      setRequestStatus(data.accessRequest?.status || 'none');

      // Handle automatic redirect on approval
      if (data.accessRequest?.status === 'approved') {
        toast.success('Access request approved! You can now start the course.');
      }
    }
  }, [data, user?._id]);

  useEffect(() => {
    if (data) {
      console.log("Course purchase status from API:", data.purchased);
      console.log("Calculated access status:", hasAccess);
      console.log("Access request status:", data.accessRequest?.status);
    }
  }, [data, hasAccess]);

  // Function to refresh data and recalculate access
  const refreshAccessStatus = async () => {
    await refetch();
  };

  // Check if course is free - more comprehensive check
  const isFree = data?.course?.coursePrice === 0 || 
                data?.course?.coursePrice === null || 
                data?.course?.coursePrice === undefined ||
                data?.course?.coursePrice === "" ||
                data?.course?.coursePrice === "0" ||
                String(data?.course?.coursePrice).toLowerCase() === "free";

  // Handle enrolling in a free course
  const handleEnrollFreeCourse = async () => {
    try {
      console.log("Enrolling in free course:", courseId);
      console.log("Course data:", data?.course);
      
      const response = await enrollFreeCourse(courseId).unwrap();
      
      if (response.success) {
        toast.success("Successfully enrolled in the course!");
        await refetch();
        // After successful enrollment, navigate to the course progress page
        navigate(`/course-progress/${courseId}`);
      }
    } catch (error) {
      console.error("Error enrolling in free course:", error);
      toast.error("You don't have access to this course yet");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-semibold">Loading course details...</h2>
          <p className="text-gray-500">Please wait</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white">
        <div className="text-center space-y-4 max-w-md p-6 rounded-lg shadow-md bg-white">
          <h2 className="text-2xl font-semibold text-red-600">Error</h2>
          <p className="text-gray-700">{error?.data?.message || "Failed to load course details"}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!data?.course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center space-y-4 max-w-md p-6 rounded-lg shadow-md bg-white">
          <h2 className="text-2xl font-semibold">Course Not Found</h2>
          <p className="text-gray-500">The course you&apos;re looking for doesn&apos;t exist</p>
          <Button onClick={() => navigate("/")}>Go to Homepage</Button>
        </div>
      </div>
    );
  }

  const { course } = data;
  
  const handleContinueCourse = () => {
    if (hasAccess) {
      console.log("Navigating to course progress:", courseId);
      navigate(`/course-progress/${courseId}`);
    } else {
      toast.error("You don't have access to this course yet");
    }
  }

  // Format the course creation date
  const formattedDate = new Date(course.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate average rating - replace with actual data when available
  const avgRating = 4.7;

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 flex flex-col gap-4">
          <div className="flex items-center space-x-2">
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">FEATURED</Badge>
            {course.skillLevel && (
              <Badge className="bg-blue-400 hover:bg-blue-500">{course.skillLevel}</Badge>
            )}
          </div>
          
          <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl">
            {course.courseTitle}
          </h1>
          
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl">
            {course.subTitle || "No subtitle available"}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <div className="flex items-center">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(avgRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 font-medium">{avgRating}</span>
            </div>
            
            <div className="flex items-center gap-1 text-blue-100">
              <Users size={18} />
              <span>{course.enrolledStudents?.length || 0} students enrolled</span>
            </div>
            
            <div className="flex items-center gap-1 text-blue-100">
              <Calendar size={18} />
              <span>Last updated: {formattedDate}</span>
            </div>
          </div>
          
          {/* Instructor information */}
          <div className="flex items-center gap-4 mt-4">
            <Avatar className="h-12 w-12 border-2 border-white">
              <AvatarImage src={course.creator?.photoUrl} alt={course.creator?.name} />
              <AvatarFallback className="bg-blue-500 text-white">
                {course.creator?.name?.charAt(0) || "I"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{course.creator?.name}</p>
              <p className="text-sm text-blue-100">Course Instructor</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Course Content */}
          <div className="w-full lg:w-2/3 space-y-8">
            {/* Course Navigation */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="content" className="flex-1">Course Content</TabsTrigger>
                <TabsTrigger value="testimonials" className="flex-1">Testimonials</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 py-4">
                {/* Key Course Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {course.duration && (
                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                      <CardContent className="p-4 flex items-center space-x-4">
                        <Clock className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                          <p className="font-medium dark:text-gray-200">{course.duration}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <BookOpen className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Lectures</p>
                        <p className="font-medium dark:text-gray-200">{course.lectures?.length || 0} lessons</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <Award className="h-10 w-10 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Certification</p>
                        <p className="font-medium dark:text-gray-200">Certificate of Completion</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Course Description */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-gray-100">About This Course</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {course.description ? (
                      <div
                        className="prose max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: course.description }}
                      />
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No description available</p>
                    )}
                  </CardContent>
                </Card>
                
                {/* Learning Outcomes */}
                {course.learningOutcomes && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        What You&apos;ll Learn
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none dark:prose-invert">
                        {course.learningOutcomes}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Prerequisites */}
                {course.prerequisites && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-gray-100">Prerequisites</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none dark:prose-invert">
                        {course.prerequisites}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Course Content Tab */}
              <TabsContent value="content" className="space-y-4">
                <div className="space-y-4">
                  {course.lectures?.length > 0 ? (
                    course.lectures.map((lecture, idx) => (
                      <div 
                        key={idx}
                        className="p-4 border rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                            {lecture.isPreviewFree || hasAccess ? (
                              <PlayCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium dark:text-gray-200">{lecture.lectureTitle}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{lecture.lectureDescription || "No description available"}</p>
                          </div>
                          {(lecture.isPreviewFree || hasAccess) ? (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/course-progress/${courseId}/lecture/${lecture._id}`)}
                              className="dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                              {hasAccess ? "Start" : "Preview"}
                            </Button>
                          ) : (
                            <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50">
                              <Lock className="h-3 w-3 mr-1" />
                              Requires Approval
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500 dark:text-gray-400">No lectures available yet</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              {/* Testimonials Tab */}
              <TabsContent value="testimonials" className="space-y-6">
                <div className="grid gap-6">
                  {TESTIMONIALS.map((testimonial) => (
                    <Card key={testimonial.id} className="dark:bg-gray-800 dark:border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold dark:text-gray-200">{testimonial.name}</h4>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < testimonial.rating
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300 dark:text-gray-600"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">{testimonial.comment}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                              {new Date(testimonial.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Column - Course Card */}
          <div className="w-full lg:w-1/3 sticky top-4 self-start">
            <Card className="border shadow-lg rounded-lg overflow-hidden dark:bg-gray-800 dark:border-gray-700">
              {/* Course Thumbnail */}
              <div className="aspect-video w-full overflow-hidden">
                {course.courseThumbnail ? (
                  <img 
                    src={course.courseThumbnail} 
                    alt={course.courseTitle}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-white" />
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                {/* Price */}
                <div className="mb-6">
                  <h2 className="text-3xl font-bold dark:text-gray-100">
                    {isFree ? (
                      <span className="text-green-600 dark:text-green-400">Free</span>
                    ) : (
                      <>₹{course.coursePrice}</>
                    )}
                  </h2>
                </div>
                
                {/* Features List */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 dark:text-gray-200">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span>Full Lifetime Access</span>
                  </div>
                  <div className="flex items-center gap-3 dark:text-gray-200">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span>Join {course.enrolledStudents?.length || 0} Students</span>
                  </div>
                  {course.duration && (
                    <div className="flex items-center gap-3 dark:text-gray-200">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span>{course.duration}</span>
                    </div>
                  )}
                </div>
                
                {/* CTA Button */}
                <div className="space-y-3">
                  {hasAccess || requestStatus === 'approved' ? (
                    <Button 
                      onClick={handleContinueCourse} 
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-6"
                    >
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Start Course
                    </Button>
                  ) : requestStatus === 'pending' ? (
                    <Button
                      disabled
                      className="w-full bg-yellow-500 hover:bg-yellow-600 cursor-not-allowed opacity-80 text-lg py-6"
                    >
                      <Clock className="mr-2 h-5 w-5 animate-pulse" />
                      Waiting for Approval
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate(`/payment-request/${courseId}`)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg py-6"
                    >
                      <LockKeyhole className="mr-2 h-5 w-5" />
                      Request Access
                    </Button>
                  )}
                  
                  {/* Refresh Status Button */}
                  {!hasAccess && (
                    <Button 
                      variant="outline" 
                      className="w-full dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700" 
                      onClick={refreshAccessStatus}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M21 2v6h-6"></path>
                        <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                        <path d="M3 22v-6h6"></path>
                        <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                      </svg>
                      Refresh Status
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

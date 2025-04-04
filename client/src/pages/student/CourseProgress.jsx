import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";
import { CheckCircle, CheckCircle2, CirclePlay, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ReactPlayer from "react-player";
import PropTypes from "prop-types";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";

// Function to extract YouTube video ID without exposing the full URL
const getSecureVideoUrl = (youtubeUrl) => {
  try {
    // Extract ID from YouTube URLs
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
    const match = youtubeUrl.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    
    if (videoId) {
      // Return an embed URL (more secure than direct youtube.com links)
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }
    return null;
  } catch (error) {
    console.error("Error processing YouTube URL:", error);
    return null;
  }
};

const VideoPlayer = ({ url, onProgress, playerRef, autoPlay }) => {
  const secureUrl = getSecureVideoUrl(url);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [played, setPlayed] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Mobile detection helper function
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Handle play/pause
  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.getInternalPlayer().pauseVideo();
      } else {
        playerRef.current.getInternalPlayer().playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle seeking
  const handleSeek = (e) => {
    const time = e.target.value;
    setPlayed(time);
    if (playerRef.current) {
      playerRef.current.seekTo(time);
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
        
        // Mobile-specific styles
        if (isMobile()) {
          containerRef.current.style.position = 'fixed';
          containerRef.current.style.top = '0';
          containerRef.current.style.left = '0';
          containerRef.current.style.right = '0';
          containerRef.current.style.bottom = '0';
          containerRef.current.style.width = '100%';
          containerRef.current.style.height = '100%';
          containerRef.current.style.zIndex = '9999';
          containerRef.current.style.margin = '0';
          containerRef.current.style.padding = '0';
        }

        // Force landscape orientation on mobile
        if (window.screen.orientation && window.screen.orientation.lock) {
          await window.screen.orientation.lock('landscape');
        }
    } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        
        // Reset mobile-specific styles
        if (isMobile()) {
          containerRef.current.style.position = '';
          containerRef.current.style.top = '';
          containerRef.current.style.left = '';
          containerRef.current.style.right = '';
          containerRef.current.style.bottom = '';
          containerRef.current.style.width = '';
          containerRef.current.style.height = '';
          containerRef.current.style.zIndex = '';
          containerRef.current.style.margin = '';
          containerRef.current.style.padding = '';
        }

        // Unlock orientation
        if (window.screen.orientation && window.screen.orientation.unlock) {
          window.screen.orientation.unlock();
        }
      }
    } catch (error) {
      console.error('Error handling fullscreen:', error);
    }
  };

  // Handle minimize toggle
  const toggleMinimize = async () => {
    try {
      setIsMinimized(!isMinimized);
      
      if (!isMinimized) {
        // When minimizing
        if (window.screen.orientation && window.screen.orientation.lock) {
          await window.screen.orientation.lock('portrait');
        }
    } else {
        // When maximizing
        if (window.screen.orientation && window.screen.orientation.unlock) {
          window.screen.orientation.unlock();
        }
      }
    } catch (error) {
      console.error('Error handling minimize:', error);
    }
  };

  // Handle progress
  const handleProgress = (state) => {
    setPlayed(state.played);
    onProgress(state);
  };

  // Handle orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      if (window.screen.orientation) {
        if (isFullscreen && window.screen.orientation.type.includes('portrait')) {
          window.screen.orientation.lock('landscape')
            .catch(err => console.log('Orientation lock failed: ', err));
        }
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isFullscreen]);

  // Cleanup orientation lock when component unmounts
  useEffect(() => {
      return () => {
      if (window.screen.orientation && window.screen.orientation.unlock) {
        window.screen.orientation.unlock();
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`w-full aspect-video rounded-lg overflow-hidden bg-black relative transition-all duration-300 ${
        isMinimized ? 'fixed bottom-4 right-4 w-64 h-36 shadow-2xl z-[9999]' : ''
      } ${
        isFullscreen ? 'fixed inset-0 w-screen h-screen z-[9999]' : ''
      }`}
    >
      {/* Top section - 15% height, 100% black with secure portal text */}
      <div className="absolute top-0 left-0 w-full h-[15%] bg-black z-10 flex items-center justify-center">
        <div className="flex items-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="text-sm font-medium">Secure Video Portal</span>
        </div>
      </div>
      
      {/* Middle section - 70% height, transparent with click handler */}
      <div 
        className="absolute top-[15%] left-0 w-full h-[70%] bg-transparent z-10 cursor-pointer"
        onClick={handlePlayPause}
      >
        {/* Center play button */}
        {!isPlaying && (
          <button 
            onClick={handlePlayPause}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-4 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Bottom section - 15% height, 100% black with controls */}
      <div className="absolute bottom-0 left-0 w-full h-[15%] bg-black z-10">
        <div className="flex items-center justify-between px-4 h-full">
          {/* Play/Pause button */}
              <button 
            onClick={handlePlayPause}
            className="text-white hover:text-gray-300 transition-colors"
              >
                {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>
              
          {/* Timeline with gradient circle */}
          <div className="flex-1 mx-4">
            <div className="relative h-1 bg-gray-600 rounded-full">
              <div 
                className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-100"
                style={{ width: `${played * 100}%` }}
              />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={played}
                onChange={handleSeek}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg cursor-pointer transition-transform hover:scale-110"
                style={{ left: `${played * 100}%` }}
              />
              </div>
            </div>
            
          {/* Control buttons */}
          <div className="flex items-center gap-2">
              <button 
              onClick={isMinimized ? toggleMinimize : toggleFullscreen}
                className="text-white hover:text-gray-300 transition-colors"
            >
              {isMinimized ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                </svg>
              ) : isFullscreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                  </svg>
                ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                )}
              </button>
          </div>
        </div>
      </div>

        <ReactPlayer
          ref={playerRef}
          url={secureUrl}
          width="100%"
        height="100%"
          controls={false}
          playing={isPlaying}
          onProgress={handleProgress}
          config={{
            youtube: {
              playerVars: {
              rel: 0,
              modestbranding: 1,
              showinfo: 0,
              fs: 1,
              cc_load_policy: 0,
              iv_load_policy: 3,
              playsinline: 1,
            },
          },
          file: {
            attributes: {
              playsInline: true,
              style: {
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }
            }
          }
        }}
      />
    </div>
  );
};

// Add prop validation
VideoPlayer.propTypes = {
  url: PropTypes.string.isRequired,
  onProgress: PropTypes.func.isRequired,
  playerRef: PropTypes.object.isRequired,
  autoPlay: PropTypes.bool.isRequired
};

const CourseProgress = () => {
  const params = useParams();
  const courseId = params.courseId;
  const userId = params.userId;
  const navigate = useNavigate();
  
  // Get course access status to ensure the user has purchased the course
  const { data: courseAccessData, isLoading: accessLoading } = useGetCourseDetailWithStatusQuery(courseId);
  
  const playerRef = useRef(null);
  const { data, isLoading, refetch } = useGetCourseProgressQuery({userId, courseId});

  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [completeCourse, { data: markCompleteData, isSuccess: completedSuccess }] = useCompleteCourseMutation();
  const [inCompleteCourse, { data: markInCompleteData, isSuccess: inCompletedSuccess }] = useInCompleteCourseMutation();
  const [currentLecture, setCurrentLecture] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);

  // Security check - redirect to payment page if user doesn't have access
  useEffect(() => {
    if (!accessLoading && courseAccessData) {
      // Allow access if purchased, approved, or user is enrolled
      const hasAccess = courseAccessData.purchased === true || 
                       courseAccessData.status === 'approved' ||
                       courseAccessData.course?.enrolledStudents?.includes(courseAccessData.user?._id);
      
      if (!hasAccess) {
        toast.error("You need instructor approval to access this course content");
        navigate(`/payment-request/${courseId}`);
      }
    }
  }, [courseAccessData, accessLoading, courseId, navigate]);

  // Additional check for direct lecture URL access
  useEffect(() => {
    // If the course data is loaded and the path includes a lecture ID
    if (!accessLoading && courseAccessData && 
        !courseAccessData.purchased && 
        courseAccessData.status !== 'approved' && 
        !courseAccessData.course?.enrolledStudents?.includes(courseAccessData.user?._id) && 
        params.lectureId) {
      toast.error("Unauthorized access to course lecture");
      navigate(`/payment-request/${courseId}`);
    }
  }, [params.lectureId, accessLoading, courseAccessData, courseId, navigate]);

  useEffect(() => {
    if (completedSuccess) {
      refetch();
      toast.success(markCompleteData.message);
    }
    if (inCompletedSuccess) {
      refetch();
      toast.success(markInCompleteData.message);
    }
  }, [completedSuccess, inCompletedSuccess, markCompleteData, markInCompleteData, refetch]);

  // Disable right-click on the entire page when on the course progress route
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Show loading state when checking access
  if (accessLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2">Verifying course access...</p>
        </div>
      </div>
    );
  }

  // Skip rendering content if user has no access (will redirect in useEffect)
  if (!courseAccessData?.purchased && 
      courseAccessData?.status !== 'approved' && 
      !courseAccessData?.course?.enrolledStudents?.includes(courseAccessData?.user?._id)) {
    return null;
  }

  if (isLoading) return <p>Loading...</p>;

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle } = courseDetails;

  // initialize the first lecture if not exist
  const initialLecture = courseDetails.lectures && courseDetails.lectures[0];

  const isLectureCompleted = (lectureId) => {
    return progress.some((prog) => prog.lectureId === lectureId && prog.viewed);
  };

  const calculateProgress = () => {
    if (!courseDetails.lectures || courseDetails.lectures.length === 0) return 0;
    const completedLectures = courseDetails.lectures.filter(lecture => 
      isLectureCompleted(lecture._id)
    ).length;
    return Math.round((completedLectures / courseDetails.lectures.length) * 100);
  };

  const handleLectureProgress = async (lectureId, isCompleting = true) => {
    try {
      const response = await updateLectureProgress({
        courseId,
        lectureId,
        isCompleting
      }).unwrap();
      
      if (response) {
        await refetch();
        toast.success(isCompleting ? "Lecture marked as completed" : "Lecture marked as uncompleted");
      }
    } catch (error) {
      console.error('Error updating lecture progress:', error);
      toast.error(error.data?.message || "Failed to update lecture progress");
    }
  };

  // Handle select a specific lecture to watch
  const handleSelectLecture = (lecture) => {
    // Stop current video playback
    if (playerRef.current) {
      playerRef.current.seekTo(0);
    }
    
    setCurrentLecture(lecture);
    // Enable autoplay when selecting a lecture
    setAutoPlay(true);
  };

  const handleVideoProgress = (state) => {
    // If video is 95% complete, mark it as viewed
    if (state.played >= 0.95 && currentLecture) {
      const lectureId = currentLecture._id || initialLecture?._id;
      if (lectureId) {
        handleLectureProgress(lectureId, true);
      }
    }
  };

  const handleCompleteCourse = async () => {
    try {
      await completeCourse(courseId).unwrap();
    } catch (error) {
      console.error('Error completing course:', error);
      toast.error(error.data?.message || "Failed to update course status");
    }
  };

  const handleInCompleteCourse = async () => {
    try {
      await inCompleteCourse(courseId).unwrap();
    } catch (error) {
      console.error('Error marking course as incomplete:', error);
      toast.error(error.data?.message || "Failed to update course status");
    }
  };

  const progressPercentage = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Course Header - Lower z-index */}
      <div className="sticky top-0 z-[1] backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                {courseTitle}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>In Progress</span>
                </div>
                <span>•</span>
                <span>{progressPercentage}% Complete</span>
              </div>
            </div>
          <Button
            onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
            variant={completed ? "outline" : "default"}
              className="rounded-full px-6 shadow-sm hover:shadow-md transition-all"
          >
            {completed ? (
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" /> <span>Completed</span>
              </div>
            ) : (
              "Mark as completed"
            )}
          </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Video section - Higher z-index */}
          <div className="flex-1 lg:w-3/5 space-y-6 relative z-[2]">
            <div className="rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800">
              <VideoPlayer
            url={currentLecture?.youtubeUrl || initialLecture?.youtubeUrl}
            playerRef={playerRef}
            onProgress={handleVideoProgress}
            autoPlay={autoPlay}
          />
            </div>
            
            {/* Current Lecture Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full">
                      Lecture {currentLecture ? courseDetails.lectures.findIndex(lec => lec._id === currentLecture._id) + 1 : 1}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold">
                    {currentLecture?.lectureTitle || initialLecture?.lectureTitle}
            </h3>
                </div>
              <Button 
                variant="outline"
                onClick={() => handleLectureProgress(
                  currentLecture?._id || initialLecture?._id,
                  !isLectureCompleted(currentLecture?._id || initialLecture?._id)
                )}
                  className={`rounded-full px-6 shadow-sm hover:shadow-md transition-all ${
                    isLectureCompleted(currentLecture?._id || initialLecture?._id) 
                      ? "text-yellow-600 hover:text-yellow-700 border-yellow-200 hover:bg-yellow-50" 
                      : "text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                  }`}
              >
                {isLectureCompleted(currentLecture?._id || initialLecture?._id) ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Mark as Uncomplete
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

          {/* Lecture Sidebar - Lower z-index */}
          <div className="lg:w-2/5 relative z-[1]">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Course Lectures</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    {courseDetails?.lectures.length} Lectures
                  </Badge>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span>Overall Progress</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Lecture List */}
              <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
            {courseDetails?.lectures.map((lecture, index) => (
              <Card
                key={lecture._id}
                    className={`group cursor-pointer transition-all duration-200 ${
                  index === courseDetails.lectures.findIndex(lec => lec._id === currentLecture?._id)
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
                onClick={() => handleSelectLecture(lecture)}
              >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isLectureCompleted(lecture._id)
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        }`}>
                    {isLectureCompleted(lecture._id) ? (
                            <CheckCircle2 className="h-4 w-4" />
                    ) : (
                            <CirclePlay className="h-4 w-4" />
                    )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">
                        {lecture.lectureTitle}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Lecture {index + 1}
                          </p>
                    </div>
                        {index === courseDetails.lectures.findIndex(lec => lec._id === currentLecture?._id) && (
                          <Badge variant="secondary" className="rounded-full">
                            Playing
                    </Badge>
                  )}
                      </div>
                </CardContent>
              </Card>
            ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;


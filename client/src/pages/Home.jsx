import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGetPublishedCourseQuery } from '@/features/api/courseApi';
import { 
  ArrowRight, BookOpen, Sparkles, GraduationCap, 
  Users, Star, Globe, Zap, Lightbulb, CheckCircle2,
  RefreshCw, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CourseSkeleton from '@/components/CourseSkeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CompanyBanner from '@/components/CompanyBanner';

const Home = () => {
  const { data, isLoading, refetch } = useGetPublishedCourseQuery();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Track mouse position for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Define level badge styles with updated colors
  const levelStyles = {
    beginner: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100',
    intermediate: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100',
    advanced: 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100',
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden">
      {/* Refresh Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleRefresh}
              className="fixed top-4 right-4 z-50 rounded-full p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-5 w-5 text-purple-600 dark:text-purple-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Refresh content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-4 right-4 z-50 rounded-full p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ChevronUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Hero Section with Creative Effects */}
      <div className="relative">
        {/* Background Elements */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-950 z-0"
          style={{
            backgroundSize: '200% 200%',
            animation: 'gradientBG 15s ease infinite'
          }}
        ></div>
        
        {/* Floating shapes for visual interest */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div 
              key={i}
              className="absolute rounded-full bg-gradient-to-tr from-purple-400/10 to-amber-400/10 dark:from-purple-500/10 dark:to-amber-500/10"
              animate={{
                x: [(mousePosition.x / 100) * (i + 1), (mousePosition.x / 100) * (i + 1)],
                y: [(mousePosition.y / 100) * (i + 1), (mousePosition.y / 100) * (i + 1)],
                opacity: [0.6 - (scrollY * 0.0005), 0.6 - (scrollY * 0.0005)],
              }}
              transition={{ duration: 0.1 }}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 300 + 100}px`,
                height: `${Math.random() * 300 + 100}px`,
                filter: 'blur(40px)',
              }}
            ></motion.div>
          ))}
        </div>
        
        {/* Inverted Dots Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjwvc3ZnPg==')] bg-[length:20px_20px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjwvc3ZnPg==')] dark:bg-[length:20px_20px] dark:[mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)] text-gray-200 dark:text-gray-800"></div>
        
        {/* Hero Content */}
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 md:py-32 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left Column - Text Content */}
            <motion.div 
              className="lg:w-1/2 space-y-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="inline-block rounded-full px-3 py-1 bg-purple-100/80 dark:bg-purple-900/30 backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center">
                  <Zap className="h-3.5 w-3.5 mr-2 text-amber-500" />
                  Unleash your potential with expert-led courses
                </p>
              </motion.div>
              
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="relative">
                  <span className="relative z-10">Expand Your </span>
                  <motion.div 
                    className="absolute -bottom-2 left-0 right-0 h-3 bg-purple-200 dark:bg-purple-800/50 -rotate-1 z-0"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  ></motion.div>
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-amber-500 dark:from-purple-400 dark:to-amber-400">
                  Skills & Horizons
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Discover top-quality courses designed to help you master new skills and advance your career. 
                Join thousands of successful learners today!
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-4 pt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button asChild className="group relative overflow-hidden bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl h-auto">
                  <Link to="/courses" className="flex items-center">
                    <span className="relative z-10">Browse All Courses</span>
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-purple-500 group-hover:translate-x-full transition-transform duration-500 ease-out z-0"></span>
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-500 to-amber-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="border-gray-300 hover:border-gray-400 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 h-auto rounded-xl transition-all duration-300">
                  <Link to="/about">
                    Learn More
                  </Link>
                </Button>
              </motion.div>
              
              {/* Featured Stats */}
              <motion.div 
                className="grid grid-cols-3 gap-2 sm:gap-8 pt-6 border-t border-gray-100 dark:border-gray-800 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    <p className="text-xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 inline-block relative">
                      100+
                      <span className="absolute top-0 -right-2 h-2 w-2 bg-purple-500 rounded-full animate-ping"></span>
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Courses</p>
                </motion.div>
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <p className="text-xl sm:text-3xl font-bold text-amber-500 dark:text-amber-400">50K+</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Students</p>
                </motion.div>
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center justify-center">
                    <p className="text-xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">4.8</p>
                    <Star className="h-4 w-4 ml-1 text-amber-400 fill-amber-400" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Rating</p>
                </motion.div>
              </motion.div>
            </motion.div>
            
            {/* Right Column - Creative Visual Element */}
            <motion.div 
              className="lg:w-1/2 relative h-80 sm:h-96 mt-12 lg:mt-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* 3D Rotating Education Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="relative w-60 h-60 sm:w-80 sm:h-80"
                  animate={{
                    rotateY: mousePosition.x / 100,
                    rotateX: -mousePosition.y / 100,
                  }}
                  transition={{ duration: 0.1 }}
                >
                  {/* Animated Rings */}
                  <motion.div 
                    className="absolute inset-0 rounded-full border-4 border-dashed border-purple-200 dark:border-purple-800/40"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  ></motion.div>
                  <motion.div 
                    className="absolute inset-0 rounded-full border-4 border-dashed border-amber-200 dark:border-amber-800/40 scale-90"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  ></motion.div>
                  
                  {/* Glass-morphic Background */}
                  <motion.div 
                    className="absolute inset-0 mx-auto my-auto w-40 h-40 sm:w-56 sm:h-56 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg rounded-xl border border-white/20 dark:border-gray-800/20 shadow-lg flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="relative group">
                      <GraduationCap className="w-20 h-20 sm:w-24 sm:h-24 text-purple-600 dark:text-purple-400 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors duration-300" />
                      
                      {/* Particle effects */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {[...Array(8)].map((_, i) => (
                          <motion.div 
                            key={i}
                            className="absolute h-2 w-2 rounded-full bg-amber-500"
                            initial={{ x: 0, y: 0, opacity: 0 }}
                            animate={{ 
                              x: Math.cos(i * Math.PI / 4) * 50,
                              y: Math.sin(i * Math.PI / 4) * 50,
                              opacity: [0, 1, 0],
                            }}
                            transition={{ 
                              duration: 0.6,
                              delay: i * 0.1,
                              repeat: Infinity,
                              repeatDelay: 2,
                            }}
                          ></motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Feature Bubbles */}
                  {[
                    { icon: <Globe className="h-4 w-4" />, text: "Global Access", position: "top-0 -left-4" },
                    { icon: <Lightbulb className="h-4 w-4" />, text: "Expert Mentors", position: "top-10 -right-6" },
                    { icon: <CheckCircle2 className="h-4 w-4" />, text: "Certified", position: "bottom-10 -left-6" }
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      className={`absolute ${item.position} bg-white dark:bg-gray-800 shadow-md rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5`}
                      animate={{ 
                        y: [0, -10, 0],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    >
                      <span className="text-amber-500">{item.icon}</span>
                      {item.text}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto fill-white dark:fill-gray-950 translate-y-1">
            <path d="M0,288L48,272C96,256,192,224,288,218.7C384,213,480,235,576,234.7C672,235,768,213,864,213.3C960,213,1056,235,1152,229.3C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </motion.div>
      </div>
      
      {/* Featured Courses Section */}
      <motion.div 
        className="max-w-6xl mx-auto px-4 py-16 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative">
              <BookOpen className="h-7 w-7 text-purple-600 dark:text-purple-400" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-amber-500 rounded-full animate-ping"></span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Featured Courses
            </h2>
          </motion.div>
          
          <Button asChild variant="ghost" className="group text-purple-600 hover:text-purple-700 dark:text-purple-400 w-fit">
            <Link to="/courses" className="flex items-center">
              View All Courses
              <span className="relative ml-2">
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                <span className="absolute -right-1 top-1/2 h-4 w-4 -translate-y-1/2 bg-purple-100 dark:bg-purple-900/30 rounded-full -z-10 scale-0 group-hover:scale-100 transition-transform"></span>
              </span>
            </Link>
          </Button>
        </div>
        
        {/* Courses Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <CourseSkeleton key={index} />
            ))}
          </div>
        ) : !data?.courses?.length ? (
          <div className="text-center py-14 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
              <GraduationCap className="h-10 w-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mt-4 text-gray-600 dark:text-gray-300">No courses available yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">We&apos;re working on adding exciting new courses. Please check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.courses.slice(0, 6).map((course, index) => (
              <Link 
                to={`/course-detail/${course._id}`} 
                key={course._id} 
                className="group"
                style={{
                  transform: `translateY(${Math.min(index * 10, 30)}px)`,
                  transition: 'transform 0.3s ease',
                  animation: `fade-in 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="h-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl dark:hover:shadow-purple-900/10 transition-all duration-300 hover:-translate-y-1 relative group/card">
                  {/* Glossy highlight effect */}
                  <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                  
                  {/* Course Thumbnail */}
                  <div className="relative h-48 overflow-hidden">
                    {/* Premium/Free badge */}
                    <div className="absolute top-3 right-3 z-10">
                      {course.coursePrice > 0 ? (
                        <Badge className="bg-amber-500 text-white border-none px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Premium
                        </Badge>
                      ) : (
                        <Badge className="bg-purple-500 text-white border-none px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Free
                        </Badge>
                      )}
                    </div>
                    
                    {/* Image with overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10"></div>
                    <img
                      src={course.courseThumbnail || "https://placehold.co/600x400?text=No+Image"}
                      alt={course.courseTitle}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Level badge */}
                    <div className="absolute bottom-3 left-3 z-20">
                      <Badge className={`${levelStyles[course.courseLevel?.toLowerCase()] || levelStyles.beginner} rounded-md`}>
                        {course.courseLevel || "All Levels"}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Course Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {course.courseTitle}
                    </h3>
                    
                    {/* Instructor */}
                    <div className="flex items-center mt-3 mb-3">
                      <Avatar className="h-6 w-6 mr-2 ring-2 ring-white dark:ring-gray-800">
                        <AvatarImage src={course.creator?.photoUrl} />
                        <AvatarFallback>{course.creator?.name?.[0] || "I"}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{course.creator?.name || "Instructor"}</span>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="ml-1 text-sm font-medium">{(Math.random() * 1 + 4).toFixed(1)}</span>
                      </div>
                      <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        <span>{Math.floor(Math.random() * 500) + 100}</span>
                      </div>
                    </div>
                    
                    {/* Price and CTA */}
                    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                      <div className="flex items-center">
                        {course.coursePrice > 0 ? (
                          <span className="font-bold text-lg text-amber-600 dark:text-amber-400">₹{course.coursePrice}</span>
                        ) : (
                          <span className="font-bold text-lg text-purple-600 dark:text-purple-400">Free</span>
                        )}
                      </div>
                      
                      {/* Start Learning Button */}
                      <div className="relative overflow-hidden rounded-lg group/btn">
                        <Button 
                          size="sm" 
                          className={`relative z-10 ${
                            course.coursePrice > 0 
                              ? 'bg-amber-500 hover:bg-amber-600' 
                              : 'bg-purple-500 hover:bg-purple-600'
                          }`}
                        >
                          <span className="flex items-center">
                            Start Learning
                            <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                          </span>
                        </Button>
                        <div className={`absolute inset-0 ${
                          course.coursePrice > 0 
                            ? 'bg-gradient-to-r from-amber-400 to-amber-600' 
                            : 'bg-gradient-to-r from-purple-400 to-purple-600'
                        } blur-xl opacity-50 group-hover/btn:opacity-75 transition-opacity`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Company Banner Section */}
      <CompanyBanner />
      
      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We provide a comprehensive learning experience designed to help you achieve your goals.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { 
              icon: <GraduationCap className="h-6 w-6 text-purple-600" />, 
              title: "Expert Instructors", 
              description: "Learn from industry professionals with real-world experience" 
            },
            { 
              icon: <Zap className="h-6 w-6 text-amber-500" />, 
              title: "Self-Paced Learning", 
              description: "Study at your own pace with lifetime access to courses" 
            },
            { 
              icon: <CheckCircle2 className="h-6 w-6 text-emerald-500" />, 
              title: "Verified Certificates", 
              description: "Earn recognized certificates to showcase your skills" 
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* CTA Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-700 dark:from-purple-900 dark:to-indigo-900 py-14 my-12">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat opacity-10"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Ready to start your learning journey?</h2>
          <p className="text-purple-100 mb-8 max-w-3xl mx-auto">
            Join thousands of students already learning on our platform. Start your journey today!
          </p>
          <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-gray-100 hover:text-purple-800 px-8 py-6 h-auto rounded-xl font-semibold text-lg">
            <Link to="/courses">
              Get Started Now
          </Link>
          </Button>
        </div>
      </div>
      
      {/* Custom Animations */}
      <style>
        {`
          @keyframes gradientBG {
            0% { background-position: 0% 50% }
            50% { background-position: 100% 50% }
            100% { background-position: 0% 50% }
          }
          
          @keyframes spin-slow {
            to { transform: rotate(360deg) }
          }
          
          @keyframes spin-reverse {
            to { transform: rotate(-360deg) }
          }
          
          @keyframes float {
            0% { transform: translateY(0px) }
            50% { transform: translateY(-8px) }
            100% { transform: translateY(0px) }
          }
          
          @keyframes float-delay {
            0% { transform: translateY(0px) }
            50% { transform: translateY(-8px) }
            100% { transform: translateY(0px) }
          }
          
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          ${[...Array(8)].map((_, i) => `
            @keyframes particle-fly-${i} {
              from { 
                transform: translate(-50%, -50%) rotate(${i * 45}deg) translateX(0); 
                opacity: 1;
              }
              to { 
                transform: translate(-50%, -50%) rotate(${i * 45}deg) translateX(40px); 
                opacity: 0;
              }
            }
          `).join('\n')}
          
          .animate-spin-slow {
            animation: spin-slow 15s linear infinite;
          }
          
          .animate-spin-reverse {
            animation: spin-reverse 12s linear infinite;
          }
          
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
          
          .animate-float-delay {
            animation: float-delay 5s ease-in-out infinite 1s;
          }
        `}
      </style>
    </div>
  );
};

export default Home; 
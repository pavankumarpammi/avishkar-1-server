import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select";
import { toast } from 'sonner';
import { 
  ArrowLeft, Save, LayoutList, Book, Eye, 
  Loader2, Sparkles, PenTool, FileVideo, 
  Globe, DollarSign, GraduationCap, Award, X
} from 'lucide-react';
import LectureManager from '../../components/LectureManager';
import { Textarea } from "../../components/ui/textarea";

const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('settings');
  const [formData, setFormData] = useState({
    courseTitle: '',
    subTitle: '',
    description: '',
    category: '',
    courseLevel: '',
    coursePrice: '',
    courseThumbnail: '',
    lectures: []
  });
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [course, setCourse] = useState(null);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  const token = localStorage.getItem("userToken");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/course/instructor/courses/${courseId}`, {
          headers: {
            Authorization: `${token}`,
          },
          withCredentials: true
        });
        setCourse(response.data.course);
        
        // Transform lectures to include both title formats
        const transformedLectures = response.data.course.lectures.map(lecture => ({
          _id: lecture._id,
          title: lecture.title,
          lectureTitle: lecture.title, // Keep both for compatibility
          description: lecture.description,
          lectureDescription: lecture.description, // Keep both for compatibility
          videoUrl: lecture.videoUrl,
          order: lecture.order
        }));

        setFormData({
          courseTitle: response.data.course.courseTitle,
          subTitle: response.data.course.subTitle || '',
          description: response.data.course.description || '',
          category: response.data.course.category || '',
          courseLevel: response.data.course.courseLevel || '',
          coursePrice: response.data.course.coursePrice || '',
          courseThumbnail: response.data.course.courseThumbnail || '', // Include the current thumbnail URL
          lectures: transformedLectures
        });
        if (response.data.course.courseThumbnail) {
          setThumbnailPreview(response.data.course.courseThumbnail);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch course');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        e.target.value = '';
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        e.target.value = '';
        return;
      }

      setFormData({
        ...formData,
        courseThumbnail: file
      });
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDescriptionChange = (e) => {
    setFormData({
      ...formData,
      description: e.target.value
    });
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.courseTitle || !formData.category || !formData.courseLevel) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('courseTitle', formData.courseTitle);
      formDataToSend.append('subTitle', formData.subTitle);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('courseLevel', formData.courseLevel);
      formDataToSend.append('coursePrice', formData.coursePrice);
      
      // Only append thumbnail if it's a new file
      if (formData.courseThumbnail instanceof File) {
        formDataToSend.append('thumbnail', formData.courseThumbnail);
      } else if (typeof formData.courseThumbnail === 'string') {
        formDataToSend.append('courseThumbnail', formData.courseThumbnail);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/course/instructor/courses/${courseId}`,
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('Course updated successfully');
        setCourse(response.data.course);
      } else {
        toast.error(response.data.message || 'Failed to update course');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error(error.response?.data?.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  const handleLectureUpdate = async (updatedLectures) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/course/instructor/${courseId}/lectures`,
        { lectures: updatedLectures },
        { withCredentials: true,
          headers: {
            Authorization: `${token}`,
          },
         }
      );

      if (response.data.success) {
        toast.success('Lectures updated successfully');
        setCourse(response.data.course);
        setFormData(prev => ({
          ...prev,
          lectures: updatedLectures
        }));
      } else {
        toast.error(response.data.message || 'Failed to update lectures');
      }
    } catch (error) {
      console.error('Error updating lectures:', error);
      toast.error(error.response?.data?.message || 'Failed to update lectures');
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      
      // First save any pending changes
      await handleSaveChanges();
      
      // Validate if course has lectures before publishing
      if (!course.lectures || course.lectures.length === 0) {
        toast.error('Please add at least one lecture before publishing');
        return;
      }

      // Now publish the course
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/course/instructor/courses/${courseId}/publish`,
        { status: "true" },
        { withCredentials: true,
          headers: {
            Authorization: `${token}`,
          },
         },
      );
      
      if (response.data.success) {
        toast.success('Course published successfully');
        setCourse(response.data.course);
        // Navigate back to dashboard after successful publish
        navigate('/instructor/dashboard');
      } else {
        toast.error(response.data.message || 'Failed to publish course');
      }
    } catch (error) {
      console.error('Error publishing course:', error);
      toast.error(error.response?.data?.message || 'Failed to publish course');
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      setPublishing(true);
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/course/instructor/courses/${courseId}/publish`,
        { status: "false" },
        { withCredentials: true,
          headers: { Authorization: `${token}` },
        },
        
      );
      
      if (response.data.success) {
        toast.success('Course unpublished successfully');
        setCourse(response.data.course);
      } else {
        toast.error(response.data.message || 'Failed to unpublish course');
      }
    } catch (error) {
      console.error('Error unpublishing course:', error);
      toast.error(error.response?.data?.message || 'Failed to unpublish course');
    } finally {
      setPublishing(false);
    }
  };

  if (loading && !course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 transition-opacity duration-500 ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/instructor/dashboard')}
              className="p-0 mr-4 hover:scale-110 transition-transform"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Edit Course</h1>
              <p className="text-gray-500 dark:text-gray-400">Update and refine your course content</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSaveChanges}
              disabled={loading}
              className="flex items-center transition-all hover:shadow-md hover:scale-105 bg-white dark:bg-gray-800"
            >
              <Save className="mr-2 h-4 w-4" /> 
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            
            {course?.isPublished ? (
              <Button
                onClick={handleUnpublish}
                disabled={loading || publishing}
                variant="destructive"
                className="flex items-center transition-all hover:shadow-lg hover:scale-105"
              >
                {publishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Unpublishing...
                  </>
                ) : (
                  'Unpublish'
                )}
              </Button>
            ) : (
              <Button
                onClick={handlePublish}
                disabled={loading || publishing}
                className="flex items-center transition-all hover:shadow-lg hover:scale-105 bg-gradient-to-r from-blue-500 to-purple-600"
              >
                {publishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Publish Course
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="animate-fade-in-up"
        >
          <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto mb-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-full p-1 shadow-lg">
            <TabsTrigger 
              value="settings" 
              className="flex items-center rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all hover:bg-white/80 dark:hover:bg-gray-700/80 relative overflow-hidden group data-[state=active]:animate-tab-pulse"
              onClick={() => setActiveTab('settings')}
            >
              <span className="absolute inset-0 w-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 transition-all duration-300 ease-out group-hover:w-full"></span>
              <Book className="mr-2 h-4 w-4" />
              <span className="relative z-10">Details</span>
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="flex items-center rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all hover:bg-white/80 dark:hover:bg-gray-700/80 relative overflow-hidden group data-[state=active]:animate-tab-pulse"
              onClick={() => setActiveTab('content')}
            >
              <span className="absolute inset-0 w-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 transition-all duration-300 ease-out group-hover:w-full"></span>
              <FileVideo className="mr-2 h-4 w-4" />
              <span className="relative z-10">Videos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="flex items-center rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all hover:bg-white/80 dark:hover:bg-gray-700/80 relative overflow-hidden group data-[state=active]:animate-tab-pulse"
              onClick={() => setActiveTab('preview')}
            >
              <span className="absolute inset-0 w-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 transition-all duration-300 ease-out group-hover:w-full"></span>
              <Eye className="mr-2 h-4 w-4" />
              <span className="relative z-10">Preview</span>
            </TabsTrigger>
          </TabsList>

          <div className="tab-content-wrapper transition-all duration-500" key={activeTab}>
            <TabsContent value="settings" className="animate-slide-up">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Course Details */}
                <div className="lg:col-span-2">
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-none shadow-xl h-full">
                    <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 pb-6">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Book className="h-5 w-5 text-blue-500" />
                        Course Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div className="space-y-2">
                        <Label htmlFor="courseTitle" className="text-sm font-medium">Course Title *</Label>
                        <Input
                          id="courseTitle"
                          name="courseTitle"
                          placeholder="Enter course title"
                          value={formData.courseTitle}
                          onChange={handleInputChange}
                          required
                          className="rounded-lg transition-all focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subTitle" className="text-sm font-medium">Subtitle</Label>
                        <Input
                          id="subTitle"
                          name="subTitle"
                          placeholder="Enter a subtitle for your course"
                          value={formData.subTitle}
                          onChange={handleInputChange}
                          className="rounded-lg transition-all focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">Course Description</Label>
                        <div className="rounded-lg overflow-hidden border transition-all focus-within:ring-2 focus-within:ring-blue-500">
                          <Textarea
                            id="description"
                            name="description"
                            placeholder="Enter course description"
                            value={formData.description}
                            onChange={handleDescriptionChange}
                            className="min-h-[200px] resize-y rounded-lg transition-all focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1 px-3 pb-2">Rich text editor temporarily disabled. Simple text input is available.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Right Column - Course Settings */}
                <div>
                  <Card className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-none shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 pb-6">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <PenTool className="h-5 w-5 text-purple-500" />
                        Course Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-medium flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-500" />
                          Category *
                        </Label>
                        <Select 
                          name="category" 
                          value={formData.category} 
                          onValueChange={(value) => handleSelectChange('category', value)}
                          required
                        >
                          <SelectTrigger id="category" className="rounded-lg transition-all focus:ring-2 focus:ring-blue-500">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg">
                            <SelectItem value="programming">Programming</SelectItem>
                            <SelectItem value="design">Design</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="personal-development">Personal Development</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="courseLevel" className="text-sm font-medium flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-blue-500" />
                          Course Level *
                        </Label>
                        <Select 
                          name="courseLevel" 
                          value={formData.courseLevel} 
                          onValueChange={(value) => handleSelectChange('courseLevel', value)}
                          required
                        >
                          <SelectTrigger id="courseLevel" className="rounded-lg transition-all focus:ring-2 focus:ring-blue-500">
                            <SelectValue placeholder="Select difficulty level" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg">
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Medium">Intermediate</SelectItem>
                            <SelectItem value="Advance">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="coursePrice" className="text-sm font-medium flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-blue-500" />
                          Price (₹)
                        </Label>
                        <Input
                          id="coursePrice"
                          name="coursePrice"
                          type="number"
                          placeholder="0 for free course"
                          value={formData.coursePrice}
                          onChange={handleInputChange}
                          min="0"
                          step="1"
                          className="rounded-lg transition-all focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="courseThumbnail" className="text-sm font-medium flex items-center gap-2">
                          <Award className="h-4 w-4 text-blue-500" />
                          Course Thumbnail
                        </Label>
                        <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 transition-all hover:border-blue-500 focus-within:border-blue-500">
                          <Input
                            id="courseThumbnail"
                            name="courseThumbnail"
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                            className="rounded-lg transition-all focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-2">Recommended size: 1280x720px (16:9 ratio)</p>
                        </div>
                        {thumbnailPreview && (
                          <div className="mt-4 overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105">
                            <img 
                              src={thumbnailPreview} 
                              alt="Thumbnail preview" 
                              className="w-full h-48 object-cover"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, courseThumbnail: '' }));
                                setThumbnailPreview('');
                              }}
                              className="mt-2 w-fit flex items-center"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove Thumbnail
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="animate-slide-up space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-none shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 pb-6">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileVideo className="h-5 w-5 text-blue-500" />
                    Course Videos
                  </CardTitle>
                  <CardDescription>
                    Add and manage your course lectures. Drag and drop to reorder.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <LectureManager
                    courseId={courseId}
                    lectures={formData.lectures}
                    onLecturesChange={handleLectureUpdate}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="animate-slide-up">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-none shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 pb-6">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Eye className="h-5 w-5 text-blue-500" />
                    Course Preview
                  </CardTitle>
                  <CardDescription>
                    See how your course will appear to students
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {thumbnailPreview ? (
                    <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src={thumbnailPreview} 
                        alt="Course thumbnail" 
                        className="w-full h-64 object-cover transition-transform hover:scale-105 duration-700"
                      />
                    </div>
                  ) : (
                    <div className="mb-8 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl h-64 flex items-center justify-center text-gray-500">
                      <p>No thumbnail uploaded</p>
                    </div>
                  )}
                  
                  <div className="space-y-8">
                    <div className="animate-fade-in">
                      <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">{formData.courseTitle || "Course Title"}</h2>
                      {formData.subTitle && (
                        <p className="text-xl text-gray-600 dark:text-gray-300">{formData.subTitle}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 animate-fade-in">
                      <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-md flex flex-col items-center transition-transform hover:scale-105">
                        <Globe className="h-6 w-6 text-blue-500 mb-2" />
                        <p className="font-medium">Category</p>
                        <p className="text-gray-600 dark:text-gray-300">{formData.category || "Not set"}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-md flex flex-col items-center transition-transform hover:scale-105">
                        <GraduationCap className="h-6 w-6 text-purple-500 mb-2" />
                        <p className="font-medium">Level</p>
                        <p className="text-gray-600 dark:text-gray-300">{formData.courseLevel || "Not set"}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-md flex flex-col items-center transition-transform hover:scale-105">
                        <DollarSign className="h-6 w-6 text-green-500 mb-2" />
                        <p className="font-medium">Price</p>
                        <p className="text-gray-600 dark:text-gray-300">
                          {formData.coursePrice ? `₹${formData.coursePrice}` : 'Free'}
                        </p>
                      </div>
                    </div>
                    
                    {formData.description && (
                      <div className="animate-fade-in">
                        <h3 className="text-xl font-semibold mb-3 flex items-center">
                          <Book className="mr-2 h-5 w-5 text-blue-500" />
                          About This Course
                        </h3>
                        <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md prose dark:prose-invert max-w-none">
                          <p className="whitespace-pre-wrap">{formData.description}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="animate-fade-in">
                      <h3 className="text-xl font-semibold mb-3 flex items-center">
                        <LayoutList className="mr-2 h-5 w-5 text-blue-500" />
                        Course Content ({formData.lectures.length} {formData.lectures.length === 1 ? 'lecture' : 'lectures'})
                      </h3>
                      <div className="space-y-4">
                        {formData.lectures.length > 0 ? (
                          formData.lectures.map((lecture, index) => (
                            <div key={lecture._id || index} className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:scale-[1.01]">
                              <div className="p-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium flex items-center">
                                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3">
                                      {index + 1}
                                    </span>
                                    {lecture.lectureTitle || lecture.title}
                                  </h4>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {lecture.duration || '00:00'} min
                                  </span>
                                </div>
                                {(lecture.lectureDescription || lecture.description) && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 ml-9">
                                    {lecture.lectureDescription || lecture.description}
                                  </p>
                                )}
                              </div>
                              {lecture.videoUrl && extractYouTubeId(lecture.videoUrl) && (
                                <div className="mt-2 border-t dark:border-gray-600">
                                  <iframe
                                    width="100%"
                                    height="315"
                                    src={`https://www.youtube.com/embed/${extractYouTubeId(lecture.videoUrl)}?modestbranding=1&rel=0&disablekb=1&showinfo=0`}
                                    title={lecture.lectureTitle || lecture.title}
                                    style={{ border: "none" }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="rounded-b-xl"
                                  />
                              
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-md text-center">
                            <FileVideo className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-300 mb-4">No lectures added yet</p>
                            <Button 
                              onClick={() => setActiveTab('content')}
                              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg transition-all"
                            >
                              Add Lectures
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default EditCourse; 
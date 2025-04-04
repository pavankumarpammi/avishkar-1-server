import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Globe, DollarSign, GraduationCap, Award
} from 'lucide-react';
import LectureManager from '../../components/LectureManager';
import { Textarea } from "../../components/ui/textarea";

const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const CreateCourse = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('settings');
  const [formData, setFormData] = useState({
    courseTitle: '',
    subTitle: '',
    description: '',
    category: '',
    courseLevel: '',
    coursePrice: '',
    courseThumbnail: null,
    lectures: []
  });
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

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

  const handleDescriptionChange = (e) => {
    setFormData({
      ...formData,
      description: e.target.value
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

  const handleLecturesChange = (updatedLectures) => {
    setFormData(prev => ({
      ...prev,
      lectures: updatedLectures
    }));
  };

  const handleCreateCourse = async () => {
    if (!formData.courseTitle || !formData.category || !formData.courseLevel) {
      toast.error('Course title, category, and level are required');
      return;
    }

    setLoading(true);
    try {
      // Create form data for file upload
      const data = new FormData();
      
      // First, add all non-file and non-lecture fields
      const basicFields = {
        courseTitle: formData.courseTitle,
        subtitle: formData.subTitle,
        description: formData.description,
        category: formData.category,
        level: formData.courseLevel,
        price: formData.coursePrice
      };
      
      // Add basic fields to FormData
      Object.entries(basicFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value);
        }
      });

      // Add thumbnail if exists
      if (formData.courseThumbnail) {
        data.append('thumbnail', formData.courseThumbnail);
      }

      // Transform and add lectures
      if (formData.lectures && formData.lectures.length > 0) {
        const transformedLectures = formData.lectures.map((lecture, index) => ({
          lectureTitle: lecture.lectureTitle,
          lectureDescription: lecture.lectureDescription || lecture.lectureTitle,
          videoUrl: lecture.videoUrl,
          order: index,
          _id: lecture._id
        }));
        data.append('lectures', JSON.stringify(transformedLectures));
      } else {
        data.append('lectures', JSON.stringify([]));
      }

      const token = localStorage.getItem("userToken");
      
      const response = await axios.post('https://avishkar-1-server-1.onrender.com/api/v1/course/instructor/courses', data, {
        headers: {
          // 'Content-Type': 'multipart/form-data',
          Authorization: `${token}`,
        },
        withCredentials: true
      });
      
      toast.success('Course created successfully');
      navigate(`/instructor/courses/edit/${response.data.course._id}`);
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!formData.lectures || formData.lectures.length === 0) {
      toast.error('Please add at least one lecture before publishing');
      return;
    }
  
    setIsPublishing(true);
    try {
      await handleCreateCourse(); // Ensure course is created before publishing
  
      const token = localStorage.getItem("userToken");
  
      // API call to publish the course
      await axios.put(
        `https://avishkar-1-server-1.onrender.com/api/v1/course/instructor/courses/${courseId}/publish`,
        { status: "true" },
        {
          headers: {
            Authorization: `${token}`,
          },
          withCredentials: true,
        }
      );
  
      toast.success('Course published successfully');
    } catch (error) {
      console.error('Error publishing course:', error);
      toast.error(error.response?.data?.message || 'Failed to publish course');
    } finally {
      setIsPublishing(false);
    }
  };
  

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
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Create New Course</h1>
              <p className="text-gray-500 dark:text-gray-400">Share your knowledge with the world</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCreateCourse}
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
                'Save Draft'
              )}
            </Button>
            <Button
              onClick={handlePublish}
              disabled={loading || isPublishing}
              className="flex items-center transition-all hover:shadow-lg hover:scale-105 bg-gradient-to-r from-blue-500 to-purple-600"
            >
              {isPublishing ? (
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
          </div>
        </div>
        {/* // Tabs */}
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

          <div className="tab-content-wrapper transition-all duration-500"  key={activeTab}>
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
                    courseId="new"
                    lectures={formData.lectures}
                    onLecturesChange={handleLecturesChange}
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
                                    {lecture.lectureTitle}
                                  </h4>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {lecture.duration || '00:00'} min
                                  </span>
                                </div>
                                {lecture.lectureDescription && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 ml-9">
                                    {lecture.lectureDescription}
                                  </p>
                                )}
                              </div>
                              {lecture.videoUrl && extractYouTubeId(lecture.videoUrl) && (
                                <div className="mt-2 border-t dark:border-gray-600">
                                  <iframe
                                    width="100%"
                                    height="315"
                                    src={`https://www.youtube.com/embed/${extractYouTubeId(lecture.videoUrl)}?modestbranding=1&rel=0&disablekb=1`}
                                    title={lecture.lectureTitle}
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

export default CreateCourse; 


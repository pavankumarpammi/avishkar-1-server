import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Plus, Trash2, GripVertical, Youtube, Play, FileVideo, Clock, Edit } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { Label } from './ui/label';

const LectureManager = ({ lectures = [], onLecturesChange }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [animatedItems, setAnimatedItems] = useState([]);
  const [newLecture, setNewLecture] = useState({
    lectureTitle: "",
    videoUrl: "",
  });

  useEffect(() => {
    // Add animation when component mounts
    const timer = setTimeout(() => {
      setAnimatedItems(lectures.map(lecture => lecture._id));
    }, 100);
    
    return () => clearTimeout(timer);
  }, [lectures]);

  const handleAddLecture = () => {
    if (!newLecture.lectureTitle || !newLecture.videoUrl) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate YouTube URL
    const videoId = extractYouTubeId(newLecture.videoUrl);
    if (!videoId) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    // Standardize YouTube URL
    const standardVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Generate a temporary ID for the new lecture
    const tempId = `temp-${Date.now()}`;

    const lectureToAdd = {
      _id: tempId, // Add a temporary ID for new lectures
      title: newLecture.lectureTitle.trim(),
      lectureTitle: newLecture.lectureTitle.trim(), // Keep both for compatibility
      description: newLecture.lectureTitle.trim(), // Use title as default description
      lectureDescription: newLecture.lectureTitle.trim(), // Keep both for compatibility
      videoUrl: standardVideoUrl,
      order: lectures.length,
      duration: 0, // Default duration
      isNew: true // Flag to identify new lectures
    };

    // Add the new lecture and update order numbers
    const updatedLectures = [...lectures, lectureToAdd].map((lecture, index) => ({
      ...lecture,
      order: index
    }));

    onLecturesChange(updatedLectures);
    setIsAdding(false);
    setNewLecture({
      lectureTitle: "",
      videoUrl: "",
    });
    
    // Add the new lecture to animated items after a brief delay
    setTimeout(() => {
      setAnimatedItems(prev => [...prev, tempId]);
    }, 50);
    
    toast.success("Lecture added successfully");
  };

  const handleDeleteLecture = (lectureId) => {
    // Remove from animated items first
    setAnimatedItems(prev => prev.filter(id => id !== lectureId));
    
    // Wait for animation to complete before removing from actual list
    setTimeout(() => {
      const updatedLectures = lectures.filter((lecture) => lecture._id !== lectureId)
        .map((lecture, index) => ({
          ...lecture,
          order: index
        }));
      onLecturesChange(updatedLectures);
      toast.success("Lecture deleted successfully");
    }, 300);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(lectures);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    onLecturesChange(updatedItems);
  };

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <FileVideo className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Course Lectures ({lectures.length})</h3>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Lecture
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-6 border border-blue-200 bg-white/90 dark:bg-gray-800/90 shadow-xl animate-scale-in overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-600/10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Play className="h-5 w-5 text-blue-500" />
              Add New Lecture
            </CardTitle>
            <CardDescription>Fill in the details to add a new lecture to your course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="lectureTitle" className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-blue-500" />
                Lecture Title *
              </Label>
              <Input
                id="lectureTitle"
                value={newLecture.lectureTitle}
                onChange={(e) =>
                  setNewLecture({ ...newLecture, lectureTitle: e.target.value })
                }
                placeholder="Enter lecture title"
                className="rounded-lg transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoUrl" className="flex items-center gap-2">
                <Youtube className="h-4 w-4 text-red-500" />
                YouTube Video URL *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="videoUrl"
                  value={newLecture.videoUrl}
                  onChange={(e) =>
                    setNewLecture({ ...newLecture, videoUrl: e.target.value })
                  }
                  placeholder="Enter YouTube video URL"
                  className="rounded-lg transition-all focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const videoId = extractYouTubeId(newLecture.videoUrl);
                    if (videoId) {
                      window.open(
                        `https://www.youtube.com/watch?v=${videoId}`,
                        "_blank"
                      );
                    } else {
                      toast.error("Invalid YouTube URL");
                    }
                  }}
                  className="hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                >
                  <Youtube className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Format: https://www.youtube.com/watch?v=XXXXXXXXXXX
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewLecture({
                    lectureTitle: "",
                    videoUrl: "",
                  });
                }}
                className="hover:bg-gray-100 transition-all"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddLecture}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-md transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lecture
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="lectures">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {lectures.length === 0 ? (
                <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center bg-white/50 dark:bg-gray-800/50">
                  <FileVideo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No lectures added yet</p>
                  <Button 
                    onClick={() => setIsAdding(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg transition-all"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Lecture
                  </Button>
                </div>
              ) : (
                lectures.map((lecture, index) => (
                  <Draggable
                    key={lecture._id}
                    draggableId={String(lecture._id)}
                    index={index}
                  >
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`group bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 
                          border-none shadow-md hover:shadow-lg transition-all overflow-hidden 
                          ${animatedItems.includes(lecture._id) ? 'animate-scale-in' : 'opacity-0 scale-95'}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-move bg-gray-100 dark:bg-gray-700 rounded-lg p-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              <GripVertical className="h-5 w-5 text-gray-500" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </span>
                                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                  {lecture.title || lecture.lectureTitle}
                                </h4>
                              </div>
                              
                              {lecture.videoUrl && (
                                <div className="flex items-center gap-2 ml-8 mt-1 text-sm text-gray-500">
                                  <Youtube className="h-3.5 w-3.5 text-red-500" />
                                  <span className="truncate max-w-md">
                                    {lecture.videoUrl}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="flex items-center text-sm text-gray-500">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {lecture.duration || '0:00'}
                              </span>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"
                                onClick={() => handleDeleteLecture(lecture._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

LectureManager.propTypes = {
  lectures: PropTypes.array,
  onLecturesChange: PropTypes.func.isRequired
};

export default LectureManager; 
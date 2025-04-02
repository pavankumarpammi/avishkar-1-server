import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  Hand,
  Info, 
  RefreshCw, 
  Bell,
  Edit, 
  Phone, 
  CheckCircle, 
  XCircle,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  Loader2,
  MoreVertical,
  Book,
  UserPlus,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { 
  DialogFooter,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useGetPurchaseRequestsQuery, useUpdatePurchaseStatusMutation } from '@/features/api/purchaseApi';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processingIds, setProcessingIds] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const navigate = useNavigate();

  // Fetch access requests
  const { data: requests, isLoading: isLoadingRequests, refetch } = useGetPurchaseRequestsQuery();
  const [updateStatus] = useUpdatePurchaseStatusMutation();

  useEffect(() => {
    fetchData();
    fetchNotifications();
  }, []);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      }
        
        // Fetch all courses for the instructor
        console.log('Fetching instructor courses...');
        const coursesResponse = await axios.get('https://avishkar-1-server-1.onrender.com/api/v1/course/instructor/courses', {
          withCredentials: true
        });
        console.log('Courses response:', coursesResponse.data);
        if (!coursesResponse.data.success) {
          console.error('Error in courses response:', coursesResponse.data.message);
          toast.error('Failed to load courses: ' + coursesResponse.data.message);
          return;
        }
      
      const coursesData = coursesResponse.data.courses || [];
      setCourses(coursesData);

        // Fetch all users with role USER
        console.log('Fetching users...');
        const usersResponse = await axios.get('/api/v1/user/users', {
          withCredentials: true
        });
        console.log('Users response:', usersResponse.data);
        if (!usersResponse.data.success) {
          console.error('Error in users response:', usersResponse.data.message);
          toast.error('Failed to load users: ' + usersResponse.data.message);
          return;
        }
        setUsers(usersResponse.data.users || []);
      
      if (isRefresh) {
        toast.success('Dashboard refreshed successfully');
      }

      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          toast.error(error.response.data.message || 'Failed to load dashboard data');
        } else if (error.request) {
          console.error('No response received:', error.request);
          toast.error('No response from server. Please check your connection.');
        } else {
          console.error('Error setting up request:', error.message);
          toast.error('Failed to set up request. Please try again.');
        }
      } finally {
      if (isRefresh) {
        setTimeout(() => setIsRefreshing(false), 800); // Smoother animation
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/v1/notification/instructor/notifications', {
        withCredentials: true
      });
      if (response.data.success) {
        setNotifications(response.data.notifications);
        // Count unread notifications
        const unreadCount = response.data.notifications.filter(n => !n.isRead).length;
        setUnreadNotificationsCount(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      setProcessingIds(prev => [...prev, requestId]);
      const response = await updateStatus({ requestId, status: newStatus }).unwrap();
      
      if (response.success) {
        toast.success(`Request ${newStatus} successfully`);
        refetch(); // Refresh the requests data
        addNotification({
          title: `Request ${newStatus}`,
          message: `You have ${newStatus} a course access request`,
          type: newStatus === 'approved' ? 'success' : 'info'
        });
      } else {
        toast.error(response.message || 'Failed to update request status');
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error(error.data?.message || 'Failed to update request status');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      const response = await axios.delete(`/api/v1/course/instructor/courses/${courseId}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        toast.success('Course deleted successfully');
        setCourses(prev => prev.filter(course => course._id !== courseId));
        setDeleteDialogOpen(false);
        setCourseToDelete(null);
      } else {
        toast.error(response.data.message || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error(error.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleDeleteConfirm = () => {
    if (courseToDelete) {
      handleDeleteCourse(courseToDelete._id);
    }
  };

  const handleRefresh = () => {
    fetchData(true);
    refetch(); // Refresh requests data
  };

  // Filter courses based on search query and status
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter requests based on search query and status
  const filteredRequests = requests?.requests?.filter(request => {
    const matchesSearch = 
      request.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.course?.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.student?.phone_number?.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone_number?.includes(searchQuery)
    );
  });

  // Calculate user statistics
  const userStats = {
    total: users.length,
    enrolled: users.filter(user => user.enrolledCourses?.length > 0).length,
    active: users.filter(user => user.status === 'active').length
  };

  // Handle user role update
  const handleUserRoleUpdate = async (userId, newRole) => {
    try {
      const response = await axios.put(
        `/api/v1/user/user/role`,
        { userId, role: newRole },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('User role updated successfully');
        setUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ));
      } else {
        toast.error(response.data.message || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error(error.response?.data?.message || 'Failed to update user role');
    }
  };

  // Handle user status update
  const handleUserStatusUpdate = async (userId, newStatus) => {
    try {
      const response = await axios.put(
        `/api/v1/user/user/status`,
        { userId, status: newStatus },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('User status updated successfully');
        setUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, status: newStatus } : user
        ));
      } else {
        toast.error(response.data.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      date: new Date(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };
  
  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await axios.put(
        `/api/v1/notification/instructor/notifications/${notificationId}/read`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const markAllNotificationsAsRead = async () => {
    try {
      const response = await axios.put(
        '/api/v1/notification/instructor/notifications/read-all',
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadNotificationsCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get status badge component
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800">
            <Info className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  if (isLoadingRequests) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Instructor Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your courses and student requests</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => navigate('/instructor/courses/create')}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{courses.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</CardTitle>
            <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Requests</CardTitle>
            <Hand className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {requests?.requests?.filter(r => r.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400">Dashboard</TabsTrigger>
          <TabsTrigger value="courses" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400">Courses</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400">Users</TabsTrigger>
          <TabsTrigger value="requests" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 relative">
            Requests
            {requests?.requests?.filter(r => r.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {requests.requests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Recent Activity */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-none shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 pb-6">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Bell className="h-5 w-5 text-blue-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 rounded-lg transition-all ${
                        notification.isRead 
                          ? 'bg-gray-50 dark:bg-gray-700/50' 
                          : 'bg-blue-50 dark:bg-blue-900/20'
                      }`}
                      onClick={() => markNotificationAsRead(notification._id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          notification.type === 'course_created' ? 'bg-green-100 dark:bg-green-900/30' :
                          notification.type === 'access_request' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          notification.type === 'user_enrolled' ? 'bg-purple-100 dark:bg-purple-900/30' :
                          'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {notification.type === 'course_created' ? <Book className="h-4 w-4 text-green-600 dark:text-green-400" /> :
                           notification.type === 'access_request' ? <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" /> :
                           notification.type === 'user_enrolled' ? <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" /> :
                           <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          }
                        </div>
                <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Your Courses</CardTitle>
              <div className="flex items-center gap-4">
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Card key={course._id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">{course.courseTitle}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <DropdownMenuItem onClick={() => navigate(`/instructor/courses/edit/${course._id}`)} className="text-gray-700 dark:text-gray-300">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(course)} className="text-red-600 dark:text-red-400">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{course.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Users className="mr-1 h-4 w-4" />
                          {course.enrolledStudents?.length || 0} students
                        </div>
                        <Badge className={course.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}>
                          {course.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">All Users</CardTitle>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-gray-200 dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="text-gray-600 dark:text-gray-400">User</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">Email</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">Phone</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">Enrolled Courses</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">Join Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                            <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                              <div>
                              <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{user.role}</div>
                            </div>
                            </div>
                          </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{user.email}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{user.phone_number || 'N/A'}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{user.enrolledCourses?.length || 0}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Course Access Requests</CardTitle>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-gray-200 dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="text-gray-600 dark:text-gray-400">Student</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">Course</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">Amount</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={request.user?.photoUrl} />
                              <AvatarFallback>
                                {request.user?.name ? request.user.name.charAt(0) : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{request.user?.name || 'Unknown User'}</p>
                              <p className="text-sm text-gray-500">{request.user?.phone || 'No phone'}</p>
                              <p className="text-sm text-gray-500">{request.user?.email || 'No email'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{request.course?.courseTitle || 'N/A'}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">₹{request.course?.coursePrice || 0}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              request.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : request.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(request._id, 'approved')}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusUpdate(request._id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Course Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Delete Course</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete &quot;{courseToDelete?.courseTitle}&quot;? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstructorDashboard; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, BookOpen, Mail, GraduationCap, BookOpenCheck, Camera } from "lucide-react";
import { useEffect, useState } from "react";
import Course from "./Course";
import {
  useLoadUserQuery,
  useUpdateUserMutation,
} from "@/features/api/authApi";
import { toast } from "sonner";
import axios from "axios";

const Profile = () => {
  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [activeTab, setActiveTab] = useState("courses");

  const { data, isLoading, refetch } = useLoadUserQuery();
  const [
    updateUser,
    {
      data: updateUserData,
      isError,
      error,
      isSuccess,
    },
  ] = useUpdateUserMutation();

  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfilePhoto(file);
  };

  const updateUserHandler = async () => {
    try {
      const formData = new FormData();
      if (name) formData.append("name", name);
      if (profilePhoto) {
        // Convert file to base64
        const reader = new FileReader();
        reader.readAsDataURL(profilePhoto);
        reader.onloadend = async () => {
          const base64String = reader.result;
          formData.append("profilePhoto", base64String);
          
          console.log("Updating profile with:", {
            name: name || "not provided",
            hasPhoto: !!profilePhoto
          });
          
          const result = await updateUser(formData);
          console.log("Profile update result:", result);
        };
      } else {
        // If no photo, just update name
        const result = await updateUser(formData);
        console.log("Profile update result:", result);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.data?.message || "Failed to update profile");
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success(data.message || "Profile updated.");
    }
    if (isError) {
      toast.error(error.message || "Failed to update profile");
    }
  }, [error, updateUserData, isSuccess, isError]);

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="relative animate-spin-slow">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 blur-md opacity-75"></div>
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-gray-900">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </div>
    </div>
  );

  useEffect(() => {

    const token = localStorage.getItem("userToken");
    
    const response = axios.get(`https://avishkar-1-server-1.onrender.com/api/v1/user/profile`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })

    if (!response.ok) {
      return { error: { status: response.status, message: "Failed to fetch profile" } };
  }
  
  return response
  }, [])

  const user = response;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Profile Header */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl"></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="relative">
                <Avatar className="h-32 w-32 md:h-40 md:w-40 transform transition-all duration-300 hover:scale-105">
                  <AvatarImage
                    src={user?.photoUrl || "https://github.com/shadcn.png"}
                    alt={user?.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {user?.name?.charAt(0)}{user?.name?.split(" ")[1]?.charAt(0) || ""}
                  </AvatarFallback>
                </Avatar>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="icon" 
                      className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg border-0 hover:scale-110 transition-all duration-300"
                    >
                      <Camera className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Update Profile Photo</DialogTitle>
                      <DialogDescription>
                        Choose a new profile photo to upload.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="photo" className="text-right">
                          Photo
                        </Label>
                        <Input
                          id="photo"
                          type="file"
                          accept="image/*"
                          onChange={onChangeHandler}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={updateUserHandler}>Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <Dialog>
                <DialogTrigger asChild>
                  <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity">
                    {}
                  </h1>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Name</DialogTitle>
                    <DialogDescription>
                      Enter your new name.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={user?.name}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={updateUserHandler}>Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span>{response.user.email || "No email"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <GraduationCap className="h-4 w-4" />
                  <span>{user?.role === "USER" ? "Student" : user?.role}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <BookOpenCheck className="h-4 w-4" />
                  <span>{user?.enrolledCourses?.length || 0} Courses</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Tab Navigation */}
        <div className="flex justify-center space-x-8 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("courses")}
            className={`py-2 px-1 relative font-medium text-sm transition-colors ${
              activeTab === "courses"
                ? "text-purple-600 dark:text-purple-400 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-purple-600 dark:after:bg-purple-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            My Courses
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`py-2 px-1 relative font-medium text-sm transition-colors ${
              activeTab === "stats"
                ? "text-purple-600 dark:text-purple-400 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-purple-600 dark:after:bg-purple-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Statistics
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "courses" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {user?.enrolledCourses?.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">No courses yet</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Start your learning journey today</p>
                  <Button asChild className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <a href="/courses">Browse Courses</a>
                  </Button>
                </div>
              ) : (
                user?.enrolledCourses?.map((course, index) => (
                  <div key={course._id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <Course course={course} />
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "stats" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium opacity-80">Courses Completed</h3>
                  <BookOpen className="h-5 w-5 opacity-80" />
                </div>
                <p className="text-3xl font-bold">{user?.enrolledCourses?.length || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium opacity-80">Learning Hours</h3>
                  <GraduationCap className="h-5 w-5 opacity-80" />
                </div>
                <p className="text-3xl font-bold">24</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium opacity-80">Certificates</h3>
                  <BookOpenCheck className="h-5 w-5 opacity-80" />
                </div>
                <p className="text-3xl font-bold">2</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

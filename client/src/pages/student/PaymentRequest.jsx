import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequestAccessMutation, useGetCourseDetailWithStatusQuery } from '@/features/api/purchaseApi';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Phone, CheckCircle } from 'lucide-react';

const PaymentRequest = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { course: courseProp } = location.state || {};
  
  const { data: courseData, refetch: refetchStatus } = useGetCourseDetailWithStatusQuery(courseId, {
    skip: !courseId,
    pollingInterval: 5000 // Poll every 5 seconds for status updates
  });

  // Handle navigation for approved status using useEffect
  useEffect(() => {
    if (courseData?.status === 'approved') {
      toast.success('Access request approved! Redirecting to course content...');
      navigate(`/course-progress/${courseId}`);
    }
  }, [courseData?.status, navigate, courseId]);

  const [requestAccess] = useRequestAccessMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ADMIN_WHATSAPP = '+918639863632';

  // Use course data from API if not provided in location state
  const course = courseProp || courseData?.course;

  const handleRequestAccess = async () => {
    if (!courseId) {
      toast.error('Course information is missing');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await requestAccess(courseId).unwrap();
      if (result.success) {
        toast.success('Access request submitted successfully! Please wait for admin approval.');
        await refetchStatus();
      }
    } catch (err) {
      console.error('Request access error:', err);
      const errorMessage = err?.data?.message || 'Failed to submit access request';
      toast.error(errorMessage);
      
      if (errorMessage.includes('pending request')) {
        await refetchStatus();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hello, I would like to request access to the course: ${course?.courseTitle}\nPrice: ₹${course?.coursePrice}\n\nI have made the payment and attached the screenshot.`
    );
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${message}`, '_blank');
  };

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Error</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Course information not found</p>
          <Button
            onClick={() => navigate(-1)}
            className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 transform hover:scale-105"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Show payment form
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-gray-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6 leading-tight">
            Course Access Request
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Complete the steps below to gain access to
            <span className="font-semibold text-blue-600 dark:text-blue-400"> {course?.courseTitle}</span>
          </p>
        </div>

        {/* Price Tag */}
        <div className="relative mb-16">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-10 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
            <div className="text-center">
              <span className="text-lg font-medium text-gray-500 dark:text-gray-400">Course Investment</span>
              <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mt-4">
                ₹{course.coursePrice}
              </div>
            </div>
          </div>
        </div>

        {/* Steps Container */}
        <div className="space-y-8">
          {/* Step 1: QR Code Payment */}
          <div className="relative transform transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-10 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <div className="flex items-center mb-8">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg mr-6">1</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Scan & Pay</h3>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="w-64 h-64 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-lg"></div>
                  <div className="relative bg-white rounded-3xl p-6 shadow-xl">
                    <img 
                      src="/qr-code.png" 
                      alt="Payment QR Code" 
                      className="w-full h-full object-contain rounded-2xl"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <div className="space-y-2">
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      Scan QR to pay ₹{course.coursePrice}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Use any UPI app to make the payment
                    </p>
                  </div>
                 
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: WhatsApp Message */}
          <div className="relative transform transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-10 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <div className="flex items-center mb-8">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg mr-6">2</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Share Payment Proof</h3>
              </div>
              <div className="text-center md:text-left space-y-8">
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Take a screenshot of your payment and share it with us on WhatsApp
                </p>
                <Button
                  onClick={handleWhatsAppClick}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-10 py-6 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl text-lg"
                >
                  <Phone className="w-6 h-6" />
                  Open WhatsApp
                </Button>
              </div>
            </div>
          </div>

          {/* Step 3: Submit Request */}
          <div className="relative transform transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-10 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <div className="flex items-center mb-8">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg mr-6">3</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Submit Request</h3>
              </div>
              <div className="text-center md:text-left space-y-8">
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  After sharing the payment proof, submit your access request
                </p>
                <Button
                  onClick={handleRequestAccess}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-6 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl hover:shadow-2xl text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-3 h-6 w-6" />
                      Submit Access Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Button
            onClick={() => navigate(`/course-detail/${courseId}`)}
            variant="ghost"
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-lg px-8 py-6 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Course
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentRequest; 
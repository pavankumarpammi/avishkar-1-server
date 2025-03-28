import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import PropTypes from "prop-types";

const BuyCourseButton = ({ courseId, price, isEnrolled, isInstructor }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestAccess = async () => {
    if (!courseId) {
      toast.error('Course information is missing');
      return;
    }

    try {
      setIsLoading(true);
      // Just navigate to payment request page without sending request
      navigate(`/payment-request/${courseId}`, {
        state: { course: { courseId, coursePrice: price } }
      });
    } catch (err) {
      console.error('Navigation error:', err);
      toast.error('Failed to navigate to payment page');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollFreeCourse = async () => {
    if (!courseId) {
      toast.error('Course information is missing');
      return;
    }

    try {
      setIsLoading(true);
      // Just navigate to payment request page without sending request
      navigate(`/payment-request/${courseId}`, {
        state: { course: { courseId, coursePrice: price } }
      });
    } catch (err) {
      console.error('Navigation error:', err);
      toast.error('Failed to navigate to payment page');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEnrolled) {
    return (
      <Button
        onClick={() => navigate(`/course-progress/${courseId}`)}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        Continue Course
      </Button>
    );
  }

  if (isInstructor) {
    return (
      <Button
        onClick={() => navigate(`/instructor/course/${courseId}`)}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        Manage Course
      </Button>
    );
  }

  return (
    <Button
      onClick={price === 0 ? handleEnrollFreeCourse : handleRequestAccess}
      disabled={isLoading}
      className="w-full bg-orange-500 hover:bg-orange-600"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : price === 0 ? (
        "Start Course"
      ) : (
        "Request Access"
      )}
    </Button>
  );
};

BuyCourseButton.propTypes = {
  courseId: PropTypes.string.isRequired,
  price: PropTypes.number,
  isEnrolled: PropTypes.bool,
  isInstructor: PropTypes.bool
};

export default BuyCourseButton;

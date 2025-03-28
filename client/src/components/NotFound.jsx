import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { useState } from "react";

const NotFound = () => {
  const navigate = useNavigate();
  const controls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);

  const handleHover = async () => {
    setIsHovered(true);
    await controls.start({
      scale: [1, 1.2, 1],
      rotate: [0, 10, -10, 0],
      y: [0, -30, 0],
      transition: {
        duration: 0.5,
        times: [0, 0.5, 1],
      },
    });
    setIsHovered(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-8 p-8 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute w-64 h-64 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ top: "20%", left: "20%" }}
          />
          <motion.div
            className="absolute w-64 h-64 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ bottom: "20%", right: "20%" }}
          />
        </div>

        {/* Goat Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-48 h-48 mx-auto"
          onHover={handleHover}
        >
          <motion.div
            animate={controls}
            className="relative"
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-8xl cursor-pointer hover:scale-110 transition-transform"
            >
              🐐
            </motion.div>
            {/* Thought Bubble */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0 }}
              className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg"
            >
              <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                Click me! 🎯
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Oops! Page Not Found
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg max-w-md mx-auto transform hover:scale-105 transition-transform duration-200">
            <p className="text-yellow-800 dark:text-yellow-200">
              🚧 This site is under development. Some features and pages may not be available yet.
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={() => navigate("/")}
            className="bg-purple-600 hover:bg-purple-700 text-white transform hover:scale-105 transition-transform duration-200"
          >
            Go Home
          </Button>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transform hover:scale-105 transition-transform duration-200"
          >
            Go Back
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound; 
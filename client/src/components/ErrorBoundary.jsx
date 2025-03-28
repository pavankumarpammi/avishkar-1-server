import { Button } from "@/components/ui/button";
import { useNavigate, useRouteError } from "react-router-dom";
import NotFound from "./NotFound";

const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  if (error?.status === 404) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-red-600">Oops!</h1>
        <p className="text-xl text-gray-600">Something went wrong</p>
        <div className="space-y-2">
          <p className="text-lg">{error?.message || "An unexpected error occurred."}</p>
          <div className="space-x-2">
            <Button onClick={() => navigate(-1)}>Go Back</Button>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary; 
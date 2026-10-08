import { Link } from "react-router-dom";
import { Button } from "../components/ui";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
      <h1 className="text-6xl font-bold text-slate-900">404</h1>
      <h2 className="text-2xl font-semibold text-slate-700">Page Not Found</h2>
      <p className="text-slate-500 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="mt-4">
        <Button>Go back home</Button>
      </Link>
    </div>
  );
}

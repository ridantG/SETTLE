export default function AuthCodeErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border rounded-xl shadow p-6 text-center space-y-3">
        <h1 className="text-2xl font-semibold">Authentication Error</h1>
        <p className="text-gray-600">
          We couldn’t complete the sign-in process. Please try again or contact support if the
          problem persists.
        </p>
      </div>
    </main>
  );
}
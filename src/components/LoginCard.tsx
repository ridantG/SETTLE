// src/components/LoginCard.tsx

const LoginCard = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Welcome back to SETTLE</h1>
      <button className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-300">
        Continue with somethingelse
      </button>
      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-sm font-semibold">OR</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      <form>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email or phone number
          </label>
          <input 
            type="text" 
            id="email" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password"className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input 
            type="password" 
            id="password" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
          />
        </div>
        <div className="text-right mb-6">
            <a href="#" className="text-sm text-green-600 hover:underline">Forgot password?</a>
        </div>
        <button 
          type="submit" 
          className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300"
        >
          Log In
        </button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {/* CORRECTED: "Don't" is now "Don&apos;t" */}
          Don&apos;t have an account? <a href="#" className="text-green-600 font-semibold hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default LoginCard;
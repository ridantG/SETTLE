

import { FcGoogle } from 'react-icons/fc';

const SignUpCard = () => {
  // Handler for Google sign-up
  const handleGoogleSignUp = () => {
    // --- In a real app, this would trigger the OAuth flow ---
    console.log('Initiating Google Sign-Up...');
    alert('This would redirect you to Google to complete your sign-up!');
  };

  // Handler for Phone sign-up
  const handlePhoneSignUp = () => {
    // --- In a real app, this would likely take you to a new screen ---
    console.log('Initiating Phone Sign-Up...');
    alert('This would take you to a new form to enter your phone number!');
  };

  return (
    <div className="bg-white p-6 sm:p-10 rounded-xl shadow-lg w-full max-w-lg animate-fade-in">
      <div className="text-left mb-10">
        <p className="font-extrabold text-gray-700">SETTLE</p>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-gray-900">Create your SETTLE account</h1>
      
      <button 
        onClick={handleGoogleSignUp}
        className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-300 mb-4 text-base"
      >
        <FcGoogle className="mr-3 text-2xl" />
        Continue with Google
      </button>
      <button 
        onClick={handlePhoneSignUp}
        className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300 text-base"
      >
        Continue with Phone
      </button>
    </div>
  );
};

export default SignUpCard;
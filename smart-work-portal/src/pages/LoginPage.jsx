import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      let userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const role = prompt('Enter your role: intern or teamlead')?.toLowerCase();

        if (role !== 'intern' && role !== 'teamlead') {
          alert('Invalid role. Please enter "intern" or "teamlead".');
          return;
        }

        const teamName = prompt('Enter your team name (e.g., Frontend)') || 'General';

        let userData = {
          name: user.displayName,
          email: user.email,
          role,
          teamName
        };

        if (role === 'intern') {
          const teamLeadId = prompt('Enter your Team Lead UID');
          userData.teamLeadId = teamLeadId || '';
        }

        await setDoc(userRef, userData);
        alert('User registered successfully!');
        userSnap = await getDoc(userRef); // refresh data after registration
      } else {
        alert('Welcome back!');
      }

      // ✅ Role-based redirection
      const role = userSnap.data().role?.toLowerCase();

      if (role === 'teamlead') {
        navigate('/teamlead-dashboard');
      } else if (role === 'intern') {
        navigate('/intern-dashboard');
      } else {
        alert('No valid role found. Contact admin.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. See console for details.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <button
        onClick={handleLogin}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default LoginPage;

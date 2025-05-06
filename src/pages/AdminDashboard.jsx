import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, provider } from '../firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  updatePassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const container = document.querySelector('.tech-bg');
    const elements = ['</>', '{ }', ';', '=>', '[]', '===', '++'];
    for (let i = 0; i < 15; i++) {
      const element = document.createElement('div');
      element.className = 'absolute text-teal-300/40 font-mono text-xl';
      element.textContent = elements[Math.floor(Math.random() * elements.length)];
      element.style.left = `${Math.random() * 100}%`;
      element.style.top = `${Math.random() * 100}%`;
      element.style.animation = `float ${5 + Math.random() * 10}s linear infinite`;
      container?.appendChild(element);
    }
  }, []);

  const handleEmailLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        alert('Your account is not registered properly. Please contact the Admin.');
        return;
      }
  
      const userData = userSnap.data();
      const role = userData.role?.toLowerCase();
  
      if (!role || !['admin', 'teamlead', 'intern'].includes(role)) {
        alert('Your role is not assigned or invalid. Please contact the Admin.');
        return;
      }
  
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'teamlead') {
        navigate('/teamlead-dashboard');
      } else {
        navigate('/intern-dashboard');
      }
    } catch (error) {
      console.error(error);
      alert('Login failed. Please check your email and password.');
    }
  };
  

  const handleChangePassword = async () => {
    try {
      if (!auth.currentUser) {
        alert('Please sign in first. If you forgot your password, contact admin.');
        return;
      }
      await updatePassword(auth.currentUser, newPassword);
      alert('Password updated successfully.');
    } catch (error) {
      console.error(error);
      alert('Failed to update password. You might need to re-authenticate.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      let userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const role = prompt('Enter your role: admin, teamlead, or intern')?.toLowerCase();
        if (!['admin', 'teamlead', 'intern'].includes(role)) {
          alert('Invalid role. Please contact the system administrator.');
          return;
        }

        const teamName = role === 'admin' ? 'AdminTeam' : prompt('Enter your team name') || 'General';
        const newUser = {
          name: user.displayName,
          email: user.email,
          role,
          teamName,
        };

        if (role === 'intern') {
          const teamLeadId = prompt('Enter your Team Lead UID');
          newUser.teamLeadId = teamLeadId || '';
        }

        await setDoc(userRef, newUser);
        alert('User registered successfully!');
        userSnap = await getDoc(userRef);
      } else {
        alert('Welcome back!');
      }

      const role = userSnap.data().role?.toLowerCase();
      if (role === 'admin') navigate('/admin-dashboard');
      else if (role === 'teamlead') navigate('/teamlead-dashboard');
      else navigate('/intern-dashboard');
    } catch (error) {
      console.error('Google login failed:', error);
      alert('Login failed. See console for details.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-900 to-teal-900 overflow-hidden relative">
      <div className="tech-bg absolute inset-0 overflow-hidden"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,...')]"></div>

      <div className="bg-white/5 backdrop-blur-md border border-teal-400/20 rounded-xl p-8 w-full max-w-sm z-10 shadow-2xl shadow-teal-900/50">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">SmartWork</h1>
          <p className="text-teal-300 font-mono tracking-widest text-sm mt-2">PORTAL</p>
          <div className="w-20 h-1 bg-teal-400 mx-auto mt-3 rounded-full"></div>
        </div>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 px-4 py-2 rounded bg-white/10 text-white border border-teal-300 placeholder-teal-300"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 px-4 py-2 rounded bg-white/10 text-white border border-teal-300 placeholder-teal-300"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleEmailLogin}
          className="w-full mb-3 py-2 bg-teal-600 text-white rounded hover:bg-teal-500"
        >
          Sign in with Email
        </button>

        <p
          onClick={() => setShowChangePassword(!showChangePassword)}
          className="text-xs text-teal-200 underline text-center cursor-pointer mb-3"
        >
          {showChangePassword ? 'Cancel' : 'Change Password'}
        </p>

        {showChangePassword && (
          <>
            <input
              type="password"
              placeholder="New Password"
              className="w-full mb-2 px-4 py-2 rounded bg-white/10 text-white border border-teal-300 placeholder-teal-300"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              onClick={handleChangePassword}
              className="w-full mb-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-500"
            >
              Update Password
            </button>
            <p className="text-xs text-center text-teal-200 mb-4">
              Forgot password? Contact Admin.
            </p>
          </>
        )}

        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-medium rounded-lg hover:from-cyan-500 hover:to-teal-500 transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            {/* Google Icon Paths */}
            <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;

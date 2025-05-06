import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, provider } from '../firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  updatePassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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

  const redirectToDashboard = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      toast.error('Your account is not set up yet. Please contact the Admin.');
      setLoading(false);
      return;
    }

    const role = userSnap.data().role?.toLowerCase();

    if (!role || !['admin', 'teamlead', 'intern'].includes(role)) {
      toast.error('Your role is not assigned correctly. Please contact the Admin.');
      setLoading(false);
      return;
    }

    setLoading(false);
    if (role === 'admin') navigate('/admin-dashboard');
    else if (role === 'teamlead') navigate('/teamlead-dashboard');
    else navigate('/intern-dashboard');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const result = await signInWithPopup(auth, provider);
      await redirectToDashboard(result.user);
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed.');
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    setLoading(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const result = await signInWithEmailAndPassword(auth, email, password);
      await redirectToDashboard(result.user);
    } catch (error) {
      console.error('Email login error:', error.message);
      toast.error('Email login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (auth.currentUser && newPassword) {
        await updatePassword(auth.currentUser, newPassword);
        toast.success('Password updated successfully!');
        setNewPassword('');
        setShowChangePassword(false);
      } else {
        toast.error('Please enter a new password.');
      }
    } catch (error) {
      console.error('Password update error:', error.message);
      toast.error('Password change failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-900 to-teal-900 overflow-hidden relative">
      <div className="tech-bg absolute inset-0 overflow-hidden"></div>

      <div className="bg-white/5 backdrop-blur-md border border-teal-400/20 rounded-xl p-8 w-full max-w-sm z-10 shadow-2xl shadow-teal-900/50">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
            SmartWork
          </h1>
          <p className="text-teal-300 font-mono text-sm mt-2">PORTAL</p>
        </div>

        <p className="text-sm text-teal-200 text-center mb-3">
          Sign in to access your workspace
        </p>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-2 px-3 py-2 rounded bg-white/10 text-white placeholder-teal-300"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative mb-2">
          <input
            type={showPass ? 'text' : 'password'}
            placeholder="Password"
            className="w-full px-3 py-2 rounded bg-white/10 text-white placeholder-teal-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute top-2.5 right-3 text-teal-200"
          >
            {showPass ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </button>
        </div>

        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="rememberMe"
            className="mr-2"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
          />
          <label htmlFor="rememberMe" className="text-teal-200 text-sm">Remember Me</label>
        </div>

        <button
          onClick={handleEmailLogin}
          disabled={loading}
          className="w-full py-2 bg-teal-600 text-white font-semibold rounded hover:bg-teal-500 mb-2 flex justify-center"
        >
          {loading ? 'Signing in...' : 'Sign in with Email'}
        </button>

        <div className="text-xs text-teal-300 text-center mb-2">
          Forgot password? Contact admin.
        </div>

        {!showChangePassword && (
          <div className="text-center mb-4">
            <button
              onClick={() => setShowChangePassword(true)}
              className="text-sm text-yellow-300 underline hover:text-yellow-400"
            >
              Change Password
            </button>
          </div>
        )}

        {showChangePassword && (
          <>
            <div className="relative mb-2">
              <input
                type={showNewPass ? 'text' : 'password'}
                placeholder="New Password"
                className="w-full px-3 py-2 rounded bg-white/10 text-white placeholder-teal-300"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute top-2.5 right-3 text-teal-200"
              >
                {showNewPass ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>

            <button
              onClick={handleChangePassword}
              className="w-full py-2 bg-yellow-600 text-white font-semibold rounded hover:bg-yellow-500 mb-4"
            >
              Update Password
            </button>
          </>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-medium rounded-lg flex items-center justify-center gap-3 hover:from-cyan-500 hover:to-teal-500"
        >
          <FcGoogle size={20} />
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};


export default LoginPage;

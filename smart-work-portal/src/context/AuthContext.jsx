import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Firebase user
  const [userData, setUserData] = useState(null); // Firestore data (user role)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);

        // ✅ Setup real-time listener for user data (role)
        const unsubscribeUserData = onSnapshot(userRef, (userSnap) => {
          if (userSnap.exists()) {
            const fetchedUserData = { uid: firebaseUser.uid, ...userSnap.data() };
            setUserData(fetchedUserData); // Save the full user data (including role)
          } else {
            setUserData(null); // User data not found
          }
          setLoading(false); // ✅ Set loading false once data is received
        });

        // Cleanup Firestore listener
        return () => unsubscribeUserData();
      } else {
        setUserData(null);
        setLoading(false); // ✅ Stop loading even if no user is signed in
      }
    });

    // Cleanup Auth listener
    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access auth context
export const useAuth = () => useContext(AuthContext);

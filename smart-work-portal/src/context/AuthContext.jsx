import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Firebase user
  const [userData, setUserData] = useState(null); // Firestore data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // Listen for changes in the user's Firestore document in real-time
        const unsubscribeUserData = onSnapshot(userRef, (userSnap) => {
          if (userSnap.exists()) {
            setUserData({ uid: firebaseUser.uid, ...userSnap.data() });
          } else {
            setUserData(null);
          }
        });

        // Clean up the listener when the component unmounts or the user changes
        return () => unsubscribeUserData();
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    // Clean up the auth listener when the component unmounts
    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

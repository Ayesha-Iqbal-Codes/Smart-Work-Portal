import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; // import useAuth
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const TeamLeadDashboard = () => {
  const { user, userData, loading } = useAuth(); // Use the user and userData from the context
  const [interns, setInterns] = useState([]);

  useEffect(() => {
    const fetchInterns = async () => {
      if (!userData || userData.role !== 'teamlead') return;

      // Fetch interns assigned to the current team lead
      const internsQuery = query(
        collection(db, 'users'),
        where('teamLeadId', '==', userData.uid),
        where('role', '==', 'intern')
      );

      const internSnaps = await getDocs(internsQuery);
      const internList = internSnaps.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInterns(internList);
    };

    if (!loading) {
      fetchInterns();
    }
  }, [userData, loading]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      {userData && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome, {userData.name}</h2>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Team Name:</strong> {userData.teamName}</p>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold mb-2">Your Interns:</h3>
        {interns.length === 0 ? (
          <p>No interns assigned to you yet.</p>
        ) : (
          <ul className="space-y-2">
            {interns.map(intern => (
              <li key={intern.id} className="p-4 bg-gray-100 rounded shadow">
                <p><strong>Name:</strong> {intern.name}</p>
                <p><strong>Email:</strong> {intern.email}</p>
                <p><strong>Team Name:</strong> {intern.teamName}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TeamLeadDashboard;

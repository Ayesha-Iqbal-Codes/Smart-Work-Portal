import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; // import useAuth
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const InternDashboard = () => {
  const { userData, loading } = useAuth(); // useAuth hook to get user data
  const [teamLead, setTeamLead] = useState(null);

  useEffect(() => {
    const fetchTeamLead = async () => {
      if (!userData || userData.role !== 'intern') return;

      // Fetch the team lead ID from the intern's user data
      const { teamLeadId } = userData;

      if (teamLeadId) {
        const teamLeadRef = doc(db, 'users', teamLeadId);
        const teamLeadSnap = await getDoc(teamLeadRef);

        if (teamLeadSnap.exists()) {
          setTeamLead(teamLeadSnap.data());
        }
      }
    };

    if (!loading) {
      fetchTeamLead();
    }
  }, [userData, loading]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Intern Dashboard</h1>
      {teamLead ? (
        <div className="border p-4 rounded shadow">
          <p><strong>Your Team Lead:</strong> {teamLead.name}</p>
          <p><strong>Email:</strong> {teamLead.email}</p>
          <p><strong>Team:</strong> {teamLead.teamName}</p>
        </div>
      ) : (
        <p>Loading team lead info...</p>
      )}
    </div>
  );
};

export default InternDashboard;

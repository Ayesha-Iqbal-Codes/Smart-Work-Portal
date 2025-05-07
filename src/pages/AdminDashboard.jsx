import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { userData, loading } = useAuth();
  const [teamLeads, setTeamLeads] = useState([]);
  const [interns, setInterns] = useState([]);
  const [selectedLead, setSelectedLead] = useState('');
  const [selectedIntern, setSelectedIntern] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showUsers, setShowUsers] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showAddIntern, setShowAddIntern] = useState(false);

  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newInternName, setNewInternName] = useState('');
  const [newInternEmail, setNewInternEmail] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const userSnap = await getDocs(collection(db, 'users'));
        const users = userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTeamLeads(users.filter(u => u.role === 'teamlead'));
        setInterns(users.filter(u => u.role === 'intern'));
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) fetchUsers();
  }, [loading]);

  const assignIntern = async () => {
    if (!selectedLead || !selectedIntern) {
      alert('Please select both a team lead and an intern');
      return;
    }

    try {
      const internRef = doc(db, 'users', selectedIntern);
      await updateDoc(internRef, { teamLeadId: selectedLead });
      alert('Intern assigned successfully!');
      setSelectedLead('');
      setSelectedIntern('');
    } catch (error) {
      console.error('Assignment error:', error);
      alert('Something went wrong while assigning intern.');
    }
  };

  const handleAddTeamLead = async (e) => {
    e.preventDefault();
    if (!newLeadName || !newLeadEmail) {
      alert('Name and Email are required');
      return;
    }

    try {
      await addDoc(collection(db, 'users'), {
        name: newLeadName,
        email: newLeadEmail,
        role: 'teamlead',
        teamName: ''
      });
      alert('Team Lead added!');
      setNewLeadName('');
      setNewLeadEmail('');
      setShowAddLead(false);
    } catch (error) {
      console.error('Add Team Lead error:', error);
      alert('Failed to add Team Lead');
    }
  };

  const handleAddIntern = async (e) => {
    e.preventDefault();
    if (!newInternName || !newInternEmail) {
      alert('Name and Email are required');
      return;
    }

    try {
      await addDoc(collection(db, 'users'), {
        name: newInternName,
        email: newInternEmail,
        role: 'intern',
        teamLeadId: ''
      });
      alert('Intern added!');
      setNewInternName('');
      setNewInternEmail('');
      setShowAddIntern(false);
    } catch (error) {
      console.error('Add Intern error:', error);
      alert('Failed to add Intern');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 to-teal-900 p-6 text-teal-50">
      <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-6 border border-teal-400/20 shadow-lg">
        <h2 className="text-2xl font-bold text-center text-teal-200 mb-4">Admin Dashboard</h2>

        {isLoading ? (
          <div className="text-center text-teal-200">Loading users...</div>
        ) : (
          <div className="space-y-6">
            {/* Assign Intern */}
            <div>
              <h3 className="text-xl text-teal-200 mb-2">Assign Intern to Team Lead</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-teal-300">Select Team Lead</label>
                  <select
                    value={selectedLead}
                    onChange={e => setSelectedLead(e.target.value)}
                    className="w-full bg-teal-700 border border-teal-400/30 rounded-lg px-4 py-2 text-teal-50"
                  >
                    <option value="">-- Select Team Lead --</option>
                    {teamLeads.map(lead => (
                      <option key={lead.id} value={lead.id}>
                        {lead.name} ({lead.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-teal-300">Select Intern</label>
                  <select
                    value={selectedIntern}
                    onChange={e => setSelectedIntern(e.target.value)}
                    className="w-full bg-teal-700 border border-teal-400/30 rounded-lg px-4 py-2 text-teal-50"
                  >
                    <option value="">-- Select Intern --</option>
                    {interns.map(intern => (
                      <option key={intern.id} value={intern.id}>
                        {intern.name} ({intern.email})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={assignIntern}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-medium rounded-lg hover:from-cyan-500 hover:to-teal-500 transition-all"
                >
                  Assign Intern
                </button>
              </div>
            </div>

            {/* Admin Functions */}
            <div>
              <h3 className="text-xl text-teal-200 mb-2">Admin Actions</h3>
              <ul className="space-y-2">
                <li
                  className="text-teal-100 hover:text-teal-300 cursor-pointer"
                  onClick={() => setShowUsers(!showUsers)}
                >
                  View All Users
                </li>
                <li
                  className="text-teal-100 hover:text-teal-300 cursor-pointer"
                  onClick={() => setShowAddLead(!showAddLead)}
                >
                  Add New Team Lead
                </li>
                <li
                  className="text-teal-100 hover:text-teal-300 cursor-pointer"
                  onClick={() => setShowAddIntern(!showAddIntern)}
                >
                  Add New Intern
                </li>
              </ul>

              {/* View All Users */}
              {showUsers && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-teal-300">Team Leads:</h4>
                  {teamLeads.map(tl => (
                    <p key={tl.id}>{tl.name} - {tl.email}</p>
                  ))}
                  <h4 className="text-teal-300 mt-2">Interns:</h4>
                  {interns.map(i => (
                    <p key={i.id}>{i.name} - {i.email}</p>
                  ))}
                </div>
              )}

              {/* Add New Team Lead Form */}
              {showAddLead && (
                <form onSubmit={handleAddTeamLead} className="mt-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Team Lead Name"
                    value={newLeadName}
                    onChange={e => setNewLeadName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
                  />
                  <input
                    type="email"
                    placeholder="Team Lead Email"
                    value={newLeadEmail}
                    onChange={e => setNewLeadEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
                  />
                  <button type="submit" className="w-full py-2 bg-teal-600 rounded-lg hover:bg-teal-500">
                    Add Team Lead
                  </button>
                </form>
              )}

              {/* Add New Intern Form */}
              {showAddIntern && (
                <form onSubmit={handleAddIntern} className="mt-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Intern Name"
                    value={newInternName}
                    onChange={e => setNewInternName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
                  />
                  <input
                    type="email"
                    placeholder="Intern Email"
                    value={newInternEmail}
                    onChange={e => setNewInternEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
                  />
                  <button type="submit" className="w-full py-2 bg-cyan-600 rounded-lg hover:bg-cyan-500">
                    Add Intern
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

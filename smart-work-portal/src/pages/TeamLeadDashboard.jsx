import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const TeamLeadDashboard = () => {
  const { userData, loading } = useAuth();
  const [interns, setInterns] = useState([]);
  const [file, setFile] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    assignedTo: '',
  });

  useEffect(() => {
    const fetchInterns = async () => {
      if (!userData || userData.role !== 'teamlead') return;

      const internsQuery = query(
        collection(db, 'users'),
        where('teamLeadId', '==', userData.uid),
        where('role', '==', 'intern')
      );
      const internSnap = await getDocs(internsQuery);
      const internList = internSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInterns(internList);
    };

    if (!loading) fetchInterns();
  }, [userData, loading]);

  useEffect(() => {
    const fetchTeamName = async () => {
      if (userData?.role === 'teamlead') {
        // First check if it's already available
        if (userData.teamName) {
          setTeamName(userData.teamName);
        } else {
          // Fallback: fetch from Firestore
          const userRef = doc(db, 'users', userData.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setTeamName(userSnap.data().teamName || '');
          }
        }
      }
    };

    fetchTeamName();
  }, [userData]);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.deadline || !formData.assignedTo) {
      alert('Please fill all fields');
      return;
    }

    try {
      let fileURL = null;

      if (file) {
        const fileRef = ref(storage, `taskFiles/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        fileURL = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, 'tasks'), {
        ...formData,
        fileURL,
        createdBy: userData.uid,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      alert('Task assigned successfully!');
      setFormData({ title: '', description: '', deadline: '', assignedTo: '' });
      setFile(null);
    } catch (err) {
      console.error('Error assigning task:', err);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-900 to-teal-900">
        <p className="text-teal-100">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 to-teal-900 p-6 text-teal-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-200">
            Welcome, {userData?.name}
          </h2>
          {teamName && (
            <p className="text-lg mt-1 text-teal-100">
              Team Lead of <span className="font-semibold text-teal-300">{teamName}</span>
            </p>
          )}
          <div className="w-24 h-1 bg-teal-400 mt-2 rounded-full"></div>
        </div>

        {/* Task Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-teal-400/20 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-teal-200">Assign a Task</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="title"
              placeholder="Task Title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-white/10 border border-teal-400/30 rounded-lg px-4 py-2 text-teal-50 placeholder-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <textarea
              name="description"
              placeholder="Task Description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-white/10 border border-teal-400/30 rounded-lg px-4 py-2 text-teal-50 placeholder-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
              rows="4"
            />
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full bg-white/10 border border-teal-400/30 rounded-lg px-4 py-2 text-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="w-full bg-white/10 border border-teal-400/30 rounded-lg px-4 py-2 text-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="" className="bg-teal-900">Assign To</option>
              {interns.map(intern => (
                <option key={intern.id} value={intern.id} className="bg-teal-900">
                  {intern.name} ({intern.email})
                </option>
              ))}
            </select>
            <div>
              <label className="block text-teal-200 mb-2">Attach File</label>
              <input
                type="file"
                onChange={e => setFile(e.target.files[0])}
                className="w-full text-teal-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-teal-800 file:bg-teal-300 file:hover:bg-teal-400 cursor-pointer"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-medium rounded-lg hover:from-cyan-500 hover:to-teal-500 transition-all"
            >
              Assign Task
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamLeadDashboard;

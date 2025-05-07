import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import axios from 'axios';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16 MB

const TeamLeadDashboard = () => {
  const { userData, loading } = useAuth();
  const [interns, setInterns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [file, setFile] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    assignedTo: '',
  });
  const [fileError, setFileError] = useState('');
  const [uploadedFileURL, setUploadedFileURL] = useState(null);

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
    const fetchTasks = async () => {
      if (!userData || userData.role !== 'teamlead') return;

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('createdBy', '==', userData.uid)
      );
      const taskSnap = await getDocs(tasksQuery);
      const taskList = taskSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(taskList);
    };

    if (!loading) fetchTasks();
  }, [userData, loading]);

  useEffect(() => {
    const fetchTeamName = async () => {
      if (userData?.role === 'teamlead') {
        if (userData.teamName) {
          setTeamName(userData.teamName);
        } else {
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

  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setFileError('File size exceeds 16 MB limit.');
        setFile(null);
      } else {
        setFileError('');
        setFile(selectedFile);
      }
    }
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
        const fileFormData = new FormData();
        fileFormData.append('file', file);

        const response = await axios.post('http://localhost:5000/upload', fileFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        fileURL = response.data.fileURL;
        setUploadedFileURL(fileURL);
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

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, { status: newStatus });
      alert(`Task ${newStatus}`);

      const tasksQuery = query(collection(db, 'tasks'), where('createdBy', '==', userData.uid));
      const taskSnap = await getDocs(tasksQuery);
      const taskList = taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(taskList);
    } catch (err) {
      console.error('Error updating task status:', err);
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
                onChange={handleFileChange}
                className="w-full text-teal-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-teal-800 file:bg-teal-300 file:hover:bg-teal-400 cursor-pointer"
              />
              {fileError && <p className="text-red-500 text-sm">{fileError}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-medium rounded-lg hover:from-cyan-500 hover:to-teal-500 transition-all"
            >
              Assign Task
            </button>
          </form>
        </div>

        {/* Uploaded File Link */}
        {uploadedFileURL && (
          <div className="mt-4 bg-white/10 border border-teal-400/20 p-4 rounded-lg text-teal-100">
            <p className="mb-2 font-semibold">Uploaded File:</p>
            <a
              href={`http://localhost:5000${uploadedFileURL}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-300 hover:underline break-all"
            >
              {uploadedFileURL}
            </a>
          </div>
        )}

        {/* Intern Tasks List */}
        <div className="mt-10 bg-white/10 p-6 rounded-xl border border-teal-400/20 shadow-lg">
          <h3 className="text-xl font-semibold text-teal-200 mb-4">Assigned Tasks</h3>
          {interns.map(intern => (
            <div key={intern.id} className="mb-6">
              <h4 className="text-lg text-teal-100 font-semibold mb-2">{intern.name} ({intern.email})</h4>
              <ul className="space-y-3 ml-4">
                {tasks.filter(task => task.assignedTo === intern.id).length === 0 ? (
                  <p className="text-teal-300">No tasks assigned.</p>
                ) : (
                  tasks
                    .filter(task => task.assignedTo === intern.id)
                    .map(task => (
                      <li key={task.id} className="bg-white/10 p-4 rounded-lg border border-teal-400/20">
                        <p className="text-teal-100 font-semibold">{task.title}</p>
                        <p className="text-teal-300 text-sm">Status: <span className={task.status === 'approved' ? 'text-green-400' : task.status === 'rejected' ? 'text-red-400' : 'text-yellow-300'}>{task.status}</span></p>
                        {task.githubURL && (
                          <p className="mt-2 text-teal-200">
                            GitHub: <a href={task.githubURL} target="_blank" rel="noopener noreferrer" className="text-teal-300 underline">{task.githubURL}</a>
                          </p>
                        )}
                        {task.websiteURL && (
                          <p className="text-teal-200">
                            Website: <a href={task.websiteURL} target="_blank" rel="noopener noreferrer" className="text-teal-300 underline">{task.websiteURL}</a>
                          </p>
                        )}
                        {task.status === 'pending' && (task.githubURL || task.websiteURL) && (
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => updateTaskStatus(task.id, 'approved')}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateTaskStatus(task.id, 'rejected')}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </li>
                    ))
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamLeadDashboard;

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';

const InternDashboard = () => {
  const { userData, loading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [taskLinks, setTaskLinks] = useState({});

  const fetchTasks = async () => {
    if (!userData || userData.role !== 'intern') return;

    const taskQuery = query(
      collection(db, 'tasks'),
      where('assignedTo', '==', userData.uid)
    );
    const snap = await getDocs(taskQuery);
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTasks(list);

    // Pre-fill taskLinks for rejected tasks
    const links = {};
    list.forEach(task => {
      if (task.status === 'rejected') {
        links[task.id] = {
          websiteURL: task.websiteURL || '',
          githubURL: task.githubURL || '',
        };
      }
    });
    setTaskLinks(links);
  };

  const handleLinkChange = (e, taskId, field) => {
    setTaskLinks(prevState => ({
      ...prevState,
      [taskId]: {
        ...prevState[taskId],
        [field]: e.target.value,
      },
    }));
  };

  const handleSubmit = async (taskId) => {
    const { websiteURL, githubURL } = taskLinks[taskId] || {};
    if (!websiteURL || !githubURL) {
      alert('Please provide both website and GitHub links.');
      return;
    }

    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        websiteURL,
        githubURL,
        status: 'pending',
      });
      alert('Task submitted for approval!');
      fetchTasks();
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  useEffect(() => {
    if (!loading) fetchTasks();
  }, [userData, loading]);

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
          <p className="text-lg mt-1 text-teal-100">Your assigned tasks are below</p>
          <div className="w-24 h-1 bg-teal-400 mt-2 rounded-full"></div>
        </div>

        <div className="space-y-6">
          {tasks.length === 0 ? (
            <p className="text-teal-200">No tasks assigned yet.</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-teal-400/20 shadow-lg"
              >
                <h3 className="text-xl font-semibold text-teal-200">{task.title}</h3>
                <p className="text-teal-100 mt-1 mb-2">{task.description}</p>
                <p className="text-sm text-teal-300">Deadline: {task.deadline}</p>
                <p className="text-sm text-yellow-200 mb-2">
                  Status:{' '}
                  <span
                    className={
                      task.status === 'approved'
                        ? 'text-green-400'
                        : task.status === 'rejected'
                        ? 'text-red-400'
                        : 'text-yellow-300'
                    }
                  >
                    {task.status}
                  </span>
                </p>

                {/* Editable fields for assigned or rejected */}
                {(task.status === 'assigned' || task.status === 'rejected') && (
                  <div>
                    <input
                      type="url"
                      value={taskLinks[task.id]?.websiteURL || ''}
                      onChange={(e) => handleLinkChange(e, task.id, 'websiteURL')}
                      placeholder="Enter your website link"
                      className="w-full bg-white/10 border border-teal-400/30 rounded-lg px-4 py-2 text-teal-50 mt-4"
                    />
                    <input
                      type="url"
                      value={taskLinks[task.id]?.githubURL || ''}
                      onChange={(e) => handleLinkChange(e, task.id, 'githubURL')}
                      placeholder="Enter your GitHub repository link"
                      className="w-full bg-white/10 border border-teal-400/30 rounded-lg px-4 py-2 text-teal-50 mt-4"
                    />
                    <button
                      onClick={() => handleSubmit(task.id)}
                      className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg"
                    >
                      Submit for Approval
                    </button>
                  </div>
                )}

                {/* Display submitted links */}
                {(task.status === 'pending' || task.status === 'approved' || task.status === 'rejected') &&
                  task.websiteURL && task.githubURL && (
                    <div className="mt-4">
                      <p className="text-sm text-teal-200">
                        Website Link:{' '}
                        <a href={task.websiteURL} target="_blank" rel="noopener noreferrer" className="underline">
                          {task.websiteURL}
                        </a>
                      </p>
                      <p className="text-sm text-teal-200">
                        GitHub Link:{' '}
                        <a href={task.githubURL} target="_blank" rel="noopener noreferrer" className="underline">
                          {task.githubURL}
                        </a>
                      </p>
                    </div>
                  )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InternDashboard;

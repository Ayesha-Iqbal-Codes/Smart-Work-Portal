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

  const fetchTasks = async () => {
    if (!userData || userData.role !== 'intern') return;

    const taskQuery = query(
      collection(db, 'tasks'),
      where('assignedTo', '==', userData.uid)
    );
    const snap = await getDocs(taskQuery);
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTasks(list);
  };

  const markAsCompleted = async (taskId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, { status: 'completed' });
      fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
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
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-200">
            Welcome, {userData?.name}
          </h2>
          <p className="text-lg mt-1 text-teal-100">Your assigned tasks are below</p>
          <div className="w-24 h-1 bg-teal-400 mt-2 rounded-full"></div>
        </div>

        {/* Task List */}
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
                      task.status === 'completed' ? 'text-green-400' : 'text-yellow-300'
                    }
                  >
                    {task.status}
                  </span>
                </p>

                
                {task.fileURL && (
  <a
    href={`http://localhost:5000${task.fileURL}`}  // Correct link to serve the file from /uploads
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block mt-2 text-sm text-cyan-300 underline hover:text-cyan-200"
  >
    📄 View Instruction File
  </a>
)}




                {task.status === 'pending' && (
                  <button
                    onClick={() => markAsCompleted(task.id)}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all"
                  >
                    Mark as Completed
                  </button>
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

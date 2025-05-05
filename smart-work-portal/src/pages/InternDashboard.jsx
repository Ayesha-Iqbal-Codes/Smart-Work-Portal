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
      fetchTasks(); // Refresh
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  useEffect(() => {
    if (!loading) fetchTasks();
  }, [userData, loading]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome, {userData?.name}</h1>
      <h2 className="text-xl font-semibold mb-2">Your Tasks</h2>

      {tasks.length === 0 ? (
        <p>No tasks assigned yet.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map(task => (
            <li key={task.id} className="border p-4 rounded shadow">
              <p><strong>Title:</strong> {task.title}</p>
              <p><strong>Description:</strong> {task.description}</p>
              <p><strong>Deadline:</strong> {task.deadline}</p>
              <p><strong>Status:</strong> {task.status}</p>

              {/* Show instruction file link if available */}
              {task.instructionFileURL && (
                <a
                  href={task.instructionFileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-blue-600 underline"
                >
                  📄 View Instruction File
                </a>
              )}

              {task.status === 'pending' && (
                <button
                  className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => markAsCompleted(task.id)}
                >
                  Mark as Completed
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InternDashboard;

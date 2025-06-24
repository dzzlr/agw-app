"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

export default function GovernanceTasks() {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  // Get API URL from environment variable
  const BACKEND_IP = process.env.NEXT_PUBLIC_BACKEND_IP || "http://localhost:8080";
  const API_BASE_URL = `${BACKEND_IP}/api`;

  // Fetch data for governance tasks
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.error("No authentication token available");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/tasks`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Sort by deadline
        const sortedData = data.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
        setTasks(sortedData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load data", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [API_BASE_URL, token]);

  // Function to save new governance task
  const handlePost = useCallback(async (task) => {
    if (!token) {
      console.error("No authentication token available");
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(task),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const newTask = await response.json();
      setTasks((prev) => [...prev, newTask]);
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Failed to save data", error);
    }
  }, [API_BASE_URL, token]);

  // Function to update existing governance task
  const handleSave = useCallback(async (task) => {
    if (!token) {
      console.error("No authentication token available");
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(task),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const updatedTask = await response.json();
      setTasks((prev) =>
        prev.map((item) => (item.id === task.id ? updatedTask : item))
      );
      setShowDialog(false);
    } catch (error) {
      console.error("Failed to update data", error);
    }
  }, [API_BASE_URL, token]);

  // Function to delete governance task
  const handleDelete = useCallback(async (id) => {
    if (!token) {
      console.error("No authentication token available");
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, { 
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      setTasks((prev) => prev.filter((item) => item.id !== id));
      setShowDialog(false);
    } catch (error) {
      console.error("Failed to delete data", error);
    }
  }, [API_BASE_URL, token]);

  // Function to show governance task details
  const handleShow = useCallback((id) => {
    const task = tasks.find((item) => item.id === id);
    setCurrentTask(task);
    setShowDialog(true);
  }, [tasks]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  // Get badge color based on status
  const getBadgeClass = (status) => {
    switch(status) {
      case 'done':
        return 'bg-green-900 text-green-200';
      case 'on progress':
        return 'bg-yellow-900 text-yellow-200';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // Get status display text
  const getStatusText = (status) => {
    switch(status) {
      case 'done':
        return 'Done';
      case 'on progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full flex flex-col gap-2 border border-slate-300 rounded-md">
        <div className="flex flex-col">
          <div className="border border-b-slate-300">
            <div className="text-xl font-bold p-4">Governance Tasks</div>
          </div>
          <div className="p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <button
                className="w-fit bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
                onClick={() => setShowCreateDialog(true)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
                Add Task
              </button>
              <Link 
                href="/audit-findings"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View Audit Findings</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </Link>
            </div>

            <div>{tasks.length} Tasks</div>

            {loading ? (
              <div className="flex justify-center">
                <p className="text-gray-400">Loading governance tasks...</p>
              </div>
            ) : (
              <div className="grid border bg-slate-200 border-slate-300 rounded-md">
                <div className="w-full flex flex-row p-2 font-semibold text-slate-700">
                  <div className="w-2/12">Category</div>
                  <div className="w-3/12">Task Name</div>
                  <div className="w-2/12">Status</div>
                  <div className="w-2/12">Owner</div>
                  <div className="w-2/12">Deadline</div>
                  <div className="w-1/12">Notes</div>
                </div>
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="w-full flex flex-row p-2 bg-white rounded-b-md border border-t-slate-300 hover:bg-slate-100 transition cursor-pointer"
                    onClick={() => handleShow(task.id)}
                  >
                    <div className="w-2/12">{task.kategori || "General"}</div>
                    <div className="w-3/12">{task.namaTugas}</div>
                    <div className="w-2/12">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getBadgeClass(
                          task.status
                        )}`}
                      >
                        {getStatusText(task.status)}
                      </span>
                    </div>
                    <div className="w-2/12">{task.pic}</div>
                    <div className="w-2/12">{formatDate(task.tanggal)}</div>
                    <div className="w-1/12 truncate">{task.catatan}</div>
                  </div>
                ))}
              </div>
            )}

            {!loading && tasks.length === 0 && (
              <div className="text-center p-8 rounded-lg shadow-lg">
                <p className="">No governance tasks available.</p>
              </div>
            )}
          </div>
        </div>

        {showDialog && (
          <TaskDialog
            task={currentTask}
            onClose={() => setShowDialog(false)}
            onSave={handleSave}
            onDelete={handleDelete}
            formatDate={formatDate}
            getBadgeClass={getBadgeClass}
            getStatusText={getStatusText}
          />
        )}

        {showCreateDialog && (
          <TaskCreateDialog
            onClose={() => setShowCreateDialog(false)}
            onSave={handlePost}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// Task Dialog Component
function TaskDialog({ task, onClose, onSave, onDelete, formatDate, getBadgeClass, getStatusText }) {
  const [formState, setFormState] = useState({
    id: task.id || "",
    namaTugas: task.namaTugas || "",
    kategori: task.kategori || "",
    catatan: task.catatan || "",
    tanggal: task.tanggal || "",
    pic: task.pic || "",
    status: task.status || "not yet",
  });

  const [isEdit, setIsEdit] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formState);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 lg:w-2/3 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          {!isEdit ? (
            <h3 className="text-xl font-bold">{formState.namaTugas}</h3>
          ) : (
            <h3 className="text-xl font-bold">Edit Task</h3>
          )}
          <button
            className="p-2 rounded-full"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {isEdit && (
            <>
              <div>
                <div className="font-bold mb-1">Category</div>
                <input
                  name="kategori"
                  className="w-full p-2 border border-slate-200"
                  value={formState.kategori}
                  onChange={handleChange}
                />
              </div>
              <div>
                <div className="font-bold mb-1">Task Name</div>
                <input
                  name="namaTugas"
                  className="w-full p-2 border border-slate-200"
                  value={formState.namaTugas}
                  onChange={handleChange}
                />
              </div>
            </>
          )}
          
          <div>
            <div className="font-bold mb-1">Deadline</div>
            {!isEdit ? (
              <div>{formatDate(formState.tanggal)}</div>
            ) : (
              <input
                type="date"
                name="tanggal"
                className="w-full p-2 border border-slate-200"
                value={formState.tanggal}
                onChange={handleChange}
              />
            )}
          </div>
          
          <div>
            <div className="font-bold mb-1">Status</div>
            {!isEdit ? (
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBadgeClass(formState.status)}`}>
                {getStatusText(formState.status)}
              </span>
            ) : (
              <select
                name="status"
                className="w-full p-2 border border-slate-200"
                value={formState.status}
                onChange={handleChange}
              >
                <option value="not yet">Not Started</option>
                <option value="on progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <div className="font-bold mb-1">Notes</div>
          {!isEdit ? (
            <div>{formState.catatan}</div>
          ) : (
            <textarea
              name="catatan"
              className="w-full p-2 border border-slate-200"
              rows={4}
              value={formState.catatan}
              onChange={handleChange}
            />
          )}
        </div>
        
        <div className="mb-6">
          <div className="font-bold mb-1">Person in Charge</div>
          {!isEdit ? (
            <div>{formState.pic}</div>
          ) : (
            <input
              name="pic"
              className="w-full p-2 border border-slate-200"
              value={formState.pic}
              onChange={handleChange}
            />
          )}
        </div>
        
        <div className="flex justify-end gap-3">
          {isEdit ? (
            <>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                onClick={() => setIsEdit(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={() => setIsEdit(true)}
              >
                Edit
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                onClick={() => onDelete(task.id)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Task Create Dialog Component
function TaskCreateDialog({ onClose, onSave }) {
  const [formState, setFormState] = useState({
    namaTugas: "",
    kategori: "",
    catatan: "",
    tanggal: "",
    status: "not yet",
    pic: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formState);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 lg:w-2/3 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Add New Task</h3>
          <button
            className="p-2 rounded-full"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="font-bold mb-1">Category</div>
            <input
              name="kategori"
              className="w-full p-2 border border-slate-200"
              placeholder="Enter category"
              value={formState.kategori}
              onChange={handleChange}
            />
          </div>
          <div>
            <div className="font-bold mb-1">Task Name</div>
            <input
              name="namaTugas"
              className="w-full p-2 border border-slate-200"
              placeholder="Enter task name"
              value={formState.namaTugas}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <div className="font-bold mb-1">Deadline</div>
            <input
              type="date"
              name="tanggal"
              className="w-full p-2 border border-slate-200"
              value={formState.tanggal}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <div className="font-bold mb-1">Status</div>
            <select
              name="status"
              className="w-full p-2 border border-slate-200"
              value={formState.status}
              onChange={handleChange}
            >
              <option value="not yet">Not Started</option>
              <option value="on progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="font-bold mb-1">Notes</div>
          <textarea
            name="catatan"
            className="w-full p-2 border border-slate-200"
            placeholder="Enter task details"
            rows={4}
            value={formState.catatan}
            onChange={handleChange}
          />
        </div>
        
        <div className="mb-6">
          <div className="font-bold mb-1">Person in Charge</div>
          <input
            name="pic"
            className="w-full p-2 border border-slate-200"
            placeholder="Enter person or team responsible"
            value={formState.pic}
            onChange={handleChange}
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { toast } from "react-hot-toast";
import { FaExclamationTriangle, FaFileExport, FaPlus, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";

// Keep the existing interfaces and type definitions
interface ChangeRequest {
    id: number;
    name: string;
    type: string;
    category: string;
    urgency: string;
    requested_migration_date: string;
    actual_migration_date: string | null;
    created_at: string;
    finished_at: string | null;
    status: string;
    cab_meeting_date: string | null;
    downtime_risk: number;
    requester_id: number;
    approver_id: number | null;
    requester_name: string;
    approver_name: string | null;
    group: string;
    division: string;
    project_code: string;
    rfc_number: string;
    pic: string;
}

type StatusOption = { value: string; label: string };

const statusOptions: StatusOption[] = [
    { value: "draft", label: "Draft" },
    { value: "waiting_approval", label: "Waiting Approval" },
    { value: "waiting_finalization", label: "Waiting Finalization" },
    { value: "waiting_ops_vdh_approval", label: "Waiting OPS VDH Approval" },
    { value: "waiting_dev_vdh_approval", label: "Waiting DEV VDH Approval" },
    { value: "waiting_migration", label: "Waiting Migration" },
    { value: "success", label: "Success" },
    { value: "failed", label: "Failed" },
];

type SortOption = { value: string; label: string };

const sortOptions: SortOption[] = [
    { value: "status", label: "Status" },
    { value: "created_at", label: "Created At" },
];

// Type to hold both name and ID
type RequesterInfo = {
    name: string;
    id: number;
};

interface User {
    id: number;
    name: string;
    username: string;
    role: string;
    division: string;
    email: string;
}

export default function ChangeManagement() {
    // Keep the existing state variables
    const [allRequests, setAllRequests] = useState<ChangeRequest[]>([]);
    const [requests, setRequests] = useState<ChangeRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [timeReference, setTimeReference] = useState<"CAB" | "Migration">("CAB");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]); 
    const [sortBy, setSortBy] = useState<string>("created_at");
    const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
    const [alertRequesters, setAlertRequesters] = useState<RequesterInfo[]>([]);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [alertSubject, setAlertSubject] = useState<string>('');
    const [alertText, setAlertText] = useState<string>('');
    const router = useRouter();

    const { token, user } = useAuth();

    // We'll keep the existing useEffect hooks and functions
    // but will update the UI to match the audit-findings style
    
    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
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
            case 'success':
                return 'bg-green-900 text-green-200';
            case 'waiting_approval':
            case 'waiting_finalization':
            case 'waiting_ops_vdh_approval':
            case 'waiting_dev_vdh_approval':
            case 'waiting_migration':
                return 'bg-yellow-900 text-yellow-200';
            case 'failed':
                return 'bg-red-900 text-red-200';
            default:
                return 'bg-gray-700 text-gray-300';
        }
    };

    // Get status display text
    const getStatusText = (status) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Load alert configuration
    useEffect(() => {
        const replaceVariables = (template: string) => {
            const currentDate = new Date().toLocaleDateString();
            return template
                .replace(/{{currentDate}}/g, currentDate)
                .replace(/{{currentUser}}/g, user?.name || "Admin");
        };
        
        const loadAlertConfig = async () => {
            if (!token || !user) return;
    
            try {
                const [subjectResponse, textResponse] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}/api/config?key=blast_email_alert_subject`, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}/api/config?key=blast_email_alert_text`, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                ]);
    
                if (!subjectResponse.ok || !textResponse.ok) {
                    throw new Error("Failed to load alert configuration");
                }
    
                const subjectData = await subjectResponse.json();
                const textData = await textResponse.json();
    
                let loadedSubject = "";
                let loadedText = "";
    
                if (subjectData.success && subjectData.data && subjectData.data.length > 0) {
                    loadedSubject = subjectData.data[0].value;
                } else {
                    console.warn("blast_email_alert_subject not found, using default");
                    loadedSubject = "Placeholder Subject";
                }
    
                if (textData.success && textData.data && textData.data.length > 0) {
                    loadedText = textData.data[0].value;
                } else {
                    console.warn("blast_email_alert_text not found, using default");
                    loadedText = "Placeholder Text";
                }
    
                setAlertSubject(replaceVariables(loadedSubject));
                setAlertText(replaceVariables(loadedText));
    
            } catch (error: unknown) {
                console.error("Error loading alert configuration:", error);
                if (error instanceof Error) {
                    toast.error(`Error loading alert configuration: ${error.message}`);
                } else {
                    toast.error("Error loading alert configuration: Unknown error");
                }
            }
        };
    
        loadAlertConfig();
    }, [token, user]);

    // Fetch change requests
    useEffect(() => {
        async function fetchRequests() {
            if (!token) return;

            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}/api/requests`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();
                if (!result.success) {
                    throw new Error("Failed to fetch change requests.");
                }

                setAllRequests(result.data);
                setRequests(result.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        }

        fetchRequests();
    }, [token]);

    // Apply filters
    useEffect(() => {
        const applyFilters = () => {
            let filtered = [...allRequests];
    
            // Time Reference Filtering
            if (timeReference === "CAB") {
                filtered = filtered.filter(request => {
                    const createdAt = new Date(request.created_at);
                    const start = startDate ? new Date(startDate) : null;
                    const end = endDate ? new Date(endDate) : null;
    
                    if (start) {
                        start.setHours(0, 0, 0, 0);
                        if (createdAt < start) return false;
                    }
                    if (end) {
                        end.setHours(23, 59, 59, 999);
                        if (createdAt > end) return false;
                    }
                    return true;
                });
            } else if (timeReference === "Migration") {
                filtered = filtered.filter(request => {
                    if (request.status !== "success" && request.status !== "failed") return false;
                    if (!request.finished_at) return false;
    
                    const finishedAt = new Date(request.finished_at);
                    const start = startDate ? new Date(startDate) : null;
                    const end = endDate ? new Date(endDate) : null;
    
                    if (start) {
                        start.setHours(0, 0, 0, 0);
                        if (finishedAt < start) return false;
                    }
                    if (end) {
                        end.setHours(23, 59, 59, 999);
                        if (finishedAt > end) return false;
                    }
    
                    return true;
                });
            }
    
            // Status Filtering
            if (selectedStatuses.length > 0) {
                filtered = filtered.filter(request => selectedStatuses.includes(request.status));
            }
    
            // Sorting
            if (sortBy === "status") {
                filtered.sort((a, b) => a.status.localeCompare(b.status));
            } else if (sortBy === "created_at") {
                filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            }
    
            setRequests(filtered);
        };
        
        applyFilters();
    }, [timeReference, startDate, endDate, selectedStatuses, sortBy, allRequests]);

    // Fetch users for alert modal
    useEffect(() => {
        async function fetchUsers() {
            if (!token) return;

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}/api/users`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();
                if (result.success) {
                    setAvailableUsers(result.data);
                } else {
                    console.error("Failed to fetch users:", result.error || result.message);
                    toast.error("Failed to fetch users");
                }
            } catch (err) {
                console.error("Error fetching users:", err);
                toast.error("Error fetching users");
            }
        }

        if (isAddUserModalOpen) {
            fetchUsers();
        }
    }, [token, isAddUserModalOpen]);

    // Handler functions
    const handleStatusChange = (statusValue: string) => {
        setSelectedStatuses(prevStatuses => {
            if (prevStatuses.includes(statusValue)) {
                return prevStatuses.filter(s => s !== statusValue);
            } else {
                return [...prevStatuses, statusValue];
            }
        });
    };

    const handleSelectAllStatuses = () => {
        setSelectedStatuses(statusOptions.map(option => option.value));
    };

    const handleClearAllStatuses = () => {
        setSelectedStatuses([]);
    };

    const exportToExcel = () => {
        const toastId = toast.loading("Exporting change requests...");
        try {
            if (requests.length === 0) {
                toast.error("No change requests to export based on current filter", { id: toastId, duration: 1500 });
                return;
            }

            const dataForExcel = requests.map(request => ({
                ID: request.id,
                Name: request.name,
                Migration: request.finished_at ? "Yes" : "No",
                Type: request.type,
                Category: request.category,
                CAB_Meeting_Date: formatDate(request.cab_meeting_date),
                Requested_Migration_Date: formatDate(request.requested_migration_date),
                Project_Code: request.project_code,
                RFC_Number: request.rfc_number,
                Requester_Name: request.requester_name,
                Approver_Name: request.approver_name,
                Downtime: request.downtime_risk,
                Time: "",
                PIC: request.pic
            }));

            const ws = XLSX.utils.json_to_sheet(dataForExcel);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Change Requests");
            XLSX.writeFile(wb, "CAB_Report.xlsx");

            toast.success("Change requests exported successfully", { id: toastId, duration: 1500 });
        } catch {
            toast.error("Failed to export change requests", { id: toastId, duration: 1500 });
        }
    };

    const handleAlertClick = () => {
        const uniqueRequesters = [
            ...new Map(requests.map((request) => [request.requester_id, { name: request.requester_name, id: request.requester_id }])).values(),
        ];
        setAlertRequesters(uniqueRequesters);
        setIsAlertModalOpen(true);
    };

    const handleAddRequester = (user: User) => {
        const isAlreadyAdded = alertRequesters.some(requester => requester.id === user.id);
        if (isAlreadyAdded) {
            toast.error("User is already added to the alert list.");
            return;
        }
        setAlertRequesters(prevRequesters => [
            ...prevRequesters,
            { name: user.name, id: user.id }
        ]);
        setIsAddUserModalOpen(false);
    };

    const sendAlertEmail = async (requesterIds: number[], subject: string | null, text: string | null) => {
        try {
            const body: { ids: number[]; subject?: string; text?: string } = {
                ids: requesterIds
            };

            if (subject !== null && subject.trim() !== '') {
                body.subject = subject;
            }

            if (text !== null && text.trim() !== '') {
                body.text = text;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}/api/users/email`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                console.error("Email error:", result);
                throw new Error(result.error || result.message || "Failed to send alert emails.");
            }
            return true;
        } catch (error: unknown) {
            console.error("Error sending emails:", error);
            throw error;
        }
    };

    const handleSendAlerts = async () => {
        const requesterIds = alertRequesters.map(r => r.id);

        if (requesterIds.length === 0) {
            toast.error("No requesters selected for alert emails.");
            return;
        }

        const toastId = toast.loading("Sending alert emails...");

        try {
            await sendAlertEmail(requesterIds, alertSubject, alertText);
            toast.success("Alert emails sent successfully!", { id: toastId, duration: 5000 });
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(`An error occurred while sending alerts: ${error.message}`, { id: toastId, duration: 5000 });
            } else {
                toast.error("An unknown error occurred while sending alerts.", { id: toastId, duration: 5000 });
            }
        } finally {
            setIsAlertModalOpen(false);
        }
    };

    const selectedStatusCount = selectedStatuses.length;
    const statusText = selectedStatusCount === 0 ? "None Selected" : `${selectedStatusCount} Selected`;

    return (
        <DashboardLayout>
            <div className="w-full flex flex-col gap-2 border border-slate-300 rounded-md">
                <div className="flex flex-col">
                    <div className="border border-b-slate-300">
                        <div className="text-xl font-bold p-4">Change Management</div>
                    </div>
                    
                    <div className="p-4 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <button
                                className="w-fit bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
                                onClick={() => router.push("/change-request-form")}
                            >
                                <FaPlus className="w-5 h-5" />
                                <span>Add Request</span>
                            </button>
                            
                            <div className="flex gap-2">
                                <button
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
                                    onClick={exportToExcel}
                                >
                                    <FaFileExport className="w-5 h-5" />
                                    <span>Export</span>
                                </button>
                                
                                <button
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
                                    onClick={handleAlertClick}
                                >
                                    <FaExclamationTriangle className="w-5 h-5" />
                                    <span>Alert</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mb-4">
                            <div className="flex flex-col">
                                <label className="text-sm mb-1">Reference:</label>
                                <select
                                    className="p-2 border border-slate-300 rounded"
                                    value={timeReference}
                                    onChange={(e) => setTimeReference(e.target.value as "CAB" | "Migration")}
                                >
                                    <option value="CAB">CAB</option>
                                    <option value="Migration">Migration</option>
                                </select>
                            </div>
                            
                            <div className="flex flex-col">
                                <label className="text-sm mb-1">Start Date:</label>
                                <input
                                    type="date"
                                    className="p-2 border border-slate-300 rounded"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex flex-col">
                                <label className="text-sm mb-1">End Date:</label>
                                <input
                                    type="date"
                                    className="p-2 border border-slate-300 rounded"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex flex-col relative">
                                <label className="text-sm mb-1">Status:</label>
                                <button
                                    type="button"
                                    className="p-2 border border-slate-300 rounded text-left"
                                    onClick={() => setIsStatusModalOpen(!isStatusModalOpen)}
                                    style={{ minWidth: '150px' }}
                                >
                                    {statusText}
                                </button>
                                
                                {isStatusModalOpen && (
                                    <div className="absolute top-full left-0 mt-1 bg-white border border-slate-300 rounded shadow-lg z-10" style={{ minWidth: '200px' }}>
                                        <div className="p-2">
                                            {statusOptions.map((option) => (
                                                <label key={option.value} className="flex items-center p-1">
                                                    <input
                                                        type="checkbox"
                                                        className="mr-2"
                                                        checked={selectedStatuses.includes(option.value)}
                                                        onChange={() => handleStatusChange(option.value)}
                                                    />
                                                    <span>{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="border-t border-slate-300 p-2 flex justify-between">
                                            <button
                                                className="text-sm text-blue-600"
                                                onClick={handleSelectAllStatuses}
                                            >
                                                Select All
                                            </button>
                                            <button
                                                className="text-sm text-blue-600"
                                                onClick={handleClearAllStatuses}
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                        <div className="border-t border-slate-300 p-2">
                                            <button
                                                className="w-full text-sm text-blue-600"
                                                onClick={() => setIsStatusModalOpen(false)}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex flex-col">
                                <label className="text-sm mb-1">Sort By:</label>
                                <select
                                    className="p-2 border border-slate-300 rounded"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center">
                                <p className="text-gray-400">Loading change requests...</p>
                            </div>
                        ) : (
                            <div className="grid border bg-slate-200 border-slate-300 rounded-md">
                                <div className="w-full flex flex-row p-2 font-semibold text-slate-700">
                                    <div className="w-3/12">Name</div>
                                    <div className="w-2/12">Type</div>
                                    <div className="w-2/12">Status</div>
                                    <div className="w-2/12">Requester</div>
                                    <div className="w-3/12">Requested Date</div>
                                </div>
                                {requests.map((request) => (
                                    <Link 
                                        href={`/change-management/${request.id}`} 
                                        key={request.id}
                                        className="w-full flex flex-row p-2 bg-white rounded-b-md border border-t-slate-300 hover:bg-slate-100 transition cursor-pointer"
                                    >
                                        <div className="w-3/12">{request.name}</div>
                                        <div className="w-2/12">{request.type}</div>
                                        <div className="w-2/12">
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${getBadgeClass(
                                                    request.status
                                                )}`}
                                            >
                                                {getStatusText(request.status)}
                                            </span>
                                        </div>
                                        <div className="w-2/12">{request.requester_name}</div>
                                        <div className="w-3/12">{formatDate(request.requested_migration_date)}</div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {!loading && requests.length === 0 && (
                            <div className="text-center p-8 rounded-lg shadow-lg">
                                <p className="">No change requests available.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Alert Modal */}
            {isAlertModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-11/12 lg:w-2/3 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Request Alert</h3>
                            <button
                                className="p-2 rounded-full"
                                onClick={() => setIsAlertModalOpen(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <p className="mb-4">There are {alertRequesters.length} requesters selected.</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {alertRequesters.map(requester => (
                                <div key={requester.id} className="bg-slate-200 rounded-full px-3 py-1 flex items-center">
                                    {requester.name}
                                    <button
                                        className="ml-2 focus:outline-none"
                                        onClick={() => {
                                            setAlertRequesters(prevRequesters => 
                                                prevRequesters.filter(r => r.id !== requester.id)
                                            );
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            ))}

                            <button 
                                className="bg-slate-200 rounded-full px-3 py-1 flex items-center"
                                onClick={() => setIsAddUserModalOpen(true)}
                            >
                                +
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block font-bold mb-1">Subject:</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-slate-200"
                                value={alertSubject}
                                onChange={(e) => setAlertSubject(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block font-bold mb-1">Message:</label>
                            <textarea
                                rows={8}
                                className="w-full p-2 border border-slate-200"
                                value={alertText}
                                onChange={(e) => setAlertText(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                                onClick={() => setIsAlertModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                                onClick={handleSendAlerts}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {isAddUserModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-11/12 lg:w-1/3 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Add User</h3>
                            <button
                                className="p-2 rounded-full"
                                onClick={() => setIsAddUserModalOpen(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="max-h-60 overflow-y-auto mb-4">
                            {availableUsers.map(user => (
                                <div key={user.id} className="flex justify-between items-center p-2 border-b border-slate-200">
                                    <span>{user.name}</span>
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                                        onClick={() => handleAddRequester(user)}
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <button
                                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                                onClick={() => setIsAddUserModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

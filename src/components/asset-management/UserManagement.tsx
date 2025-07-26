"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  employeeId: string | null;
  lastLogin: string | null;
  createdAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  isAccepted: boolean;
  createdAt: string;
  invitedBy: {
    fullName: string;
  };
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteFormData, setInviteFormData] = useState({
    email: "",
    role: "user",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock data for now - replace with actual API calls
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: "1",
        fullName: "John Doe",
        email: "admin@teknomai.co.id",
        role: "admin",
        isActive: true,
        employeeId: "TMI001",
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        fullName: "Jane Smith",
        email: "user@teknomai.co.id",
        role: "user",
        isActive: true,
        employeeId: "TMI002",
        lastLogin: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    const mockInvitations: Invitation[] = [
      {
        id: "1",
        email: "pending@teknomai.co.id",
        role: "manager",
        isAccepted: false,
        createdAt: new Date().toISOString(),
        invitedBy: {
          fullName: "John Doe",
        },
      },
    ];

    setUsers(mockUsers);
    setInvitations(mockInvitations);
    setIsLoading(false);
  }, []);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/auth/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(inviteFormData),
      });

      const data = await response.json();

      if (response.ok) {
        // Add to invitations list
        setInvitations(prev => [
          {
            id: data.invitation.id,
            email: data.invitation.email,
            role: data.invitation.role,
            isAccepted: false,
            createdAt: data.invitation.createdAt,
            invitedBy: {
              fullName: "Current User", // Replace with actual user name
            },
          },
          ...prev,
        ]);

        // Reset form
        setInviteFormData({ email: "", role: "user" });
        setShowInviteForm(false);

        // Show success message
        alert("Invitation sent successfully!");
      } else {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((error: { path: string[]; message: string }) => {
            fieldErrors[error.path[0]] = error.message;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: data.error || "Failed to send invitation" });
        }
      }
    } catch {
      setErrors({ general: "Network error. Please try again." });
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (confirm("Are you sure you want to deactivate this user?")) {
      // Implement user deactivation
      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, isActive: false } : user
        )
      );
    }
  };

  const handleActivateUser = async (userId: string) => {
    // Implement user activation
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, isActive: true } : user
      )
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "user":
        return "bg-green-100 text-green-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="h-32 rounded bg-gray-200"></div>
          <div className="h-32 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">
            Manage users and invitations for your company
          </p>
        </div>
        <Button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {showInviteForm ? "Cancel" : "Invite User"}
        </Button>
      </div>

      {/* Invite User Form */}
      {showInviteForm && (
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Invite New User</h2>
          <form onSubmit={handleInviteUser} className="space-y-4">
            {errors.general && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={inviteFormData.email}
                  onChange={e =>
                    setInviteFormData(prev => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="user@company.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  value={inviteFormData.role}
                  onChange={e =>
                    setInviteFormData(prev => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Send Invitation
              </Button>
              <Button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Active Users */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">
          Active Users ({users.filter(u => u.isActive).length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  User
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  Role
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  Employee ID
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  Last Login
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.fullName}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {user.employeeId || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {user.isActive ? (
                        <button
                          onClick={() => handleDeactivateUser(user.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateUser(user.id)}
                          className="text-sm text-green-600 hover:text-green-800"
                        >
                          Activate
                        </button>
                      )}
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Pending Invitations ({invitations.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Invited By
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Sent Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {invitations
                  .filter(inv => !inv.isAccepted)
                  .map(invitation => (
                    <tr
                      key={invitation.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {invitation.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(invitation.role)}`}
                        >
                          {invitation.role.charAt(0).toUpperCase() +
                            invitation.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {invitation.invitedBy.fullName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(invitation.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="text-sm text-blue-600 hover:text-blue-800">
                            Resend
                          </button>
                          <button className="text-sm text-red-600 hover:text-red-800">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

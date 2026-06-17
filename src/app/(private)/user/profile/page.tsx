"use client";
import { useState } from "react";
import { useUsersStore } from "@/store/users-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Mail, Shield, Calendar, AlertCircle, Check } from "lucide-react";
import dayjs from "dayjs";

export default function UserProfile() {
  const { currentUser } = useUsersStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-gray-600">User information not available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Implement profile update action
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal information</p>
      </div>

      {/* Profile Card */}
      <Card className="shadow-md">
        <CardHeader className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle>{currentUser.name}</CardTitle>
                <CardDescription>{currentUser.email}</CardDescription>
              </div>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-700 font-medium">Name</Label>
                    {isEditing ? (
                      <Input
                        value={currentUser.name}
                        className="mt-2"
                        disabled
                      />
                    ) : (
                      <div className="mt-2 text-gray-900">
                        {currentUser.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={currentUser.email}
                        className="mt-2"
                        disabled
                      />
                    ) : (
                      <div className="mt-2 text-gray-900">
                        {currentUser.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Account Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-700 font-medium">Role</Label>
                    <div className="mt-2">
                      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-900 font-medium capitalize">
                          {currentUser.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-700 font-medium">Status</Label>
                    <div className="mt-2">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
                          currentUser.status === "active"
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <Check
                          className={`w-4 h-4 ${
                            currentUser.status === "active"
                              ? "text-green-600"
                              : "text-gray-600"
                          }`}
                        />
                        <span
                          className={`font-medium capitalize ${
                            currentUser.status === "active"
                              ? "text-green-900"
                              : "text-gray-900"
                          }`}
                        >
                          {currentUser.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Member Since
                    </Label>
                    <div className="mt-2 text-gray-900">
                      {dayjs(currentUser.created_at).format("MMM DD, YYYY")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User ID Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              User ID
            </h3>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">ID</p>
              <p className="font-mono text-sm text-gray-900 break-all">
                {currentUser.id}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/user/settings")}
                >
                  Account Settings
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Your personal information is secure and private.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-green-600" />
              Communication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              We'll send important updates to your email address.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Manage your account and preferences.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

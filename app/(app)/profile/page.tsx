"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Lock, Mail } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function ProfilePage() {
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    fetch("/api/admin-user")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setEmail(data.email))
      .catch(() => showToast("Failed to load profile.", "error"))
      .finally(() => setIsLoadingAdmin(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingEmail(true);
    try {
      const response = await fetch("/api/admin-user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        showToast(data?.error ?? "Failed to update email.", "error");
        return;
      }
      showToast("Email updated successfully.", "success");
    } catch {
      showToast("Failed to update email.", "error");
    } finally {
      setIsSavingEmail(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await fetch("/api/admin-user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        showToast(data?.error ?? "Failed to update password.", "error");
        return;
      }
      showToast("Password updated successfully.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      showToast("Failed to update password.", "error");
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <div>
      <PageHeader title="Profile" description="Manage your login email and password." />

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
            <CardDescription>The email you sign in with.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleEmailSubmit}>
              <Input
                label="Email"
                type="email"
                icon={<Mail size={16} />}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isLoadingAdmin}
                required
              />
              <Button type="submit" className="self-start" isLoading={isSavingEmail} disabled={isLoadingAdmin}>
                Save Email
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Choose a new password for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handlePasswordSubmit}>
              <Input
                label="Current password"
                type="password"
                icon={<Lock size={16} />}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
              <Input
                label="New password"
                type="password"
                icon={<Lock size={16} />}
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
              <Input
                label="Confirm new password"
                type="password"
                icon={<Lock size={16} />}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
              <Button type="submit" className="self-start" isLoading={isSavingPassword}>
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

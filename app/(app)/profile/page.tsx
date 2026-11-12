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

  const [originalEmail, setOriginalEmail] = useState("");
  const [email, setEmail] = useState("");
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetch("/api/admin-user")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        setEmail(data.email);
        setOriginalEmail(data.email);
      })
      .catch(() => showToast("Failed to load profile.", "error"))
      .finally(() => setIsLoadingAdmin(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const wantsPasswordChange = Boolean(newPassword || confirmPassword || currentPassword);
    if (wantsPasswordChange && newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }

    setIsSaving(true);
    try {
      if (email !== originalEmail) {
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
        setOriginalEmail(email);
      }

      if (wantsPasswordChange) {
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
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      showToast("Profile updated successfully.", "success");
    } catch {
      showToast("Failed to update profile.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Profile" description="Manage your login email and password." />

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Update your email and/or password.</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              icon={<Mail size={16} />}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoadingAdmin}
              required
            />
            <Input
              label="Current password"
              type="password"
              icon={<Lock size={16} />}
              autoComplete="current-password"
              placeholder="Required to change password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
            <Input
              label="New password"
              type="password"
              icon={<Lock size={16} />}
              autoComplete="new-password"
              placeholder="Leave blank to keep current password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
            <Input
              label="Confirm new password"
              type="password"
              icon={<Lock size={16} />}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <Button type="submit" size="sm" className="self-end" isLoading={isSaving} disabled={isLoadingAdmin}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

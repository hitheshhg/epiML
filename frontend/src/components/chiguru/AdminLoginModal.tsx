"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Key, AlertCircle, CheckCircle2, Lock, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminLoginModal({
  isOpen,
  onClose,
  onSuccess,
}: AdminLoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim(); // handles "admin" or "admin "

    // Verify Admin Credentials: username "admin" (or "admin@epiml.ai") and password "admin"
    const isUserValid = cleanUser === "admin" || cleanUser === "admin@epiml.ai" || cleanUser === "administrator";
    const isPassValid = cleanPass === "admin";

    setTimeout(() => {
      if (isUserValid && isPassValid) {
        if (typeof window !== "undefined") {
          const adminSession = {
            username: cleanUser,
            role: "admin",
            authenticatedAt: new Date().toISOString(),
          };
          localStorage.setItem("epiml_admin_auth", JSON.stringify(adminSession));
          sessionStorage.setItem("epiml_admin_auth", JSON.stringify(adminSession));
        }
        setIsLoading(false);
        setUsername("");
        setPassword("");
        onSuccess();
      } else {
        setIsLoading(false);
        setError("Invalid credentials. Access restricted to System Administrators.");
      }
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md bg-card border border-border/80 shadow-2xl rounded-2xl p-6 sm:p-8 relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground tracking-tight">
                  Admin Clearance Gate
                </h2>
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                  Admin-Only
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                ML Training & Model Management Center
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-2 mb-6 leading-relaxed">
            Model training, multi-user dataset aggregation, model registry, and production deployment are restricted exclusively to administrators.
          </p>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Admin Username / Email
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-xl h-10 text-xs font-mono"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="admin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl h-10 text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-1/2 rounded-xl text-xs h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-1/2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs h-10 flex items-center justify-center gap-1.5 shadow-xs hover:opacity-90"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Unlock Admin</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Credentials hint for authorized personnel */}
          <div className="mt-6 pt-4 border-t border-border/60 text-center text-[11px] text-muted-foreground font-mono">
            Default credentials: Username: <strong className="text-foreground">admin</strong> · Password: <strong className="text-foreground">admin</strong>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import { DashboardLayout } from "@/components/recruiter/DashboardLayout";
import React from "react";

export default function RecruiterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
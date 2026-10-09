"use client";

import { BusinessOnboarding } from "@/components/onboarding/business-onboarding";

export default function AssessmentPage() {
  return <BusinessOnboarding assessmentOnly onExit={() => window.location.assign("/score")} />;
}

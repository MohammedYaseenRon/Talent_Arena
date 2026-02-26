"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

type PublishOption = "now" | "draft" | "schedule";

type SuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  challengeId: string;
};

export function ChallengeSuccessModal({
  isOpen,
  onClose,
  challengeId,
}: SuccessModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [option, setOption] = useState<PublishOption>("now");
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [notifyCandidates, setNotifyCandidates] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (option === "schedule") {
      setStep(2);
    } else {
      handleConfirm();
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError("");

    try {
      if (option === "now") {
        // Publish immediately
        const response = await fetch(
          `http://localhost:4000/challenge/${challengeId}/publish`,
          {
            method: "POST",
            credentials: "include",
          },
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to publish");
        }

        toast.success("Challenge published successfully!");
      } else if (option === "draft") {
        // Save as draft
        const response = await fetch(
          `http://localhost:4000/api/challenges/${challengeId}/draft`,
          {
            method: "POST",
            credentials: "include",
          },
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to save draft");
        }

        alert("Challenge saved as draft!");
      } else if (option === "schedule" && date) {
        // Schedule for later
        const startDateTime = new Date(date);
        const [startHours, startMinutes] = startTime.split(":");
        startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

        const endDateTime = new Date(date);
        const [endHours, endMinutes] = endTime.split(":");
        endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

        if (endDateTime <= startDateTime) {
          setError("End time must be after start time");
          setLoading(false);
          return;
        }
        console.log("challengeId being sent:", challengeId); // ← Add this to verify

        const response = await fetch(
          `http://localhost:4000/challenge/schedule`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              challengeId: challengeId,
              startTime: startDateTime.toISOString(),
              endTime: endDateTime.toISOString(),
              notifyCandidates,
            }),
          },
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to schedule");
        }

        toast.success("Challenge scheduled successfully!");
      }

      onClose();
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle>Challenge Created! 🎉</DialogTitle>
              <DialogDescription>
                What would you like to do with this challenge?
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="bg-red-100 text-red-600 p-3 rounded text-sm">
                {error}
              </div>
            )}

            <div className="py-4">
              <RadioGroup
                value={option}
                onValueChange={(v) => setOption(v as PublishOption)}
              >
                <div className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="now" id="now" />
                  <Label htmlFor="now" className="flex-1 cursor-pointer">
                    <div className="font-medium">Publish Now</div>
                    <div className="text-sm text-gray-500">
                      Make it available immediately
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="draft" id="draft" />
                  <Label htmlFor="draft" className="flex-1 cursor-pointer">
                    <div className="font-medium">Save as Draft</div>
                    <div className="text-sm text-gray-500">
                      Keep it private for now
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="schedule" id="schedule" />
                  <Label htmlFor="schedule" className="flex-1 cursor-pointer">
                    <div className="font-medium">Schedule for Later</div>
                    <div className="text-sm text-gray-500">
                      Set a publish date and time
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleContinue} disabled={loading}>
                {loading
                  ? "Processing..."
                  : option === "schedule"
                    ? "Continue →"
                    : "Confirm"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Schedule Challenge</DialogTitle>
              <DialogDescription>
                Choose when to publish this challenge
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="bg-red-100 text-red-600 p-3 rounded text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4 py-4">
              <div>
                <Label>Date</Label>
                // ...existing code...
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const checkDate = new Date(date);
                    checkDate.setHours(0, 0, 0, 0);
                    return checkDate < today;
                  }}
                  className="rounded-md border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notify"
                  checked={notifyCandidates}
                  onChange={(e) => setNotifyCandidates(e.target.checked)}
                />
                <Label htmlFor="notify">Notify candidates via email</Label>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                ← Back
              </Button>
              <Button onClick={handleConfirm} disabled={!date || loading}>
                {loading ? "Scheduling..." : "Schedule"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

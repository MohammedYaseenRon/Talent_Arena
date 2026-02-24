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

type PublishOption = "now" | "draft" | "schedule";

type SuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  challengeId: string;
};

export function ChallengeSuccessModal({ isOpen, onClose, challengeId }: SuccessModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [option, setOption] = useState<PublishOption>("now");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("10:00");
  const [notifyCandidates, setNotifyCandidates] = useState(true);

  const handleContinue = () => {
    if (option === "schedule") {
      setStep(2);
    } else {
      handleConfirm();
    }
  };

  const handleConfirm = async () => {
    try {
      if (option === "now") {
        await fetch(`/api/challenges/${challengeId}/publish`, { method: "POST" });
      } else if (option === "draft") {
        // Already saved as draft
      } else if (option === "schedule" && date) {
        const scheduledDateTime = new Date(date);
        const [hours, minutes] = time.split(":");
        scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

        await fetch(`/api/challenges/${challengeId}/schedule`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scheduledAt: scheduledDateTime.toISOString(),
            notifyCandidates,
          }),
        });
      }

      onClose();
      // Redirect or show success message
    } catch (error) {
      console.error("Failed:", error);
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

            <div className="py-4">
              <RadioGroup value={option} onValueChange={(v) => setOption(v as PublishOption)}>
                <div className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="now" id="now" />
                  <Label htmlFor="now" className="flex-1 cursor-pointer">
                    <div className="font-medium">Publish Now</div>
                    <div className="text-sm text-gray-500">Make it available immediately</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="draft" id="draft" />
                  <Label htmlFor="draft" className="flex-1 cursor-pointer">
                    <div className="font-medium">Save as Draft</div>
                    <div className="text-sm text-gray-500">Keep it private for now</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="schedule" id="schedule" />
                  <Label htmlFor="schedule" className="flex-1 cursor-pointer">
                    <div className="font-medium">Schedule for Later</div>
                    <div className="text-sm text-gray-500">Set a publish date and time</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleContinue}>
                {option === "schedule" ? "Continue →" : "Confirm"}
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

            <div className="space-y-4 py-4">
              <div>
                <Label>Date</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>

              <div>
                <Label>Time</Label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
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
              <Button variant="outline" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button onClick={handleConfirm} disabled={!date}>
                Schedule
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
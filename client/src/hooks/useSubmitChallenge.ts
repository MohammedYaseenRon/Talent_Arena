import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export const useSubmitChallenge = (
  challengeId: string,
  sessionId: string
) => {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL;

  const submit = async (
    codeFiles: Record<string, string>,
    autoSubmitted: boolean = false
  ) => {
    setStatus("loading");

    try {
      await api.post(
        `${API}/submission/${challengeId}/sessions/${sessionId}/submit`,
        {
          code: JSON.stringify(codeFiles),
          language: "react",
          autoSubmitted: autoSubmitted,
        },
      );

      setStatus("success");
      setTimeout(() => {
        router.push("/challenges");
      }, 1000);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setStatus("success");
        return;
      }
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return { status, submit };
};
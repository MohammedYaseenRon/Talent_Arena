"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ImagePlus, X, ArrowLeft, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface FrontendDetails {
  taskDescription: string;
  submissionInstructions: string;
  features?: string;
  optionalRequirements?: string;
  apiDetails?: string;
  techConstraints?: string;
  starterCode?: string;
  solutionTemplate?: string;
  allowedLanguages?: string[];
}

interface EditChallenge {
  title: string;
  description?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  challengeType: "FRONTEND" | "BACKEND" | "DSA" | "SYSTEM_DESIGN";
  frontendDetails?: FrontendDetails;
}

type FormValues = EditChallenge & {
  frontendDetails?: FrontendDetails & {
    allowedLanguagesInput?: string;
  };
};

export default function EditChallengePage() {
  const { challengeId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [challengeType, setChallengeType] = useState<string>("FRONTEND");

  // Design images state
  const [designImages, setDesignImages] = useState<File[]>([]);
  const [designPreviews, setDesignPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]); // already uploaded URLs

  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      difficulty: "EASY",
      challengeType: "FRONTEND",
      frontendDetails: {
        taskDescription: "",
        submissionInstructions: "",
        features: "",
        optionalRequirements: "",
        apiDetails: "",
        techConstraints: "",
        starterCode: "",
        solutionTemplate: "",
        allowedLanguagesInput: "",
      },
    },
  });

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await api.get(`${API_URL}/challenge/${challengeId}`);
        const ch = res.data.challenge;
        const frontend = res.data.frontendDetails;

        if (!ch.isDraft) {
          toast.error("Only draft challenges can be edited");
          router.replace("/recruiter/challenges");
          return;
        }

        setChallengeType(ch.challengeType);

        // Prefill main fields
        form.reset({
          title: ch.title ?? "",
          description: ch.description ?? "",
          difficulty: ch.difficulty ?? "EASY",
          challengeType: ch.challengeType ?? "FRONTEND",
          frontendDetails: {
            taskDescription: frontend?.taskDescription ?? "",
            submissionInstructions: frontend?.submissionInstructions ?? "",
            features: frontend?.features ?? "",
            optionalRequirements: frontend?.optionalRequirements ?? "",
            apiDetails: frontend?.apiDetails ?? "",
            techConstraints: frontend?.techConstraints ?? "",
            starterCode: frontend?.starterCode ?? "",
            solutionTemplate: frontend?.solutionTemplate ?? "",
            allowedLanguagesInput: (frontend?.allowedLanguages ?? []).join(", "),
          },
        });

        if (frontend?.designImages?.length > 0) {
          setExistingImages(frontend.designImages);
        }
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401) { router.replace("/recruiter/login"); return; }
        if (status === 404) { router.replace("/recruiter/challenges"); return; }
        toast.error("Failed to load challenge");
      } finally {
        setFetching(false);
      }
    };

    if (challengeId) fetchChallenge();
  }, [challengeId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const totalImages = existingImages.length + designImages.length + files.length;
    if (totalImages > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const oversized = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error("Each image must be under 5MB");
      return;
    }

    setDesignImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDesignPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeNewImage = (index: number) => {
    setDesignImages((prev) => prev.filter((_, i) => i !== index));
    setDesignPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const allowedLanguages = (data.frontendDetails?.allowedLanguagesInput ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const formData = new FormData();
      formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);
      formData.append("difficulty", data.difficulty);
      formData.append("challengeType", data.challengeType);

      if (data.challengeType === "FRONTEND" && data.frontendDetails) {
        const fd = data.frontendDetails;
        formData.append("frontendDetails[taskDescription]", fd.taskDescription ?? "");
        formData.append("frontendDetails[submissionInstructions]", fd.submissionInstructions ?? "");
        if (fd.features) formData.append("frontendDetails[features]", fd.features);
        if (fd.optionalRequirements) formData.append("frontendDetails[optionalRequirements]", fd.optionalRequirements);
        if (fd.apiDetails) formData.append("frontendDetails[apiDetails]", fd.apiDetails);
        if (fd.techConstraints) formData.append("frontendDetails[techConstraints]", fd.techConstraints);
        if (fd.starterCode) formData.append("frontendDetails[starterCode]", fd.starterCode);
        if (fd.solutionTemplate) formData.append("frontendDetails[solutionTemplate]", fd.solutionTemplate);
        if (allowedLanguages.length > 0) {
          formData.append("frontendDetails[allowedLanguages]", JSON.stringify(allowedLanguages));
        }

        formData.append("existingImages", JSON.stringify(existingImages));

        designImages.forEach((file) => {
          formData.append("designImages", file);
        });
      }

      await api.patch(`${API_URL}/challenge/${challengeId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Challenge updated successfully");
      router.push("/recruiter/challenges");
    } catch (error: any) {
      console.error("Error updating challenge:", error);
      toast.error(error?.response?.data?.error || "Failed to update challenge");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#080810] flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 size={14} className="animate-spin text-slate-400 dark:text-slate-600" />
          <span className="text-xs font-mono text-slate-400 dark:text-slate-600 tracking-widest">Loading challenge…</span>
        </div>
      </div>
    );
  }

  const totalImages = existingImages.length + designImages.length;

  return (
    <div className="min-h-screen bg-white dark:bg-[#080810]">
      <div className="w-full px-0 lg:px-6">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-400 transition-colors mb-6"
        >
          <ArrowLeft size={12} />
          Back to Challenges
        </button>

        <Card className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900 dark:text-white">Edit Challenge</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-500">
              Update your draft challenge — only drafts can be edited
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Build a Todo App"
                          className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-purple-500/30"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief overview of the challenge"
                          className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-purple-500/30"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-purple-500/30 w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="EASY">Easy</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HARD">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="challengeType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Challenge Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-purple-500/30 w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="FRONTEND">Frontend</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {challengeType === "FRONTEND" && (
                  <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-purple-500/20">
                    <h3 className="text-lg font-semibold text-violet-600 dark:text-purple-400">
                      Frontend Details
                    </h3>

                    <FormField
                      control={form.control}
                      name="frontendDetails.taskDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Detailed task for the user"
                              className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-purple-500/30 min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frontendDetails.submissionInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Submission Instructions</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="How should users submit their solution?"
                              className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-purple-500/30 min-h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frontendDetails.features"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Features</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="List required features"
                              className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-purple-500/30"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>What features must the solution include?</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frontendDetails.optionalRequirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Optional Requirements</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Nice-to-have features"
                              className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-purple-500/30"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frontendDetails.apiDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Details</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="API endpoints and structure"
                              className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-purple-500/30"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Design Images */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">
                          Design Reference Images
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                          Upload mockups or design references · PNG, JPG, WEBP · Max 5MB each · Up to 5 images
                        </p>
                      </div>

                      {existingImages.length > 0 && (
                        <div>
                          <p className="text-xs font-mono text-slate-400 dark:text-slate-600 mb-2">Current images</p>
                          <div className="grid grid-cols-3 gap-2">
                            {existingImages.map((url, i) => (
                              <div key={i} className="relative group aspect-video bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden rounded">
                                <img src={url} alt={`Existing ${i + 1}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeExistingImage(i)}
                                  className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                <span className="absolute bottom-1 left-1 text-xs font-mono text-white/60 bg-black/50 px-1 rounded">
                                  {i + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Upload area */}
                      <label
                        className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed cursor-pointer transition-colors rounded
                          ${totalImages >= 5
                            ? "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 cursor-not-allowed opacity-50"
                            : "border-slate-300 dark:border-purple-500/30 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-400 dark:hover:border-purple-500/60 hover:bg-slate-100 dark:hover:bg-slate-900/80"
                          }`}
                      >
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                          <ImagePlus className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                            {totalImages >= 5 ? "Maximum images reached" : "Click to add new images"}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          multiple
                          className="hidden"
                          onChange={handleImageSelect}
                          disabled={totalImages >= 5}
                        />
                      </label>

                      {designPreviews.length > 0 && (
                        <div>
                          <p className="text-xs font-mono text-slate-400 dark:text-slate-600 mb-2">New images</p>
                          <div className="grid grid-cols-3 gap-2">
                            {designPreviews.map((preview, i) => (
                              <div key={i} className="relative group aspect-video bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden rounded">
                                <img src={preview} alt={`New ${i + 1}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeNewImage(i)}
                                  className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                <span className="absolute bottom-1 left-1 text-xs font-mono text-white/60 bg-black/50 px-1 rounded">
                                  {i + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-xs font-mono text-slate-400 dark:text-slate-700">{totalImages}/5 images</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="frontendDetails.techConstraints"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tech Constraints</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any restrictions (no libraries, must use X framework, etc.)"
                              className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-purple-500/30"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frontendDetails.starterCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Starter Code</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Initial code template"
                              className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-purple-500/30 font-mono text-sm min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frontendDetails.solutionTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Solution Template</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Reference solution (for grading)"
                              className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-purple-500/30 font-mono text-sm min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frontendDetails.allowedLanguagesInput"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Allowed Languages</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., React, Vue, Svelte (comma-separated)"
                              className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-purple-500/30"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Separate multiple languages with commas</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={13} className="animate-spin" />
                        Saving…
                      </span>
                    ) : "Save Changes"}
                  </Button>
                </div>

              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
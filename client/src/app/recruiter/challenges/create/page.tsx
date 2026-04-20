"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ChallengeSuccessModal } from "@/components/recruiter/SuccessModal";
import api from "@/lib/axios";
import { ImagePlus, X } from "lucide-react";


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

interface CreateChallenge {
  title: string;
  description?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  challengeType: "FRONTEND" | "BACKEND" | "DSA" | "SYSTEM_DESIGN";
  frontendDetails?: FrontendDetails;
}

type FormValues = CreateChallenge & {
  frontendDetails?: FrontendDetails & {
    allowedLanguagesInput?: string;
  };
};


export default function CreateChallengeForm() {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [challengeId, setChallengeId] = useState("");
  const [designImages, setDesignImages] = useState<File[]>([]);
  const [designPreviews, setDesignPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

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

  const challengeType = form.watch("challengeType");
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    if (designImages.length + files.length > 5) {
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

  const removeImage = (index: number) => {
    setDesignImages((prev) => prev.filter((_, i) => i !== index));
    setDesignPreviews((prev) => prev.filter((_, i) => i !== index));
  };
  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const allowedLanguages = (data.frontendDetails?.allowedLanguagesInput ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Use FormData to send both JSON fields + image files in one request
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

        // Attach image files — multer picks these up
        designImages.forEach((file) => {
          formData.append("designImages", file);
        });
      }

      const response = await api.post(
        `${process.env.NEXT_PUBLIC_API_URL}/challenge`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const newChallengeId = response.data.challenge?.id;
      if (!newChallengeId) throw new Error("Challenge ID not returned from server");

      toast.success("Challenge created successfully");
      setChallengeId(newChallengeId);
      setIsModalOpen(true);
      form.reset();
      setDesignImages([]);
      setDesignPreviews([]);
    } catch (error: any) {
      console.error("Error creating challenge:", error);
      toast.error(error?.response?.data?.error || "Failed to create challenge");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
          <Card className="dark:bg-slate-950/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl">Create Challenge</CardTitle>
              <CardDescription>
                Build a new coding or frontend challenge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Build a Todo App"
                            className="dark:bg-slate-900/50 border-purple-500/30"
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
                            className="dark:dark:bg-slate-900/50 border-purple-500/30"
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="dark:dark:bg-slate-900/50 border-purple-500/30 w-full">
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full dark:dark:bg-slate-900/50 border-purple-500/30">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem defaultValue="FRONTEND" value="FRONTEND">Frontend</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Frontend Details */}
                  {challengeType === "FRONTEND" && (
                    <div className="space-y-6 pt-6 border-t border-purple-500/20">
                      <h3 className="text-lg font-semibold text-purple-400">
                        Frontend Details
                      </h3>

                      {/* Task Description */}
                      <FormField
                        control={form.control}
                        name="frontendDetails.taskDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Task Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Detailed task for the user"
                                className="dark:dark:bg-slate-900/50 border-purple-500/30 min-h-24"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Submission Instructions */}
                      <FormField
                        control={form.control}
                        name="frontendDetails.submissionInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Submission Instructions</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="How should users submit their solution?"
                                className="dark:dark:bg-slate-900/50 border-purple-500/30 min-h-20"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Features */}
                      <FormField
                        control={form.control}
                        name="frontendDetails.features"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Features</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="List required features"
                                className="dark:dark:bg-slate-900/50 border-purple-500/30"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              What features must the solution include?
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Optional Requirements */}
                      <FormField
                        control={form.control}
                        name="frontendDetails.optionalRequirements"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Optional Requirements</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Nice-to-have features"
                                className="dark:dark:bg-slate-900/50 border-purple-500/30"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* API Details */}
                      <FormField
                        control={form.control}
                        name="frontendDetails.apiDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Details</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="API endpoints and structure"
                                className="dark:dark:bg-slate-900/50 border-purple-500/30"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Design Reference Images — replaces designReference URL */}
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-slate-200 mb-1">
                            Design Reference Images
                          </p>
                          <p className="text-xs text-slate-500 font-mono">
                            Upload mockups or design references · PNG, JPG, WEBP · Max 5MB each · Up to 5 images
                          </p>
                        </div>

                        {/* Upload area */}
                        <label
                          className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed cursor-pointer transition-colors
                            ${designImages.length >= 5 || uploading
                              ? "border-slate-800 bg-slate-900/20 cursor-not-allowed opacity-50"
                              : "border-purple-500/30 dark:dark:bg-slate-900/50 hover:border-purple-500/60 hover:bg-slate-900/80"
                            }`}
                        >
                          <div className="flex flex-col items-center gap-2 pointer-events-none">
                            {uploading ? (
                              <>
                                <div className="w-5 h-5 border-2 border-slate-600 border-t-purple-400 rounded-full animate-spin" />
                                <span className="text-xs font-mono text-slate-500">Uploading…</span>
                              </>
                            ) : (
                              <>
                                <ImagePlus className="w-5 h-5 text-slate-500" />
                                <span className="text-xs font-mono text-slate-500">
                                  {designImages.length >= 5
                                    ? "Maximum images reached"
                                    : "Click to select images"
                                  }
                                </span>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            multiple
                            className="hidden"
                            onChange={handleImageSelect}
                            disabled={uploading || designImages.length >= 5}
                          />
                        </label>

                        {/* Preview grid */}
                        {designPreviews.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {designPreviews.map((preview, i) => (
                              <div
                                key={i}
                                className="relative group aspect-video bg-slate-900 border border-slate-800 overflow-hidden"
                              >
                                <img
                                  src={preview}
                                  alt={`Design ${i + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {/* Remove button */}
                                <button
                                  type="button"
                                  onClick={() => removeImage(i)}
                                  className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                {/* Index badge */}
                                <span className="absolute bottom-1 left-1 text-xs font-mono text-white/60 bg-black/50 px-1">
                                  {i + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <p className="text-xs font-mono text-slate-700">
                          {designImages.length}/5 images selected
                        </p>
                      </div>

                      {/* Tech Constraints */}
                      <FormField
                        control={form.control}
                        name="frontendDetails.techConstraints"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tech Constraints</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any restrictions (no libraries, must use X framework, etc.)"
                                className="dark:dark:bg-slate-900/50 border-purple-500/30"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Starter Code */}
                      <FormField
                        control={form.control}
                        name="frontendDetails.starterCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Starter Code</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Initial code template"
                                className="dark:dark:bg-slate-900/50 border-purple-500/30 font-mono text-sm min-h-24"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Solution Template */}
                      <FormField
                        control={form.control}
                        name="frontendDetails.solutionTemplate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Solution Template</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Reference solution (for grading)"
                                className="dark:dark:bg-slate-900/50 border-purple-500/30 font-mono text-sm min-h-24"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Allowed Languages */}
                      <FormField
                        control={form.control}
                        name="frontendDetails.allowedLanguagesInput"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allowed Languages</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., React, Vue, Svelte (comma-separated)"
                                className="dark:bg-slate-900/50 border-purple-500/30"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Separate multiple languages with commas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || uploading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                  >
                    {loading ? "Creating..." : "Create Challenge"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

      <ChallengeSuccessModal
        challengeId={challengeId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
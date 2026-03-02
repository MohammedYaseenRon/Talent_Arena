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
import axios from "axios";
import toast from "react-hot-toast";
import { ChallengeSuccessModal } from "@/components/recruiter/SuccessModal";

interface frontendDetailsDetails {
  taskDescription: string;
  submissionInstructions: string;
  features?: string;
  optionalRequirements?: string;
  apiDetails?: string;
  designReference?: string;
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
  frontendDetails?: frontendDetailsDetails;
}

type FormValues = CreateChallenge & {
  frontendDetails?: frontendDetailsDetails & {
    allowedLanguagesInput?: string;
  };
};

export default function CreateChallengeForm() {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [challengeId, setChallengeId] = useState("");
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
        designReference: "",
        techConstraints: "",
        starterCode: "",
        solutionTemplate: "",
        allowedLanguagesInput: "",
      },
    },
  });

  const challengeType = form.watch("challengeType");

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const allowedLanguagesInput =
        data.frontendDetails?.allowedLanguagesInput || "";
      const allowedLanguages = allowedLanguagesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: CreateChallenge = {
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        challengeType: data.challengeType,
        frontendDetails:
          data.challengeType === "FRONTEND"
            ? {
                taskDescription: data.frontendDetails?.taskDescription || "",
                submissionInstructions:
                  data.frontendDetails?.submissionInstructions || "",
                features: data.frontendDetails?.features,
                optionalRequirements:
                  data.frontendDetails?.optionalRequirements,
                apiDetails: data.frontendDetails?.apiDetails,
                designReference: data.frontendDetails?.designReference,
                techConstraints: data.frontendDetails?.techConstraints,
                starterCode: data.frontendDetails?.starterCode,
                solutionTemplate: data.frontendDetails?.solutionTemplate,
                allowedLanguages:
                  allowedLanguages.length > 0 ? allowedLanguages : undefined,
              }
            : undefined,
      };

      const response = await apipost(
        "http://localhost:4000/challenge",
        payload,
        { withCredentials: true },
      );
      console.log(response.data);
      const challengeId = response.data.challenge?.id;
      console.log(challengeId);
      
      if (!challengeId) {
        throw new Error("Challenge ID not returned from server");
      }
      toast.success("Challenge create successfully");
      setChallengeId(challengeId);
      setIsModalOpen(true);
      console.log("Challenge created:", response.data);
      form.reset();
    } catch (error: any) {
      console.error("Error creating challenge:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="w-[300px]">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="view">View</TabsTrigger>
        </TabsList>
        <TabsContent value="create" className="w-full">
          <Card className="bg-slate-950/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl">Create Challenge</CardTitle>
              <CardDescription>
                Build a new coding or frontend challenge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Build a Todo App"
                            className="bg-slate-900/50 border-purple-500/30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief overview of the challenge"
                            className="bg-slate-900/50 border-purple-500/30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Difficulty */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-slate-900/50 border-purple-500/30 w-full">
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

                    {/* Challenge Type */}
                    <FormField
                      control={form.control}
                      name="challengeType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Challenge Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full bg-slate-900/50 border-purple-500/30">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="FRONTEND">Frontend</SelectItem>
                              <SelectItem value="BACKEND">Backend</SelectItem>
                              <SelectItem value="DSA">DSA</SelectItem>
                              <SelectItem value="SYSTEM_DESIGN">
                                System Design
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* Frontend Details Section */}
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
                                className="bg-slate-900/50 border-purple-500/30 min-h-24"
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
                                className="bg-slate-900/50 border-purple-500/30 min-h-20"
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
                                className="bg-slate-900/50 border-purple-500/30"
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
                                className="bg-slate-900/50 border-purple-500/30"
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
                                className="bg-slate-900/50 border-purple-500/30"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Design Reference */}
                      <FormField
                        control={form.control}
                        name="frontendDetails.designReference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Design Reference URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Link to design mockup"
                                className="bg-slate-900/50 border-purple-500/30"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                                className="bg-slate-900/50 border-purple-500/30"
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
                                className="bg-slate-900/50 border-purple-500/30 font-mono text-sm min-h-24"
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
                                className="bg-slate-900/50 border-purple-500/30 font-mono text-sm min-h-24"
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
                                className="bg-slate-900/50 border-purple-500/30"
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
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                  >
                    {loading ? "Creating..." : "Create Challenge"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <ChallengeSuccessModal 
        challengeId={challengeId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

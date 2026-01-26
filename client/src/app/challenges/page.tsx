"use client";
import { Editor } from "@monaco-editor/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sandpack } from "@codesandbox/sandpack-react";

const Challenges = () => {
  return (
    <div className="h-screen">
      <div className="flex h-full">
        <div className="w-1/2 p-2 overflow-y-auto">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full flex items-center justify-between">
              <div className="flex items-center gap-4">
                <TabsTrigger value="overview">Description</TabsTrigger>
                <TabsTrigger value="analytics">Editiorial</TabsTrigger>
                <TabsTrigger value="reports">Solution</TabsTrigger>
                <TabsTrigger value="settings">Submission</TabsTrigger>
              </div>
              <div className="flex items-center gap-2">
                <Box />
                <Box />
              </div>
            </TabsList>
            <TabsContent value="overview">
              <Card className="">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                  <CardDescription>
                    View your key metrics and recent project activity. Track
                    progress across all your active projects.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  <Sandpack template="react" />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>
                    Track performance and user engagement metrics. Monitor
                    trends and identify growth opportunities.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  Page views are up 25% compared to last month.
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Reports</CardTitle>
                  <CardDescription>
                    Generate and download your detailed reports. Export data in
                    multiple formats for analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  You have 5 reports ready and available to export.
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences and options. Customize your
                    experience to fit your needs.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  Configure notifications, security, and themes.
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="w-1/2">
          <div className="mt-2 w-full flex flex-col border rounded-xl p-1">
            <Select>
              <SelectTrigger className="w-full max-w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="mt-12">
                <SelectGroup defaultValue="Java">
                  <SelectItem value="apple">Java</SelectItem>
                  <SelectItem value="banana">Javascript</SelectItem>
                  <SelectItem value="blueberry">Html</SelectItem>
                  <SelectItem value="grapes">C++</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Editor
            height="90vh"
            language="javascript"
            
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenges;

// "use client";

// import Editor from "@monaco-editor/react";

// type CodeEditorProps = {
//   code: string;
//   onChange: (value: string) => void;
//   readOnly?: boolean;
// };

// export default function CodeEditor({
//   code,
//   onChange,
//   readOnly = false,
// }: CodeEditorProps) {
//   return (
//     <Editor
//       height="100%"
//       language="javascript"
//       theme="vs-dark"
//       value={code}
//       onChange={(value) => onChange(value || "")}
//       options={{
//         fontSize: 14,
//         minimap: { enabled: false },
//         wordWrap: "on",
//         readOnly,
//         automaticLayout: true,
//       }}
//     />
//   );
// }

import { useEffect, useMemo, useState } from "react";
import {
  FileAudio,
  FileCode2,
  FileOutput,
  FileText,
  FolderUp,
  LayoutDashboard,
  Save,
  Send,
  Share2,
} from "lucide-react";
import AIOutputPage from "./components/AIOutputPage";
import AppHeader from "./components/AppHeader";
import AppSidebar from "./components/AppSidebar";
import DashboardPage from "./components/DashboardPage";
import EditorPage from "./components/EditorPage";
import ExportSharePage from "./components/ExportSharePage";
import InlineAlert from "./components/InlineAlert";
import ProcessingPipelinePage from "./components/ProcessingPipelinePage";
import UploadSourcePage from "./components/UploadSourcePage";
import { downloadMinutes, processMeeting, sendMeetingEmail } from "./lib/api";

const navItems = [
  { id: "dashboard", label: "Dashboard", description: "Overview and recent activity", icon: LayoutDashboard },
  { id: "upload", label: "Upload Source", description: "Bring in recordings and documents", icon: FolderUp },
  { id: "pipeline", label: "Processing Pipeline", description: "Monitor backend workflow", icon: FileCode2 },
  { id: "output", label: "AI Output", description: "Review generated minutes", icon: FileOutput },
  { id: "editor", label: "Editor", description: "Refine content before delivery", icon: Save },
  { id: "export", label: "Export & Share", description: "Download and send minutes", icon: Share2 },
];

const inputMethods = [
  { id: "audio", label: "Audio Upload", icon: FileAudio },
  { id: "text", label: "Paste Text", icon: FileText },
  { id: "txt", label: "TXT File", icon: FileText },
  { id: "pdf", label: "PDF File", icon: FileText },
];

const emptyMetadata = {
  title: "",
  date: "",
  time: "",
  venue: "",
  organizer: "",
  recorder: "",
};

const pipelineBase = [
  { id: "transcription", label: "Transcription", description: "Whisper converts source audio into text.", status: "pending" },
  { id: "preprocessing", label: "Cleaning & Preprocessing", description: "The backend normalizes and structures the transcript.", status: "pending" },
  { id: "extraction", label: "Information Extraction", description: "Meeting details, decisions, and actions are identified.", status: "pending" },
  { id: "summarization", label: "Summarization", description: "BART generates the final meeting minutes.", status: "pending" },
];

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

function normalizeMeetingData(data) {
  if (!data) return null;
  return {
    metadata: { ...emptyMetadata, ...(data.metadata || {}) },
    attendees: Array.isArray(data.attendees) ? data.attendees : [],
    agenda: Array.isArray(data.agenda) ? data.agenda : [],
    summary: data.summary || "",
    decisions: Array.isArray(data.decisions) ? data.decisions : [],
    action_items: Array.isArray(data.action_items)
      ? data.action_items.map((item) => ({
          task: item.task || "",
          responsible: item.responsible || "",
          deadline: item.deadline || "",
          status: item.status || "Pending",
        }))
      : [],
    next_meeting: data.next_meeting || {},
  };
}

function buildEmailBody(meeting) {
  if (!meeting) return "";
  const lines = [];
  if (meeting.summary) lines.push("Summary", meeting.summary, "");
  if (meeting.decisions?.length) lines.push("Key Decisions", ...meeting.decisions.map((item) => `- ${item}`), "");
  if (meeting.action_items?.length) {
    lines.push("Action Items");
    meeting.action_items.forEach((item) => {
      const tags = [item.responsible && `Owner: ${item.responsible}`, item.deadline && `Deadline: ${item.deadline}`]
        .filter(Boolean)
        .join(", ");
      lines.push(`- ${item.task}${tags ? ` (${tags})` : ""}`);
    });
  }
  return lines.join("\n").trim();
}

function splitSummary(summary) {
  return (summary || "")
    .split("\n")
    .map((line) => line.replace(/^[-\u2022]\s*/u, "").trim())
    .filter(Boolean);
}

function pageMeta(pageId) {
  const map = {
    dashboard: {
      title: "Dashboard",
      subtitle: "Recent meeting files, workspace health, and quick actions.",
      actionLabel: "New Upload",
      actionPage: "upload",
    },
    upload: {
      title: "Upload Source",
      subtitle: "Import recordings, documents, or transcript text into the workspace.",
      actionLabel: "Open Pipeline",
      actionPage: "pipeline",
    },
    pipeline: {
      title: "Processing Pipeline",
      subtitle: "Launch generation and monitor each backend stage.",
      actionLabel: "View Output",
      actionPage: "output",
    },
    output: {
      title: "AI Output",
      subtitle: "Review structured meeting minutes in a polished reading view.",
      actionLabel: "Open Editor",
      actionPage: "editor",
    },
    editor: {
      title: "Editor",
      subtitle: "Refine the generated minutes before exporting or sharing.",
      actionLabel: "Go to Export",
      actionPage: "export",
    },
    export: {
      title: "Export & Share",
      subtitle: "Prepare downloads and deliver minutes to your team.",
      actionLabel: "Return to Dashboard",
      actionPage: "dashboard",
    },
  };
  return map[pageId] || map.dashboard;
}

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [inputMethod, setInputMethod] = useState("audio");
  const [inputs, setInputs] = useState({ audioFile: null, pastedText: "", txtFile: null, txtPreview: "", pdfFile: null });
  const [transcript, setTranscript] = useState("");
  const [editableMeeting, setEditableMeeting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ tone: "neutral", text: "Upload a source to start generating meeting minutes." });
  const [emailForm, setEmailForm] = useState({ recipients: "", subject: "AIMS Meeting Minutes", body: "", attachPdf: true, attachDocx: false });
  const [pipelineStages, setPipelineStages] = useState(pipelineBase);
  const [recentItems, setRecentItems] = useState([]);
  const [lastSavedAt, setLastSavedAt] = useState("");

  const summaryPoints = useMemo(() => splitSummary(editableMeeting?.summary || ""), [editableMeeting]);
  const currentMeta = pageMeta(activePage);

  useEffect(() => {
    if (!loading) return undefined;
    let stageIndex = 0;
    setPipelineStages(
      pipelineBase.map((stage, index) => ({
        ...stage,
        status: index === 0 ? "running" : "pending",
      })),
    );

    const interval = window.setInterval(() => {
      stageIndex += 1;
      setPipelineStages(
        pipelineBase.map((stage, index) => {
          if (index < stageIndex) return { ...stage, status: "completed" };
          if (index === stageIndex && index < pipelineBase.length) return { ...stage, status: "running" };
          return { ...stage, status: "pending" };
        }),
      );
      if (stageIndex >= pipelineBase.length) {
        window.clearInterval(interval);
      }
    }, 1200);

    return () => window.clearInterval(interval);
  }, [loading]);

  const pipelineProgress = useMemo(() => {
    const completed = pipelineStages.filter((stage) => stage.status === "completed").length;
    const running = pipelineStages.some((stage) => stage.status === "running") ? 0.5 : 0;
    return Math.round(((completed + running) / pipelineStages.length) * 100);
  }, [pipelineStages]);

  const metrics = useMemo(() => ({
    totalFiles: recentItems.length,
    processedFiles: recentItems.filter((item) => item.status === "Processed").length,
    pendingFiles: recentItems.filter((item) => item.status === "Pending").length,
    actionItems: editableMeeting?.action_items?.length || 0,
  }), [recentItems, editableMeeting]);

  function updateStatus(text, tone = "neutral") {
    setStatus({ text, tone });
  }

  function activeFile() {
    if (inputMethod === "audio") return inputs.audioFile;
    if (inputMethod === "txt") return inputs.txtFile;
    if (inputMethod === "pdf") return inputs.pdfFile;
    return null;
  }

  function currentSourceLabel() {
    if (inputMethod === "audio" && inputs.audioFile) return `Audio source: ${inputs.audioFile.name}`;
    if (inputMethod === "text" && inputs.pastedText.trim()) return `Pasted transcript with ${inputs.pastedText.trim().split(/\s+/).length} words`;
    if (inputMethod === "txt" && inputs.txtFile) return `Text document: ${inputs.txtFile.name}`;
    if (inputMethod === "pdf" && inputs.pdfFile) return `PDF document: ${inputs.pdfFile.name}`;
    return "No source selected";
  }

  function canProcess() {
    if (inputMethod === "text") return Boolean(inputs.pastedText.trim());
    return Boolean(activeFile());
  }

  async function handleTxtUpload(file) {
    if (!file) {
      setInputs((current) => ({ ...current, txtFile: null, txtPreview: "" }));
      return;
    }
    const preview = await file.text();
    setInputs((current) => ({ ...current, txtFile: file, txtPreview: preview }));
  }

  function registerRecentItem(statusLabel) {
    const label = currentSourceLabel();
    const item = {
      label,
      status: statusLabel,
      meta: new Date().toLocaleString(),
    };
    setRecentItems((current) => [item, ...current].slice(0, 8));
  }

  async function runAims() {
    if (!canProcess()) {
      updateStatus("Select an audio file, document, or transcript text before starting the pipeline.", "error");
      return;
    }

    setLoading(true);
    updateStatus("Processing source through transcription, preprocessing, extraction, and summarization.");
    registerRecentItem("Pending");
    setActivePage("pipeline");

    try {
      const payload =
        inputMethod === "audio"
          ? { file: inputs.audioFile, text: "" }
          : inputMethod === "text"
            ? { file: null, text: inputs.pastedText }
            : inputMethod === "txt"
              ? { file: inputs.txtFile, text: "" }
              : { file: inputs.pdfFile, text: "" };

      const response = await processMeeting(payload);
      const data = response.data || {};
      const nextMeeting = normalizeMeetingData(data.structured_summary);

      setTranscript(data.transcript || "");
      setEditableMeeting(nextMeeting);
      setEmailForm((current) => ({ ...current, body: buildEmailBody(nextMeeting) }));
      setPipelineStages(pipelineBase.map((stage) => ({ ...stage, status: "completed" })));
      setRecentItems((current) => {
        const [first, ...rest] = current;
        if (!first) return current;
        return [{ ...first, status: "Processed" }, ...rest];
      });
      updateStatus(response.message || "Meeting minutes generated successfully.", "success");
      setActivePage("output");
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        requestError.message ||
        "The workspace could not complete processing. Please try again.";
      setPipelineStages(pipelineBase.map((stage) => ({ ...stage, status: "pending" })));
      setRecentItems((current) => current.filter((_, index) => index !== 0));
      updateStatus(message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(format) {
    if (!editableMeeting) {
      updateStatus("Generate meeting output before exporting.", "error");
      return;
    }
    try {
      updateStatus(`Preparing ${format.toUpperCase()} export.`);
      const blob = await downloadMinutes(editableMeeting, format);
      downloadBlob(blob, `meeting-minutes.${format}`);
      updateStatus(`${format.toUpperCase()} export downloaded successfully.`, "success");
    } catch {
      updateStatus("The export could not be completed. Please try again.", "error");
    }
  }

  async function handleSendEmail() {
    if (!editableMeeting) {
      updateStatus("Generate meeting output before sending email.", "error");
      return;
    }
    const recipients = emailForm.recipients.split(",").map((item) => item.trim()).filter(Boolean);
    if (!recipients.length) {
      updateStatus("Enter at least one recipient email address.", "error");
      return;
    }
    try {
      const response = await sendMeetingEmail({
        meeting_data: editableMeeting,
        recipients,
        subject: emailForm.subject,
        body: emailForm.body,
        attach_pdf: emailForm.attachPdf,
        attach_docx: emailForm.attachDocx,
      });
      updateStatus(response.message || "Meeting minutes sent successfully.", "success");
    } catch {
      updateStatus("Email delivery failed. Check the email settings and try again.", "error");
    }
  }

  function resetEmailBody() {
    setEmailForm((current) => ({ ...current, body: buildEmailBody(editableMeeting) }));
  }

  function handleSaveEditor() {
    setLastSavedAt(new Date().toLocaleTimeString());
    resetEmailBody();
    updateStatus("Edits saved to the current workspace state.", "success");
  }

  function updateMetadata(field, value) {
    setEditableMeeting((current) => ({ ...current, metadata: { ...(current?.metadata || emptyMetadata), [field]: value } }));
  }

  function updateDecision(index, value) {
    setEditableMeeting((current) => ({ ...current, decisions: current.decisions.map((item, itemIndex) => (itemIndex === index ? value : item)) }));
  }

  function addDecision() {
    setEditableMeeting((current) => ({ ...current, decisions: [...(current?.decisions || []), ""] }));
  }

  function removeDecision(index) {
    setEditableMeeting((current) => ({ ...current, decisions: current.decisions.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function updateActionItem(index, field, value) {
    setEditableMeeting((current) => ({
      ...current,
      action_items: current.action_items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function addActionItem() {
    setEditableMeeting((current) => ({
      ...current,
      action_items: [...(current?.action_items || []), { task: "", responsible: "", deadline: "", status: "Pending" }],
    }));
  }

  function removeActionItem(index) {
    setEditableMeeting((current) => ({
      ...current,
      action_items: current.action_items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function renderPage() {
    if (activePage === "dashboard") {
      return (
        <DashboardPage
          metrics={metrics}
          recentItems={recentItems}
          currentSourceLabel={currentSourceLabel()}
          onQuickUpload={() => setActivePage("upload")}
          onQuickProcess={() => setActivePage("pipeline")}
          canProcess={canProcess()}
        />
      );
    }
    if (activePage === "upload") {
      return (
        <UploadSourcePage
          inputMethods={inputMethods}
          inputMethod={inputMethod}
          inputs={inputs}
          setInputMethod={setInputMethod}
          setInputs={setInputs}
          handleTxtUpload={handleTxtUpload}
        />
      );
    }
    if (activePage === "pipeline") {
      return (
        <ProcessingPipelinePage
          currentSourceLabel={currentSourceLabel()}
          loading={loading}
          pipelineStages={pipelineStages}
          pipelineProgress={pipelineProgress}
          runAims={runAims}
          canProcess={canProcess()}
          statusText={status.text}
        />
      );
    }
    if (activePage === "output") {
      return <AIOutputPage editableMeeting={editableMeeting} summaryPoints={summaryPoints} />;
    }
    if (activePage === "editor") {
      return (
        <EditorPage
          editableMeeting={editableMeeting}
          updateMetadata={updateMetadata}
          updateDecision={updateDecision}
          addDecision={addDecision}
          removeDecision={removeDecision}
          updateActionItem={updateActionItem}
          addActionItem={addActionItem}
          removeActionItem={removeActionItem}
          setEditableMeeting={setEditableMeeting}
          onSave={handleSaveEditor}
        />
      );
    }
    return (
      <ExportSharePage
        editableMeeting={editableMeeting}
        transcript={transcript}
        emailForm={emailForm}
        setEmailForm={setEmailForm}
        handleDownload={handleDownload}
        handleSendEmail={handleSendEmail}
        resetEmailBody={resetEmailBody}
      />
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <div className="flex min-h-screen">
        <AppSidebar items={navItems} activePage={activePage} onSelect={setActivePage} />
        <div className="flex min-h-screen flex-1 flex-col">
          <AppHeader
            title={currentMeta.title}
            subtitle={`${currentMeta.subtitle}${lastSavedAt ? ` Last saved at ${lastSavedAt}.` : ""}`}
            action={
              <button
                type="button"
                onClick={() => setActivePage(currentMeta.actionPage)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Send size={16} />
                {currentMeta.actionLabel}
              </button>
            }
          />

          <main className="flex-1 px-4 py-6 sm:px-6 xl:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
              <InlineAlert tone={status.tone} message={status.text} />
              {renderPage()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

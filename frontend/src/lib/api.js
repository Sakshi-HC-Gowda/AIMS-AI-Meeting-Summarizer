import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

export async function transcribeAudio(file) {
  const formData = new FormData();
  formData.append("audio", file);
  const response = await api.post("/transcribe", formData);
  return response.data;
}

export async function summarizeText(text) {
  const response = await api.post("/summarize", { text });
  return response.data;
}

export async function processMeeting({ file, text }) {
  if (file) {
    const formData = new FormData();
    if (/\.(mp3|wav|m4a)$/i.test(file.name)) {
      formData.append("audio", file);
    } else {
      formData.append("document", file);
    }
    const response = await api.post("/process", formData);
    return response.data;
  }

  const response = await api.post("/process", { text });
  return response.data;
}

export async function downloadMinutes(meetingData, format) {
  const response = await api.post(
    `/export/${format}`,
    { meeting_data: meetingData },
    { responseType: "blob" },
  );
  return response.data;
}

export async function sendMeetingEmail(payload) {
  const response = await api.post("/email", payload);
  return response.data;
}

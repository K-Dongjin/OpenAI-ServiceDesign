import { useState } from "react";
import { buildBotReply } from "../utils/chat.js";

const prompts = [
  {
    label: "계약서 질문",
    text: "알바를 시작하는데 계약서는 다음 주에 쓰자고 하는데 괜찮아?",
  },
  {
    label: "급여 질문",
    text: "이번 달 월급이 예상보다 적게 들어온 것 같아.",
  },
  {
    label: "퇴사 질문",
    text: "18개월 일했는데 퇴직금을 받을 수 있을까?",
  },
];

export default function Chat({ job, logs, payroll, messages, onAddMessages }) {
  const [input, setInput] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    onAddMessages([
      { role: "user", text },
      { role: "bot", text: buildBotReply(text, { job, logs, payroll }) },
    ]);
    setInput("");
  };

  return (
    <section className="view active" aria-label="AI 상담">
      <section className="chat-panel">
        <div className="section-heading">
          <p className="eyebrow">상담 초안</p>
          <h2>상황별 AI 챗봇</h2>
        </div>
        <div className="prompt-row" aria-label="예시 질문">
          {prompts.map((prompt) => (
            <button key={prompt.label} onClick={() => setInput(prompt.text)} type="button">
              {prompt.label}
            </button>
          ))}
        </div>
        <div className="chat-stream" aria-live="polite">
          {messages.map((message, index) => (
            <div className={`message ${message.role === "user" ? "user" : "bot"}`} key={`${message.role}-${index}`}>
              <small>{message.role === "user" ? "나" : "알바권리 AI"}</small>
              {message.text}
            </div>
          ))}
        </div>
        <form className="chat-form" onSubmit={handleSubmit}>
          <input
            autoComplete="off"
            onChange={(event) => setInput(event.target.value)}
            placeholder="상황을 입력하세요"
            type="text"
            value={input}
          />
          <button className="primary-button" type="submit">
            전송
          </button>
        </form>
      </section>
    </section>
  );
}

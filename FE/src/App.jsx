import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Chat from "./pages/Chat.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import JobSetup from "./pages/JobSetup.jsx";
import Payroll from "./pages/Payroll.jsx";
import WorkLogs from "./pages/WorkLogs.jsx";
import { createDefaultState, loadState, saveState, STORAGE_KEY } from "./utils/storage.js";
import { getSetupChecks } from "./utils/payroll.js";

const views = {
  dashboard: "홈",
  setup: "알바 시작",
  logs: "근무 기록",
  payroll: "급여 확인",
  chat: "AI 상담",
};

export default function App() {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setupChecks = useMemo(() => getSetupChecks(state.job), [state.job]);

  const updateJob = (job) => {
    setState((current) => ({ ...current, job }));
  };

  const addLog = (log) => {
    setState((current) => ({ ...current, logs: [...current.logs, log] }));
  };

  const deleteLog = (id) => {
    setState((current) => ({
      ...current,
      logs: current.logs.filter((log) => log.id !== id),
    }));
  };

  const updatePayroll = (payroll) => {
    setState((current) => ({ ...current, payroll: { ...current.payroll, ...payroll } }));
  };

  const addChatMessages = (messages) => {
    setState((current) => ({ ...current, messages: [...current.messages, ...messages] }));
  };

  const switchView = (view) => {
    setState((current) => ({ ...current, currentView: view }));
  };

  const resetDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(createDefaultState());
  };

  return (
    <div className="app-shell">
      <Sidebar currentView={state.currentView} views={views} onSwitchView={switchView} />
      <main className="main-panel">
        <Topbar title={views[state.currentView]} onReset={resetDemo} />

        {state.currentView === "dashboard" && (
          <Dashboard job={state.job} logs={state.logs} setupChecks={setupChecks} />
        )}
        {state.currentView === "setup" && (
          <JobSetup job={state.job} checks={setupChecks} onSave={updateJob} />
        )}
        {state.currentView === "logs" && (
          <WorkLogs logs={state.logs} onAddLog={addLog} onDeleteLog={deleteLog} />
        )}
        {state.currentView === "payroll" && (
          <Payroll job={state.job} logs={state.logs} payroll={state.payroll} onChange={updatePayroll} />
        )}
        {state.currentView === "chat" && (
          <Chat
            job={state.job}
            logs={state.logs}
            payroll={state.payroll}
            messages={state.messages}
            onAddMessages={addChatMessages}
          />
        )}
      </main>
    </div>
  );
}

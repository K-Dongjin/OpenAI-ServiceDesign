import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Chat from "./pages/Chat.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import JobSetup from "./pages/JobSetup.jsx";
import Payroll from "./pages/Payroll.jsx";
import WorkLogs from "./pages/WorkLogs.jsx";
import { createJob, deleteJob, getHealth, listJobs, updateJob as updateJobRequest } from "./api/client.js";
import { createDefaultState, loadState, saveState, STORAGE_KEY } from "./utils/storage.js";
import { getSetupChecks } from "./utils/payroll.js";

const views = {
  dashboard: "홈",
  setup: "알바 시작",
  logs: "근무 기록",
  payroll: "급여 확인",
  chat: "AI 상담",
};

function getLatestJob(jobs = []) {
  return [...jobs].sort((a, b) => {
    const next = new Date(b.updatedAt || b.createdAt || 0).getTime();
    const previous = new Date(a.updatedAt || a.createdAt || 0).getTime();
    return next - previous;
  })[0];
}

function toJobPayload(job) {
  return {
    workplace: job.workplace.trim(),
    hourlyWage: Number(job.hourlyWage) || 0,
    minimumWage: Number(job.minimumWage) || 0,
    startDate: job.startDate,
    payDay: Number(job.payDay) || 0,
    weeklyDays: Number(job.weeklyDays) || 0,
    dailyHours: Number(job.dailyHours) || 0,
    contractStatus: job.contractStatus,
    weeklyIncluded: Boolean(job.weeklyIncluded),
  };
}

export default function App() {
  const [state, setState] = useState(loadState);
  const [health, setHealth] = useState({
    status: "checking",
    service: "",
    message: "BE 연결 확인 중",
  });
  const [jobSync, setJobSync] = useState({
    status: "idle",
    message: "근무 조건은 브라우저에 임시 저장됩니다.",
  });

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 3000);

    getHealth({ signal: controller.signal })
      .then((data) => {
        setHealth({
          status: "connected",
          service: data.service || "BE",
          message: "BE 연결됨",
        });
      })
      .catch(() => {
        setHealth({
          status: "disconnected",
          service: "",
          message: "BE 연결 실패",
        });
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
      });

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const controller = new AbortController();
    setJobSync({ status: "loading", message: "BE에서 근무 조건을 불러오는 중입니다." });

    listJobs({ signal: controller.signal })
      .then(({ jobs }) => {
        const latestJob = getLatestJob(jobs);
        if (!latestJob) {
          setJobSync({ status: "idle", message: "BE에 저장된 근무 조건이 없습니다." });
          return;
        }

        setState((current) => ({
          ...current,
          job: { ...current.job, ...latestJob },
        }));
        setJobSync({ status: "saved", message: "BE에서 근무 조건을 불러왔습니다." });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setJobSync({ status: "offline", message: "BE 연결 실패. 브라우저 임시 저장을 사용합니다." });
      });

    return () => {
      controller.abort();
    };
  }, []);

  const setupChecks = useMemo(() => getSetupChecks(state.job), [state.job]);

  const updateJob = async (job) => {
    const localJob = { ...state.job, ...job };
    const payload = toJobPayload(localJob);

    setState((current) => ({ ...current, job: localJob }));
    setJobSync({ status: "saving", message: "BE에 근무 조건을 저장하는 중입니다." });

    try {
      const savedJob = localJob.id
        ? await updateJobRequest(localJob.id, payload).catch((error) => {
            if (error.status !== 404) throw error;
            return createJob(payload);
          })
        : await createJob(payload);

      setState((current) => ({ ...current, job: { ...current.job, ...savedJob } }));
      setJobSync({ status: "saved", message: "BE에 근무 조건을 저장했습니다." });
    } catch (error) {
      const message =
        error.status === 400 ? error.message : "BE 저장 실패. 브라우저 임시 저장을 사용합니다.";
      setJobSync({ status: error.status === 400 ? "error" : "offline", message });
    }
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

  const resetDemo = async () => {
    const jobId = state.job.id;
    localStorage.removeItem(STORAGE_KEY);
    setState(createDefaultState());

    if (!jobId) {
      setJobSync({ status: "idle", message: "브라우저 입력값을 초기화했습니다." });
      return;
    }

    setJobSync({ status: "saving", message: "BE 근무 조건을 초기화하는 중입니다." });
    try {
      await deleteJob(jobId);
      setJobSync({ status: "idle", message: "BE 근무 조건을 초기화했습니다." });
    } catch (error) {
      if (error.status === 404) {
        setJobSync({ status: "idle", message: "브라우저 입력값을 초기화했습니다." });
        return;
      }
      setJobSync({ status: "offline", message: "BE 초기화 실패. 브라우저 입력값만 초기화했습니다." });
    }
  };

  return (
    <div className="app-shell">
      <Sidebar currentView={state.currentView} views={views} onSwitchView={switchView} />
      <main className="main-panel">
        <Topbar health={health} title={views[state.currentView]} onReset={resetDemo} />

        {state.currentView === "dashboard" && (
          <Dashboard job={state.job} logs={state.logs} setupChecks={setupChecks} />
        )}
        {state.currentView === "setup" && (
          <JobSetup job={state.job} checks={setupChecks} jobSync={jobSync} onSave={updateJob} />
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

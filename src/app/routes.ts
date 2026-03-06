import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./components/pages/Dashboard";
import InverterHealth from "./components/pages/InverterHealth";
import FailurePredictions from "./components/pages/FailurePredictions";
import Analytics from "./components/pages/Analytics";
import AIInsights from "./components/pages/AIInsights";
import Chatbot from "./components/pages/Chatbot";
import SystemLogs from "./components/pages/SystemLogs";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "inverter-health", Component: InverterHealth },
      { path: "failure-predictions", Component: FailurePredictions },
      { path: "analytics", Component: Analytics },
      { path: "ai-insights", Component: AIInsights },
      { path: "chatbot", Component: Chatbot },
      { path: "system-logs", Component: SystemLogs },
    ],
  },
]);

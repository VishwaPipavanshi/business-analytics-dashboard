import { DashboardProvider } from "../context/DashboardContext";
import DashboardLayout from "../components/layout/DashboardLayout";

export default function App() {
  return (
    <DashboardProvider>
      <DashboardLayout />
    </DashboardProvider>
  );
}
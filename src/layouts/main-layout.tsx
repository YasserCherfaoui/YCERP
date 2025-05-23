import AuthAppBar from "@/components/common/auth-app-bar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { DayPickerProvider } from "react-day-picker";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <DayPickerProvider
        initialProps={{
          mode: "single",
          required: true,
        }}
      >
        <AuthAppBar />
        <Outlet />
        <Toaster />
      </DayPickerProvider>
    </ThemeProvider>
  );
}

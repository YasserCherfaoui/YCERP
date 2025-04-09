import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Outlet } from "react-router-dom"

export default function MainLayout() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Outlet />
      <Toaster />
    </ThemeProvider>
  )
}


import { metaPixelId } from "@/app/constants";
import AppRouter from "@/app/routes";
import { store } from "@/app/store";
import { initMetaPixel } from "@/utils/meta-pixel";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

export default function App() {
  const queryClient = new QueryClient();

  useEffect(() => {
    // Initialize Meta Pixel when app loads
    if (metaPixelId) {
      initMetaPixel(metaPixelId);
    }
  }, []);

  return (
    <BrowserRouter>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AppRouter />
        </QueryClientProvider>
      </Provider>
    </BrowserRouter>
  );
}

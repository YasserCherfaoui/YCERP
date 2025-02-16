import { BrowserRouter } from "react-router-dom";
import AppRouter from "@/app/routes";
import { Provider } from "react-redux";
import { store } from "@/app/store";

export default function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <AppRouter />
      </Provider>
    </BrowserRouter>
  );
}

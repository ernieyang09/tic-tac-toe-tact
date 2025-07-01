import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { TonConnectButton } from "@tonconnect/ui-react";
import HomePage from "./pages/home";
import BoardPage from "./pages/board";

// const PROJECT_NAME = "tic-tac-toe-tact";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 150,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TonConnectUIProvider
        manifestUrl={import.meta.env.VITE_TON_MANIFEST_URL}
        walletsListConfiguration={{
          network: "testnet",
        }}
      >
        <TonConnectButton />
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/:board" element={<BoardPage />} />
          </Routes>
        </Router>
      </TonConnectUIProvider>
    </QueryClientProvider>
  );
}

export default App;

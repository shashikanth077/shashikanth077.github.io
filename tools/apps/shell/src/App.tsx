import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout.js";
import { ShellProvider } from "./shell-context.js";
import Home from "./pages/Home.js";
import NotFound from "./pages/NotFound.js";
import ToolPage from "./pages/ToolPage.js";
import Resources from "./pages/Resources.js";
import ResourceStack from "./pages/ResourceStack.js";
import AiAtlas from "./pages/AiAtlas.js";
import CloudLab from "./pages/CloudLab.js";

/**
 * Routing lives in the shell; the remote owns only the slug→component mapping.
 * A single `:slug` route means adding a tool to the manifest and the remote
 * requires no change here at all.
 */
export default function App() {
  return (
    <ShellProvider>
      <Layout>
        <Routes>
          <Route index element={<Home />} />
          <Route path="resources" element={<Resources />} />
          <Route path="resources/:stack" element={<ResourceStack />} />
          <Route path="ai" element={<AiAtlas />} />
          <Route path="ai/:stack" element={<ResourceStack />} />
          <Route path="cloud" element={<CloudLab />} />
          <Route path="cloud/:stack" element={<ResourceStack />} />
          <Route path=":slug" element={<ToolPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </ShellProvider>
  );
}

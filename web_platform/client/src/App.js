import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import MainHub from "./pages/MainHub";
import UploadData from "./pages/UploadData";
import IriMenu from "./pages/IriMenu";
import IriItemsUpload from "./pages/IriItemsUpload";
import IriCategoryBrandUpload from "./pages/IriCategoryBrandUpload";
import PosUpload from "./pages/PosUpload";
import PmrUpload from "./pages/PmrUpload";
import NewTable from "./pages/NewTable";

import ExternalRedirect from "./components/ExternalRedirect";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/hub" element={<MainHub />} />
        <Route path="/upload" element={<UploadData />} />
        <Route path="/upload/iri" element={<IriMenu />} />
        <Route path="/upload/iri/items" element={<IriItemsUpload />} />
        <Route path="/upload/iri/category-brand" element={<IriCategoryBrandUpload />} />
        {/* Optional placeholders */}
        <Route path="/upload/pos" element={<PosUpload/>} />
        <Route path="/upload/pmr" element={<PmrUpload/>} />
        <Route path="/upload/new-table" element={<NewTable/>} />
        <Route
          path="/metabase"
          element={<ExternalRedirect to="https://mrfresh.haibuilder.com" newTab />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

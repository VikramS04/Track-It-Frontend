import { BrowserRouter, Routes, Route } from "react-router-dom";

//Login page
import AuthPage from "./components/AuthPage";

// Normal Pages
import Trackitapp from "./pages/Trackitapp1";
import Dashboard from "./pages/Dashboard";
import Addexpense from "./pages/Addexpense";
import Expenseslist from "./pages/Expenseslist";
import Budgetmanager from "./pages/Budgetmanager";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Trackitapp />}>

          {/* Default page */}
          <Route index element={<Dashboard />} />

          {/* Child routes */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="add-expense" element={<Addexpense />} />
          <Route path="expenses" element={<Expenseslist />} />
          <Route path="budget" element={<Budgetmanager />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
          {/* Keeping login OUTSIDE layout -- Takki Uskon Sidebar Access na mil jaye */}
          <Route path="/login" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
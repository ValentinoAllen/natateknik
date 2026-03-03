import { RouterProvider, createBrowserRouter } from "react-router";
import { DataProvider } from "./components/data-provider";
import { MainSite } from "./components/main-site";
import { AdminDashboard } from "./components/admin-dashboard";

const router = createBrowserRouter([
  {
    path: "/",
    Component: () => (
      <DataProvider>
        <MainSite />
      </DataProvider>
    ),
  },
  {
    path: "/admin",
    Component: () => (
      <AdminDashboard />
    ),
  },
  {
    path: "/admin/*",
    Component: () => (
      <AdminDashboard />
    ),
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
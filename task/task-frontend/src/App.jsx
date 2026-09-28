import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard.jsx";

function App() {

  const [page, setPage] = useState(
      localStorage.getItem("token") ? "dashboard" : "login"
  );

  const handleLogin = (data) => {
    localStorage.setItem("token", data.token);

    localStorage.setItem(
        "user",
        JSON.stringify({
          name: data.name,
          email: data.email,
        })
    );

    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setPage("login");
  };

  if (page === "register") {
    return (
        <Register
            onRegister={() => setPage("login")}
            onLogin={() => setPage("login")}
        />
    );
  }

  if (page === "dashboard") {
    return (
        <Dashboard
            onLogout={handleLogout}
        />
    );
  }

  return (
      <Login
          onLogin={handleLogin}
          onRegister={() => setPage("register")}
      />
  );
}

export default App;
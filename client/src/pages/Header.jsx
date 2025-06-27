import { useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { UserContext } from "../UserContext";
import { RxExit } from "react-icons/rx";

export default function Header() {
  const { user, setUser } = useContext(UserContext);

  const logout = async () => {
    await axios.post("/logout");
    setUser(null);
  };

  return (
    <header className="flex flex-wrap items-center justify-between py-2 px-4 sm:px-4 gap-4 relative z-50 bg-white shadow">
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <img src="../src/assets/cp.png" alt="Logo" className="w-26 h-9" />
      </Link>

      {/* Role-based Action Button */}
      {user?.role === "organizer" && (
        <Link
          to="/createEvent"
          className="hidden md:flex flex-col items-center py-1 px-2 rounded text-primary cursor-pointer hover:text-primarydark hover:bg-white hover:shadow-sm shadow-gray-200 transition duration-150"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 stroke-3 py-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <div className="font-bold color-primary text-sm">Create Event</div>
        </Link>
      )}
      
      {/* Auth Buttons */}
      {!!user ? (
        <div className="flex items-center gap-4">
          <span className="font-semibold">{user.name.toUpperCase()}</span>
          <button onClick={logout} className="flex items-center gap-1 secondary">
            <div>Log out</div>
            <RxExit />
          </button>
        </div>
      ) : (
        <Link to="/login">
          <button className="primary">
            <div>Sign in</div>
          </button>
        </Link>
      )}
    </header>
  );
}

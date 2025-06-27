import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import heroImage from "../assets/hero.png";
import { toast } from "react-hot-toast";
import { UserContext } from "../UserContext";

const IndexPage = () => {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [reviewMap, setReviewMap] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("/api/events");
        setEvents(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleReviewSubmit = async (eventId, review, rating) => {
    if (!review.trim() && !rating) return;
    try {
      await axios.post(`/api/events/${eventId}/reviews`, { comment: review, rating });
      toast.success("Review submitted!");
    } catch (err) {
      console.error("Review error:", err);
      toast.error("Error submitting review.");
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchCategory = selectedCategory === "all" || event.category === selectedCategory;
    const matchQuery = event.title.toLowerCase().includes(query.toLowerCase());
    return matchCategory && matchQuery;
  });

  return (
    <div>
      {/* ✅ Hero Section */}
      <div className="w-full">
        <img
          src={heroImage}
          alt="Campus Events"
          className="w-full h-[280px] object-cover rounded-b-xl shadow-md"
        />
      </div>

      <div className="p-4 max-w-5xl mx-auto">
        {/* 🔍 Search bar */}
        <input
          type="text"
          placeholder="Search events..."
          className="w-full p-2 border rounded mb-4"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* 🧩 Category Filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {["all", "workshop", "club activity", "sports", "cultural", "technical"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1 rounded-full text-sm capitalize ${
                selectedCategory === cat ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 🗓️ Event Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p>Loading events...</p>
          ) : filteredEvents.length === 0 ? (
            <p className="col-span-full text-center text-gray-600 text-lg">No events found.</p>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <Link to={`/event/${event._id}`}>
                  <img
                    src={event.image ? `http://localhost:4000/uploads/${event.image}` : "/default-event.jpg"}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                </Link>

                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-1">{event.title}</h2>
                  <p className="text-sm text-gray-500 mb-1">
                    {new Date(event.eventDate).toLocaleDateString()}, {event.eventTime || "TBD"}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    {event.category?.charAt(0).toUpperCase() + event.category?.slice(1)} • {event.location || "TBD"}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-3">{event.description}</p>

                  <div className="mt-2 text-sm text-gray-500">
                    <span>Organized By: </span>
                    <span className="font-semibold text-blue-600">
                      {event.organizer?.name || "Unknown"}
                    </span>
                  </div>

                  {/* 👥 Show participant count to organizers */}
                  {user?.role === "organizer" && (
                    <p className="text-sm text-green-600 mt-2">
                      Registrations: {event.participants?.length || 0}
                    </p>
                  )}

                  {/* ✨ Optional Rating Input for students */}
                  {user?.role === "student" && (
                    <div className="mt-2">
                      <textarea
                        placeholder="Leave a review (optional)"
                        className="w-full border rounded p-1 text-sm"
                        value={reviewMap[event._id] || ""}
                        onChange={(e) =>
                          setReviewMap({ ...reviewMap, [event._id]: e.target.value })
                        }
                        onBlur={() => handleReviewSubmit(event._id, reviewMap[event._id], 0)}
                      />
                    </div>
                  )}

                  {/* 🎯 Role-based view/register */}
                  <div className="mt-4">
                    <Link
                      to={`/event/${event._id}`}
                      className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      {user?.role === "student" ? "View & Register" : "View"}
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
};

export default IndexPage;

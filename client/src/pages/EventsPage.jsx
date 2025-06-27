import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AiFillStar } from "react-icons/ai";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get("/api/events");
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filter events based on search term and category (if set)
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? event.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  // Calculate average rating from event.ratings (if any)
  const calculateAvgRating = (ratings) => {
    if (!ratings || ratings.length === 0) return null;
    const sum = ratings.reduce((acc, item) => acc + item.value, 0);
    return (sum / ratings.length).toFixed(1);
  };

  if (loading)
    return <div className="text-center p-8">Loading events...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Category Filter Only */}
      <div className="flex flex-col md:flex-row justify-end mb-6 gap-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Categories</option>
          <option value="workshop">Workshop</option>
          <option value="cultural">Cultural</option>
          <option value="technical">Technical</option>
          <option value="seminar">Seminar</option>
          <option value="sports">Sports</option>
          <option value="club activity">Club Activity</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Event Cards */}
      {filteredEvents.length === 0 ? (
        <p className="col-span-full text-center text-gray-600 text-lg">No events found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const avgRating = calculateAvgRating(event.ratings);
            return (
              <div
                key={event._id}
                className="border rounded-lg overflow-hidden shadow hover:shadow-md transition duration-300"
              >
                <Link to={`/event/${event._id}`}>
                  {event.image ? (
                    <img
                      src={`http://localhost:4000/uploads/${event.image}`}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <img
                      src="/default-event.jpg"
                      alt="default event"
                      className="w-full h-48 object-cover"
                    />
                  )}
                </Link>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold">{event.title}</h2>
                    {avgRating && (
                      <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
                        <AiFillStar className="text-yellow-400 mr-1" />
                        <span>{avgRating}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mt-1">
                    {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                  </p>
                  <p className="text-gray-700 mt-2 line-clamp-2">{event.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date(event.eventDate).toLocaleDateString()}, {event.eventTime}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <span>Location: </span>
                    <span>{event.location}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <span>Organizer: </span>
                    <span className="font-semibold text-blue-600">
                      {event.organizer?.name || "Unknown"}
                    </span>
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/event/${event._id}`}
                      className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      View Details
                    </Link>
                  </div>
                  {user?.role === "organizer" && user._id === event.organizer?._id && (
                  <div className="mt-2 flex justify-between">
                    <Link
                      to={`/edit-event/${event._id}`}
                      className="text-sm text-yellow-600 hover:underline font-semibold"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this event?")) {
                          try {
                            await axios.delete(`/api/events/${event._id}`, { withCredentials: true });
                            toast.success("Event deleted");
                            setEvents(events.filter(e => e._id !== event._id)); // remove from UI
                          } catch (err) {
                            console.error("Delete failed", err);
                            toast.error("Failed to delete");
                          }
                        }
                      }}
                      className="text-sm text-red-600 hover:underline font-semibold"
                    >
                      🗑 Delete
                    </button>
                  </div>
                )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

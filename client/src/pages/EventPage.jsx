import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { UserContext } from "../UserContext";
import { toast } from "react-hot-toast";

export default function EventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [event, setEvent] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedEvent, setUpdatedEvent] = useState({});

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`/api/events/${id}`);
        setEvent(data);
        setUpdatedEvent({
          title: data.title,
          category: data.category,
          eventDate: data.eventDate?.slice(0, 10),
          eventTime: data.eventTime,
          location: data.location,
          description: data.description,
        });
      } catch (err) {
        console.error("Error fetching event:", err);
      }
    };
    fetchEvent();
  }, [id, refresh]);

  const isOrganizer = user?._id === event?.organizer?._id;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/events/${id}/reviews`, {
        rating,
        comment: review,
      });
      toast.success("Review submitted!");
      setRating(0);
      setReview("");
      setRefresh(!refresh);
    } catch (err) {
      if (err.response?.data?.error === "You have already rated this event") {
        toast.error("You've already reviewed this event.");
      } else {
        toast.error("Error submitting review.");
      }
    }
  };

  const handleRegister = async () => {
    if (user?.role !== "student") {
      toast.error("Only students can register.");
      return;
    }
    const confirm = window.confirm("Are you sure you want to register?");
    if (!confirm) return;

    try {
      await axios.post(`/api/events/register/${id}`);
      toast.success("Successfully registered!");
      setRefresh(!refresh);
    } catch (err) {
      if (err.response?.data?.error === "You are already registered") {
        toast.error("You have already registered for this event.");
      } else {
        toast.error("Registration failed.");
      }
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this event?");
    if (!confirm) return;
    try {
      await axios.delete(`/api/events/${id}`);
      toast.success("Event deleted successfully");
      navigate("/");
    } catch (err) {
      toast.error("Failed to delete event");
    }
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      for (const key in updatedEvent) {
        formData.append(key, updatedEvent[key]);
      }
      await axios.put(`/api/events/${id}`, formData);
      toast.success("Event updated successfully");
      setIsEditing(false);
      setRefresh(!refresh);
    } catch (err) {
      toast.error("Failed to update event");
    }
  };

  if (!event) return <div className="text-center p-8">Loading event...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* 📸 Poster */}
      {event.image ? (
        <img
          src={`http://localhost:4000/uploads/${event.image}`}
          alt={event.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      ) : (
        <div className="w-full h-64 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg mb-6">
          No image available
        </div>
      )}

      {/* 🔧 Organizer Edit Mode or View Mode */}
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Event Title</label>
            <input
              type="text"
              value={updatedEvent.title}
              onChange={(e) => setUpdatedEvent({ ...updatedEvent, title: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Category</label>
            <select
              value={updatedEvent.category}
              onChange={(e) => setUpdatedEvent({ ...updatedEvent, category: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="workshop">Workshop</option>
              <option value="cultural">Cultural</option>
              <option value="technical">Technical</option>
              <option value="seminar">Seminar</option>
              <option value="sports">Sports</option>
              <option value="club activity">Club Activity</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Date</label>
            <input
              type="date"
              value={updatedEvent.eventDate}
              onChange={(e) => setUpdatedEvent({ ...updatedEvent, eventDate: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Time</label>
            <input
              type="time"
              value={updatedEvent.eventTime}
              onChange={(e) => setUpdatedEvent({ ...updatedEvent, eventTime: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Location</label>
            <input
              type="text"
              value={updatedEvent.location}
              onChange={(e) => setUpdatedEvent({ ...updatedEvent, location: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              value={updatedEvent.description}
              onChange={(e) => setUpdatedEvent({ ...updatedEvent, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-1">{event.title}</h1>
          <p className="text-gray-600 mb-3">{event.category} • {event.location}</p>

          <div className="prose mb-6">
            <p>{event.description}</p>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-bold mb-3">Event Details</h2>
            <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {event.eventTime}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Organizer:</strong> {event.organizer?.name || "Unknown"}</p>
          </div>
        </>
      )}

      {/* 📥 Register Button (Student) */}
      {user?.role === "student" && (
        <div className="mb-6">
          {event.participants?.some(p => p._id === user._id) ? (
            <button disabled className="bg-gray-400 text-white px-5 py-2 rounded cursor-not-allowed">
              Registered
            </button>
          ) : (
            <button onClick={handleRegister} className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700">
              Register for this Event
            </button>
          )}
        </div>
      )}

      {/* ⚙️ Organizer Controls */}
      {isOrganizer && (
        <div className="flex justify-center gap-4 mt-8">
          {isEditing ? (
            <button onClick={handleUpdate} className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">
              Save Changes
            </button>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="bg-yellow-500 text-white px-5 py-2 rounded hover:bg-yellow-600">
                Edit Event
              </button>
              <button onClick={handleDelete} className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700">
                Delete Event
              </button>
            </>
          )}
        </div>
      )}

      {/* ⭐ Review Section */}
      {user?.role === "student" && (
        <div className="mt-12 mb-10">
          <h2 className="text-xl font-bold mb-3">Leave a Review</h2>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-2xl"
                >
                  {star <= rating ? <AiFillStar className="text-yellow-400" /> : <AiOutlineStar />}
                </button>
              ))}
            </div>

            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-2 border rounded"
              rows={3}
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit Review
            </button>
          </form>
        </div>
      )}

      {/* 💬 All Reviews */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Reviews ({event.comments?.length || 0})</h2>
        {event.comments?.length > 0 ? (
          <div className="space-y-4">
            {event.comments.map((r, i) => (
              <div key={i} className="border-b pb-4">
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, star) => (
                    <span key={star}>
                      {star < (event.ratings[i]?.value || 0)
                        ? <AiFillStar className="text-yellow-400" />
                        : <AiOutlineStar />}
                    </span>
                  ))}
                </div>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
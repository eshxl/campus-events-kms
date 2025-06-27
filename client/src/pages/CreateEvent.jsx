import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";

export default function CreateEvent() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return <Navigate to="/login" />;
  if (user.role !== "organizer") {
    return (
      <div className="text-center text-red-500 text-lg mt-10">
        ❌ Only organizers can create events
      </div>
    );
  }

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    location: "",
    category: "",
    organizer: user._id,
    image: null,
  });

  const categories = [
    "workshop",
    "cultural",
    "technical",
    "seminar",
    "sports",
    "club activity",
    "other",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "eventDate") {
          formDataToSend.append("eventDate", new Date(value).toISOString());
        } else {
          formDataToSend.append(key, value);
        }        
      });

      await axios.post("/api/events", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/"); // go back to homepage after creation
    } catch (err) {
      console.error("Event creation failed:", err);
      alert("Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Event Title*</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1">Category*</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Date*</label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1">Time*</label>
            <input
              type="time"
              name="eventTime"
              value={formData.eventTime}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1">Location*</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Description*</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        <div>
          <label className="block mb-1">Event Poster (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}

import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../UserContext";
import { toast } from "react-hot-toast";

export default function EditEventPage() {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    location: "",
    category: "",
    image: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`/api/events/${id}`);
        if (data.organizer._id !== user._id) {
          toast.error("You can only edit your own events");
          return navigate("/");
        }

        setFormData({
          title: data.title,
          description: data.description,
          eventDate: data.eventDate.split("T")[0],
          eventTime: data.eventTime,
          location: data.location,
          category: data.category,
          image: null, // file input always null initially
        });
      } catch (err) {
        console.error("Error fetching event:", err);
        toast.error("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchEvent();
  }, [id, user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) payload.append(key, value);
    });

    try {
      await axios.put(`/api/events/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success("Event updated successfully!");
      navigate("/");
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update event");
    }
  };

  if (loading) return <div className="text-center p-6">Loading event...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Event Title"
          className="w-full p-2 border rounded"
          required
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full p-2 border rounded"
          rows={4}
          required
        />

        <div className="flex gap-4">
          <input
            type="date"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
          />
          <input
            type="time"
            name="eventTime"
            value={formData.eventTime}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
          />
        </div>

        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full p-2 border rounded"
          required
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Category</option>
          <option value="workshop">Workshop</option>
          <option value="cultural">Cultural</option>
          <option value="technical">Technical</option>
          <option value="seminar">Seminar</option>
          <option value="sports">Sports</option>
          <option value="club activity">Club Activity</option>
          <option value="other">Other</option>
        </select>

        <input
          type="file"
          name="image"
          onChange={handleChange}
          className="w-full p-2 border rounded"
          accept="image/*"
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

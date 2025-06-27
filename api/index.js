const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");

const UserModel = require("./models/User");
const Event = require("./models/Event");

const app = express();
const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "bsbsfbrnsftentwnnwnwn";

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });


// --- AUTH ---
app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: "User already exists with this email" });
  }

  try {
    const userDoc = await UserModel.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
      role,
    });
    res.status(201).json(userDoc);
  } catch (e) {
    res.status(500).json({ error: "Registration failed", details: e.message });
  }
});

app.post("/login", async (req, res) => {
  console.log("🔐 Login attempt:", req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const userDoc = await UserModel.findOne({ email });
  if (!userDoc) return res.status(404).json({ error: "User not found" });

  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (!passOk) return res.status(401).json({ error: "Invalid password" });

  jwt.sign(
    { email: userDoc.email, id: userDoc._id, role: userDoc.role },
    jwtSecret,
    {},
    (err, token) => {
      if (err) return res.status(500).json({ error: "Token error" });
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax", // helps cookies work across ports
      }).json(userDoc);      
    }
  );
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.json(null);

  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const user = await UserModel.findById(userData.id);
    res.json(user);
  });
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

// --- EVENTS ---
app.post("/api/events", upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      category,
      eventDate,
      eventTime,
      location,
      description,
      organizer,
    } = req.body;

    if (!title || !category || !eventDate || !eventTime || !location || !description || !organizer) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newEvent = new Event({
      title,
      category,
      eventDate: new Date(eventDate),
      eventTime,
      location,
      description,
      organizer,
      image: req.file ? req.file.filename : null,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Event creation failed:", error);
    res.status(500).json({ error: "Failed to create event", details: error.message });
  }
});

app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().populate("organizer", "name");
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "name")
      .populate("participants", "name email");
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Event fetch failed" });
  }
});

app.post("/api/events/register/:id", async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { id } = req.params;
    const decoded = jwt.verify(token, jwtSecret);
    const user = await UserModel.findById(decoded.id);

    if (user.role !== "student") return res.status(403).json({ error: "Only students can register" });

    const event = await Event.findById(id);
    const alreadyRegistered = event.participants.includes(user._id);
    if (alreadyRegistered) {
      return res.status(400).json({ error: "You are already registered" });
    }

    event.participants.push(user._id);
    await event.save();

    res.json({ message: "Registered successfully", event });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/events/:id/reviews", async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const { rating, comment } = req.body;

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.id;
    const userRole = decoded.role;

    if (userRole !== "student") {
      return res.status(403).json({ error: "Only students can review" });
    }

    const event = await Event.findById(req.params.id);
    const alreadyRated = event.ratings.some(r => r.user.equals(userId));
    if (alreadyRated) {
      return res.status(400).json({ error: "You have already rated this event" });
    }

    event.ratings.push({ user: userId, value: rating });
    if (comment?.trim()) {
      event.comments.push({ user: userId, text: comment });
    }

    await event.save();
    res.json({ message: "Review submitted" });
  } catch (err) {
    res.status(500).json({ error: "Review failed" });
  }
});

// --- My Registrations ---
app.get("/api/events/my-registrations", async (req, res) => {
  try {
    const { token } = req.cookies;
    console.log("Received token:", token);
    
    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ error: "Unauthorized" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (tokenError) {
      console.error("Token verification failed:", tokenError);
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decoded.id;
    console.log("User ID from token:", userId);

    const events = await Event.find().lean();
    const registeredEvents = events.filter(event =>
      event.participants?.some(p => p.toString() === userId)
    );

    console.log("Registered events found:", registeredEvents.length);
    return res.json(registeredEvents);
  } catch (err) {
    console.error("ERROR in /my-registrations:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/test", (req, res) => {
  res.json("test ok");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// --- UPDATE EVENT ---
app.put("/api/events/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      eventDate,
      eventTime,
      location,
      description,
      organizer,
    } = req.body;

    const updatedData = {
      title,
      category,
      eventDate,
      eventTime,
      location,
      description,
      organizer,
    };

    if (req.file) {
      updatedData.image = req.file.filename;
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(updatedEvent);
  } catch (err) {
    console.error("Update event failed:", err);
    res.status(500).json({ error: "Failed to update event" });
  }
});

// --- DELETE EVENT ---
app.delete("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Event.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Delete event failed:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

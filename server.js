require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");

const Brand = require("./models/Brand");
const Model = require("./models/Model");
const Booking = require("./models/Booking");
const Admin = require("./models/Admin");
const Technician = require("./models/Technician");
const Service = require("./models/Service");

const sendBookingEmail = require("./services/bookingNotifications");

const app = express();
const PORT = process.env.PORT || 5000;

/* ================= DATABASE ================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err.message);
  });

/* ================= MIDDLEWARE ================= */

const allowedOrigins = [
  "http://localhost:3000",
  "https://bookmyrepair.netlify.app",
  "https://willowy-croquembouche-2ca609.netlify.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ================= ROOT ================= */

app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

/* ================= UTIL FUNCTIONS ================= */

const hashPassword = (password, salt) =>
  crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");

const generateToken = () => crypto.randomBytes(24).toString("hex");

/* ================= ADMIN API ================= */

app.post("/api/admin/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Admin.findOne({ email });

    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const hash = hashPassword(password, salt);

    const admin = await Admin.create({
      name,
      email,
      passwordHash: hash,
      passwordSalt: salt,
    });

    res.status(201).json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const hash = hashPassword(password, admin.passwordSalt);

    if (hash !== admin.passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      message: "Login success",
      token: generateToken(),
      admin,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= BRAND API ================= */

app.post("/api/brands", async (req, res) => {
  try {
    const brand = await Brand.create(req.body);
    res.status(201).json(brand);
  } catch (error) {
    console.error("Brand create error:", error);
    res.status(500).json({ error: "Failed to create brand" });
  }
});

app.get("/api/brands", async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/brands/:id", async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/brands/:id", async (req, res) => {
  try {
    await Model.deleteMany({ brandId: req.params.id });

    await Brand.findByIdAndDelete(req.params.id);

    res.json({ message: "Brand deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= MODEL API ================= */

app.post("/api/models", async (req, res) => {
  try {
    const model = await Model.create(req.body);
    res.status(201).json(model);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/models", async (req, res) => {
  try {
    const models = await Model.find().populate("brandId");
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/models/bulk", async (req, res) => {
  try {
    const models = req.body;

    if (!Array.isArray(models)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const inserted = await Model.insertMany(models);

    res.json({
      message: "Models uploaded successfully",
      count: inserted.length,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ error: "Bulk upload failed" });
  }
});

app.put("/api/models/:id", async (req, res) => {
  try {
    const model = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(model);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/models/:id", async (req, res) => {
  try {
    await Model.findByIdAndDelete(req.params.id);

    res.json({ message: "Model deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= TECHNICIAN API ================= */

app.post("/api/technicians", async (req, res) => {
  try {
    const tech = await Technician.create(req.body);
    res.status(201).json(tech);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/technicians", async (req, res) => {
  try {
    const techs = await Technician.find();
    res.json(techs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/technicians/:id", async (req, res) => {
  try {
    const tech = await Technician.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(tech);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/technicians/:id", async (req, res) => {
  try {
    await Technician.findByIdAndDelete(req.params.id);

    res.json({ message: "Technician deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= BOOKING API ================= */

app.post("/api/bookings", async (req, res) => {
  try {
    const booking = await Booking.create(req.body);

    // Send response immediately
    res.status(201).json({
      trackingId: booking.trackingId,
      phone: booking.phone,
    });

    // Send email in background
    sendBookingEmail(booking).catch((err) => {
      console.error("Email failed:", err.message);
    });

  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/bookings/track", async (req, res) => {
  try {
    const { trackingId, phone } = req.body;

    const booking = await Booking.findOne({
      trackingId: trackingId.toUpperCase(),
      phone: phone.trim(),
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ================= SERVICE API ================= */

app.post("/api/services", async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/services", async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/services/:id", async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/services/:id", async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);

    res.json({ message: "Service deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

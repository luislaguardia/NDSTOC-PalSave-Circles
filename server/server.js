require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

let circle = {
  circleName: "Weekly Sabado Circle",
  nextPayout: "2025-04-07",
  totalCollected: 8000,
  contribution: 1000,
  payoutAmount: 10000,
  participants: [
    { name: "Maria A*******", status: "Claimed" },
    { name: "Jose B********", status: "Claimed" },
    { name: "Liza C********", status: "Claimed" },
    { name: "Ramon D********", status: "Claimed" },
    { name: "Sofia E********", status: "Pending" },
    { name: "Andres F********", status: "Not Paid" },
    { name: "Carla G********", status: "Not Paid" },
    { name: "Ben H********", status: "Not Paid" },
    { name: "Isabel I********", status: "Not Paid" },
    { name: "Miguel Jordan", status: "Not Paid" }
  ]
};

app.get("/api/circle", (req, res) => {
  res.json(circle);
});

app.post("/api/circle/contribute", (req, res) => {
  const nameInput = req.body.name;

  if (!nameInput) {
    return res.status(400).json({ message: "Name is required" });
  }

  // Trim and compare names case-insensitively
  const user = circle.participants.find(p =>
    p.name.toLowerCase().trim() === nameInput.toLowerCase().trim()
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.status === "Claimed") {
    return res.status(400).json({ message: "Already contributed" });
  }

  user.status = "Claimed";
  circle.totalCollected += circle.contribution;

  if (circle.totalCollected > circle.payoutAmount) {
    circle.totalCollected = circle.payoutAmount;
  }

  res.json({ message: "Contribution recorded", circle });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
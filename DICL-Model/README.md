# 🤖 DICL-Model (Data-Informed Credit Logic)

This directory contains the implementation of the **Alternative Credit Scoring** model used in the **PalSave Circles** platform. It analyzes users' financial behavior within Paluwagan circles to generate a creditworthiness score, especially for users without traditional financial histories.

---

## 📊 What This Model Does

- Tracks **user contribution patterns** within savings circles.
- Evaluates **consistency**, **timeliness**, and **circle reliability**.
- Uses **machine learning** (e.g., Random Forest) to predict credit behavior.
- Provides a **credit score** based on user trustworthiness and participation.

---

## 🧠 Model Type (Current)

The current implementation uses a **Random Forest Classifier**, a supervised learning model that performs well with structured behavioral data.

### Features Used:
- `total_contributions`
- `on_time_payments`
- `late_payments`
- `number_of_circles_joined`
- `average_contribution_amount`
- `dropout_rate`

### Target:
- `is_trustworthy` → Boolean (1 for good standing, 0 otherwise)

---

## 🛠️ Files in This Folder

```plaintext
DICL-Model/
├── Dockerfile                 # Docker configuration to containerize the model
├── README.md                  # This documentation file
├── app.py                     # Flask API exposing the model for prediction
├── credit_score_model.joblib  # Trained Random Forest model
├── requirements.txt           # Python dependencies
└── set_data.html              # Web form for submitting prediction input
```

---

## 🚀 How to Run

You can run the credit scoring model using Docker for easy setup.

### 📦 Prerequisites

- Install [Docker](https://www.docker.com/products/docker-desktop)

### 🧪 Steps to Run with Docker

1. **Navigate to the DICL-Model folder:**
   ```bash
   cd NDSTOC-PalSave-Circles/DICL-Model
   ```
2. **Build the Docker image:**
   ```bash
   docker build -t dicl-model .
   ```
3. **Run the Docker container:**
   ```bash
   docker run -d -p 5000:5000 dicl-model
   ```


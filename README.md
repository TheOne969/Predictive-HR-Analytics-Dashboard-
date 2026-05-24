# HR Attrition Predictive Analytics Dashboard

A full-stack, data-driven web application designed to help HR teams predict, monitor, and mitigate employee flight risk. By leveraging a Machine Learning model trained on the [IBM HR Analytics Employee Attrition & Performance dataset from Kaggle](https://www.kaggle.com/datasets/pavansubhasht/ibm-hr-analytics-attrition-dataset), this dashboard identifies high-risk employees and visualizes the underlying factors driving turnover, allowing companies to take proactive retention measures.

**Live Demo link**: [Click here](https://hr-dashboard-ui.onrender.com)

## 🚀 Overview

Traditional HR dashboards tell you *who* quit. This application tells you *who is going to quit* and *why*. 

The application utilizes a Scikit-Learn Random Forest model to calculate a "Flight Risk Probability" score. Crucially, the frontend is dynamically driven by the model's **Feature Importance**. The user interface strictly prioritizes the heaviest variables driving attrition (e.g., Overtime, Monthly Income, Stock Options), ensuring HR managers manipulate the variables that actually impact retention.

## 💻 Tech Stack

*   **Frontend:** React (Vite), Tailwind CSS, Recharts (Data Visualization), Lucide React (Icons), React Router.
*   **Backend:** Python, Flask, Flask-CORS, SQLAlchemy.
*   **Machine Learning:** Scikit-Learn (Random Forest Classifier), Pandas.
*   **Database:** SQLite (Local/Ephemeral).

## ✨ Key Features

*   **Predictive ML Engine:** Inputs demographic and workload data to instantly calculate an employee's flight risk percentage and categorize them (Low, Medium, High).
*   **Data-Driven Form:** Form fields are specifically mapped to the top 10 highest-weighted ML variables (e.g., Overtime, Job Level, Total Working Years) to ensure accurate, reactive predictions.
*   **Feature Importance Visualization:** Dynamically renders a bar chart showing the global factors driving company attrition based on the trained model.
*   **Retention Watchlist (Full CRUD):** Save, view, update, and delete high-risk employee profiles to a persistent SQL database.
*   **Advanced Dashboard Controls:**
    *   **Search:** Real-time text filtering by employee name.
    *   **Categorical Filters:** Toggle lists to filter by Department, Job Role, and Risk Level.
    *   **Smart Sorting:** Clickable column headers to sort ascending/descending by Name, ID, or ML Score.
*   **Immutable State Management:** Edit mode pre-fills historical employee data while protecting database Primary Keys (System IDs).

---

## 🛠️ Setting Up (Local Deployment)

Follow these steps to run the application locally on your machine.

### Prerequisites
*   [Python 3.8+](https://www.python.org/downloads/) installed.
*   [Node.js (v16+) and npm](https://nodejs.org/) installed.

### 1. Clone the Repository
```bash
git clone https://github.com/TheOne969/Predictive-HR-Analytics-Dashboard-.git
cd Predictive-HR-Analytics-Dashboard
```

### 2. Backend Setup (Flask & ML)
Open a new terminal window and navigate to the `backend` folder.

```bash
cd backend

# Create a virtual environment (Optional but recommended)
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install the required Python packages
pip install -r requirements.txt

# Start the Flask server
python app.py
```
*The Flask server should now be running on `http://127.0.0.1:5000`.*
*(Note: The SQLite database `hr_database.db` will automatically generate in the `instance/` folder upon first run).*

### 3. Frontend Setup (React)
Open a *second* terminal window and navigate to the `frontend` folder.

```bash
cd frontend

# Install Node modules
npm install

# Start the Vite development server
npm run dev
```
*The React app should now be running on `http://localhost:5173` (or the port specified by Vite).*

### 4. Test the Application
1. Open your browser and go to the local React URL.
2. Navigate to the **Predictive Analytics** page.
3. Fill out the form and click **Run Prediction Model**.
4. Save the record, navigate to the **Dashboard**, and test the search, sort, and edit functionalities!

---

## 📂 Project Structure

```text
hr-attrition-dashboard/
│
├── backend/
│   ├── app.py                     # Flask API routes and DB configuration
│   ├── models.py                  # SQLAlchemy Database Schema
│   ├── hr_pipeline.joblib    # Trained Scikit-Learn Model
│   ├── feature_importances.json   # Exported ML weights for React Recharts
│   └── requirements.txt           # Python dependencies
    ├── data.csv                   # Dataset used for training
    ├── train_model.ipynb          # Notebook used for training the model. 
│
└── frontend/
    ├── src/
    │   ├── App.jsx                # React Router setup
    │   ├── Dashboard.jsx          # Watchlist table with Search/Sort/Filter
    │   ├── Predict.jsx            # ML Input form and Results Visualization
    │   └── main.jsx               # React entry point
        └── index.css              # main stylesheet
    ├── package.json               # Node dependencies
    └── tailwind.config.js         # Tailwind CSS configuration
└── test_database.py               # Testing sqlitedatabase
```

## ☁️ Deployment Note (Portfolio Demo)
This project utilizes a local SQLite database for ease of development.
Demo link: [Click here]()
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import json
from models import db, Employee, ActionLog

app = Flask(__name__)
CORS(app)

# Database Configuration (Creates a local SQLite file)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hr_database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Load Machine Learning Artifacts
try:
    pipeline = joblib.load('hr_pipeline.joblib')
    with open('feature_importances.json', 'r') as f:
        feature_importances = json.load(f)
except Exception as e:
    print(f"Error loading ML artifacts: {e}")
    print("Ensure 'hr_pipeline.joblib' and 'feature_importances.json' are in the backend directory.")

# Create database tables automatically
with app.app_context():
    db.create_all()

# --- ML ENDPOINTS ---

@app.route('/api/predict', methods=['POST'])
def predict_risk():
    """Runs form data through the ML model without saving to DB."""
    try:
        data = request.json
        
        # --- Safe Fallback Logic ---
        known_roles = [
            'Sales Executive', 'Research Scientist', 'Laboratory Technician', 
            'Manufacturing Director', 'Healthcare Representative', 'Manager', 
            'Sales Representative', 'Research Director', 'Human Resources'
        ]
        actual_job_role = data.get('job_role', 'Sales Executive')
        ml_safe_role = actual_job_role if actual_job_role in known_roles else 'Sales Executive'
        
        known_depts = ['Sales', 'Research & Development', 'Human Resources']
        actual_dept = data.get('department', 'Sales')
        ml_safe_dept = actual_dept if actual_dept in known_depts else 'Sales'
        # --------------------------------

        dummy_data = {
            'Age': [int(data.get('Age', 35))],
            'BusinessTravel': ['Travel_Rarely'],
            'DailyRate': [800],
            'Department': [ml_safe_dept],
            'DistanceFromHome': [10],
            'Education': [3],
            'EducationField': ['Life Sciences'],
            'EnvironmentSatisfaction': [3],
            'Gender': ['Male'],
            'HourlyRate': [65],
            'JobInvolvement': [3],
            'JobLevel': [int(data.get('JobLevel', 2))],                              # <-- NEW
            'JobRole': [ml_safe_role],
            'JobSatisfaction': [3],
            'MaritalStatus': [data.get('MaritalStatus', 'Married')],                 # <-- NEW
            'MonthlyIncome': [int(data.get('MonthlyIncome', 5000))],
            'MonthlyRate': [14000],
            'NumCompaniesWorked': [2],
            'OverTime': [data.get('OverTime', 'No')],
            'PercentSalaryHike': [12],
            'PerformanceRating': [3],
            'RelationshipSatisfaction': [3],
            'StockOptionLevel': [int(data.get('StockOptionLevel', 0))],
            'TotalWorkingYears': [int(data.get('TotalWorkingYears', 10))],           # <-- NEW
            'TrainingTimesLastYear': [3],
            'WorkLifeBalance': [3],
            'YearsAtCompany': [int(data.get('YearsAtCompany', 5))],
            'YearsInCurrentRole': [3],
            'YearsSinceLastPromotion': [1],
            'YearsWithCurrManager': [int(data.get('YearsWithCurrManager', 3))]       # <-- NEW
        }
        
        df = pd.DataFrame(dummy_data)
        risk_probability = pipeline.predict_proba(df)[0][1]
        
        if risk_probability >= 0.70:
            risk_level = "High"
        elif risk_probability >= 0.40:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        return jsonify({
            "probability": float(risk_probability),
            "risk_level": risk_level
        }), 200

    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({"error": str(e)}), 400

@app.route('/api/features', methods=['GET'])
def get_features():
    """Returns the feature importance JSON for React charts."""
    return jsonify(feature_importances), 200

# --- DATABASE CRUD ENDPOINTS ---

@app.route('/api/employees', methods=['GET'])
def get_all_employees():
    """Fetches all tracked employees for the dashboard."""
    employees = Employee.query.order_by(Employee.risk_score.desc()).all()
    return jsonify([emp.to_dict() for emp in employees]), 200

@app.route('/api/employees', methods=['POST'])
def add_employee():
    """Saves a new employee to the database."""
    data = request.json
    try:
        new_emp = Employee(
            name=data['name'],
            department=data['department'],
            job_role=data['job_role'],
            # Save the ML Variables
            age=data.get('Age', 35),
            monthly_income=data.get('MonthlyIncome', 5000),
            over_time=data.get('OverTime', 'No'),
            stock_option_level=data.get('StockOptionLevel', 0),
            job_level=data.get('JobLevel', 2),
            total_working_years=data.get('TotalWorkingYears', 10),
            marital_status=data.get('MaritalStatus', 'Married'),
            years_with_curr_manager=data.get('YearsWithCurrManager', 3),
            years_at_company=data.get('YearsAtCompany', 3),
            
            risk_score=data['risk_score'],
            risk_level=data['risk_level']
        )
        db.session.add(new_emp)
        db.session.commit()
        return jsonify(new_emp.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/employees/<int:emp_id>', methods=['DELETE'])
def delete_employee(emp_id):
    """Removes an employee from the tracking database."""
    employee = Employee.query.get_or_404(emp_id)
    try:
        db.session.delete(employee)
        db.session.commit()
        return jsonify({"message": "Employee removed successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/api/employees/<int:emp_id>', methods=['PUT'])
def update_employee(emp_id):
    """Updates an existing employee's data in the database."""
    employee = Employee.query.get_or_404(emp_id)
    data = request.json
    
    try:
        employee.department = data.get('department', employee.department)
        employee.job_role = data.get('job_role', employee.job_role)
        
        # Update the ML variables
        employee.age = data.get('Age', employee.age)
        employee.monthly_income = data.get('MonthlyIncome', employee.monthly_income)
        employee.over_time = data.get('OverTime', employee.over_time)
        employee.stock_option_level = data.get('StockOptionLevel', employee.stock_option_level)
        employee.job_level = data.get('JobLevel', employee.job_level)
        employee.total_working_years = data.get('TotalWorkingYears', employee.total_working_years)
        employee.marital_status = data.get('MaritalStatus', employee.marital_status)
        employee.years_with_curr_manager = data.get('YearsWithCurrManager', employee.years_with_curr_manager)
        employee.years_at_company = data.get('YearsAtCompany', employee.years_at_company)
        
        employee.risk_score = data.get('risk_score', employee.risk_score)
        employee.risk_level = data.get('risk_level', employee.risk_level)
        
        db.session.commit()
        return jsonify(employee.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/api/employees/<int:emp_id>/actions', methods=['POST'])
def log_action(emp_id):
    """Logs a retention action (e.g., 'Meeting Scheduled') for an employee."""
    data = request.json
    try:
        new_action = ActionLog(
            employee_id=emp_id,
            action_type=data['action_type'],
            notes=data.get('notes', '')
        )
        db.session.add(new_action)
        db.session.commit()
        return jsonify(new_action.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/api/employees/<int:emp_id>/actions', methods=['GET'])
def get_actions(emp_id):
    """Gets all logged actions for a specific employee."""
    actions = ActionLog.query.filter_by(employee_id=emp_id).order_by(ActionLog.timestamp.desc()).all()
    return jsonify([action.to_dict() for action in actions]), 200

@app.route('/api/employees/<int:emp_id>', methods=['GET'])
def get_single_employee(emp_id):
    """Fetches a single employee and their action history."""
    employee = Employee.query.get_or_404(emp_id)
    return jsonify(employee.to_dict()), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
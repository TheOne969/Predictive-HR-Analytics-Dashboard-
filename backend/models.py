from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Employee(db.Model):
    __tablename__ = 'employees'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    job_role = db.Column(db.String(100), nullable=False)
    
    # --- The ML Variables ---
    age = db.Column(db.Integer, default=35)
    monthly_income = db.Column(db.Integer, default=5000)
    over_time = db.Column(db.String(10), default='No')
    stock_option_level = db.Column(db.Integer, default=0)
    job_level = db.Column(db.Integer, default=2)
    total_working_years = db.Column(db.Integer, default=10)
    marital_status = db.Column(db.String(20), default='Married')
    years_with_curr_manager = db.Column(db.Integer, default=3)
    years_at_company = db.Column(db.Integer, default=3)
    
    # --- Risk Scores ---
    risk_score = db.Column(db.Float, nullable=False)
    risk_level = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    actions = db.relationship('ActionLog', backref='employee', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "department": self.department,
            "job_role": self.job_role,
            # Pass the ML variables back to React using the exact capitalization React expects
            "Age": self.age,
            "MonthlyIncome": self.monthly_income,
            "OverTime": self.over_time,
            "StockOptionLevel": self.stock_option_level,
            "JobLevel": self.job_level,
            "TotalWorkingYears": self.total_working_years,
            "MaritalStatus": self.marital_status,
            "YearsWithCurrManager": self.years_with_curr_manager,
            "YearsAtCompany": self.years_at_company,
            
            "risk_score": round(self.risk_score * 100, 1),
            "risk_level": self.risk_level,
            "created_at": self.created_at.strftime("%Y-%m-%d"),
            "action_count": len(self.actions)
        }
    
class ActionLog(db.Model):
    __tablename__ = 'action_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    action_type = db.Column(db.String(100), nullable=False) # e.g., 'Meeting Scheduled', 'Raise Offered'
    notes = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "action_type": self.action_type,
            "notes": self.notes,
            "timestamp": self.timestamp.strftime("%Y-%m-%d %H:%M")
        }
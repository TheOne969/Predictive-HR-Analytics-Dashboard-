import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

def run_full_stack_test():
    print("🚀 Starting Database & API Test...\n")

    # 1. Save a new high-risk employee
    print("1. Saving John Doe to the database...")
    employee_data = {
        "name": "John Doe",
        "department": "Sales",
        "job_role": "Sales Executive",
        "risk_score": 0.89,
        "risk_level": "High"
    }
    response = requests.post(f"{BASE_URL}/employees", json=employee_data)
    print(f"Status: {response.status_code}")
    saved_emp = response.json()
    print(f"Result: {json.dumps(saved_emp, indent=2)}\n")
    
    emp_id = saved_emp.get("id")

    if emp_id:
        # 2. Log an HR Action for John Doe
        print("2. Logging an HR action (Scheduling 1-on-1)...")
        action_data = {
            "action_type": "Meeting Scheduled",
            "notes": "Discussing career growth and salary expectations."
        }
        action_res = requests.post(f"{BASE_URL}/employees/{emp_id}/actions", json=action_data)
        print(f"Status: {action_res.status_code}")
        print(f"Result: {json.dumps(action_res.json(), indent=2)}\n")

        # 3. Fetch Dashboard Data (All Employees)
        print("3. Fetching the Dashboard Watchlist...")
        dash_res = requests.get(f"{BASE_URL}/employees")
        print(f"Status: {dash_res.status_code}")
        print(f"Result: {json.dumps(dash_res.json(), indent=2)}\n")

if __name__ == "__main__":
    run_full_stack_test()
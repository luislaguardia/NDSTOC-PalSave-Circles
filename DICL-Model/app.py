from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
from typing import Literal
import pandas as pd
import joblib
import numpy as np

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

class CreditScorePredictor:
    def __init__(self, model_path='credit_score_model.joblib'):
        model_components = joblib.load(model_path)
        self.model = model_components['model']
        self.scaler = model_components['scaler']
        self.le = model_components['label_encoder']
        self.feature_columns = model_components['feature_columns']

        if 'payment_freq_encoder' in model_components:
            self.payment_freq_encoder = model_components['payment_freq_encoder']

    def prepare_customer_data(self, customer_data):
        if isinstance(customer_data['Employment_Type'], str):
            customer_data['Employment_Type'] = self.le.transform([customer_data['Employment_Type']])[0]
        
        if hasattr(self, 'payment_freq_encoder') and 'Payment_Frequency' in customer_data:
            customer_data['Payment_Frequency_Encoded'] = self.payment_freq_encoder.transform([customer_data['Payment_Frequency']])[0]

            del customer_data['Payment_Frequency']

        if 'Upfront_Payment_Factor' not in customer_data:
            customer_data['Upfront_Payment_Factor'] = self.calculate_upfront_payment_factor(customer_data)
        
        df = pd.DataFrame([customer_data], columns=self.feature_columns)
        return df

    def calculate_upfront_payment_factor(self, customer_data):

        total_contributions = customer_data['Total_Contributions']
        duration = customer_data.get('Paluwagan_Duration', 12)
        
        base_prob = np.clip(
            (total_contributions / 20000) * (1 / duration), 
            0, 1
        )
        
        noise = np.random.normal(0, 0.1)
        upfront_factor = np.clip(base_prob + noise, 0, 1)
        
        return round(upfront_factor, 2)

    def predict(self, customer_data):
        df = self.prepare_customer_data(customer_data)
        
        scaled_features = self.scaler.transform(df)
        
        predicted_score = self.model.predict(scaled_features)[0]
        
        return round(predicted_score)

    def detailed_risk_assessment(self, customer_data):

        predicted_score = self.predict(customer_data)

        if predicted_score >= 750:
            risk_level = "Excellent"
        elif predicted_score >= 670:
            risk_level = "Good"
        elif predicted_score >= 580:
            risk_level = "Fair"
        else:
            risk_level = "Poor"
        
        risk_factors = {
            'Credit Score': {
                'value': predicted_score,
                'weight': 0.4,
                'interpretation': risk_level
            },
            'On-Time Payment Rate': {
                'value': customer_data['OnTime_Payment_Rate'],
                'weight': 0.2,
                'interpretation': self.interpret_ontime_rate(customer_data['OnTime_Payment_Rate'])
            },
            'Online Transaction Score': {
                'value': customer_data['Online_Transaction_Score'],
                'weight': 0.1,
                'interpretation': self.interpret_online_score(customer_data['Online_Transaction_Score'])
            },
            'Upfront Payment Factor': {
                'value': customer_data.get('Upfront_Payment_Factor', 
                    self.calculate_upfront_payment_factor(customer_data)),
                'weight': 0.15,
                'interpretation': self.interpret_upfront_payment(customer_data.get('Upfront_Payment_Factor', 
                    self.calculate_upfront_payment_factor(customer_data)))
            },
            'Circle Member Rating': {
                'value': customer_data['Circle_Member_Rating'],
                'weight': 0.15,
                'interpretation': self.interpret_circle_rating(customer_data['Circle_Member_Rating'])
            }
        }
        
        return {
            'predicted_score': predicted_score,
            'risk_level': risk_level,
            'risk_factors': risk_factors,
            'loan_recommendation': self.get_loan_recommendation(risk_level)
        }

    def interpret_ontime_rate(self, rate):
        if rate > 0.9:
            return "Excellent Payment Consistency"
        elif rate > 0.7:
            return "Good Payment Consistency"
        elif rate > 0.5:
            return "Moderate Payment Consistency"
        else:
            return "Poor Payment Consistency"

    def interpret_online_score(self, score):
        if score > 0.8:
            return "High Digital Financial Activity"
        elif score > 0.5:
            return "Moderate Digital Financial Activity"
        else:
            return "Low Digital Financial Activity"

    def interpret_upfront_payment(self, factor):
        if factor > 0.8:
            return "Full Cycle Upfront Payment"
        elif factor > 0.5:
            return "Significant Upfront Payment"
        elif factor > 0.2:
            return "Partial Upfront Payment"
        else:
            return "No Upfront Payment"

    def interpret_circle_rating(self, rating):
        if rating > 4:
            return "Excellent Community Standing"
        elif rating > 3:
            return "Good Community Standing"
        elif rating > 2:
            return "Average Community Standing"
        else:
            return "Below Average Community Standing"

    def get_loan_recommendation(self, risk_level):
        recommendations = {
            "Excellent": {
                "approval_probability": "Very High",
                "recommendation": "Eligible for premium loan terms",
                "max_loan_multiplier": 5
            },
            "Good": {
                "approval_probability": "High",
                "recommendation": "Standard loan terms",
                "max_loan_multiplier": 3
            },
            "Fair": {
                "approval_probability": "Moderate",
                "recommendation": "Conditional approval, may require additional guarantees",
                "max_loan_multiplier": 2
            },
            "Poor": {
                "approval_probability": "Low",
                "recommendation": "Loan not recommended, suggest credit improvement",
                "max_loan_multiplier": 1
            }
        }
        return recommendations.get(risk_level, recommendations["Poor"])

# Define a request model using Pydantic
class CreditScoreInput(BaseModel):
    Age: int
    Total_Contributions: float
    OnTime_Payment_Rate: float
    Missed_Payments: int
    Paluwagan_Duration: int
    GCash_Activity_Score: float
    Online_Transaction_Score: float
    Circle_Member_Rating: float
    Employment_Type: str
    Loan_Amount_Requested: float
    Payment_Frequency: str
    Upfront_Payment_Factor: float

# Load the model and its components
try:
    predictor = CreditScorePredictor('credit_score_model.joblib')
    print("Model and components loaded successfully.")
except Exception as e:
    print("Error loading model and components:", str(e))
    predictor = None

# Predict route
@app.post("/predict")
async def predict(input_data: CreditScoreInput):
    if predictor is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        # Convert input data to dictionary
        customer_data = input_data.dict()

        # Perform detailed risk assessment
        risk_assessment = predictor.detailed_risk_assessment(customer_data)

        # Return the result
        return {
            "Predicted Credit Score": risk_assessment['predicted_score'],
            "Risk Level": risk_assessment['risk_level'],
            "Risk Factors": risk_assessment['risk_factors'],
            "Loan Recommendation": risk_assessment['loan_recommendation']
        }
    except Exception as e:
        print("Error during prediction:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
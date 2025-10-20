import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import generate_dummy_data

# Generate dummy data for training
_, _, X_duration, y_duration, _ = generate_dummy_data(200)

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X_duration, y_duration, test_size=0.2, random_state=42
)

# Train a Random Forest Regressor for duration prediction
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate the model
r2_score = model.score(X_test, y_test)
print(f"Duration Model R² Score: {r2_score:.2f}")

# Save the model
model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models')
os.makedirs(model_dir, exist_ok=True)
model_path = os.path.join(model_dir, 'duration_model.pkl')
joblib.dump(model, model_path)
print(f"Duration prediction model saved to {model_path}")
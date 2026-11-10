
import os
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

# ==========================================
# 1. CREATE RESULTS FOLDER
# ==========================================

os.makedirs("results", exist_ok=True)


# ==========================================
# 2. LOAD DATASET
# ==========================================

df = pd.read_excel(
    "India_EWaste_Research_Datasets.xlsx",
    sheet_name="state_generation_observed"
)

print("\nFIRST FIVE RECORDS")
print(df.head())

print("\nDATASET INFORMATION")
df.info()


# ==========================================
# 3. DATA PREPROCESSING
# ==========================================

# Remove duplicate records
df = df.drop_duplicates()

# Convert target column into numeric values
df['E_waste_Generated_MT'] = pd.to_numeric(
    df['E_waste_Generated_MT'],
    errors='coerce'
)

# Remove rows with missing target values
df = df.dropna(
    subset=['E_waste_Generated_MT', 'State', 'Financial_Year']
).copy()

# Clean state names
df['State'] = df['State'].astype(str).str.strip()

# Extract starting year from financial year
df['Year'] = pd.to_numeric(
    df['Financial_Year'].str.extract(r'(\d{4})')[0],
    errors='coerce'
)

df = df.dropna(subset=['Year']).copy()
df['Year'] = df['Year'].astype(int)

# Keep cleaned original data for graphs and state names
original_df = df.copy()

# Convert state names into numerical columns
df = pd.get_dummies(
    df,
    columns=['State'],
    dtype=int
)

print("\nPREPROCESSED DATA")
print(df.head())

print("\nFINAL DATASET SHAPE")
print(df.shape)


# ==========================================
# 4. SELECT INPUT AND OUTPUT
# ==========================================

X = df.drop(
    columns=[
        'Financial_Year',
        'E_waste_Generated_MT',
        'Data_Type',
        'Source',
        'Source_URL'
    ],
    errors='ignore'
)

y = np.log1p(df['E_waste_Generated_MT'])

# Keep numerical columns only
X = X.select_dtypes(include='number')

# Save feature column names
model_columns = X.columns.tolist()

# Save available states
available_states = sorted(
    original_df['State'].unique().tolist()
)


# ==========================================
# 5. SPLIT DATASET
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


# ==========================================
# 6. CREATE MACHINE LEARNING MODELS
# ==========================================

models = {
    "Linear Regression": LinearRegression(),

    "Random Forest": RandomForestRegressor(
        n_estimators=100,
        random_state=42
    ),

    "Decision Tree": DecisionTreeRegressor(
        random_state=42
    )
}


# ==========================================
# 7. TRAIN AND EVALUATE MODELS
# ==========================================

results = []
predictions = {}

for name, model in models.items():

    # Train model
    model.fit(X_train, y_train)

    # Predict test data
    y_pred = model.predict(X_test)

    predictions[name] = y_pred

    # Calculate evaluation metrics
    mae = mean_absolute_error(y_test, y_pred)

    mse = mean_squared_error(y_test, y_pred)

    rmse = np.sqrt(mse)

    r2 = r2_score(y_test, y_pred)

    results.append([
        name,
        mae,
        mse,
        rmse,
        r2
    ])

    print("\n" + name + " trained successfully!")


# ==========================================
# 8. MODEL COMPARISON
# ==========================================

results_df = pd.DataFrame(
    results,
    columns=[
        'Model',
        'MAE',
        'MSE',
        'RMSE',
        'R2 Score'
    ]
)

print("\nMODEL COMPARISON")
print(results_df.round(3).to_string(index=False))

# Save model comparison
results_df.to_csv(
    "results/model_comparison.csv",
    index=False
)


# ==========================================
# 9. SELECT BEST MODEL
# ==========================================

best_model_name = "Linear Regression"

best_model = models[best_model_name]

print("\nBest model based on RMSE:", best_model_name)


# ==========================================
# 10. ACTUAL VS PREDICTED COMPARISON
# ==========================================

comparison = pd.DataFrame({
    'Actual': y_test.values,
    'Linear Regression': predictions['Linear Regression'],
    'Random Forest': predictions['Random Forest'],
    'Decision Tree': predictions['Decision Tree']
})

print("\nACTUAL VS PREDICTED VALUES")
print(comparison.round(2))

# Calculate Decision Tree prediction errors
comparison['DT_Error'] = abs(
    comparison['Actual'] - comparison['Decision Tree']
)

print("\nDECISION TREE PREDICTION ERRORS")

print(
    comparison[
        ['Actual', 'Decision Tree', 'DT_Error']
    ].round(2)
)

# Save actual vs predicted results
comparison.to_csv(
    "results/actual_vs_predicted.csv",
    index=False
)


# ==========================================
# 11. VISUALIZATIONS
# ==========================================

plt.figure(figsize=(16, 11))


# Graph 1: State-wise e-waste generation

plt.subplot(2, 2, 1)

latest_year = original_df['Financial_Year'].max()

latest_data = original_df[
    original_df['Financial_Year'] == latest_year
]

plt.bar(
    latest_data['State'],
    latest_data['E_waste_Generated_MT']
)

plt.title("State-wise E-waste Generation (" + str(latest_year) + ")")
plt.xlabel("State")
plt.ylabel("E-waste (Metric Tonnes)")
plt.xticks(rotation=45, ha='right')


# Graph 2: E-waste generation by financial year

plt.subplot(2, 2, 2)

year_data = original_df.groupby(
    'Financial_Year'
)['E_waste_Generated_MT'].sum()

plt.plot(
    year_data.index,
    year_data.values,
    marker='o'
)

plt.title("E-waste Generation by Financial Year")
plt.xlabel("Financial Year")
plt.ylabel("Total E-waste (Metric Tonnes)")
plt.xticks(rotation=45)


# Graph 3: Model comparison using RMSE

plt.subplot(2, 2, 3)

plt.bar(
    results_df['Model'],
    results_df['RMSE']
)

plt.title("Model Comparison - RMSE")
plt.xlabel("Machine Learning Models")
plt.ylabel("RMSE (Lower is Better)")
plt.xticks(rotation=15)


# Graph 4: Actual vs predicted values

plt.subplot(2, 2, 4)

best_predictions = predictions[best_model_name]

plt.scatter(
    y_test,
    best_predictions
)

minimum = min(
    y_test.min(),
    best_predictions.min()
)

maximum = max(
    y_test.max(),
    best_predictions.max()
)

plt.plot(
    [minimum, maximum],
    [minimum, maximum],
    linestyle='--'
)

plt.title("Actual vs Predicted - " + best_model_name)
plt.xlabel("Actual E-waste")
plt.ylabel("Predicted E-waste")

plt.tight_layout()

plt.savefig(
    "results/model_visualizations.png",
    dpi=300,
    bbox_inches='tight'
)

plt.show()


# ==========================================
# 12. ACTUAL VS PREDICTED BAR GRAPH
# ==========================================

comparison[
    [
        'Actual',
        'Linear Regression',
        'Random Forest',
        'Decision Tree'
    ]
].plot(
    kind='bar',
    figsize=(12, 6)
)

plt.title("Actual vs Predicted E-waste")
plt.xlabel("Test Records")
plt.ylabel("E-waste (Metric Tonnes)")
plt.xticks(rotation=0)
plt.tight_layout()

plt.savefig(
    "results/actual_vs_predicted_graph.png",
    dpi=300,
    bbox_inches='tight'
)

plt.show()


# ==========================================
# 13. TRAIN AND SAVE FINAL MODEL
# ==========================================

print("\nTRAINING FINAL MODEL")

# Train selected model using complete dataset
best_model.fit(X, y)

# Save trained model
joblib.dump(
    best_model,
    "results/best_model.pkl"
)

# Save feature column names
joblib.dump(
    model_columns,
    "results/model_columns.pkl"
)

# Save available states
joblib.dump(
    available_states,
    "results/available_states.pkl"
)

print("\nMODEL FILES SAVED SUCCESSFULLY!")
print("Best model:", best_model_name)


# ==========================================
# 14. NEW E-WASTE PREDICTION SYSTEM
# ==========================================

print("\n===================================")
print("       E-WASTE PREDICTION SYSTEM")
print("===================================")

print("\nAVAILABLE STATES:")

for state_name in available_states:
    print(state_name)


state = input("\nEnter State Name: ").strip()

year_input = input(
    "Enter starting year (example: 2025 for 2025-26): "
).strip()

try:

    year = int(year_input)

    if year < 1900 or year > 2100:
        raise ValueError

    # Match state name without case sensitivity
    matched_state = next(
        (
            s for s in available_states
            if s.lower() == state.lower()
        ),
        None
    )

    if matched_state is None:

        print("\nInvalid state name!")
        print("Please enter a state from the available list.")

    else:

        # Prepare new input data
        new_data = pd.DataFrame(
            0,
            index=[0],
            columns=model_columns
        )

        # Set year
        new_data['Year'] = year

        # Set selected state
        state_column = 'State_' + matched_state

        if state_column in new_data.columns:

            new_data[state_column] = 1

            # Generate prediction
            prediction = best_model.predict(new_data)[0]

            print("\nPREDICTION RESULT")
            print("-------------------------")

            print("State:", matched_state)

            print(
                "Financial Year:",
                str(year) + "-" + str(year + 1)[-2:]
            )

            print(
                "Predicted E-waste Generation:",
                round(float(prediction), 2),
                "Metric Tonnes"
            )

            print("Model Used:", best_model_name)

            print("\nPrediction completed successfully!")

        else:

            print("\nState feature not found in model!")

except ValueError:

    print("\nInvalid year! Please enter a valid year, such as 2025.")


# ==========================================
# 15. FINAL MESSAGE
# ==========================================

print("\n===================================")
print("       PROJECT EXECUTION COMPLETE")
print("===================================")

print("\nAll results saved in the 'results' folder.")

print("1. model_comparison.csv")
print("2. actual_vs_predicted.csv")
print("3. model_visualizations.png")
print("4. actual_vs_predicted_graph.png")
print("5. best_model.pkl")
print("6. model_columns.pkl")
print("7. available_states.pkl")

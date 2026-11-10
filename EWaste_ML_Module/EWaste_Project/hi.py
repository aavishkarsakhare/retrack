import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np

df = pd.read_excel("India_EWaste_Research_Datasets.xlsx",
                   sheet_name="state_generation_observed")

df['Year'] = df['Financial_Year'].str[:4].astype(int)

df = pd.get_dummies(df, columns=['State'], dtype=int)

X = df.drop(columns=['Financial_Year', 'E_waste_Generated_MT',
                     'Data_Type', 'Source', 'Source_URL'])

y = df['E_waste_Generated_MT']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = DecisionTreeRegressor(random_state=42)

model.fit(X_train, y_train)

y_pred = model.predict(X_test)

print("MAE:", mean_absolute_error(y_test, y_pred))
print("MSE:", mean_squared_error(y_test, y_pred))
print("RMSE:", np.sqrt(mean_squared_error(y_test, y_pred)))
print("R2 Score:", r2_score(y_test, y_pred))
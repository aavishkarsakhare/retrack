import pandas as pd

# Load Excel dataset
df = pd.read_excel(
    "India_EWaste_Research_Datasets.xlsx",
    sheet_name="state_generation_observed"
)

# Display first five records
print("\nFIRST FIVE RECORDS")
print(df.head())

# Dataset dimensions
print("\nDATASET SHAPE")
print(df.shape)

# Column information
print("\nDATASET INFORMATION")
df.info()

# Missing values
print("\nMISSING VALUES")
print(df.isnull().sum())

# Duplicate records
print("\nDUPLICATE RECORDS")
print(df.duplicated().sum())

# Statistical summary
print("\nSTATISTICAL SUMMARY")
print(df.describe(include="all"))
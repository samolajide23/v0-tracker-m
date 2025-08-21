export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface ValidationRule {
  field: string
  value: any
  rules: Array<{
    type: "required" | "min" | "max" | "positive" | "email" | "date" | "minLength" | "maxLength"
    value?: any
    message: string
  }>
}

export const validateField = (field: string, value: any, rules: ValidationRule["rules"]): ValidationResult => {
  const errors: string[] = []

  for (const rule of rules) {
    switch (rule.type) {
      case "required":
        if (!value || (typeof value === "string" && value.trim() === "")) {
          errors.push(rule.message)
        }
        break

      case "positive":
        const numValue = typeof value === "string" ? Number.parseFloat(value) : value
        if (isNaN(numValue) || numValue <= 0) {
          errors.push(rule.message)
        }
        break

      case "min":
        const minValue = typeof value === "string" ? Number.parseFloat(value) : value
        if (isNaN(minValue) || minValue < rule.value) {
          errors.push(rule.message)
        }
        break

      case "max":
        const maxValue = typeof value === "string" ? Number.parseFloat(value) : value
        if (isNaN(maxValue) || maxValue > rule.value) {
          errors.push(rule.message)
        }
        break

      case "minLength":
        if (typeof value === "string" && value.length < rule.value) {
          errors.push(rule.message)
        }
        break

      case "maxLength":
        if (typeof value === "string" && value.length > rule.value) {
          errors.push(rule.message)
        }
        break

      case "date":
        const dateValue = new Date(value)
        if (isNaN(dateValue.getTime())) {
          errors.push(rule.message)
        }
        break

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (typeof value === "string" && !emailRegex.test(value)) {
          errors.push(rule.message)
        }
        break
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateForm = (validationRules: ValidationRule[]): ValidationResult => {
  const allErrors: string[] = []

  for (const rule of validationRules) {
    const result = validateField(rule.field, rule.value, rule.rules)
    if (!result.isValid) {
      allErrors.push(...result.errors)
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  }
}

// Specific validation functions for financial data
export const validateIncomeData = (source: string, amount: string): ValidationResult => {
  return validateForm([
    {
      field: "source",
      value: source,
      rules: [
        { type: "required", message: "Income source is required" },
        { type: "minLength", value: 2, message: "Income source must be at least 2 characters" },
        { type: "maxLength", value: 50, message: "Income source must be less than 50 characters" },
      ],
    },
    {
      field: "amount",
      value: amount,
      rules: [
        { type: "required", message: "Amount is required" },
        { type: "positive", message: "Amount must be greater than 0" },
        { type: "max", value: 1000000, message: "Amount cannot exceed $1,000,000" },
      ],
    },
  ])
}

export const validateExpenseData = (category: string, description: string, amount: string): ValidationResult => {
  return validateForm([
    {
      field: "category",
      value: category,
      rules: [{ type: "required", message: "Category is required" }],
    },
    {
      field: "description",
      value: description,
      rules: [
        { type: "required", message: "Description is required" },
        { type: "minLength", value: 2, message: "Description must be at least 2 characters" },
        { type: "maxLength", value: 100, message: "Description must be less than 100 characters" },
      ],
    },
    {
      field: "amount",
      value: amount,
      rules: [
        { type: "required", message: "Amount is required" },
        { type: "positive", message: "Amount must be greater than 0" },
        { type: "max", value: 100000, message: "Amount cannot exceed $100,000" },
      ],
    },
  ])
}

export const validateDebtData = (
  name: string,
  balance: string,
  interestRate: string,
  minimumPayment: string,
): ValidationResult => {
  return validateForm([
    {
      field: "name",
      value: name,
      rules: [
        { type: "required", message: "Debt name is required" },
        { type: "minLength", value: 2, message: "Debt name must be at least 2 characters" },
        { type: "maxLength", value: 50, message: "Debt name must be less than 50 characters" },
      ],
    },
    {
      field: "balance",
      value: balance,
      rules: [
        { type: "required", message: "Balance is required" },
        { type: "positive", message: "Balance must be greater than 0" },
        { type: "max", value: 10000000, message: "Balance cannot exceed $10,000,000" },
      ],
    },
    {
      field: "interestRate",
      value: interestRate,
      rules: [
        { type: "required", message: "Interest rate is required" },
        { type: "min", value: 0, message: "Interest rate cannot be negative" },
        { type: "max", value: 100, message: "Interest rate cannot exceed 100%" },
      ],
    },
    {
      field: "minimumPayment",
      value: minimumPayment,
      rules: [
        { type: "required", message: "Minimum payment is required" },
        { type: "positive", message: "Minimum payment must be greater than 0" },
        { type: "max", value: 100000, message: "Minimum payment cannot exceed $100,000" },
      ],
    },
  ])
}

export const validateSavingsGoalData = (
  name: string,
  targetAmount: string,
  targetDate: string,
  monthlyContribution: string,
): ValidationResult => {
  return validateForm([
    {
      field: "name",
      value: name,
      rules: [
        { type: "required", message: "Goal name is required" },
        { type: "minLength", value: 2, message: "Goal name must be at least 2 characters" },
        { type: "maxLength", value: 50, message: "Goal name must be less than 50 characters" },
      ],
    },
    {
      field: "targetAmount",
      value: targetAmount,
      rules: [
        { type: "required", message: "Target amount is required" },
        { type: "positive", message: "Target amount must be greater than 0" },
        { type: "max", value: 10000000, message: "Target amount cannot exceed $10,000,000" },
      ],
    },
    {
      field: "targetDate",
      value: targetDate,
      rules: [
        { type: "required", message: "Target date is required" },
        { type: "date", message: "Please enter a valid date" },
      ],
    },
    {
      field: "monthlyContribution",
      value: monthlyContribution,
      rules: [
        { type: "required", message: "Monthly contribution is required" },
        { type: "positive", message: "Monthly contribution must be greater than 0" },
        { type: "max", value: 100000, message: "Monthly contribution cannot exceed $100,000" },
      ],
    },
  ])
}

export const validateEmergencyFundData = (monthlyExpenses: string, targetMonths: string): ValidationResult => {
  return validateForm([
    {
      field: "monthlyExpenses",
      value: monthlyExpenses,
      rules: [
        { type: "required", message: "Monthly expenses is required" },
        { type: "positive", message: "Monthly expenses must be greater than 0" },
        { type: "max", value: 100000, message: "Monthly expenses cannot exceed $100,000" },
      ],
    },
    {
      field: "targetMonths",
      value: targetMonths,
      rules: [
        { type: "required", message: "Target months is required" },
        { type: "min", value: 1, message: "Target months must be at least 1" },
        { type: "max", value: 24, message: "Target months cannot exceed 24" },
      ],
    },
  ])
}

export const validateContributionData = (amount: string, description: string): ValidationResult => {
  return validateForm([
    {
      field: "amount",
      value: amount,
      rules: [
        { type: "required", message: "Amount is required" },
        { type: "positive", message: "Amount must be greater than 0" },
        { type: "max", value: 1000000, message: "Amount cannot exceed $1,000,000" },
      ],
    },
    {
      field: "description",
      value: description,
      rules: [
        { type: "required", message: "Description is required" },
        { type: "minLength", value: 2, message: "Description must be at least 2 characters" },
        { type: "maxLength", value: 100, message: "Description must be less than 100 characters" },
      ],
    },
  ])
}

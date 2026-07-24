// Human-readable labels for the raw SCREAMING_SNAKE_CASE enum values
// coming back from Prisma. Keep in sync with schema.prisma if those
// enums change.

const YEARS_OF_OPERATION_LABELS: Record<string, string> = {
  ONE_TO_FIVE: "1–5 years",
  SIX_TO_TEN: "6–10 years",
  ELEVEN_TO_FIFTEEN: "11–15 years",
  SIXTEEN_TO_TWENTY: "16–20 years",
  MORE_THAN_TWENTY: "20+ years",
};

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  CORPORATION: "Corporation",
  SOLE_PROPRIETORSHIP: "Sole Proprietorship",
  PARTNERSHIP: "Partnership",
  COOPERATIVES: "Cooperative",
};

const BUSINESS_FORM_LABELS: Record<string, string> = {
  MERCHANDISING: "Merchandising",
  SERVICE: "Service",
  HYBRID: "Hybrid",
  MANUFACTURING: "Manufacturing",
};

const NUMBER_OF_EMPLOYEES_LABELS: Record<string, string> = {
  ONE_TO_FIFTY: "1–50 employees",
  FIFTY_ONE_TO_HUNDRED: "51–100 employees",
  ONE_HUNDRED_TO_ONE_FIFTY: "101–150 employees",
  ONE_FIFTY_TO_TWO_HUNDRED: "151–200 employees",
  MORE_THAN_TWO_HUNDRED: "200+ employees",
};

const AVERAGE_MONTHLY_INCOME_LABELS: Record<string, string> = {
  BELOW_P50_000: "Below ₱50,000",
  P50_001_TO_P100_000: "₱50,001 – ₱100,000",
  P100_001_TO_P150_000: "₱100,001 – ₱150,000",
  P150_001_TO_P200_000: "₱150,001 – ₱200,000",
  MORE_THAN_P200_000: "More than ₱200,000",
};

const ASSET_SIZE_LABELS: Record<string, string> = {
  SMALL: "Small",
  MEDIUM: "Medium",
};

function formatOrFallback(
  map: Record<string, string>,
  value: string | null,
): string | null {
  if (!value) return null;
  return map[value] ?? value;
}

export const formatYearsOfOperation = (value: string | null) =>
  formatOrFallback(YEARS_OF_OPERATION_LABELS, value);

export const formatBusinessType = (value: string | null) =>
  formatOrFallback(BUSINESS_TYPE_LABELS, value);

export const formatBusinessForm = (value: string | null) =>
  formatOrFallback(BUSINESS_FORM_LABELS, value);

export const formatNumberOfEmployees = (value: string | null) =>
  formatOrFallback(NUMBER_OF_EMPLOYEES_LABELS, value);

export const formatAverageMonthlyIncome = (value: string | null) =>
  formatOrFallback(AVERAGE_MONTHLY_INCOME_LABELS, value);

export const formatAssetSize = (value: string | null) =>
  formatOrFallback(ASSET_SIZE_LABELS, value);

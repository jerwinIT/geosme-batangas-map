// Kept in a plain (non "use server") file — files with the "use server"
// directive may only export async functions, so shared types live here
// and get imported by both the server action and the client component.

export interface FintechUsage {
  name: string;
  densityColor: string | null;
}

export interface SMEMarkerData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  assetSize: string; // "SMALL" | "MEDIUM"
  municipality: string | null;
  address: string | null;
  natureOfBusiness: string | null;
  yearsOfOperation: string | null;
  typeOfBusinessOrganization: string | null;
  formsOfBusinessOrganization: string | null;
  numberOfEmployees: string | null;
  averageMonthlyIncome: string | null;
  financialTechnologies: FintechUsage[];
}

export interface SMEMarkerFilters {
  /** Values from the LeftSidebar "Asset Size" filter, e.g. ["Small", "Medium"] */
  assetSizes?: string[];
  /** Value from the LeftSidebar "Type of Business" filter, or "All Types" */
  businessType?: string;
  /** Values from the LeftSidebar "Forms of Business" filter */
  businessForms?: string[];
}

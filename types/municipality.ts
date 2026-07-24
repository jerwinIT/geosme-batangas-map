export interface MunicipalityData {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  area: number | null; // km², used for computing SME density (count per km²)
  boundary: unknown | null; // GeoJSON Polygon/MultiPolygon, or null if not digitized yet
}

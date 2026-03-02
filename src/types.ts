export interface Product {
  id: number;
  name: string;
  category: string;
  release_date: string;
  v2_release_date: string | null;
}

export interface RMARecord {
  id: number;
  product_id: number;
  defect_type: string;
  report_date: string;
  status: string;
}

export interface Improvement {
  id: number;
  product_id: number;
  description: string;
  implementation_date: string;
}

export interface OverviewStats {
  totalRMAs: number;
  topDefects: { defect_type: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
}

export interface ProductStats {
  product: Product;
  rmas: { month: string; count: number }[];
  improvements: Improvement[];
  defectDistribution: { defect_type: string; count: number }[];
}

export interface TrendStats {
  categoryStats: { category: string; count: number }[];
  defectVelocity: { defect_type: string; recent_count: number; previous_count: number }[];
}

export interface RecentRMA extends RMARecord {
  product_name: string;
  category: string;
}

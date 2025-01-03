export interface TrafficData {
    date: string;
    visitors: number;
    pageViews: number;
  }
  
  export type TimeFrame = '30' | '60' | '90' | 'quarter' | 'month' | 'year';
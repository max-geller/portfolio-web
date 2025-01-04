export interface EquipmentItem {
    id: string;
    name: string;
    brand: string;
    model: string;
    type: 'camera' | 'lens' | 'filter' | 'drone';
    specs?: Record<string, string>;
    notes?: string;
    dateAcquired?: string;
    isActive: boolean;
  }
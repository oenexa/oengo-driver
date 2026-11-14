export type VehicleType = 'BIKE' | 'SCOOTER' | 'CAR' | 'VAN';

export type DriverStatus = 'OFFLINE' | 'AVAILABLE' | 'ON_DISPATCH';

export type RouteMilestone =
  | 'ASSIGNED'
  | 'HEADING_TO_STORE'
  | 'AT_STORE'
  | 'PICKED_UP'
  | 'EN_ROUTE'
  | 'DELIVERED';

export interface DriverProfile {
  id: string;
  name: string;
  vehicle: VehicleType;
  payoutAddress: string;
  status: DriverStatus;
  rating: number;
}

export interface DeliveryMission {
  id: string;
  orderId: string;
  driverId: string;
  pickupAddress: string;
  dropoffAddress: string;
  basePayout: number; // e.g. 5.50 ONXC
  tip: number;
  milestone: RouteMilestone;
  createdAt: string;
  completedAt?: string;
}

import { DriverProfile, DriverStatus, DeliveryMission, RouteMilestone, VehicleType } from '../domain/types';
import { CloudEvent } from '../domain/events.js';

export class DriverService {
  private drivers: Map<string, DriverProfile> = new Map();
  private missions: Map<string, DeliveryMission> = new Map();
  private eventOutbox: CloudEvent<any>[] = [];

  public registerDriver(id: string, name: string, vehicle: VehicleType, payoutAddress: string): DriverProfile {
    const profile: DriverProfile = {
      id,
      name,
      vehicle,
      payoutAddress,
      status: 'OFFLINE',
      rating: 5.0,
    };
    this.drivers.set(id, profile);
    return profile;
  }

  public setAvailability(driverId: string, status: DriverStatus): DriverProfile {
    const driver = this.drivers.get(driverId);
    if (!driver) throw new Error(`Driver ${driverId} not registered`);
    driver.status = status;
    return driver;
  }

  public acceptMission(missionId: string, orderId: string, driverId: string, pickup: string, dropoff: string, basePayout: number, tip = 0): DeliveryMission {
    const driver = this.drivers.get(driverId);
    if (!driver) throw new Error(`Driver ${driverId} not found`);
    if (driver.status === 'OFFLINE') throw new Error(`Driver is OFFLINE`);

    const mission: DeliveryMission = {
      id: missionId,
      orderId,
      driverId,
      pickupAddress: pickup,
      dropoffAddress: dropoff,
      basePayout,
      tip,
      milestone: 'ASSIGNED',
      createdAt: new Date().toISOString(),
    };

    driver.status = 'ON_DISPATCH';
    this.missions.set(missionId, mission);

    this.eventOutbox.push({
      specversion: '1.0',
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      source: 'urn:oenexa:oengo:driver',
      type: 'oengo.driver.mission.assigned',
      time: new Date().toISOString(),
      datacontenttype: 'application/json',
      data: { missionId, orderId, driverId, basePayout },
    });

    return mission;
  }

  public advanceMilestone(missionId: string, milestone: RouteMilestone): DeliveryMission {
    const mission = this.missions.get(missionId);
    if (!mission) throw new Error(`Mission ${missionId} not found`);

    mission.milestone = milestone;

    if (milestone === 'DELIVERED') {
      mission.completedAt = new Date().toISOString();
      const driver = this.drivers.get(mission.driverId);
      if (driver) {
        driver.status = 'AVAILABLE';
      }

      this.eventOutbox.push({
        specversion: '1.0',
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        source: 'urn:oenexa:oengo:driver',
        type: 'oengo.driver.mission.delivered',
        time: new Date().toISOString(),
        datacontenttype: 'application/json',
        data: {
          missionId,
          orderId: mission.orderId,
          driverId: mission.driverId,
          totalEarned: mission.basePayout + mission.tip,
        },
      });
    }

    return mission;
  }

  public getEarnings(driverId: string): { completedMissions: number; totalPayout: number } {
    let completedMissions = 0;
    let totalPayout = 0;

    for (const mission of this.missions.values()) {
      if (mission.driverId === driverId && mission.milestone === 'DELIVERED') {
        completedMissions += 1;
        totalPayout += mission.basePayout + mission.tip;
      }
    }

    return { completedMissions, totalPayout };
  }

  public getDriver(driverId: string): DriverProfile | undefined {
    return this.drivers.get(driverId);
  }

  public getMission(missionId: string): DeliveryMission | undefined {
    return this.missions.get(missionId);
  }

  public getOutbox(): CloudEvent<any>[] {
    return [...this.eventOutbox];
  }
}

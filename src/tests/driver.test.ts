import { describe, it, expect, beforeEach } from 'vitest';
import { DriverService } from '../service/DriverService';

describe('OENGO Courier Driver Service', () => {
  let driverService: DriverService;

  beforeEach(() => {
    driverService = new DriverService();
  });

  it('registers driver and toggles availability', () => {
    const driver = driverService.registerDriver(
      'drv-001',
      'Marco Silva',
      'SCOOTER',
      '0x9999999999999999999999999999999999999999'
    );

    expect(driver.id).toBe('drv-001');
    expect(driver.status).toBe('OFFLINE');

    driverService.setAvailability('drv-001', 'AVAILABLE');
    expect(driverService.getDriver('drv-001')?.status).toBe('AVAILABLE');
  });

  it('dispatches mission, advances milestones, and credits earnings', () => {
    driverService.registerDriver('drv-002', 'Elena Rostova', 'BIKE', '0x2222222222222222222222222222222222222222');
    driverService.setAvailability('drv-002', 'AVAILABLE');

    const mission = driverService.acceptMission(
      'msn-100',
      'ord-500',
      'drv-002',
      'Via Roma 42, Milano',
      'Corso Buenos Aires 10, Milano',
      6.5,
      2.0
    );

    expect(mission.milestone).toBe('ASSIGNED');
    expect(driverService.getDriver('drv-002')?.status).toBe('ON_DISPATCH');

    driverService.advanceMilestone('msn-100', 'HEADING_TO_STORE');
    driverService.advanceMilestone('msn-100', 'AT_STORE');
    driverService.advanceMilestone('msn-100', 'PICKED_UP');
    driverService.advanceMilestone('msn-100', 'EN_ROUTE');
    const completed = driverService.advanceMilestone('msn-100', 'DELIVERED');

    expect(completed.milestone).toBe('DELIVERED');
    expect(completed.completedAt).toBeDefined();
    expect(driverService.getDriver('drv-002')?.status).toBe('AVAILABLE');

    const earnings = driverService.getEarnings('drv-002');
    expect(earnings.completedMissions).toBe(1);
    expect(earnings.totalPayout).toBe(8.5);

    const outbox = driverService.getOutbox();
    expect(outbox.length).toBe(2);
    expect(outbox[1].type).toBe('oengo.driver.mission.delivered');
  });
});

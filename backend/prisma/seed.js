const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding HaulSync TOS FTL database…');
  const hash = (pw) => bcrypt.hash(pw, 10);

  const shipper = await prisma.company.upsert({
    where: { id: 'ftl-shipper-001' }, update: {},
    create: { id: 'ftl-shipper-001', name: 'HaulSync Demo Corp', type: 'SHIPPER', gstin: '29ABCDE1234F1Z5', city: 'Bangalore', state: 'Karnataka', phone: '9876543210', email: 'ops@haulsyncdemo.com' },
  });

  const [t1, t2, t3, t4] = await Promise.all([
    prisma.company.upsert({ where: { id: 'ftl-trans-001' }, update: {}, create: { id: 'ftl-trans-001', name: 'Swift Logistics', type: 'TRANSPORTER', city: 'Mumbai', state: 'Maharashtra', phone: '9111100001', email: 'ops@swiftlogistics.in', slaScore: 88 } }),
    prisma.company.upsert({ where: { id: 'ftl-trans-002' }, update: {}, create: { id: 'ftl-trans-002', name: 'Rapid Carriers', type: 'TRANSPORTER', city: 'Delhi', state: 'Delhi', phone: '9111100002', email: 'ops@rapidcarriers.in', slaScore: 82 } }),
    prisma.company.upsert({ where: { id: 'ftl-trans-003' }, update: {}, create: { id: 'ftl-trans-003', name: 'FastMove Transport', type: 'TRANSPORTER', city: 'Chennai', state: 'Tamil Nadu', phone: '9111100003', email: 'ops@fastmove.in', slaScore: 79 } }),
    prisma.company.upsert({ where: { id: 'ftl-trans-004' }, update: {}, create: { id: 'ftl-trans-004', name: 'National Freight', type: 'TRANSPORTER', city: 'Hyderabad', state: 'Telangana', phone: '9111100004', email: 'ops@nationalfreight.in', slaScore: 74 } }),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@haulsync.local' }, update: {},
    create: { name: 'Super Admin', email: 'admin@haulsync.local', password: await hash('Admin@1234'), role: 'SUPER_ADMIN', companyId: shipper.id },
  });
  await prisma.user.upsert({ where: { email: 'manager@haulsync.local' }, update: {}, create: { name: 'Ops Manager', email: 'manager@haulsync.local', password: await hash('Mgr@1234'), role: 'MANAGER', companyId: shipper.id } });
  await prisma.user.upsert({ where: { email: 'finance@haulsync.local' }, update: {}, create: { name: 'Finance User', email: 'finance@haulsync.local', password: await hash('Finance@1234'), role: 'FINANCE', companyId: shipper.id } });
  const transUser = await prisma.user.upsert({ where: { email: 'transporter@haulsync.local' }, update: {}, create: { name: 'Transport Manager', email: 'transporter@haulsync.local', password: await hash('Trans@1234'), role: 'TRANSPORTER', companyId: t1.id } });

  const [v1, v2, v3, v4] = await Promise.all([
    prisma.vehicle.upsert({ where: { registrationNo: 'MH04AB1234' }, update: {}, create: { registrationNo: 'MH04AB1234', type: 'TRUCK_32FT_SXL', capacityTonnes: 15, make: 'Tata', model: 'Prima 3525', gpsProvider: 'Vamosys', companyId: t1.id, insuranceExpiry: new Date('2026-12-31'), pucExpiry: new Date('2025-09-30') } }),
    prisma.vehicle.upsert({ where: { registrationNo: 'MH12XY5678' }, update: {}, create: { registrationNo: 'MH12XY5678', type: 'TRUCK_20FT_MXL', capacityTonnes: 9, make: 'Ashok Leyland', model: 'Dost+', gpsProvider: 'Locus', companyId: t2.id, insuranceExpiry: new Date('2026-06-30'), pucExpiry: new Date('2025-08-31') } }),
    prisma.vehicle.upsert({ where: { registrationNo: 'DL01CD9012' }, update: {}, create: { registrationNo: 'DL01CD9012', type: 'TRUCK_32FT_MXL', capacityTonnes: 20, make: 'Tata', model: 'LPT 2518', gpsProvider: 'Vamosys', companyId: t2.id, insuranceExpiry: new Date('2027-01-31'), pucExpiry: new Date('2025-11-30') } }),
    prisma.vehicle.upsert({ where: { registrationNo: 'TN01EF3456' }, update: {}, create: { registrationNo: 'TN01EF3456', type: 'CONTAINER_20FT', capacityTonnes: 22, make: 'BharatBenz', model: '3523', gpsProvider: 'Locus', companyId: t3.id, insuranceExpiry: new Date('2026-09-30'), pucExpiry: new Date('2025-07-31') } }),
  ]);

  const [d1, d2, d3, d4] = await Promise.all([
    prisma.driver.upsert({ where: { phone: '9500011111' }, update: {}, create: { name: 'Rajan Kumar', phone: '9500011111', licenseNo: 'MH2021001234', licenseExpiry: new Date('2028-06-30'), city: 'Mumbai', rating: 4.8, companyId: t1.id } }),
    prisma.driver.upsert({ where: { phone: '9500022222' }, update: {}, create: { name: 'Suresh Yadav', phone: '9500022222', licenseNo: 'MH2019005678', licenseExpiry: new Date('2027-03-31'), city: 'Pune', rating: 4.5, companyId: t1.id } }),
    prisma.driver.upsert({ where: { phone: '9500033333' }, update: {}, create: { name: 'Mohan Singh', phone: '9500033333', licenseNo: 'DL2022009012', licenseExpiry: new Date('2029-01-31'), city: 'Delhi', rating: 4.2, companyId: t2.id } }),
    prisma.driver.upsert({ where: { phone: '9500044444' }, update: {}, create: { name: 'Anil Sharma', phone: '9500044444', licenseNo: 'TN2020003456', licenseExpiry: new Date('2028-09-30'), city: 'Chennai', rating: 4.7, companyId: t3.id } }),
  ]);

  const indent1 = await prisma.indent.upsert({ where: { indentNumber: 'IND-2025-0101' }, update: {}, create: { indentNumber: 'IND-2025-0101', originCity: 'Mumbai', originState: 'Maharashtra', destCity: 'Delhi', destState: 'Delhi', vehicleType: 'TRUCK_32FT_SXL', quantity: 2, contractType: 'CONTRACT', loadingDate: new Date('2025-03-25'), status: 'RFQ_PUBLISHED', createdById: admin.id } });
  const indent2 = await prisma.indent.upsert({ where: { indentNumber: 'IND-2025-0100' }, update: {}, create: { indentNumber: 'IND-2025-0100', originCity: 'Pune', originState: 'Maharashtra', destCity: 'Bangalore', destState: 'Karnataka', vehicleType: 'TRUCK_20FT_MXL', quantity: 1, contractType: 'SPOT', loadingDate: new Date('2025-03-24'), status: 'AWARDED', createdById: admin.id } });

  const rfq1 = await prisma.ftlRFQ.upsert({
    where: { rfqNumber: 'RFQ-2025-0211' }, update: {},
    create: { rfqNumber: 'RFQ-2025-0211', indentId: indent1.id, originCity: 'Mumbai', originState: 'Maharashtra', destCity: 'Delhi', destState: 'Delhi', vehicleType: 'TRUCK_32FT_SXL', quantity: 2, loadingDate: new Date('2025-03-25'), awardStrategy: 'L1_AUTO', rfqWindowMinutes: 45, minSLAScore: 70, status: 'OPEN', closesAt: new Date(Date.now() + 3 * 60 * 60 * 1000), createdById: admin.id },
  });

  await Promise.all([
    prisma.vendorBid.upsert({ where: { id: 'bid-001' }, update: {}, create: { id: 'bid-001', rfqId: rfq1.id, vendorId: t1.id, submittedById: transUser.id, rateAmount: 28500, rank: 1, slaScore: 88, status: 'PENDING' } }),
    prisma.vendorBid.upsert({ where: { id: 'bid-002' }, update: {}, create: { id: 'bid-002', rfqId: rfq1.id, vendorId: t2.id, submittedById: transUser.id, rateAmount: 29800, rank: 2, slaScore: 82, status: 'PENDING' } }),
    prisma.vendorBid.upsert({ where: { id: 'bid-003' }, update: {}, create: { id: 'bid-003', rfqId: rfq1.id, vendorId: t3.id, submittedById: transUser.id, rateAmount: 31200, rank: 3, slaScore: 79, status: 'PENDING' } }),
  ]);

  const trip1 = await prisma.ftlTrip.upsert({ where: { tripNumber: 'TRIP-2025-0841' }, update: {}, create: { tripNumber: 'TRIP-2025-0841', originCity: 'Mumbai', originState: 'Maharashtra', destCity: 'Delhi', destState: 'Delhi', vehicleType: 'TRUCK_32FT_SXL', vendorId: t1.id, vehicleId: v1.id, driverId: d1.id, agreedRate: 28500, lrNumber: 'LR-2025-0841', ewayBillNo: 'EWB-291234567890', loadingDate: new Date('2025-03-24'), expectedDelivery: new Date('2025-03-26'), status: 'IN_TRANSIT', weightTonnes: 12, createdById: admin.id } });
  const trip2 = await prisma.ftlTrip.upsert({ where: { tripNumber: 'TRIP-2025-0838' }, update: {}, create: { tripNumber: 'TRIP-2025-0838', originCity: 'Chennai', originState: 'Tamil Nadu', destCity: 'Hyderabad', destState: 'Telangana', vehicleType: 'CONTAINER_20FT', vendorId: t3.id, vehicleId: v4.id, driverId: d4.id, agreedRate: 18500, lrNumber: 'LR-2025-0838', ewayBillNo: 'EWB-291234567888', loadingDate: new Date('2025-03-22'), expectedDelivery: new Date('2025-03-23'), actualDelivery: new Date('2025-03-23'), status: 'COMPLETED', weightTonnes: 18, createdById: admin.id } });
  const trip3 = await prisma.ftlTrip.upsert({ where: { tripNumber: 'TRIP-2025-0839' }, update: {}, create: { tripNumber: 'TRIP-2025-0839', originCity: 'Delhi', originState: 'Delhi', destCity: 'Kolkata', destState: 'West Bengal', vehicleType: 'TRUCK_32FT_SXL', vendorId: t2.id, vehicleId: v3.id, driverId: d3.id, agreedRate: 31200, lrNumber: 'LR-2025-0839', ewayBillNo: 'EWB-291234567880', loadingDate: new Date('2025-03-23'), expectedDelivery: new Date('2025-03-25'), status: 'DELAYED', createdById: admin.id } });

  await Promise.all([
    prisma.tripTrackingEvent.upsert({ where: { id: 'evt-001' }, update: {}, create: { id: 'evt-001', tripId: trip1.id, eventType: 'DEPARTED', location: 'Mumbai Loading Dock', city: 'Mumbai', state: 'Maharashtra', latitude: 19.076, longitude: 72.877, speedKmph: 0, gpsProvider: 'Vamosys', recordedAt: new Date('2025-03-24T06:00:00Z') } }),
    prisma.tripTrackingEvent.upsert({ where: { id: 'evt-002' }, update: {}, create: { id: 'evt-002', tripId: trip1.id, eventType: 'CHECKPOINT', location: 'Nagpur bypass, NH-44', city: 'Nagpur', state: 'Maharashtra', latitude: 21.145, longitude: 79.088, speedKmph: 68, gpsProvider: 'Vamosys', recordedAt: new Date('2025-03-24T14:00:00Z') } }),
    prisma.tripException.upsert({ where: { id: 'exc-001' }, update: {}, create: { id: 'exc-001', tripId: trip3.id, type: 'DELAY', severity: 'HIGH', message: 'Truck halted 90+ min at NH-48 near Vadodara', location: 'Vadodara, NH-48', status: 'OPEN' } }),
    prisma.tripPOD.upsert({ where: { tripId: trip2.id }, update: {}, create: { tripId: trip2.id, receiverName: 'Rajesh Mehta', receiverPhone: '9876500001', imageUrls: ['/uploads/pods/pod-trip-0838-1.jpg'], lrNumber: 'LR-2025-0838', ewayBillNo: 'EWB-291234567888', capturedAt: new Date('2025-03-23T16:30:00Z'), verifiedAt: new Date('2025-03-23T17:00:00Z'), status: 'VERIFIED' } }),
    prisma.ftlInvoice.upsert({ where: { invoiceNumber: 'INV-2025-0411' }, update: {}, create: { invoiceNumber: 'INV-2025-0411', tripId: trip2.id, vendorId: t3.id, agreedRate: 18500, invoicedAmount: 18500, deductions: 0, gstAmount: 3330, finalAmount: 18500, status: 'APPROVED', approvedAt: new Date('2025-03-24') } }),
  ]);

  console.log('\n✅ Seed complete!');
  console.log('   admin@haulsync.local       / Admin@1234   (SUPER_ADMIN)');
  console.log('   manager@haulsync.local     / Mgr@1234     (MANAGER)');
  console.log('   finance@haulsync.local     / Finance@1234 (FINANCE)');
  console.log('   transporter@haulsync.local / Trans@1234   (TRANSPORTER)');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

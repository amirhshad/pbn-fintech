import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test users
  const user1 = await prisma.user.upsert({
    where: { phoneNumber: '+31612345001' },
    update: {},
    create: {
      phoneNumber: '+31612345001',
      fullName: 'Alice Johnson',
      phoneVerified: true,
      verificationStatus: 'PHONE_VERIFIED',
      trustScore: 4.5,
      totalTransactions: 10,
      successfulTransactions: 9,
      dateOfBirth: new Date('1990-05-15'),
      locationLat: 52.3676,  // Amsterdam
      locationLng: 4.9041,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { phoneNumber: '+31612345002' },
    update: {},
    create: {
      phoneNumber: '+31612345002',
      fullName: 'Bob Smith',
      phoneVerified: true,
      verificationStatus: 'PHONE_VERIFIED',
      trustScore: 4.2,
      totalTransactions: 8,
      successfulTransactions: 8,
      dateOfBirth: new Date('1988-08-22'),
      locationLat: 52.3702,  // Amsterdam (nearby)
      locationLng: 4.8952,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { phoneNumber: '+31612345003' },
    update: {},
    create: {
      phoneNumber: '+31612345003',
      fullName: 'Charlie Brown',
      phoneVerified: true,
      verificationStatus: 'PHONE_VERIFIED',
      trustScore: 0.0, // New user
      totalTransactions: 0,
      successfulTransactions: 0,
      dateOfBirth: new Date('1995-03-10'),
      locationLat: 52.3667,  // Amsterdam
      locationLng: 4.8945,
    },
  });

  const user4 = await prisma.user.upsert({
    where: { phoneNumber: '+31612345004' },
    update: {},
    create: {
      phoneNumber: '+31612345004',
      fullName: 'Diana Prince',
      phoneVerified: true,
      verificationStatus: 'ID_VERIFIED',
      trustScore: 4.8,
      totalTransactions: 15,
      successfulTransactions: 15,
      dateOfBirth: new Date('1992-11-05'),
      locationLat: 52.3647,  // Amsterdam
      locationLng: 4.9103,
    },
  });

  console.log('✅ Created 4 test users');

  // Create safe locations
  const safeLocations = await Promise.all([
    prisma.safeLocation.create({
      data: {
        name: 'Amsterdam Centraal Station',
        address: 'Stationsplein 9, 1012 AB Amsterdam',
        latitude: 52.3791,
        longitude: 4.9003,
        locationType: 'TRAIN_STATION',
        description: 'Main railway station, well-lit and busy',
        operatingHours: '24/7',
        city: 'Amsterdam',
        verified: true,
        safetyRating: 4.7,
        usageCount: 0,
      },
    }),
    prisma.safeLocation.create({
      data: {
        name: 'ING Bank - Dam Square',
        address: 'Dam 1-3, 1012 JS Amsterdam',
        latitude: 52.3728,
        longitude: 4.8933,
        locationType: 'BANK',
        description: 'ING Bank branch on Dam Square',
        operatingHours: 'Mon-Fri 9:00-17:00',
        city: 'Amsterdam',
        verified: true,
        safetyRating: 4.9,
        usageCount: 0,
      },
    }),
    prisma.safeLocation.create({
      data: {
        name: 'Police Station Nieuwezijds',
        address: 'Nieuwezijds Voorburgwal 104, 1012 SG Amsterdam',
        latitude: 52.3737,
        longitude: 4.8911,
        locationType: 'POLICE_STATION',
        description: 'Amsterdam police station',
        operatingHours: '24/7',
        city: 'Amsterdam',
        verified: true,
        safetyRating: 5.0,
        usageCount: 0,
      },
    }),
    prisma.safeLocation.create({
      data: {
        name: 'The Magna Plaza',
        address: 'Nieuwezijds Voorburgwal 182, 1012 SJ Amsterdam',
        latitude: 52.3748,
        longitude: 4.8916,
        locationType: 'MALL',
        description: 'Shopping mall with security',
        operatingHours: 'Mon-Sat 10:00-19:00, Sun 12:00-19:00',
        city: 'Amsterdam',
        verified: true,
        safetyRating: 4.5,
        usageCount: 0,
      },
    }),
  ]);

  console.log(`✅ Created ${safeLocations.length} safe locations`);

  console.log('\n📊 Seed Summary:');
  console.log('  - Users:', {
    alice: user1.id,
    bob: user2.id,
    charlie: user3.id,
    diana: user4.id
  });
  console.log('  - Safe Locations:', safeLocations.length);
  console.log('\n✨ Database seeded successfully!');
  console.log('\nTest Users:');
  console.log('  1. Alice   (+31612345001) - Experienced (4.5★, 10 transactions)');
  console.log('  2. Bob     (+31612345002) - Experienced (4.2★, 8 transactions)');
  console.log('  3. Charlie (+31612345003) - New User (0★, 0 transactions)');
  console.log('  4. Diana   (+31612345004) - Expert (4.8★, 15 transactions)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Seeding database...');
  
  // Create roles
  const roles = [
    { name: 'Founder', isAdmin: true },
    { name: 'CEO', isAdmin: true },
    { name: 'Staff', isAdmin: false }
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: { name: r.name, isAdmin: r.isAdmin }
    });
  }
  
  const founderRole = await prisma.role.findUnique({ where: { name: 'Founder' } });
  
  // Create default admin user
  const adminEmail = 'admin@falcusmedia.com';
  const adminPassword = 'Falcusmedia@234';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      fullName: 'System Admin',
      email: adminEmail,
      passwordHash: passwordHash,
      roleId: founderRole.id,
      profileStatus: 'completed',
      contractStatus: 'signed',
      policyStatus: 'acknowledged',
      isActive: true,
    }
  });

  console.log('Seed completed successfully!');
  console.log('Admin Email:', adminEmail);
  console.log('Admin Password:', adminPassword);
  
  await prisma.$disconnect();
  await pool.end();
}
main().catch(console.error);

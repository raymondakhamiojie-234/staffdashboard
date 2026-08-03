require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const adminRole = await prisma.role.findFirst({ where: { isAdmin: true } });
  if (!adminRole) { console.log('No admin role found!'); return; }
  const admins = await prisma.user.findMany({ where: { roleId: adminRole.id } });
  if (admins.length === 0) { console.log('No admin users found!'); }
  else { console.log('Admin Users:'); admins.forEach(a => console.log(`- ${a.email}`)); }
  
  await prisma.$disconnect();
  await pool.end();
}
main().catch(console.error);

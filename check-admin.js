const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const adminRole = await prisma.role.findFirst({ where: { isAdmin: true } });
  if (!adminRole) { console.log('No admin role found!'); return; }
  const admins = await prisma.user.findMany({ where: { roleId: adminRole.id } });
  if (admins.length === 0) { console.log('No admin users found!'); }
  else { console.log('Admin Users:'); admins.forEach(a => console.log(`- ${a.email} (Password: Falcusmedia@234)`)); }
}
main().finally(() => prisma.$disconnect());

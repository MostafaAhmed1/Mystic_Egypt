import { PrismaClient } from '/app/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient();
try {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  console.log('Admin:', JSON.stringify(admin ? { id: admin.id, email: admin.email } : null));
  const tours = await prisma.tour.findMany({ select: { id: true, title: true, slug: true } });
  console.log('Existing tours:', tours.length);
  if (tours.length > 0) console.log(JSON.stringify(tours));
} catch (e) {
  console.error('DB Error:', e.message);
} finally {
  await prisma.$disconnect();
}
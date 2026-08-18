import { prisma } from '../lib/prisma.js';

export async function getAdminOverview() {
  const [users, citizens, staff, reports, publications, queued] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'citizen' } }),
    prisma.user.count({ where: { role: 'edg_staff' } }),
    prisma.userReport.count(),
    prisma.infoPublication.count({ where: { status: 'published' } }),
    prisma.notificationOutbox.count({ where: { status: 'queued' } }),
  ]);

  return { users, citizens, staff, reports, publications, queued };
}

export async function listAdminUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      name: true,
      phoneNumber: true,
      role: true,
      notifySms: true,
      notifyWhatsapp: true,
      createdAt: true,
      commune: { select: { name: true } },
      quartier: { select: { name: true } },
      defaultSector: { select: { name: true } },
    },
  });
  return users;
}

export async function listAdminReports() {
  const reports = await prisma.userReport.findMany({
    orderBy: { reportedAt: 'desc' },
    take: 200,
    select: {
      id: true,
      reportType: true,
      reportedAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
        },
      },
      sector: {
        select: {
          id: true,
          name: true,
          commune: { select: { name: true } },
          quartier: { select: { name: true } },
        },
      },
    },
  });
  return reports.map((r) => ({
    ...r,
    id: String(r.id),
  }));
}

export async function listAdminOutbox() {
  const rows = await prisma.notificationOutbox.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      user: { select: { firstName: true, lastName: true, phoneNumber: true } },
      publication: { select: { title: true } },
    },
  });
  return rows;
}

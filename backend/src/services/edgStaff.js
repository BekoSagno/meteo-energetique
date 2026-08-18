import { prisma } from '../lib/prisma.js';

/** Compte démo backoffice EDG (connexion OTP comme un citoyen). */
export const EDG_STAFF_PHONE = '+224611000000';

export async function ensureEdgStaffUser() {
  const existing = await prisma.user.findUnique({
    where: { phoneNumber: EDG_STAFF_PHONE },
    select: { id: true, role: true },
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        phoneNumber: EDG_STAFF_PHONE,
        firstName: 'Agent',
        lastName: 'EDG',
        name: 'Agent EDG',
        role: 'edg_staff',
        isVerified: true,
        notifyInApp: true,
      },
    });
    console.info(`[EDG] Compte backoffice créé : ${EDG_STAFF_PHONE}`);
    return;
  }

  if (existing.role !== 'edg_staff') {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: 'edg_staff', firstName: 'Agent', lastName: 'EDG', name: 'Agent EDG' },
    });
  }

  console.info(`[EDG] Compte backoffice : ${EDG_STAFF_PHONE}`);
}

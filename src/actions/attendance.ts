"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { AttendanceStatus } from "@prisma/client"

export async function markAttendance(meetingId: string, youthId: string, status: AttendanceStatus) {
  // Upsert para crear o actualizar el registro
  await prisma.attendance.upsert({
    where: {
      youthId_meetingId: {
        youthId,
        meetingId
      }
    },
    update: {
      status
    },
    create: {
      meetingId,
      youthId,
      status
    }
  })

  // Aquí se podrían recalcular al vuelo las faltas consecutivas y marcar "needsFollowUp"
  if (status === AttendanceStatus.ABSENT) {
    // Ejemplo rápido de actualización al joven si falta
    // await prisma.youth.update({ where: { id: youthId }, data: { needsFollowUp: true } })
  }

  revalidatePath(`/meetings/${meetingId}/attendance`)
}

export async function bulkSaveAttendance(meetingId: string, attendances: { youthId: string, status: AttendanceStatus }[]) {
  // Primero, obtenemos todos los jóvenes activos para saber quiénes faltan
  const allYouth = await prisma.youth.findMany({
    where: { isActive: true },
    select: { id: true }
  });

  const markedYouthIds = new Set(attendances.map(a => a.youthId));

  const operations = [];

  // Para los que fueron marcados explícitamente (Presente o Faltó)
  for (const { youthId, status } of attendances) {
    operations.push(
      prisma.attendance.upsert({
        where: { youthId_meetingId: { youthId, meetingId } },
        update: { status },
        create: { meetingId, youthId, status }
      })
    );
  }

  // Para el resto (los que no fueron tocados), marcarlos como ABSENT (Faltó)
  for (const youth of allYouth) {
    if (!markedYouthIds.has(youth.id)) {
      operations.push(
        prisma.attendance.upsert({
          where: { youthId_meetingId: { youthId: youth.id, meetingId } },
          update: { status: AttendanceStatus.ABSENT },
          create: { meetingId, youthId: youth.id, status: AttendanceStatus.ABSENT }
        })
      );
    }
  }

  // Ejecutamos todo en una transacción (con timeout más largo por la red)
  await prisma.$transaction(operations, {
    timeout: 20000,
  });

  revalidatePath(`/meetings/${meetingId}/attendance`);
  return { success: true };
}

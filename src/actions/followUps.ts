"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { FollowUpType, Priority } from "@prisma/client"
import { auth } from "@/lib/auth"

export async function getFollowUps() {
  return await prisma.followUp.findMany({
    include: {
      youth: true,
      leader: true,
    },
    orderBy: { createdAt: "desc" }
  })
}

export async function createFollowUp(formData: FormData) {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("No autorizado")
  }

  const youthId = formData.get("youthId") as string
  const type = formData.get("type") as FollowUpType
  const priority = formData.get("priority") as Priority
  const notes = formData.get("notes") as string
  
  // Si el usuario logueado es Líder, usar su ID. Si es Admin y elige uno, usar el del form.
  // Por simplicidad en este MVP, usaremos el leaderId del form o buscaremos el leader asociado al user.
  let leaderId = formData.get("leaderId") as string
  
  if (!leaderId) {
    const leader = await prisma.leader.findUnique({ where: { userId: session.user.id }})
    if (leader) leaderId = leader.id
  }

  if (!leaderId) {
    throw new Error("Se requiere un líder para el seguimiento")
  }

  await prisma.followUp.create({
    data: {
      youthId,
      leaderId,
      type,
      priority,
      notes,
    }
  })

  // Si creamos un seguimiento, quizás queramos limpiar la bandera de needsFollowUp del joven
  await prisma.youth.update({
    where: { id: youthId },
    data: { needsFollowUp: false }
  })

  revalidatePath("/follow-ups")
  revalidatePath("/youth")
}

export async function deleteFollowUp(id: string) {
  await prisma.followUp.delete({
    where: { id }
  })
  revalidatePath("/follow-ups")
}

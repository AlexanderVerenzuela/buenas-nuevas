"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getLeaders() {
  return await prisma.leader.findMany({
    include: {
      user: true,
      discipleshipGroup: true,
      _count: {
        select: { assignedYouth: true }
      }
    },
    orderBy: { firstName: "asc" }
  })
}

export async function createLeader(formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const phone = formData.get("phone") as string
  const email = formData.get("email") as string
  
  await prisma.leader.create({
    data: {
      firstName,
      lastName,
      phone,
      email,
    }
  })

  revalidatePath("/leaders")
}

export async function deleteLeader(id: string) {
  // Nota: Deberíamos manejar la reasignación de jóvenes antes de borrar en un caso real
  await prisma.leader.delete({
    where: { id }
  })
  revalidatePath("/leaders")
}

export async function updateLeaderInfo(id: string, formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const phone = formData.get("phone") as string
  const email = formData.get("email") as string
  const isActiveStr = formData.get("isActive") as string

  await prisma.leader.update({
    where: { id },
    data: {
      firstName,
      lastName,
      phone: phone || null,
      email: email || null,
      isActive: isActiveStr === "true",
    },
  })

  revalidatePath("/leaders")
}

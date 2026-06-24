"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getGroups() {
  return await prisma.discipleshipGroup.findMany({
    include: {
      leader: true,
      _count: {
        select: { members: true }
      }
    },
    orderBy: { name: "asc" }
  })
}

export async function createGroup(formData: FormData) {
  const name = formData.get("name") as string
  const leaderId = formData.get("leaderId") as string
  const meetingDay = formData.get("meetingDay") as string
  const meetingTime = formData.get("meetingTime") as string
  const location = formData.get("location") as string
  
  await prisma.discipleshipGroup.create({
    data: {
      name,
      leaderId,
      meetingDay,
      meetingTime,
      location,
    }
  })

  revalidatePath("/groups")
}

export async function deleteGroup(id: string) {
  await prisma.discipleshipGroup.delete({
    where: { id }
  })
  revalidatePath("/groups")
}

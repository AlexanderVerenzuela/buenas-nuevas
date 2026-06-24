"use server"

import { signIn, signOut } from "@/lib/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export async function loginAction(prevState: any, formData: FormData) {
  try {
    const data = Object.fromEntries(formData)
    await signIn("credentials", { ...data, redirectTo: "/" })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales inválidas." }
        default:
          return { error: "Ocurrió un error al iniciar sesión." }
      }
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut()
}

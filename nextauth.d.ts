import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    apiToken: string
    groups: string[]
  }
  interface Session  extends DefaultSession {
    user?: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    apiToken: string
    groups: string[]
  }
}
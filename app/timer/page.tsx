import { redirect } from "next/navigation"

import { TabataTimer } from "@/components/tabata-timer"
import { getCurrentUser } from "@/lib/auth"
import { isSubscribed } from "@/lib/db"

export default async function TimerPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!isSubscribed(user)) redirect("/abonner")
  return <TabataTimer accountHref="/konto" />
}

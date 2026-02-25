import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminShopPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  redirect("/dashboard/shop");
}

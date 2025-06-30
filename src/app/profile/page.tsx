import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DefaultAvailabilityGrid } from "@/components/DefaultAvailabilityGrid";

export const metadata = {
  title: "Your Profile",
  description: "Manage your preferences and default availability",
};

export default async function ProfilePage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your default scheduling preferences.</p>
      </section>

      <section>
        <Suspense
          fallback={<p className="text-sm text-muted-foreground">Loading availability...</p>}
        >
          <DefaultAvailabilityGrid />
        </Suspense>
      </section>
    </main>
  );
}

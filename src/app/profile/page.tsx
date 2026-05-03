import { getServerSession } from "next-auth";
import Link from "next/link";
import { ProfileForm } from "@/components/ProfileForm";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  let profile = null;

  if (session?.user?.id) {
    try {
      profile = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          homeLat: true,
          homeLon: true,
          skillLevel: true,
          preferredMinWind: true,
          preferredMaxWind: true,
          preferredSpotTypes: true,
          favorites: { include: { spot: true } }
        }
      });
    } catch {
      profile = null;
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-normal text-lagoon">Rider profile</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">Preferences and favorites</h1>
      </div>

      {session ? (
        <>
          <ProfileForm profile={profile} />
          <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="font-black text-slate-950">Favorite spots</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {profile?.favorites.map((favorite) => (
                <Link key={favorite.spotId} href={`/spots/${favorite.spot.slug}`} className="rounded-md bg-slate-50 p-3 font-bold hover:bg-sandbar">
                  {favorite.spot.name}
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-slate-700">Sign in to save rider preferences, home location, and favorite spots.</p>
          <Link href="/login" className="mt-4 inline-flex rounded-md bg-lagoon px-5 py-2 font-black text-white">
            Sign in
          </Link>
        </section>
      )}
    </main>
  );
}

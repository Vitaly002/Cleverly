import CompanionCard from '@/components/companion-card'
import CompanionsList from '@/components/companions-list';
import CTA from '@/components/cta';
import { getAllCompanions, getRecentSessions } from "@/lib/actions/companion.actions";
import { getSubjectColor } from "@/lib/utils";
import { Companion } from '@/types';

const Page = async () => {
  let companions: Companion[] = [];
  let recentSessionsCompanions: Companion[] = [];

  try {
    const result = await getAllCompanions({ limit: 3 });
    companions = Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Failed to fetch companions:", error);
  }

  try {
    const result = await getRecentSessions(10);
    recentSessionsCompanions = Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Failed to fetch recent sessions:", error);
  }

  return (
    <main className="space-y-12">
      <h1 className="text-2xl font-semibold">Popular Companions</h1>

      <section className="home-section grid gap-4 md:grid-cols-3">
        {companions.length > 0 ? (
          companions.map((companion, index) => (
            <CompanionCard
              key={`${companion.$id}-${index}`}
              {...companion}
              color={getSubjectColor(companion.subject)}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 py-8 col-span-full">
            You don’t have any companions yet — go create some!
          </div>
        )}
      </section>

      <section className="home-section flex flex-col lg:flex-row justify-between gap-8">
        {recentSessionsCompanions.length > 0 ? (
          <CompanionsList
            title="Recently completed sessions"
            companions={recentSessionsCompanions}
            classNames="w-2/3 max-lg:w-full"
          />
        ) : (
          <div className="w-2/3 max-lg:w-full text-center text-gray-500 py-8">
            No recent sessions yet.
          </div>
        )}
        <CTA />
      </section>
    </main>
  );
};

export default Page;

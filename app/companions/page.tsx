import {getAllCompanions} from "@/lib/actions/companion.actions";
import CompanionCard from "@/components/companion-card";
import {getSubjectColor} from "@/lib/utils";
import SearchInput from "@/components/search-input";
import SubjectFilter from "@/components/subject-filter";
import { SearchParams } from "@/types";

const CompanionsLibrary = async ({ searchParams }: SearchParams) => {
    const filters = await searchParams;
    const subject = filters.subject || "";
    const topic = filters.topic || "";

    const companions = await getAllCompanions({ subject, topic });

    const hasCompanions = Array.isArray(companions) && companions.length > 0;

    return (
        <main>
        <section className="flex justify-between gap-4 max-sm:flex-col">
            <h1>Companion Library</h1>

            {hasCompanions && (
                <div className="flex gap-4">
                    <SearchInput />
                    <SubjectFilter />
                </div>
            )}
        </section>

        <section className="companions-grid">
            {hasCompanions ? (
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
        </main>
    );
};

export default CompanionsLibrary;
  
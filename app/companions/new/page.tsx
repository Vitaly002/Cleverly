import {auth} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CompanionForm from "@/components/companion-form";
import { newCompanionPermissions } from "@/lib/actions/companion.actions";

const NewCompanion = async () => {
    const { userId } = await auth();
    if(!userId) redirect('/sign-in');

    const canCreateCompanion = await newCompanionPermissions();

    return (
        <main className="min-lg:w-1/3 min-md:w-2/3 items-center justify-center">
            {canCreateCompanion ? (
                <article className="w-full gap-4 flex flex-col">
                    <h1>Companion Builder</h1>

                    <CompanionForm />
                </article>
                ) : (
                    <article className="companion-limit">
                        <Image src="/images/limit.svg" alt="Companion limit reached" width={360} height={230} />
                        <div className="cta-badge">
                            Oops!
                        </div>
                        <h1>You’ve Reached Your Limit</h1>
                        <p className="text-muted-foreground max-w-md">
                            Looks like you've created the maximum number of companions allowed
                            for your current plan.  
                            <br />  
                            If you enjoyed using this feature and want more — don’t hesitate to reach out. Together, we can keep improving this project and take it to the next level.
                        </p>
                        <Link href="mailto:vitalyto06@gmail.com" className="btn-primary w-full justify-center" >
                            Contact Me for More
                        </Link>
                    </article>
                )}
        </main>
    )
}

export default NewCompanion

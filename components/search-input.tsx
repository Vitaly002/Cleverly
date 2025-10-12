"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

const SearchInput = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentParams = new URLSearchParams(window.location.search);
  
      if (searchQuery) {
        currentParams.set("topic", searchQuery);
      } else {
        currentParams.delete("topic");
      }
  
      const queryString = currentParams.toString();
      router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
    }, 500);
  
    return () => clearTimeout(timeout);
  }, [searchQuery, pathname, router]);  

  return (
    <div className="relative border border-black rounded-lg items-center flex gap-2 px-2 py-1 h-fit">
      <Image src="/icons/search.svg" alt="search" width={15} height={15} />
      <input
        placeholder="Search companions..."
        className="outline-none"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;

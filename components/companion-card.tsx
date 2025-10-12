"use client";
import { useState } from "react";
import { removeBookmark } from "@/lib/actions/companion.actions";
import { addBookmark } from "@/lib/actions/companion.actions";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface CompanionCardProps {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color: string;
  bookmarked: boolean;
}

const CompanionCard = ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
  bookmarked: initialBookmarked,
}: CompanionCardProps) => {
  const pathname = usePathname();
  
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const handleBookmark = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (isBookmarked) {
        await removeBookmark(id, pathname);
        setIsBookmarked(false);
      } else {
        await addBookmark(id, pathname);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Bookmark error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="companion-card" style={{ backgroundColor: color }}>
      <div className="flex justify-between items-center">
        <div className="subject-badge">{subject}</div>

        <button
          className={`companion-bookmark transition-transform ${
            isBookmarked ? "scale-110" : "scale-100"
          }`}
          onClick={handleBookmark}
          disabled={loading}
        >
          <Image
            src={
              isBookmarked
                ? "/icons/bookmark-filled.svg"
                : "/icons/bookmark.svg"
            }
            alt="bookmark"
            width={20}
            height={20}
            className={`transition-colors ${
              isBookmarked ? "text-yellow-500" : "text-gray-400"
            }`}
          />
        </button>
      </div>

      <h2 className="text-2xl font-bold">{name}</h2>
      <p className="text-sm">{topic}</p>
      <div className="flex items-center gap-2">
        <Image
          src="/icons/clock.svg"
          alt="duration"
          width={13.5}
          height={13.5}
        />
        <p className="text-sm">{duration} minutes</p>
      </div>

      <Link href={`/companions/${id}`} className="w-full">
        <button className="btn-primary w-full justify-center">
          Launch Lesson
        </button>
      </Link>
    </article>
  );
};

export default CompanionCard;

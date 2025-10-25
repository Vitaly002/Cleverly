'use server';

import {auth} from "@clerk/nextjs/server";
import {createSupabaseClient} from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { Companion, CreateCompanion, GetAllCompanions } from "@/types";

export const createCompanion = async (formData: CreateCompanion) => {
    const { userId: author } = await auth();
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('companions')
        .insert({...formData, author })
        .select();

    if(error || !data) throw new Error(error?.message || 'Failed to create a companion');

    return data[0];
}

export const getAllCompanions = async ({
    limit = 10,
    page = 1,
    subject,
    topic,
  }: GetAllCompanions): Promise<Companion[]> => {
    try {
      const { userId } = await auth();
      if (!userId) return [];
      const supabase = createSupabaseClient();
  
      let query = supabase
        .from("companions")
        .select(
          `
          *,
          bookmarks!left(user_id)
          `
        )
        .eq("bookmarks.user_id", userId);
  
      if (subject && topic) {
        query = query
          .ilike("subject", `%${subject}%`)
          .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
      } else if (subject) {
        query = query.ilike("subject", `%${subject}%`);
      } else if (topic) {
        query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
      }
  
      query = query.range((page - 1) * limit, page * limit - 1);
  
      const { data: companions, error } = await query;
  
      if (error || !companions) {
        console.error("Error fetching companions:", error?.message || "Unknown error");
        return [];
      }
  
      return companions.map((companion) => ({
        ...companion,
        bookmarked: Array.isArray(companion.bookmarks) && companion.bookmarks.length > 0,
      }));
    } catch (err) {
      console.error("Failed to fetch companions:", err);
      return [];
    }
  };

export const getCompanion = async (id: string) => {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('id', id);

    if(error) return console.log(error);

    return data[0];
}

export const addToSessionHistory = async (companionId: string) => {
    const { userId } = await auth();
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from('session_history')
        .insert({
            companion_id: companionId,
            user_id: userId,
        })

    if(error) throw new Error(error.message);

    return data;
}

export const getRecentSessions = async (limit = 10): Promise<Companion[]> => {
    try {
        const { userId } = await auth();
        if (!userId) return [];
        const supabase = createSupabaseClient();

        const { data, error } = await supabase
        .from("session_history")
        .select(`companions:companion_id (*)`)
        .order("created_at", { ascending: false })
        .limit(limit);

        if (error || !data) {
        console.error("Error fetching recent sessions:", error?.message || "Unknown error");
        return [];
        }

        const companions = data
        .map((record) => record.companions)
        .filter((c): c is Companion => Boolean(c));

        return companions;
    } catch (err) {
        console.error("Failed to fetch recent sessions:", err);
        return [];
    }
};

export const getUserSessions = async (userId: string, limit = 10) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('session_history')
        .select(`companions:companion_id (*)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if(error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
}

export const getUserCompanions = async (userId: string) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('author', userId)

    if(error) throw new Error(error.message);

    return data;
}

export const newCompanionPermissions = async (): Promise<boolean> => {
    try {
      const { userId } = await auth();
      const supabase = createSupabaseClient();
  
      const { count, error } = await supabase
        .from("companions")
        .select("*", { count: "exact", head: true })
        .eq("author", userId);
  
      if (error) {
        console.error("Supabase error checking companions:", error.message);
        return false;
      }
  
      if (count === null) {
        console.warn("No count returned. Possibly due to RLS or mismatched author ID.");
        return false;
      }
  
      console.log(`Found ${count} companions for user ${userId}`);
      return count < 2;
    } catch (err) {
      console.error("Failed to check companion permissions:", err);
      return false;
    }
};  
  

// Bookmarks
export const addBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from("bookmarks").insert({
    companion_id: companionId,
    user_id: userId,
  });
  if (error) {
    throw new Error(error.message);
  }
  // Revalidate the path to force a re-render of the page

  revalidatePath(path);
  return data;
};

export const removeBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("companion_id", companionId)
    .eq("user_id", userId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath(path);
  return data;
};

export const getBookmarkedCompanions = async (userId: string) => { 
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .select(`companions:companion_id (*)`) // (*) to get all the companion data
    .eq("user_id", userId);
  if (error) {
    throw new Error(error.message);
  }
  // return only the companions
  return data.map(({ companions }) => companions);
};

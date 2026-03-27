import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
  dealerDiscount: number | null;
}

export async function getUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  let dealerDiscount: number | null = null;
  if (profile.role === "dealer") {
    const { data: dealer } = await supabase
      .from("dealer_profiles")
      .select("discount_percent, status")
      .eq("id", user.id)
      .single();

    if (dealer?.status === "approved") {
      dealerDiscount = dealer.discount_percent;
    }
  }

  return {
    id: user.id,
    email: user.email!,
    role: profile.role,
    firstName: profile.first_name,
    lastName: profile.last_name,
    dealerDiscount,
  };
}

import { supabase } from "./supabaseAdmin";

// Generate next membership code in the format BDS-00001 (no year)
// Looks at existing membership_code values, extracts the numeric suffix, and increments.
export async function generateMembershipCode() {
  // Fetch some of the most recently created users that already have a membership_code
  const { data, error } = await supabase
    .from("users")
    .select("membership_code, created_at")
    .not("membership_code", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("generateMembershipCode: failed to query users", error);
  }

  let maxNumber = 0;

  if (Array.isArray(data)) {
    for (const row of data) {
      const code = row.membership_code;
      if (!code) continue;
      const match = String(code).match(/(\d+)\s*$/);
      if (!match) continue;
      const num = parseInt(match[1], 10);
      if (!Number.isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  }

  const nextNumber = maxNumber + 1;
  const padded = String(nextNumber).padStart(5, "0");
  return `BDS-${padded}`;
}

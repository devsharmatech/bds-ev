import { supabase } from "@/lib/supabaseAdmin";
import { jsonResponse } from "@/lib/adminHelpers";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 20);
    const status = url.searchParams.get("status");
    const category = url.searchParams.get("category"); // 'membership' | 'event' | 'all'
    const dateRange = url.searchParams.get("date_range");
    const eventId = url.searchParams.get("event_id");
    const membershipPlan = url.searchParams.get("membership_plan");
    const search = url.searchParams.get("search");

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("payment_history")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (category && category !== "all") {
      if (category === "membership") {
        query = query.ilike("payment_for", "subscription%");
      } else if (category === "event") {
        query = query.eq("payment_for", "event_registration");
      }
    }

    if (eventId) {
      query = query.eq("details->>event_id", eventId);
    }

    if (membershipPlan) {
      query = query.eq("details->>plan_name", membershipPlan);
    }

    if (dateRange && dateRange !== "all") {
      const now = new Date();
      let start = null;
      let end = null;

      if (dateRange === "today") {
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
      } else if (dateRange === "yesterday") {
        end = new Date(now);
        end.setHours(0, 0, 0, 0);
        start = new Date(end);
        start.setDate(start.getDate() - 1);
      } else if (dateRange === "week") {
        end = now;
        start = new Date(now);
        start.setDate(start.getDate() - 7);
      } else if (dateRange === "month") {
        end = now;
        start = new Date(now);
        start.setMonth(start.getMonth() - 1);
      } else if (dateRange === "year") {
        end = now;
        start = new Date(now);
        start.setFullYear(start.getFullYear() - 1);
      }

      if (start && end) {
        query = query
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString());
      }
    }

    if (search) {
      const pattern = `%${search}%`;
      query = query.or(
        [
          `payment_id.ilike.${pattern}`,
          `invoice_id.ilike.${pattern}`,
          `payment_for.ilike.${pattern}`,
          `details->>user_name.ilike.${pattern}`,
          `details->>event_title.ilike.${pattern}`,
          `details->>plan_name.ilike.${pattern}`
        ].join(",")
      );
    }

    const { data, count, error } = await query.range(from, to);

    if (error) {
      return jsonResponse({ success: false, error: error.message }, 500);
    }

    const payments = data || [];

    // Enrich with basic user info so admin can see who paid
    const userIds = Array.from(
      new Set(
        payments
          .map((p) => p.user_id)
          .filter((id) => !!id)
      )
    );

    let usersById = {};
    if (userIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, full_name, email")
        .in("id", userIds);

      if (!usersError && users) {
        usersById = users.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
      }
    }

    const enriched = payments.map((p) => {
      const user = p.user_id ? usersById[p.user_id] : null;
      return {
        ...p,
        user_full_name: user?.full_name || null,
        user_email: user?.email || null,
      };
    });

    return jsonResponse(
      {
        success: true,
        payments: enriched,
        pagination: {
          total: count || 0,
          page,
          totalPages: Math.max(1, Math.ceil((count || 0) / limit)),
        },
      },
      200
    );
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

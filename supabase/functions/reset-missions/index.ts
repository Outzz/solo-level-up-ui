import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday
    const dayOfMonth = now.getUTCDate();

    const results: string[] = [];

    // Always reset daily missions
    const { error: dailyError, count: dailyCount } = await supabase
      .from("missions")
      .update({ completed: false })
      .eq("type", "daily")
      .eq("completed", true);

    if (dailyError) {
      console.error("Daily reset error:", dailyError);
    } else {
      results.push(`Daily: ${dailyCount ?? 0} missions reset`);
    }

    // Reset weekly missions on Monday (dayOfWeek === 1)
    if (dayOfWeek === 1) {
      const { error: weeklyError, count: weeklyCount } = await supabase
        .from("missions")
        .update({ completed: false })
        .eq("type", "weekly")
        .eq("completed", true);

      if (weeklyError) {
        console.error("Weekly reset error:", weeklyError);
      } else {
        results.push(`Weekly: ${weeklyCount ?? 0} missions reset`);
      }
    }

    // Reset monthly missions on the 1st
    if (dayOfMonth === 1) {
      const { error: monthlyError, count: monthlyCount } = await supabase
        .from("missions")
        .update({ completed: false })
        .eq("type", "monthly")
        .eq("completed", true);

      if (monthlyError) {
        console.error("Monthly reset error:", monthlyError);
      } else {
        results.push(`Monthly: ${monthlyCount ?? 0} missions reset`);
      }
    }

    console.log("Reset results:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Reset error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

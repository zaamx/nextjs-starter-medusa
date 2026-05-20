const { createClient } = require('./node_modules/@supabase/supabase-js');
const SUPABASE_URL = "https://api.wenow.netme.now";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1a3VwYW9wZ3pucWlod2N1d3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMTgxMDksImV4cCI6MjA2NjY5NDEwOX0.SUinDjr6-5A6j-6lj7p-rvSRD_bXUBCYMIkkvd-n9MU";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase
    .from('vw_network_activity_member_orders')
    .select('*')
    .eq('order_display', 5666);
  console.log("Supabase data for order 5666:", JSON.stringify(data, null, 2), error);
}
test();

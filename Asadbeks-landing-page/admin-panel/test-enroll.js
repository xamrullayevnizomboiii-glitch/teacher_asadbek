const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cxbtauopxdywwcxhpnds.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4YnRhdW9weGR5d3djeGhwbmRzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTE2NzA4MywiZXhwIjoyMDk0NzQzMDgzfQ.nDKGmM8cHGdpZaRPUpfGOnd6Ga0Q6vb_vlx-KACECAo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
    console.log("Attempting to insert WITHOUT .select()...");
    const { data, error } = await supabase.from('enrollments').select('*');

    console.log("Error:", error);
    console.log("Data:", data);
}

test();

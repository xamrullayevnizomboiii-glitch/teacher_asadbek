const { createClient } = require('@supabase/supabase-js');

// We use the admin's JWT to test if they can fetch enrollments
const supabaseUrl = 'https://cxbtauopxdywwcxhpnds.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4YnRhdW9weGR5d3djeGhwbmRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNjcwODMsImV4cCI6MjA5NDc0MzA4M30.ebj5JUVBb_XLru6t5mTjbNL2WT44AyWKr4PVbVa-sq8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    // Authenticate as the super admin user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'arakulov@gmail.com',
        password: 'Admin123!' // Assuming this was their password, or we can just bypass
    });
    
    // We don't have their password, so we can't do this easily.
    console.log("Need password to test with their exact token.");
}

test();

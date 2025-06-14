import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ejgcugnvtmhdxpdonhwa.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqZ2N1Z252dG1oZHhwZG9uaHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3Nzc4MjYsImV4cCI6MjA2NTM1MzgyNn0.9eN38XbYpAZHvwQdIWBlOenuyrKGK0nbBBsG02HTQ_Q';

export const supabase = createClient(supabaseUrl, supabaseKey);

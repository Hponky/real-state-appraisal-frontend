import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://uvwfemunxdyxhvpflfqv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2d2ZlbXVueGR5eGh2cGZsZnF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwOTY4NzIsImV4cCI6MjA1NzY3Mjg3Mn0.iF2oVBm8pZ-W81oDya3JGBJhRa4YjvItRdc7AQSRiEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tuuhmtdvqehwkrpbzxhl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1dWhtdGR2cWVod2tycGJ6eGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTI2NjYsImV4cCI6MjA3OTU4ODY2Nn0.dc4RXn79ZKhX1L8AopUk4uFjaJM925YYPUmqe9t66Ro';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


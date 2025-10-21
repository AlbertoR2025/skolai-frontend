import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sfuswdvazwtnqsfviwae.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmdXN3ZHZhend0bnFzZnZpd2FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTE0MTIsImV4cCI6MjA3NjYyNzQxMn0.CbmzY6dtBx4TCrevuedli0O1oYyYBB09v7j-7o0KL2E'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

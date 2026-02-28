import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://httxcjzsuvwfxiqfkldp.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dHhjanpzdXZ3ZnhpcWZrbGRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzYyODQsImV4cCI6MjA4Nzg1MjI4NH0.niwuwambKrnfTO5cEC4l_EZNs2Gm8pz1zh5pvMGD6T8'

export const supabase = createClient(supabaseUrl, supabaseKey)

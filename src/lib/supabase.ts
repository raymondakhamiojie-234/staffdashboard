import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://isqpgnnhvuzkfkgrmyui.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzcXBnbm5odnV6a2ZrZ3JteXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MzgwNjUsImV4cCI6MjEwMTExNDA2NX0.7wz8Kce-Fzo7yh9g3jZkVnSGWaTgB_BmvbhxpyjSGTk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadFile(file: File, bucket = 'uploads', customPath?: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = customPath || `${fileName}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file);

  if (error) {
    throw new Error('Error uploading file: ' + error.message);
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return publicUrlData.publicUrl;
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url-for-build.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

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

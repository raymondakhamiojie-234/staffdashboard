import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';

export default async function Home() {
  const token = (await cookies()).get('auth_token')?.value;

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      if (payload.isAdmin) {
        redirect('/admin/dashboard');
      } else {
        redirect('/staff/dashboard');
      }
    }
  }

  // If no token or invalid token, redirect to login
  redirect('/login');
}

// ============================================================
// Nutri Atende — Root Page
// Redirects to dashboard or login
// ============================================================

import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Simple redirect: if user has session cookie, go to dashboard, otherwise login
  // Middleware handles the actual auth check
  redirect('/login');
}

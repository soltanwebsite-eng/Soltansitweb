import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OWNER_EMAIL = 'soltanphene3@gmail.com';

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  try {
    const setupToken = request.headers.get('x-sultan-setup-token') || '';
    const expectedToken = process.env.SULTAN_OWNER_SETUP_TOKEN || '';
    if (!expectedToken || !safeEqual(setupToken, expectedToken)) {
      return NextResponse.json({ error: 'رمز الإعداد غير صحيح.' }, { status: 403 });
    }

    const body = await request.json();
    const password = typeof body.password === 'string' ? body.password : '';
    if (password.length < 12) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 12 حرفاً على الأقل.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'إعداد الخادم ناقص: يلزم ضبط مفتاح Supabase الإداري في Render.' }, { status: 503 });
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: usersData, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) throw listError;
    const users = usersData.users;
    if (users.some(user => user.app_metadata?.role === 'owner' && user.email?.toLowerCase() !== OWNER_EMAIL)) {
      return NextResponse.json({ error: 'يوجد حساب مالك آخر بالفعل. أوقف الإعداد الأولي وتواصل مع المسؤول.' }, { status: 409 });
    }

    const existing = users.find(user => user.email?.toLowerCase() === OWNER_EMAIL);
    if (existing) {
      if (existing.app_metadata?.role === 'owner') {
        return NextResponse.json({ error: 'حساب المالك مهيأ بالفعل. انتقل إلى صفحة تسجيل الدخول.' }, { status: 409 });
      }
      const { error } = await admin.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
        app_metadata: { ...existing.app_metadata, role: 'owner' }
      });
      if (error) throw error;
    } else {
      const { error } = await admin.auth.admin.createUser({
        email: OWNER_EMAIL,
        password,
        email_confirm: true,
        app_metadata: { role: 'owner' }
      });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, message: 'تم إنشاء حساب المالك وتعيين صلاحية الإدارة بنجاح. يمكنك الآن تسجيل الدخول.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'تعذر إكمال إعداد المالك.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

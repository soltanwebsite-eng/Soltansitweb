'use client';
import { useState, type FormEvent } from 'react';

export default function SetupOwner() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password.length < 12) { setError('كلمة المرور يجب أن تكون 12 حرفاً على الأقل.'); return; }
    if (password !== confirm) { setError('كلمتا المرور غير متطابقتين.'); return; }
    if (!setupToken.trim()) { setError('أدخل رمز الإعداد الذي تم ضبطه للموقع.'); return; }
    setBusy(true);
    try {
      const response = await fetch('/api/admin/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sultan-setup-token': setupToken.trim() },
        body: JSON.stringify({ password })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'تعذر إنشاء حساب المالك.');
      setMessage(result.message || 'تم إعداد حساب المالك. يمكنك تسجيل الدخول الآن.');
      setPassword('');
      setConfirm('');
      setSetupToken('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر إنشاء الحساب.');
    } finally {
      setBusy(false);
    }
  }

  return <main className="shell section" style={{ maxWidth: 560 }}>
    <div className="panel">
      <span className="eyebrow">إعداد آمن لمرة واحدة</span>
      <h1>إنشاء حساب مالك السلطان</h1>
      <p className="hint">هذا الإجراء ينشئ الحساب مباشرة عبر الخادم ويمنحه صلاحية المالك. لا تُرسل رمز الإعداد أو كلمة المرور لأي شخص.</p>
      <div className="field"><label>بريد المالك</label><input value="soltanphene3@gmail.com" readOnly dir="ltr" /></div>
      <form onSubmit={submit}>
        <div className="field" style={{ marginTop: 14 }}>
          <label>رمز الإعداد السري</label>
          <input type="password" autoComplete="off" required value={setupToken} onChange={e => setSetupToken(e.target.value)} placeholder="أدخل رمز الإعداد" dir="ltr" />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label>كلمة المرور الجديدة</label>
          <input type="password" minLength={12} autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="12 حرفاً على الأقل" />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label>تأكيد كلمة المرور</label>
          <input type="password" minLength={12} autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="أعد كتابة كلمة المرور" />
        </div>
        <button className="btn" disabled={busy}>{busy ? 'جارٍ إعداد الحساب…' : 'إنشاء حساب المالك'}</button>
      </form>
      {message && <div className="result">{message}<p><a href="/admin">الانتقال إلى لوحة الإدارة</a></p></div>}
      {error && <div className="result error">{error}</div>}
      <p className="hint" style={{ marginTop: 14 }}>صفحة الإعداد محمية برمز سري محفوظ في إعدادات الخادم، ولا تستخدم إرسال رسائل التأكيد بالبريد.</p>
    </div>
  </main>;
}

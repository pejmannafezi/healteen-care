# راه‌اندازی Supabase برای Healteen Care (قدم‌به‌قدم)

این راهنما کاملاً مبتدی‌پسند است. تقریباً ۱۰ دقیقه طول می‌کشد.

---

## قدم ۱ — ساخت حساب و پروژه

1. برو به **https://supabase.com** و روی **Start your project** بزن. با گوگل یا گیت‌هاب وارد شو (رایگان است).
2. روی **New project** بزن.
3. این فیلدها را پر کن:
   - **Name:** `healteen-care`
   - **Database Password:** یک رمز قوی بساز و **جایی امن ذخیره‌اش کن** (بعداً ممکن است لازم شود).
   - **Region:** نزدیک‌ترین به آمریکا را انتخاب کن، مثلاً **East US (North Virginia)**.
4. **Create new project** را بزن و ~۲ دقیقه صبر کن تا آماده شود.

---

## قدم ۲ — برداشتن کلیدها (مهم‌ترین قدم)

از منوی چپ برو به: **Project Settings (آیکون چرخ‌دنده) → API**.

سه چیز را کپی کن:

| در صفحه با این اسم | کجا استفاده می‌شود |
|---|---|
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` |
| **Project API keys → `anon` `public`** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **Project API keys → `service_role` `secret`** | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ کلید **service_role** مثل کلید گاوصندوق است. هیچ‌وقت جایی عمومی نگذار. فقط در فایل `.env.local` (که هیچ‌وقت در گیت نمی‌رود).

این سه مقدار را برای من بفرست (یا خودت در فایل `.env.local` بگذار — راهنمای فایل در پایین).

---

## قدم ۳ — اجرای ساختار دیتابیس (Migrations)

از منوی چپ برو به **SQL Editor → New query**. حالا محتوای این سه فایل را **به همین ترتیب** اجرا کن
(هر کدام را باز کن، همه را کپی کن، در ادیتور پیست کن، **Run** بزن، بعد فایل بعدی):

1. `supabase/migrations/0001_schema.sql`  (جدول‌ها)
2. `supabase/migrations/0002_rls.sql`     (امنیت سطر-محور)
3. `supabase/migrations/0003_triggers_seed.sql` (ساخت خودکار پروفایل + داده‌های اولیه)

اگر پیام سبز «Success» دیدی یعنی درست شد. (من می‌توانم این کار را هم برایت اتوماتیک کنم — پایین را ببین.)

---

## قدم ۴ — تنظیمات احراز هویت (ایمیل)

برو به **Authentication → Sign In / Providers** و مطمئن شو **Email** روشن است.

سپس **Authentication → URL Configuration**:
- **Site URL:** فعلاً `http://localhost:3000`
- **Redirect URLs:** این دو را اضافه کن:
  - `http://localhost:3000/api/auth/confirm`
  - `http://localhost:3000/**`

(وقتی روی Vercel منتشر کردیم، آدرس واقعی را هم اضافه می‌کنیم.)

---

## قدم ۵ — ساخت فایل `.env.local`

در پوشه‌ی اصلی پروژه یک فایل به اسم `.env.local` بساز و این‌ها را بگذار
(از روی `.env.example` کپی کن و مقدارها را پر کن):

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...        ← Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   ← anon public key
SUPABASE_SERVICE_ROLE_KEY=...       ← service_role secret key
```

> اگر راحت‌تری، فقط این سه مقدار را برای من بفرست؛ خودم فایل را می‌سازم.

---

## قدم ۶ — ادمین کردن حساب خودت

بعد از اینکه در سایت ثبت‌نام کردی، یک‌بار این را در **SQL Editor** اجرا کن تا حسابت ادمین شود
(ایمیلت را جایگزین کن):

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'YOUR_EMAIL@example.com');
```

---

## بعدش چی؟

وقتی این سه کلید را داشته باشم:
- فایل `.env.local` را می‌سازم،
- در صورت تمایل، migrationها را برایت اجرا می‌کنم،
- احراز هویت را زنده تست می‌کنیم (ثبت‌نام/ورود/خروج)،
- و می‌رویم سراغ فروشگاه و صفحه‌ی محصول (M3).

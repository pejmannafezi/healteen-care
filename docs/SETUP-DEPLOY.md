# انتشار Healteen Care روی Vercel (قدم‌به‌قدم)

سایت آماده‌ی انتشاره و یک commit گیت هم ساخته شده. مسیر استاندارد: **GitHub → Vercel**.

---

## قدم ۱ — ساخت مخزن خالی در GitHub
1. برو به **https://github.com/new**
2. **Repository name:** `healteen-care`
3. **Private** را انتخاب کن (توصیه‌شده)
4. هیچ گزینه‌ای را تیک نزن (نه README، نه .gitignore، نه License) — باید **خالی** باشد
5. **Create repository** را بزن
6. آدرس مخزن را کپی کن (مثل `https://github.com/USERNAME/healteen-care.git`)

## قدم ۲ — فرستادن کد به GitHub
دو راه:
- **راه آسان (به من بسپار):** آدرس مخزن + یک **Personal Access Token** بده تا من push کنم.
  توکن را از اینجا بساز: **github.com → Settings → Developer settings → Personal access tokens →
  Fine-grained tokens → Generate** (دسترسی: فقط همین مخزن، Contents = Read and write).
- **راه دستی:** با **GitHub Desktop** پوشه‌ی پروژه را Publish کن.

## قدم ۳ — اتصال به Vercel
1. برو به **https://vercel.com** → **Sign Up / Log in** با **GitHub**
2. **Add New… → Project**
3. مخزن `healteen-care` را **Import** کن
4. Framework خودش **Next.js** را تشخیص می‌دهد — دست نزن

## قدم ۴ — افزودن Environment Variables (مهم‌ترین قدم)
در صفحه‌ی Import، بخش **Environment Variables**، این‌ها را اضافه کن (از فایل `.env.local`):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | فعلاً خالی بگذار؛ بعد از Deploy آدرس واقعی Vercel را بگذار |
| `NEXT_PUBLIC_SUPABASE_URL` | https://fbzututqtrtebzwuttvv.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sb_publishable_… |
| `SUPABASE_SERVICE_ROLE_KEY` | sb_secret_… |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | pk_test_… |
| `STRIPE_SECRET_KEY` | sk_test_… |
| `STRIPE_WEBHOOK_SECRET` | بعد از قدم ۶ پر می‌شود |
| `HEALTEEN_ANTHROPIC_KEY` | sk-ant-… |
| `HEALTEEN_SHIPPO_TOKEN` | shippo_test_… |
| `HEALTEEN_RESEND_KEY` | (اختیاری، اگر ایمیل می‌خواهی) |
| `EMAIL_FROM` | Healteen Care <onboarding@resend.dev> |

> همه را برای محیط **Production** (و در صورت تمایل Preview) اضافه کن.

## قدم ۵ — Deploy
**Deploy** را بزن. ~۲ دقیقه بعد، یک آدرس مثل `https://healteen-care-xxxx.vercel.app` می‌گیری.
- این آدرس را در متغیر `NEXT_PUBLIC_SITE_URL` (Vercel → Settings → Environment Variables) بگذار و یک‌بار **Redeploy** کن.

## قدم ۶ — تنظیمات بعد از انتشار
1. **Supabase → Authentication → URL Configuration:**
   - Site URL: آدرس Vercel
   - Redirect URLs: `https://<vercel-url>/api/auth/confirm` و `https://<vercel-url>/**`
2. **Stripe → Developers → Webhooks → Add endpoint:**
   - URL: `https://<vercel-url>/api/webhooks/stripe`
   - Events: `checkout.session.completed`
   - بعد از ساخت، **Signing secret** (`whsec_…`) را کپی و در Vercel به `STRIPE_WEBHOOK_SECRET` بده → Redeploy
3. **Shippo → Webhooks (اختیاری):**
   - URL: `https://<vercel-url>/api/webhooks/shippo`

## قدم ۷ — تست نهایی روی دامنه‌ی واقعی
- باز کردن سایت روی آدرس Vercel، یک خرید تستی، چت پشتیبانی، و نصب به‌عنوان اپ (PWA) روی گوشی.

---

> 🔒 امنیت: همه‌ی کلیدها فقط در Env Vars هستند (نه در کد). کلیدهای حساس (DB password، service_role،
> و کلیدهایی که در چت رد و بدل شد) را قبل از راه‌اندازی نهاییِ واقعی **rotate** کن.

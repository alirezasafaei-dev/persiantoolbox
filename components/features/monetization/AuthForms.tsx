'use client';

import { Card, Button } from '@/components/ui';
import Input from '@/shared/ui/Input';
import Link from 'next/link';

type AuthTab = 'login' | 'register';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

interface AuthFormsProps {
  activeTab: AuthTab;
  setActiveTab: (tab: AuthTab) => void;
  authError: string | null;
  loginEmail: string;
  setLoginEmail: (v: string) => void;
  loginPassword: string;
  setLoginPassword: (v: string) => void;
  showLoginPassword: boolean;
  setShowLoginPassword: (v: boolean) => void;
  loginErrors: { email?: string; password?: string };
  touchedFields: Record<string, boolean>;
  registerEmail: string;
  setRegisterEmail: (v: string) => void;
  registerPassword: string;
  setRegisterPassword: (v: string) => void;
  registerConfirmPassword: string;
  setRegisterConfirmPassword: (v: string) => void;
  showRegisterPassword: boolean;
  setShowRegisterPassword: (v: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (v: boolean) => void;
  registerErrors: { email?: string; password?: string; confirmPassword?: string };
  registerSuccess: boolean;
  passwordStrength: PasswordStrength;
  showPasswordStrength: boolean;
  handleLogin: () => Promise<void>;
  handleRegister: () => Promise<void>;
  markTouched: (field: string) => void;
  loginLoading: boolean;
  registerLoading: boolean;
}

export default function AuthForms({
  activeTab,
  setActiveTab,
  authError,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  showLoginPassword,
  setShowLoginPassword,
  loginErrors,
  touchedFields,
  registerEmail,
  setRegisterEmail,
  registerPassword,
  setRegisterPassword,
  registerConfirmPassword,
  setRegisterConfirmPassword,
  showRegisterPassword,
  setShowRegisterPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  registerErrors,
  registerSuccess,
  passwordStrength,
  showPasswordStrength,
  handleLogin,
  handleRegister,
  markTouched,
  loginLoading,
  registerLoading,
}: AuthFormsProps) {
  return (
    <div className="space-y-6 max-w-lg mx-auto px-4">
      <section className="text-center py-4">
        <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">
          {activeTab === 'login' ? 'ورود به حساب' : 'ایجاد حساب جدید'}
        </h1>
        <p className="text-[var(--text-secondary)] mt-2 text-sm">
          {activeTab === 'login'
            ? 'برای فعال‌سازی تاریخچه کارها، وارد شوید.'
            : 'حساب بسازید و از امکانات بیشتر بهره‌مند شوید.'}
        </p>
      </section>

      <Card className="p-6 md:p-8">
        <div className="flex border-b border-[var(--border-light)] mb-6">
          <button
            type="button"
            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${
              activeTab === 'login'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            onClick={() => {
              setActiveTab('login');
            }}
          >
            ورود
          </button>
          <button
            type="button"
            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${
              activeTab === 'register'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            onClick={() => {
              setActiveTab('register');
            }}
          >
            ثبت‌نام
          </button>
        </div>

        {authError ? (
          <div
            role="alert"
            className="mb-4 p-3 rounded-[var(--radius-md)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-sm text-[var(--color-danger)]"
          >
            {authError}
          </div>
        ) : null}

        {activeTab === 'login' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <Input
              label="ایمیل"
              type="email"
              dir="ltr"
              placeholder="example@email.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              onBlur={() => markTouched('loginEmail')}
              {...(touchedFields['loginEmail'] && loginErrors.email
                ? { error: loginErrors.email }
                : {})}
            />
            <Input
              label="رمز عبور"
              type={showLoginPassword ? 'text' : 'password'}
              dir="ltr"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              onBlur={() => markTouched('loginPassword')}
              {...(touchedFields['loginPassword'] && loginErrors.password
                ? { error: loginErrors.password }
                : {})}
              endAction={
                <button
                  type="button"
                  tabIndex={-1}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  aria-label={showLoginPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
                >
                  {showLoginPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              }
            />
            <Button type="submit" fullWidth isLoading={loginLoading}>
              ورود
            </Button>
          </form>
        )}

        {activeTab === 'register' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
            className="space-y-4"
          >
            {registerSuccess ? (
              <div
                role="status"
                className="p-3 rounded-[var(--radius-md)] bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 text-sm text-[var(--color-success)]"
              >
                ثبت‌نام با موفقیت انجام شد. در حال انتقال به حساب کاربری...
              </div>
            ) : null}
            <Input
              label="ایمیل"
              type="email"
              dir="ltr"
              placeholder="example@email.com"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              onBlur={() => markTouched('registerEmail')}
              {...(touchedFields['registerEmail'] && registerErrors.email
                ? { error: registerErrors.email }
                : {})}
            />
            <div>
              <Input
                label="رمز عبور"
                type={showRegisterPassword ? 'text' : 'password'}
                dir="ltr"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                onBlur={() => markTouched('registerPassword')}
                {...(touchedFields['registerPassword'] && registerErrors.password
                  ? { error: registerErrors.password }
                  : {})}
                endAction={
                  <button
                    type="button"
                    tabIndex={-1}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    aria-label={showRegisterPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
                  >
                    {showRegisterPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                }
              />
              {showPasswordStrength ? (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-colors"
                        style={{
                          backgroundColor:
                            i < passwordStrength.score
                              ? passwordStrength.color
                              : 'var(--border-light)',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: passwordStrength.color }}>
                    قدرت رمز: {passwordStrength.label}
                  </p>
                </div>
              ) : null}
            </div>
            <Input
              label="تکرار رمز عبور"
              type={showConfirmPassword ? 'text' : 'password'}
              dir="ltr"
              value={registerConfirmPassword}
              onChange={(e) => setRegisterConfirmPassword(e.target.value)}
              onBlur={() => markTouched('registerConfirmPassword')}
              {...(touchedFields['registerConfirmPassword'] && registerErrors.confirmPassword
                ? { error: registerErrors.confirmPassword }
                : {})}
              endAction={
                <button
                  type="button"
                  tabIndex={-1}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
                >
                  {showConfirmPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              }
            />
            <Button type="submit" fullWidth isLoading={registerLoading}>
              ثبت‌نام
            </Button>
          </form>
        )}
      </Card>

      <p className="text-center text-xs text-[var(--text-muted)]">
        با {activeTab === 'login' ? 'ورود' : 'ثبت‌نام'}، شما{' '}
        <Link href="/terms" className="underline hover:text-[var(--color-primary)]">
          شرایط استفاده
        </Link>{' '}
        را می‌پذیرید.
      </p>
    </div>
  );
}

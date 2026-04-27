"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function LoginScreen() {
  return (
    <div className="flex min-h-screen bg-[#0F0F0F]">
      <div className="hidden w-full max-w-[46%] flex-col justify-between border-r border-[#1E1E1E] bg-[#121212] p-10 lg:flex">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#A78BFA]/20 bg-[#A78BFA]/10 px-4 py-1.5 text-[11px] font-medium text-[#C4B5FD]">
            <Sparkles className="h-3.5 w-3.5" />
            AI SMM Workspace
          </div>
          <h1 className="max-w-lg text-4xl font-semibold leading-tight text-white">
            Вход для SMM-специалистов и руководителей
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#8B93A7]">
            Авторизуйтесь по email и паролю, чтобы открыть личный кабинет, отчёты и клиентские рабочие пространства с доступом по вашей роли.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-[#1E1E1E] bg-[#171717] p-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#38BDF8]/20 bg-[#38BDF8]/10 text-[#38BDF8]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Роли и доступ</h3>
            <p className="mt-2 text-sm text-[#8B93A7]">
              SMM-специалист видит только свой кабинет, а руководитель — все личные кабинеты и отчёты команды.
            </p>
          </div>

          <div className="rounded-3xl border border-[#1E1E1E] bg-[#171717] p-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#34D399]/20 bg-[#34D399]/10 text-[#34D399]">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Персональное сохранение</h3>
            <p className="mt-2 text-sm text-[#8B93A7]">
              Все действия в личном кабинете будут сохраняться за авторизованным специалистом.
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md rounded-[32px] border border-[#1E1E1E] bg-[#151515] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-8">
          <div className="mb-6 lg:hidden">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#A78BFA]/20 bg-[#A78BFA]/10 px-3 py-1 text-[11px] font-medium text-[#C4B5FD]">
              <Sparkles className="h-3.5 w-3.5" />
              AI SMM Workspace
            </div>
            <h1 className="text-2xl font-semibold text-white">Вход в систему</h1>
            <p className="mt-2 text-sm text-[#8B93A7]">
              Авторизуйтесь, чтобы открыть свой кабинет и рабочие инструменты.
            </p>
          </div>

          <Auth
            supabaseClient={supabase}
            providers={[]}
            theme="dark"
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#A78BFA",
                    brandAccent: "#8B5CF6",
                    defaultButtonBackground: "#1A1A1A",
                    defaultButtonBackgroundHover: "#202020",
                    defaultButtonBorder: "#2A2A2A",
                    defaultButtonText: "#FFFFFF",
                    inputBackground: "#101010",
                    inputBorder: "#262626",
                    inputBorderHover: "#3A3A3A",
                    inputBorderFocus: "#A78BFA",
                    inputText: "#FFFFFF",
                    inputLabelText: "#C9D1E1",
                    inputPlaceholder: "#6B7280",
                    messageText: "#F9FAFB",
                    messageTextDanger: "#FCA5A5",
                    anchorTextColor: "#7DD3FC",
                    anchorTextHoverColor: "#BAE6FD",
                  },
                  radii: {
                    borderRadiusButton: "16px",
                    buttonBorderRadius: "16px",
                    inputBorderRadius: "16px",
                  },
                  space: {
                    buttonPadding: "12px 14px",
                    inputPadding: "12px 14px",
                  },
                },
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: "Email",
                  password_label: "Пароль",
                  email_input_placeholder: "you@example.com",
                  password_input_placeholder: "Введите пароль",
                  button_label: "Войти",
                  loading_button_label: "Вход...",
                  link_text: "Уже есть аккаунт? Войти",
                },
                sign_up: {
                  email_label: "Email",
                  password_label: "Пароль",
                  email_input_placeholder: "you@example.com",
                  password_input_placeholder: "Придумайте пароль",
                  button_label: "Зарегистрироваться",
                  loading_button_label: "Регистрация...",
                  link_text: "Нет аккаунта? Зарегистрироваться",
                },
                forgotten_password: {
                  email_label: "Email",
                  password_label: "Пароль",
                  email_input_placeholder: "you@example.com",
                  button_label: "Отправить ссылку",
                  loading_button_label: "Отправка...",
                  link_text: "Забыли пароль?",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
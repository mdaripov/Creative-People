export function getReadableAuthError(error: unknown) {
  if (!error) return "Произошла неизвестная ошибка.";

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object") {
    const maybeError = error as {
      message?: unknown;
      error_description?: unknown;
      msg?: unknown;
      code?: unknown;
    };

    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message;
    }

    if (
      typeof maybeError.error_description === "string" &&
      maybeError.error_description.trim()
    ) {
      return maybeError.error_description;
    }

    if (typeof maybeError.msg === "string" && maybeError.msg.trim()) {
      return maybeError.msg;
    }

    if (maybeError.code === "email_not_confirmed") {
      return "Почта ещё не подтверждена.";
    }
  }

  return "Не удалось выполнить действие. Попробуйте ещё раз.";
}
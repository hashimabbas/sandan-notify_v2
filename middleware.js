export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/",
    "/data_showing",
    "/rent_receivable_showing",
    "/send_text_message_showing",
    "/register",
    "/pages/users_managment",
  ],
};
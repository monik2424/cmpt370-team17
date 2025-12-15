export { middlewareAuth as middleware } from "@/lib/auth-middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/events/:path*", "/profile/:path*"],
};
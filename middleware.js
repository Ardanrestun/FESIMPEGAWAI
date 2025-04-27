import { NextResponse } from "next/server";

export function middleware(req) {
  const role = req.cookies.get("role")?.value;
  const menusRaw = req.cookies.get("menus")?.value;

  console.log("Role dari cookie:", role);

  const pathname = req.nextUrl.pathname;

  if (!role || !menusRaw) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  let menus = [];

  try {
    menus = JSON.parse(menusRaw);
  } catch (error) {
    console.error("Gagal parse cookie menus:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const hasAccess = menus.some((menu) => {
    const matchParent = menu.route === pathname && menu.roles.includes(role);
    const matchChild = menu.children?.some(
      (child) => child.route === pathname && child.roles.includes(role)
    );
    return matchParent || matchChild;
  });

  if (!hasAccess) {
    return NextResponse.redirect(new URL("/404", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/setting/:path*", "/employee/:path*"],
};

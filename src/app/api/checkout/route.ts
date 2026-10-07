import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, PRODUCTS } from "@/lib/creem";

/**
 * SOP-3H-05: Pro 订阅 + 模板购买 checkout
 *
 * GET /api/checkout?productId=prod_xxx[&templateSlug=pet-shop]
 * 1. 解析 productId/templateSlug（SOP-3V-10：上移到 auth 检查之前，未登录回跳要带购买意图）
 * 2. 未登录 → 302 /auth/login?next=/api/checkout?productId=…[&templateSlug=…]，
 *    登录成功后整页跳回本路由重新进入（重复进入仅新建 Creem 会话，无扣费与状态污染）
 * 3. 调 createCheckoutSession（metadata.referenceId = userId；模板购买额外带 templateSlug）
 * 4. 302 到 Creem 结账页
 *
 * 凭据未配置（CREEM_API_KEY 缺失）→ 503 提示支付未启用。
 */
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  const templateSlug = req.nextUrl.searchParams.get("templateSlug");
  if (!productId) {
    return NextResponse.json(
      { error: "Missing productId" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/auth/login", req.url);
    const next = `/api/checkout?productId=${productId}${templateSlug ? `&templateSlug=${templateSlug}` : ""}`;
    loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl);
  }

  // 占位 productId 校验（env 未配置时 PRODUCTS 值为空）
  const knownProduct = Object.values(PRODUCTS).includes(productId);
  if (!knownProduct) {
    return NextResponse.json(
      { error: "Unknown productId. Creem products not configured yet." },
      { status: 503 },
    );
  }

  try {
    const checkout = await createCheckoutSession({
      productId,
      userId: user.id,
      email: user.email ?? "",
      // 模板购买传 templateSlug，webhook onCheckoutCompleted 据此写 purchased_templates
      ...(templateSlug ? { metadata: { templateSlug } } : {}),
    });
    const checkoutUrl =
      // CheckoutEntity.checkoutUrl（creem SDK 实测字段）
      (checkout as { checkoutUrl?: string }).checkoutUrl ?? null;
    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "No checkout URL returned by Creem" },
        { status: 502 },
      );
    }
    return NextResponse.redirect(checkoutUrl);
  } catch (err) {
    console.error("[/api/checkout] createCheckoutSession failed:", err);
    return NextResponse.json(
      { error: "Checkout failed. Is CREEM_API_KEY configured?" },
      { status: 503 },
    );
  }
}

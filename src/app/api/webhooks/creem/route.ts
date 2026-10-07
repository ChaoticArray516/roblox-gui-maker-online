import { Webhook } from "@creem_io/nextjs";
import { getServiceClient } from "@/lib/supabase/service";

/**
 * SOP-3H-06: Creem webhook
 *
 * 签名校验由 Webhook() 工厂处理（raw body + HMAC）。
 * 幂等：subscriptions.upsert onConflict 'provider_event_id'（schema unique 约束）。
 * plan 同步：paid/active → profiles.plan='Pro'；expired/canceled → profiles.plan='Free'。
 * 模板购买：onCheckoutCompleted 写 purchased_templates（onConflict 'user_id,template_slug'）。
 *
 * 凭据未配置（CREEM_WEBHOOK_SECRET 缺失）时工厂会在启动时抛错——
 * 部署时必须在 Vercel env 注入 webhook secret。
 */
export const POST = Webhook({
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,

  // 订阅付费/激活 → 升 Pro
  onSubscriptionPaid: async ({
    webhookId,
    id,
    customer,
    status,
    current_period_start_date,
    current_period_end_date,
    metadata,
  }) => {
    const supabase = getServiceClient();
    const userId = metadata?.referenceId as string | undefined;
    if (!userId) {
      console.warn("[Creem webhook] onSubscriptionPaid: missing referenceId");
      return;
    }

    const { error: subError } = await supabase.from("subscriptions").upsert(
      {
        user_id: userId,
        plan: "Pro",
        status,
        provider: "creem",
        provider_subscription_id: id,
        provider_customer_id:
          typeof customer === "string" ? customer : customer.id,
        provider_event_id: webhookId,
        current_period_start: current_period_start_date?.toISOString() ?? null,
        current_period_end: current_period_end_date?.toISOString() ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider_event_id" },
    );
    if (subError) {
      console.error("[Creem webhook] onSubscriptionPaid upsert:", subError);
      throw subError;
    }

    // 同步 profiles.plan = Pro
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ plan: "Pro", updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (profileError)
      console.error("[Creem webhook] onSubscriptionPaid profile:", profileError);

    console.log(`[Creem webhook] Subscription paid → Pro for ${userId}`);
  },

  onSubscriptionActive: async ({
    webhookId,
    id,
    customer,
    status,
    current_period_start_date,
    current_period_end_date,
    metadata,
  }) => {
    const supabase = getServiceClient();
    const userId = metadata?.referenceId as string | undefined;
    if (!userId) return;

    const { error } = await supabase.from("subscriptions").upsert(
      {
        user_id: userId,
        plan: "Pro",
        status,
        provider: "creem",
        provider_subscription_id: id,
        provider_customer_id:
          typeof customer === "string" ? customer : customer.id,
        provider_event_id: webhookId,
        current_period_start: current_period_start_date?.toISOString() ?? null,
        current_period_end: current_period_end_date?.toISOString() ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider_event_id" },
    );
    if (error) console.error("[Creem webhook] onSubscriptionActive:", error);

    await supabase
      .from("profiles")
      .update({ plan: "Pro", updated_at: new Date().toISOString() })
      .eq("id", userId);
  },

  // 订阅过期/取消 → 降 Free
  onSubscriptionExpired: async ({ webhookId, id, metadata }) => {
    const supabase = getServiceClient();
    const userId = metadata?.referenceId as string | undefined;
    if (!userId) return;

    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: "expired",
        provider_event_id: webhookId,
        updated_at: new Date().toISOString(),
      })
      .eq("provider_subscription_id", id)
      .eq("user_id", userId);
    if (error) console.error("[Creem webhook] onSubscriptionExpired:", error);

    await supabase
      .from("profiles")
      .update({ plan: "Free", updated_at: new Date().toISOString() })
      .eq("id", userId);
  },

  onSubscriptionCanceled: async ({ webhookId, id, metadata }) => {
    const supabase = getServiceClient();
    const userId = metadata?.referenceId as string | undefined;
    if (!userId) return;

    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        provider_event_id: webhookId,
        updated_at: new Date().toISOString(),
      })
      .eq("provider_subscription_id", id)
      .eq("user_id", userId);
    if (error) console.error("[Creem webhook] onSubscriptionCanceled:", error);

    await supabase
      .from("profiles")
      .update({ plan: "Free", updated_at: new Date().toISOString() })
      .eq("id", userId);
  },

  // checkout 完成 — 一次性模板购买写 purchased_templates（订阅也会触发，但有 subscription 字段可区分）
  onCheckoutCompleted: async ({ metadata, product }) => {
    const supabase = getServiceClient();
    const userId = metadata?.referenceId as string | undefined;
    const templateSlug = metadata?.templateSlug as string | undefined;
    if (!userId || !templateSlug) return;

    const orderId = product?.id ?? null;
    const { error } = await supabase.from("purchased_templates").upsert(
      {
        user_id: userId,
        template_slug: templateSlug,
        creem_order_id: orderId,
        purchased_at: new Date().toISOString(),
      },
      { onConflict: "user_id,template_slug" },
    );
    if (error)
      console.error("[Creem webhook] onCheckoutCompleted:", error);
    else
      console.log(
        `[Creem webhook] Template purchased: ${templateSlug} for ${userId}`,
      );
  },
});

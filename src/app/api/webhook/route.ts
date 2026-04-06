import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";

async function grantCredit(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id;
  if (!userId) return;

  // Skip if payment not actually completed (boleto/pix pending)
  if (session.payment_status === "unpaid") return;

  const supabase = createServiceClient();

  // Idempotency: skip if credit already exists for this session
  const { data: existing } = await supabase
    .from("laudo_credits")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase.from("laudo_credits").insert({
    user_id: userId,
    stripe_session_id: session.id,
  });

  if (error) {
    console.error("[webhook] CRITICAL: credit insert failed", { userId, sessionId: session.id, error });
    throw error; // Retorna 500 → Stripe retenta o webhook
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Sem assinatura" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    await grantCredit(session);
  }

  return NextResponse.json({ received: true });
}

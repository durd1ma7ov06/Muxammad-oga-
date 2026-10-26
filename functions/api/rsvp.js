const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

// Faqat kelin-kuyov uchun: /api/rsvp?key=ADMIN_KEY
export async function onRequestGet({ request, env }) {
  const key = new URL(request.url).searchParams.get("key");
  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY.trim()) return json({ error: "Ruxsat yo'q" }, 403);

  const { results } = await env.DB.prepare(
    "SELECT name, attending, guests, created_at FROM rsvp ORDER BY id DESC"
  ).all();
  const coming = results.filter(r => r.attending);
  return json({
    jami_javoblar: results.length,
    keladi: coming.length,
    mehmonlar_soni: coming.reduce((s, r) => s + r.guests, 0),
    kelolmaydi: results.length - coming.length,
    royxat: results,
  });
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "Noto'g'ri so'rov" }, 400); }

  const name = String(body.name || "").trim().slice(0, 60);
  const attending = body.attending ? 1 : 0;
  const guests = attending ? Math.min(20, Math.max(1, parseInt(body.guests, 10) || 1)) : 0;
  if (!name) return json({ error: "Ism kerak" }, 400);

  await env.DB.prepare("INSERT INTO rsvp (name, attending, guests) VALUES (?, ?, ?)")
    .bind(name, attending, guests).run();
  return json({ ok: true }, 201);
}

export async function onRequestGet({ env
}) {
  const now = Math.floor(Date.now() / 1000);

  const { results
  } = await env.DB.prepare(
    "SELECT * FROM posts WHERE expires_at > ? ORDER BY created_at DESC"
  )
    .bind(now)
    .all();

  return Response.json(results);
}

export async function onRequestPost(context) {
  const db = context.env.DB;

  try {
    const body = await context.request.json();
    const ip = context.request.headers.get("CF-Connecting-IP");

    // ⛔ Rate limit: 1 post per 30 seconds
    const cutoff = Math.floor(Date.now() / 1000) - 30;

    const recent = await db.prepare(
      "SELECT COUNT(*) as count FROM posts WHERE created_at > ? AND ip = ?"
    )
      .bind(cutoff, ip)
      .first();

    if (recent.count > 0) {
      return new Response("Too many posts", { status: 429 });
    }

    const { title, location, description, expires_at } = body;

    await db.prepare(
      `INSERT INTO posts (title, location, description, expires_at, ip)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(title, location, description, expires_at, ip)
      .run();

    return new Response("Created", { status: 201 });

  } catch (err) {
    return new Response(err.toString(), { status: 500 });
  }
}

export async function onRequestDelete(context) {
  const db = context.env.DB;

  const now = Math.floor(Date.now() / 1000);

  await db.prepare(
    "DELETE FROM posts WHERE expires_at <= ?"
  )
    .bind(now)
    .run();

  return new Response("Deleted expired posts");
}
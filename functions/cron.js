export async function onScheduled(event, env) {
    const now = Math.floor(Date.now() / 1000);

    await env.DB.prepare(
        "DELETE FROM posts WHERE expires_at <= ?"
    )
        .bind(now)
        .run();
}
import { useEffect, useState } from "react";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({
    title: "",
    location: "",
    description: "",
    expiresAt: ""
  });

  async function fetchPosts() {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data);
  }

  useEffect(() => {
    fetchPosts();
    const i = setInterval(fetchPosts, 10000);
    return () => clearInterval(i);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const expires_at = Math.floor(
      new Date(form.expiresAt).getTime() / 1000
    );

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: form.title,
        location: form.location,
        description: form.description,
        expires_at
      })
    });

    if (!res.ok) {
      alert("Error: " + (await res.text()));
      return;
    }

    setForm({
      title: "",
      location: "",
      description: "",
      expiresAt: ""
    });

    fetchPosts();
  }

  function timeLeft(exp) {
    const diff = exp - Math.floor(Date.now() / 1000);
    if (diff <= 0) return "expired";

    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins} min`;

    const hrs = Math.floor(mins / 60);
    return `${hrs} hr`;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">🍕 Free Food @ UMN</h1>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 rounded-xl shadow mb-6 space-y-3"
        >
          <input
            className="w-full border p-2 rounded"
            placeholder="What food?"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="Where?"
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="Details"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />

          <input
            type="datetime-local"
            className="w-full border p-2 rounded"
            value={form.expiresAt}
            onChange={e => setForm({ ...form, expiresAt: e.target.value })}
            required
          />

          <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Post
          </button>
        </form>

        {/* POSTS */}
        <div className="space-y-3">
          {posts.map(p => (
            <div
              key={p.id}
              className="bg-white p-4 rounded-xl shadow"
            >
              <div className="flex justify-between">
                <h3 className="font-semibold">{p.title}</h3>
                <span className="text-sm text-gray-500">
                  ⏳ {timeLeft(p.expires_at)}
                </span>
              </div>

              <p className="text-sm text-gray-600">📍 {p.location}</p>
              <p className="mt-1">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
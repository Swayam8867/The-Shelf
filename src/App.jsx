import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const SITE_NAME = "The Shelf";
const SITE_TAGLINE = "A small, curated list of things worth your time.";

// Change this to any secret word only you know.
// Visiting yoursite.com/?owner=SECRET_WORD is the only way the Admin button appears.
const SECRET_WORD = "shelf2026";

const emptyForm = { name: "", category: "", image: "", description: "", link: "" };

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const showAdminEntry =
    new URLSearchParams(window.location.search).get("owner") === SECRET_WORD;

  const [session, setSession] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();

    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) setError(error.message);
    else setProducts(data);
    setLoading(false);
  }

  async function signIn() {
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) {
      setLoginError(error.message);
    } else {
      setShowLogin(false);
      setLoginEmail("");
      setLoginPassword("");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(p) {
    setEditingId(p.id);
    setForm({ name: p.name, category: p.category, image: p.image || "", description: p.description || "", link: p.link });
    setShowForm(true);
  }

  async function saveProduct() {
    if (!form.name.trim() || !form.category.trim() || !form.link.trim()) return;
    setSaving(true);
    let dbError;
    if (editingId) {
      const { error } = await supabase.from("products").update(form).eq("id", editingId);
      dbError = error;
    } else {
      const { error } = await supabase.from("products").insert([form]);
      dbError = error;
    }
    setSaving(false);
    if (dbError) {
      alert("Couldn't save: " + dbError.message);
      return;
    }
    setShowForm(false);
    fetchProducts();
  }

  async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) alert("Couldn't delete: " + error.message);
    else fetchProducts();
  }

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];
  const visible = activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);
  const isAdmin = !!session;

  return (
    <div className="page">
      <header className="header">
        <div>
          <img src="/logo.jpg" alt="The Shelf" style={{ height: '56px' }} /> 
          <p className="site-tagline">{SITE_TAGLINE}</p>
        </div>
        {isAdmin ? (
          <button className="btn btn-outline" onClick={signOut}>Sign out</button>
        ) : showAdminEntry ? (
          <button className="btn btn-ghost" onClick={() => setShowLogin(true)}>Admin</button>
        ) : null}
      </header>

      {categories.length > 1 && (
        <div className="tabs">
          {categories.map((c) => (
            <button
              key={c}
              className={"tab" + (activeCategory === c ? " tab-active" : "")}
              onClick={() => setActiveCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="admin-bar">
          <button className="btn btn-accent" onClick={openAddForm}>+ Add product</button>
        </div>
      )}

      <main className="main">
        {loading ? (
          <p className="muted">Loading your shelf…</p>
        ) : error ? (
          <p className="muted">Couldn't load products: {error}</p>
        ) : visible.length === 0 ? (
          <div className="empty">
            <p>{products.length === 0 ? "Nothing on the shelf yet." : "Nothing in this category yet."}</p>
          </div>
        ) : (
          <div className="grid">
            {visible.map((p) => (
              <div key={p.id} className="card">
                <div className="card-image">
                  {p.image ? <img src={p.image} alt={p.name} /> : <div className="no-image" />}
                </div>
                <div className="card-body">
                  <span className="category-tag">{p.category}</span>
                  <h3 className="card-title">{p.name}</h3>
                  <p className="card-desc">{p.description}</p>
                  <a className="btn btn-dark" href={p.link} target="_blank" rel="noopener noreferrer sponsored">
                    Get it →
                  </a>
                  {isAdmin && (
                    <div className="card-admin">
                      <button className="link-btn" onClick={() => openEditForm(p)}>Edit</button>
                      <button className="link-btn link-danger" onClick={() => deleteProduct(p.id)}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Some links on this page are affiliate links. If you buy through them, we may earn a commission at no extra cost to you.</p>
      </footer>

      {showLogin && (
        <div className="modal-backdrop" onClick={() => setShowLogin(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Admin sign-in</h2>
            <label className="field-label">Email</label>
            <input className="fld" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
            <label className="field-label">Password</label>
            <input className="fld" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && signIn()} />
            {loginError && <p className="error-text">{loginError}</p>}
            <button className="btn btn-dark full" onClick={signIn}>Sign in</button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? "Edit product" : "Add product"}</h2>

            <label className="field-label">Product name</label>
            <input className="fld" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

            <label className="field-label">Category</label>
            <input className="fld" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />

            <label className="field-label">Image URL</label>
            <input className="fld" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />

            <label className="field-label">Description</label>
            <textarea className="fld" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <label className="field-label">Digistore24 affiliate link</label>
            <input className="fld" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />

            <button
              className="btn btn-accent full"
              disabled={saving || !form.name.trim() || !form.category.trim() || !form.link.trim()}
              onClick={saveProduct}
            >
              {saving ? "Saving…" : editingId ? "Save changes" : "Add to shelf"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

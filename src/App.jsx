import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

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

  // Simple page routing: "/" = shelf, "/product/<id>" = product page
  const [path, setPath] = useState(window.location.pathname);

  const [showAdminEntry] = useState(() => {
  const fromLink =
    new URLSearchParams(window.location.search).get("owner") === SECRET_WORD;
  try {
    if (fromLink) sessionStorage.setItem("shelf-owner", "1");
    return fromLink || sessionStorage.getItem("shelf-owner") === "1";
  } catch (e) {
    return fromLink;
  }
});

  const [session, setSession] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();

    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Keep the page in sync with the browser's back/forward buttons
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function go(to) {
    window.history.pushState({}, "", to);
    setPath(to);
    window.scrollTo(0, 0);
  }

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

  // Which page are we on?
  const productMatch = path.match(/^\/product\/([^/]+)/);
  const productId = productMatch ? productMatch[1] : null;
  const currentProduct = productId ? products.find((p) => String(p.id) === productId) : null;

  // Show the product name in the browser tab on product pages
  useEffect(() => {
    document.title = currentProduct ? currentProduct.name + " | The Shelf" : "The Shelf";
  }, [currentProduct]);

  return (
    <div className="page">
      <header className="header">
        <div>
          <a href="/" onClick={(e) => { e.preventDefault(); go("/"); }}>
            <img src="/logo.jpg" alt="The Shelf" style={{ height: "56px" }} />
          </a>
          <p className="site-tagline">{SITE_TAGLINE}</p>
        </div>
        {isAdmin ? (
          <button className="btn btn-outline" onClick={signOut}>Sign out</button>
        ) : showAdminEntry ? (
          <button className="btn btn-ghost" onClick={() => setShowLogin(true)}>Admin</button>
        ) : null}
      </header>

      {productId ? (
        /* ---------- PRODUCT PAGE ---------- */
        <main className="main">
          <button className="back-btn" onClick={() => go("/")}>← Back to shelf</button>

          {loading ? (
            <p className="muted">Loading…</p>
          ) : !currentProduct ? (
            <div className="empty">
              <p>This product couldn't be found.</p>
            </div>
          ) : (
            <div className="product-page">
              <div className="product-page-image">
                {currentProduct.image ? (
                  <img src={currentProduct.image} alt={currentProduct.name} />
                ) : (
                  <div className="no-image" />
                )}
              </div>
              <div className="product-page-info">
                <span className="category-tag">{currentProduct.category}</span>
                <h1 className="product-page-title">{currentProduct.name}</h1>
                {currentProduct.description && (
                  <p className="product-page-desc">{currentProduct.description}</p>
                )}
                <a
                  className="btn btn-dark buy-btn"
                  href={currentProduct.link}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                >
                  Buy now →
                </a>
              </div>
            </div>
          )}
        </main>
      ) : (
        /* ---------- SHELF (HOME) ---------- */
        <>
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
                  <div
                    key={p.id}
                    className="card card-clickable"
                    role="button"
                    tabIndex={0}
                    onClick={() => go("/product/" + p.id)}
                    onKeyDown={(e) => e.key === "Enter" && go("/product/" + p.id)}
                  >
                    <div className="card-image">
                      {p.image ? <img src={p.image} alt={p.name} /> : <div className="no-image" />}
                    </div>
                    <div className="card-body card-body-compact">
                      <h3 className="card-title card-title-compact">{p.name}</h3>
                      {isAdmin && (
                        <div className="card-admin">
                          <button
                            className="link-btn"
                            onClick={(e) => { e.stopPropagation(); openEditForm(p); }}
                          >
                            Edit
                          </button>
                          <button
                            className="link-btn link-danger"
                            onClick={(e) => { e.stopPropagation(); deleteProduct(p.id); }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </>
      )}

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

            <label className="field-label">Product image</label>
            <input
              className="fld"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                setUploading(true);
                const fileName = `${Date.now()}-${file.name}`;
                const { error } = await supabase.storage
                  .from("product-images")
                  .upload(fileName, file);
                if (error) {
                  alert("Upload failed: " + error.message);
                } else {
                  const { data } = supabase.storage
                    .from("product-images")
                    .getPublicUrl(fileName);
                  setForm((f) => ({ ...f, image: data.publicUrl }));
                }
                setUploading(false);
              }}
            />
            {uploading && <p className="muted" style={{ marginTop: 6 }}>Uploading…</p>}
            {form.image && !uploading && (
              <img src={form.image} alt="" style={{ marginTop: 8, height: 60, borderRadius: 6 }} />
            )}

            <label className="field-label">Description</label>
            <textarea className="fld" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <label className="field-label">Digistore24 affiliate link</label>
            <input className="fld" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />

            <button
              className="btn btn-accent full"
              disabled={saving || uploading || !form.name.trim() || !form.category.trim() || !form.link.trim()}
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

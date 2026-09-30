import { useEffect, useMemo, useState } from "react";
import {
  Routes, Route, Link, NavLink, useNavigate, useLocation, useParams
} from "react-router-dom";
import {
  ArrowRight, BookOpen, Bot, Check, ChevronRight, Clock3, Edit3,
  FileText, Hash, Home, LogIn, LogOut, Menu, PenLine, Plus, Search,
  Sparkles, Trash2, User, X, Wand2
} from "lucide-react";
import { api } from "./api";

const categories = ["All", "Technology", "Education", "Health", "Sports", "Lifestyle", "Business", "Travel", "Finance", "Entertainment"];

function App() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("blognest_token")) return setBooting(false);
    api.profile().then(setUser).catch(() => localStorage.removeItem("blognest_token")).finally(() => setBooting(false));
  }, []);

  const login = (token) => {
    localStorage.setItem("blognest_token", token);
    return api.profile().then(setUser);
  };
  const logout = () => {
    localStorage.removeItem("blognest_token");
    setUser(null);
  };

  if (booting) return <Splash />;

  return (
    <div className="app-shell">
      <Navbar user={user} logout={logout} />
      <main className="main-wrap">
        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs/:id" element={<BlogPage user={user} />} />
          <Route path="/login" element={<AuthPage mode="login" onLogin={login} />} />
          <Route path="/register" element={<AuthPage mode="register" onLogin={login} />} />
          <Route path="/write" element={<Protected user={user}><EditorPage /></Protected>} />
          <Route path="/write/:id" element={<Protected user={user}><EditorPage /></Protected>} />
          <Route path="/ai" element={<Protected user={user}><AIPage /></Protected>} />
          <Route path="/dashboard" element={<Protected user={user}><Dashboard user={user} /></Protected>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function Protected({ user, children }) {
  const location = useLocation();
  if (!user) return <NavigateToLogin from={location.pathname} />;
  return children;
}
function NavigateToLogin({ from }) {
  const navigate = useNavigate();
  useEffect(() => navigate("/login", { state: { from } }), [navigate, from]);
  return <Splash label="Opening secure sign in…" />;
}

function Splash({ label = "Loading BlogNest…" }) {
  return <div className="splash"><div className="brand-mark"><Sparkles size={22}/></div><strong>{label}</strong><div className="loader"/></div>;
}

function Navbar({ user, logout }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link className="brand" to="/">
          <span className="brand-icon"><Sparkles size={18}/></span>
          <span>Blog<span>Nest</span></span>
        </Link>
        <nav className={`nav-links ${open ? "open" : ""}`}>
          <NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/blogs" onClick={() => setOpen(false)}>Explore</NavLink>
          {user && <NavLink to="/dashboard" onClick={() => setOpen(false)}>Dashboard</NavLink>}
          {user && <NavLink to="/ai" onClick={() => setOpen(false)}><Sparkles size={15}/> AI Studio</NavLink>}
        </nav>
        <div className="nav-actions">
          {user ? <>
            <Link className="avatar" to="/dashboard" title="Profile">{initials(user.name)}</Link>
            <button className="icon-btn mobile-menu" onClick={() => setOpen(!open)}><Menu size={20}/></button>
            <button className="ghost-btn desktop-only" onClick={logout}><LogOut size={15}/> Logout</button>
          </> : <>
            <Link className="ghost-btn desktop-only" to="/login">Sign in</Link>
            <Link className="primary-btn small desktop-only" to="/register">Start writing <ArrowRight size={15}/></Link>
            <button className="icon-btn mobile-menu" onClick={() => setOpen(!open)}><Menu size={20}/></button>
          </>}
        </div>
      </div>
    </header>
  );
}

function HomePage({ user }) {
  const [blogs, setBlogs] = useState([]);
  useEffect(() => { api.blogs().then(setBlogs).catch(() => setBlogs([])); }, []);
  const featured = blogs[0];

  return <div>
    <section className="hero">
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse-dot"/> AI-assisted publishing, made simple</div>
          <h1>Ideas deserve a <em>beautiful</em> place to live.</h1>
          <p>Write, discover and shape thoughtful stories with BlogNest. Use AI when you need a spark, then make every word yours.</p>
          <div className="hero-actions">
            <Link to={user ? "/write" : "/register"} className="primary-btn">Start writing <ArrowRight size={17}/></Link>
            <Link to="/blogs" className="secondary-btn">Explore stories <BookOpen size={16}/></Link>
          </div>
          <div className="hero-meta"><span><Check size={14}/> AI generation</span><span><Check size={14}/> Secure accounts</span><span><Check size={14}/> Your stories</span></div>
        </div>
        <div className="hero-orbit">
          <div className="orbit-card card-a"><Sparkles size={17}/><span>AI Studio</span><b>Generate</b></div>
          <div className="orbit-card card-b"><PenLine size={17}/><span>Editor</span><b>Publish</b></div>
          <div className="hero-core"><span>BN</span><small>YOUR<br/>STORY</small></div>
          <div className="orbit-line"/>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="section-head"><div><div className="eyebrow">Fresh from the nest</div><h2>Latest stories</h2></div><Link className="text-link" to="/blogs">View all <ArrowRight size={15}/></Link></div>
      {featured ? <div className="feature-grid">
        <Link className="feature-card" to={`/blogs/${featured._id}`}>
          <div className="feature-art"><span>{categoryIcon(featured.category)}</span><i>{featured.category}</i></div>
          <div className="feature-content"><div className="post-kicker">Featured story</div><h3>{featured.title}</h3><p>{excerpt(featured.content, 190)}</p><div className="post-by"><span className="mini-avatar">{initials(featured.authorName)}</span><span>{featured.authorName}</span><span>•</span><span>{formatDate(featured.createdAt)}</span></div></div>
        </Link>
        <div className="stack-list">{blogs.slice(1, 4).map(blog => <BlogRow key={blog._id} blog={blog}/>)}</div>
      </div> : <EmptyState title="Your nest is waiting" text="Be the first to publish a story." action={user ? "Write a blog" : "Create account"} to={user ? "/write" : "/register"}/>}
    </section>

    <section className="cta">
      <div><div className="eyebrow">Built for curious minds</div><h2>Turn a blank page into momentum.</h2><p>Start with your own words or ask the AI Studio for a first draft.</p></div>
      <Link className="primary-btn" to={user ? "/ai" : "/register"}>{user ? "Open AI Studio" : "Join BlogNest"} <Wand2 size={17}/></Link>
    </section>
  </div>;
}

function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  useEffect(() => { api.blogs().then(setBlogs).catch(() => {}); }, []);
  const filtered = useMemo(() => blogs.filter(b =>
    (cat === "All" || b.category === cat) &&
    `${b.title} ${b.content} ${b.authorName}`.toLowerCase().includes(query.toLowerCase())
  ), [blogs, query, cat]);

  return <section className="section explore-page">
    <div className="page-intro"><div><div className="eyebrow">The public library</div><h1>Explore stories</h1><p>Find ideas from every corner of the BlogNest community.</p></div></div>
    <div className="toolbar"><div className="search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search stories, topics, authors…" /></div><div className="category-scroll">{categories.map(c => <button className={cat === c ? "chip active" : "chip"} key={c} onClick={() => setCat(c)}>{c}</button>)}</div></div>
    {filtered.length ? <div className="blog-grid">{filtered.map(b => <BlogCard key={b._id} blog={b}/>)}</div> : <EmptyState title="No stories found" text="Try a different search or category."/>}
  </section>;
}

function BlogCard({ blog }) {
  return <Link className="blog-card" to={`/blogs/${blog._id}`}>
    <div className="blog-art"><span>{categoryIcon(blog.category)}</span><small>{blog.category}</small></div>
    <div className="blog-card-body"><h3>{blog.title}</h3><p>{excerpt(blog.content, 115)}</p><div className="post-by"><span className="mini-avatar">{initials(blog.authorName)}</span><span>{blog.authorName}</span><span>•</span><span>{formatDate(blog.createdAt)}</span></div></div>
  </Link>;
}

function BlogRow({ blog }) {
  return <Link className="blog-row" to={`/blogs/${blog._id}`}><div className="row-art">{categoryIcon(blog.category)}</div><div><small>{blog.category}</small><h3>{blog.title}</h3><p>{blog.authorName} · {formatDate(blog.createdAt)}</p></div><ChevronRight size={17}/></Link>;
}

function BlogPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { api.blog(id).then(setBlog).catch(() => setBlog(false)); }, [id]);
  if (blog === false) return <EmptyState title="Story not found" text="This post may have been removed." action="Back to explore" to="/blogs"/>;
  if (!blog) return <Splash/>;

  const owner = user && blog.author?._id === user.id;

  async function summarize() {
    setLoadingSummary(true);
    try { setSummary((await api.summarize({ content: blog.content })).summary); }
    catch (e) { setSummary(e.message); }
    finally { setLoadingSummary(false); }
  }
  async function remove() {
    if (!confirm("Delete this blog permanently?")) return;
    setDeleting(true);
    try { await api.deleteBlog(id); navigate("/dashboard"); } catch(e) { alert(e.message); setDeleting(false); }
  }

  return <article className="article">
    <Link className="back-link" to="/blogs">← Back to stories</Link>
    <div className="article-head"><span className="category-label">{blog.category}</span><h1>{blog.title}</h1><div className="article-by"><span className="avatar large">{initials(blog.authorName)}</span><div><b>{blog.authorName}</b><span>Published {formatDate(blog.createdAt)}</span></div></div></div>
    <div className="article-layout"><div className="article-content"><p className="lead">{firstSentence(blog.content)}</p><div className="prose">{blog.content.split(/\n+/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}</div></div>
      <aside className="article-side"><div className="side-card"><div className="side-icon"><Sparkles size={18}/></div><h3>AI summary</h3><p>{summary || "Get a quick, easy-to-read summary of this story."}</p><button className="secondary-btn full" onClick={summarize} disabled={loadingSummary}>{loadingSummary ? "Summarizing…" : "Summarize with AI"} <Wand2 size={15}/></button></div>
      {owner && <div className="side-card owner-card"><div className="side-title">Your story</div><Link className="secondary-btn full" to={`/write/${blog._id}`}><Edit3 size={15}/> Edit story</Link><button className="danger-btn full" onClick={remove} disabled={deleting}><Trash2 size={15}/> {deleting ? "Deleting…" : "Delete story"}</button></div>}</aside>
    </div>
  </article>;
}

function AuthPage({ mode, onLogin }) {
  const loginMode = mode === "login";
  const [form, setForm] = useState(loginMode ? {email:"", password:""} : {name:"", email:"", password:""});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      if (loginMode) await onLogin((await api.login(form)).token);
      else { await api.register(form); await onLogin((await api.login({email:form.email,password:form.password})).token); }
      navigate(location.state?.from || "/dashboard");
    } catch(e) { setError(e.message); } finally { setBusy(false); }
  }

  return <section className="auth-page"><div className="auth-visual"><div className="eyebrow"><Sparkles size={14}/> AI-powered publishing</div><h1>Your ideas.<br/><em>One home.</em></h1><p>BlogNest brings writing, discovery and AI assistance into one calm workspace.</p><div className="quote">“Good writing is simply clear thinking made visible.”<span>— BlogNest</span></div></div>
    <div className="auth-panel"><Link className="back-link" to="/">← Home</Link><div className="auth-heading"><span className="brand-icon"><Sparkles size={17}/></span><div><div className="eyebrow">{loginMode ? "Welcome back" : "Create your nest"}</div><h2>{loginMode ? "Sign in to BlogNest" : "Start your writing journey"}</h2></div></div>
      {error && <div className="error-box"><X size={16}/>{error}</div>}
      <form onSubmit={submit} className="form">
        {!loginMode && <label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label>}
        <label>Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label>
        <label>Password<input required minLength="6" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 6 characters"/></label>
        <button className="primary-btn full" disabled={busy}>{busy ? "Please wait…" : loginMode ? "Sign in" : "Create account"} <ArrowRight size={16}/></button>
      </form>
      <p className="switch-auth">{loginMode ? "New to BlogNest?" : "Already have an account?"} <Link to={loginMode ? "/register" : "/login"}>{loginMode ? "Create an account" : "Sign in"}</Link></p>
    </div>
  </section>;
}

function Dashboard({ user }) {
  const [blogs, setBlogs] = useState([]);
  useEffect(() => { api.blogs().then(setBlogs).catch(() => {}); }, []);
  const mine = blogs.filter(b => b.author?._id === user.id || b.author === user.id);
  return <section className="section dashboard">
    <div className="dashboard-top"><div><div className="eyebrow">Personal workspace</div><h1>Good to see you, {user.name.split(" ")[0]}.</h1><p>Your stories, drafts and AI tools in one place.</p></div><Link className="primary-btn" to="/write"><Plus size={17}/> New story</Link></div>
    <div className="stats"><Stat icon={<FileText/>} label="Published" value={mine.length}/><Stat icon={<Clock3/>} label="Latest" value={mine.length ? formatDate(mine[0].createdAt) : "—"}/><Stat icon={<Sparkles/>} label="AI Studio" value="Ready"/></div>
    <div className="dashboard-grid"><div className="dash-panel"><div className="panel-head"><div><div className="eyebrow">Your library</div><h2>Published stories</h2></div><Link to="/blogs">Explore all</Link></div>{mine.length ? mine.map(b => <BlogRow key={b._id} blog={b}/>) : <EmptyState title="No stories yet" text="Publish your first idea and it will appear here." action="Write a story" to="/write"/>}</div>
      <div className="dash-panel ai-panel"><div className="ai-glow"><Sparkles/></div><div className="eyebrow">BlogNest AI</div><h2>Need a head start?</h2><p>Describe a topic and AI can turn it into a concise 100–150 word draft you can edit and publish.</p><Link className="primary-btn" to="/ai">Open AI Studio <Wand2 size={16}/></Link></div></div>
  </section>;
}

function Stat({icon,label,value}) { return <div className="stat"><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong></div></div>; }

function EditorPage() {
  const { id } = useParams();
  const edit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({title:"",content:"",category:"Technology"});
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  useEffect(()=>{ if(edit) api.blog(id).then(b=>setForm({title:b.title,content:b.content,category:b.category})).catch(e=>setMessage(e.message)); },[id,edit]);

  async function save(e) {
    e.preventDefault(); setBusy(true); setMessage("");
    try { const b = edit ? await api.updateBlog(id,form) : await api.createBlog(form); navigate(`/blogs/${b._id}`); }
    catch(e){setMessage(e.message)} finally {setBusy(false)}
  }
  return <section className="editor-page"><div className="editor-top"><div><Link className="back-link" to="/dashboard">← Dashboard</Link><div className="eyebrow">{edit ? "Refine your story" : "Create something new"}</div><h1>{edit ? "Edit story" : "Write a story"}</h1></div><Link className="secondary-btn" to="/ai"><Sparkles size={15}/> Need AI help?</Link></div>
    {message && <div className="error-box">{message}</div>}
    <form onSubmit={save} className="editor-shell"><div className="editor-main"><input className="title-input" required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="A title worth clicking…"/><textarea className="content-input" required value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Start with an idea. Let the rest unfold…"/><div className="editor-footer"><span>{form.content.trim().split(/\s+/).filter(Boolean).length} words</span><button className="primary-btn" disabled={busy}>{busy ? "Saving…" : edit ? "Save changes" : "Publish story"} <ArrowRight size={16}/></button></div></div>
      <aside className="editor-side"><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.slice(1).map(c=><option key={c}>{c}</option>)}</select></label><div className="tip-card"><Sparkles size={17}/><b>Writing tip</b><p>Use a specific title and open with the one idea you want readers to remember.</p></div></aside></form>
  </section>;
}

function AIPage() {
  const [topic,setTopic]=useState("");
  const [category,setCategory]=useState("");
  const [generated,setGenerated]=useState(null);
  const [busy,setBusy]=useState(false);
  const [summaryInput,setSummaryInput]=useState("");
  const [summary,setSummary]=useState("");
  const [sumBusy,setSumBusy]=useState(false);
  const navigate=useNavigate();

  async function generate(e){e.preventDefault();setBusy(true);try{setGenerated(await api.generateBlog({topic,category:category||undefined}))}catch(e){alert(e.message)}finally{setBusy(false)}}
  async function summarize(e){e.preventDefault();setSumBusy(true);try{setSummary((await api.summarize({content:summaryInput})).summary)}catch(e){alert(e.message)}finally{setSumBusy(false)}}
  return <section className="section ai-page"><div className="page-intro"><div><div className="eyebrow"><Sparkles size={14}/> BlogNest AI Studio</div><h1>From blank page<br/><em>to first draft.</em></h1><p>Use Gemini through your BlogNest API to generate a compact draft, then edit it before publishing.</p></div></div>
    <div className="ai-grid"><div className="ai-tool"><div className="tool-head"><div className="tool-number">01</div><div><h2>Generate a blog</h2><p>Give the AI a topic. It returns a ready-to-edit 100–150 word post.</p></div></div><form onSubmit={generate} className="form"><label>Topic<input required value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. How AI is changing education"/></label><label>Category <span className="muted">(optional)</span><select value={category} onChange={e=>setCategory(e.target.value)}><option value="">Auto-detect</option>{categories.slice(1).map(c=><option key={c}>{c}</option>)}</select></label><button className="primary-btn full" disabled={busy}>{busy ? "Generating…" : "Generate draft"} <Wand2 size={16}/></button></form>{generated && <div className="result"><div className="result-top"><span className="category-label">{generated.category}</span><button className="icon-btn" onClick={()=>setGenerated(null)}><X size={16}/></button></div><h3>{generated.title}</h3><p>{generated.content}</p><button className="secondary-btn full" onClick={()=>navigate("/write",{state:{generated}})}>Edit & publish <Edit3 size={15}/></button></div>}</div>
      <div className="ai-tool"><div className="tool-head"><div className="tool-number">02</div><div><h2>Summarize content</h2><p>Turn a longer article into a quick, easy-to-read paragraph.</p></div></div><form onSubmit={summarize} className="form"><label>Paste blog content<textarea className="mini-textarea" required value={summaryInput} onChange={e=>setSummaryInput(e.target.value)} placeholder="Paste content here…"/></label><button className="secondary-btn full" disabled={sumBusy}>{sumBusy ? "Summarizing…" : "Create summary"} <Sparkles size={15}/></button></form>{summary && <div className="result"><div className="result-top"><span className="category-label">AI SUMMARY</span></div><p>{summary}</p></div>}</div>
    </div>
  </section>;
}

function NotFound(){return <section className="empty-page"><div className="brand-icon"><Hash/></div><h1>404</h1><p>This page wandered outside the nest.</p><Link className="primary-btn" to="/">Go home</Link></section>}
function EmptyState({title,text,action,to}){return <div className="empty-state"><div className="empty-icon"><FileText size={19}/></div><h3>{title}</h3><p>{text}</p>{action&&<Link className="secondary-btn" to={to}>{action} <ArrowRight size={15}/></Link>}</div>}
function Footer(){return <footer><div className="footer-inner"><Link className="brand" to="/"><span className="brand-icon"><Sparkles size={16}/></span><span>Blog<span>Nest</span></span></Link><p>Write clearly. Think deeply. Publish beautifully.</p><span>© {new Date().getFullYear()} BlogNest</span></div></footer>}
function initials(name=""){return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase() || "BN"}
function excerpt(s,n){return (s||"").replace(/\s+/g," ").slice(0,n)+(s?.length>n?"…":"")}
function firstSentence(s){return (s||"").split(/(?<=[.!?])\s+/)[0] || excerpt(s,160)}
function formatDate(d){return d ? new Date(d).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}) : ""}
function categoryIcon(c){return c==="Technology"?"◈":c==="Health"?"✦":c==="Travel"?"⌁":c==="Finance"?"◇":c==="Sports"?"△":c==="Education"?"▱":"✧"}

export default App;
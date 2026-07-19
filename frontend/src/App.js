import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const API = 'http://localhost:8000';

const C = {
  navy: '#0a1628', navy2: '#0d1f3c', card: '#111f38',
  cyan: '#00c9b1', teal: '#0891b2', blue: '#3b82f6',
  white: '#ffffff', gray: '#94a3b8', light: '#e2e8f0'
};

const S = {
  // AUTH
  authPage: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navy2} 100%)`, padding:'1rem', position:'relative', overflow:'hidden' },
  authGrid: { position:'absolute', inset:0, backgroundImage:`linear-gradient(rgba(0,201,177,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,201,177,0.04) 1px, transparent 1px)`, backgroundSize:'60px 60px' },
  authCard: { background:C.card, border:`1px solid rgba(0,201,177,0.2)`, borderRadius:'20px', padding:'2.5rem', width:'100%', maxWidth:'420px', position:'relative', zIndex:2, boxShadow:'0 25px 50px rgba(0,0,0,0.5)' },
  logoWrap: { textAlign:'center', marginBottom:'2rem' },
  logoTitle: { fontFamily:"'Space Grotesk',sans-serif", fontSize:'2rem', fontWeight:700, background:`linear-gradient(135deg, ${C.cyan}, ${C.blue})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  logoSub: { display:'block', fontSize:'0.7rem', color:C.gray, letterSpacing:'2px', textTransform:'uppercase', marginTop:'0.2rem' },
  authH2: { fontFamily:"'Space Grotesk',sans-serif", fontSize:'1.4rem', fontWeight:700, color:C.white, textAlign:'center', marginBottom:'0.3rem' },
  authP: { color:C.gray, fontSize:'0.85rem', textAlign:'center', marginBottom:'1.8rem' },
  fg: { marginBottom:'1.1rem' },
  label: { display:'block', fontSize:'0.72rem', color:C.gray, marginBottom:'0.35rem', textTransform:'uppercase', letterSpacing:'0.5px', fontWeight:600 },
  input: { width:'100%', background:'rgba(255,255,255,0.04)', border:`1px solid rgba(255,255,255,0.1)`, borderRadius:'8px', padding:'0.72rem 1rem', color:C.white, fontSize:'0.9rem', fontFamily:"'Inter',sans-serif", outline:'none', boxSizing:'border-box' },
  btnPrimary: { width:'100%', background:`linear-gradient(135deg, ${C.cyan}, ${C.teal})`, color:'#000', border:'none', borderRadius:'9px', padding:'0.85rem', fontWeight:700, fontSize:'0.95rem', cursor:'pointer', fontFamily:"'Inter',sans-serif", marginTop:'0.5rem' },
  errBox: { background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'0.7rem', color:'#f87171', fontSize:'0.84rem', marginBottom:'1rem' },
  switchP: { textAlign:'center', marginTop:'1.4rem', fontSize:'0.84rem', color:C.gray },
  switchA: { color:C.cyan, cursor:'pointer', fontWeight:600 },
  // CHAT
  chatPage: { display:'flex', flexDirection:'column', height:'100vh', background:C.navy },
  navbar: { background:'rgba(10,22,40,0.97)', backdropFilter:'blur(12px)', borderBottom:`1px solid rgba(0,201,177,0.15)`, padding:'0 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', height:'64px', flexShrink:0 },
  navL: { display:'flex', alignItems:'center', gap:'10px' },
  navLogo: { fontFamily:"'Space Grotesk',sans-serif", fontSize:'1.2rem', fontWeight:700, color:C.cyan },
  navBadge: { background:'rgba(0,201,177,0.1)', border:`1px solid rgba(0,201,177,0.3)`, borderRadius:'100px', padding:'0.18rem 0.7rem', fontSize:'0.68rem', color:C.cyan, fontWeight:600 },
  navR: { display:'flex', alignItems:'center', gap:'0.8rem' },
  userBadge: { fontSize:'0.82rem', color:C.white },
  logoutBtn: { background:'rgba(255,255,255,0.06)', border:`1px solid rgba(255,255,255,0.12)`, borderRadius:'7px', padding:'0.38rem 0.85rem', color:C.white, cursor:'pointer', fontSize:'0.8rem', fontFamily:"'Inter',sans-serif" },
  chatBody: { flex:1, overflowY:'auto', padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' },
  welcome: { textAlign:'center', padding:'3rem 1rem' },
  welcomeIcon: { fontSize:'3rem', marginBottom:'0.8rem' },
  welcomeTitle: { fontFamily:"'Space Grotesk',sans-serif", fontSize:'1.8rem', fontWeight:700, color:C.white, marginBottom:'0.5rem' },
  welcomeSub: { color:C.light, fontSize:'0.9rem', marginBottom:'2rem' },
  sugGrid: { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'0.8rem', maxWidth:'580px', margin:'0 auto' },
  sugCard: { background:C.card, border:`1px solid rgba(0,201,177,0.15)`, borderRadius:'12px', padding:'0.9rem 1rem', cursor:'pointer', textAlign:'left', transition:'all 0.2s' },
  sugText: { fontSize:'0.83rem', color:C.white, lineHeight:1.5 },
  msgRow: { display:'flex', gap:'0.7rem', alignItems:'flex-start' },
  msgRowUser: { flexDirection:'row-reverse' },
  av: { width:'34px', height:'34px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.95rem', flexShrink:0 },
  avAI: { background:`linear-gradient(135deg, ${C.cyan}, ${C.blue})` },
  avUser: { background:`linear-gradient(135deg, #7c3aed, ${C.blue})` },
  bubble: { maxWidth:'72%', borderRadius:'16px', padding:'0.85rem 1.1rem', fontSize:'0.9rem', lineHeight:1.65 },
  bubbleAI: { background:C.card, border:`1px solid rgba(0,201,177,0.12)`, color:C.white, borderTopLeftRadius:'4px' },
  bubbleUser: { background:`linear-gradient(135deg, ${C.cyan}, ${C.teal})`, color:'#000', fontWeight:600, borderTopRightRadius:'4px' },
  typingWrap: { display:'flex', gap:'5px', padding:'0.3rem' },
  dot: { width:'8px', height:'8px', borderRadius:'50%', background:C.cyan },
  inputArea: { borderTop:`1px solid rgba(255,255,255,0.06)`, padding:'1rem 1.5rem', background:'rgba(10,22,40,0.95)', flexShrink:0 },
  inputRow: { display:'flex', gap:'0.7rem', alignItems:'center', background:C.card, border:`1px solid rgba(0,201,177,0.15)`, borderRadius:'12px', padding:'0.5rem 0.7rem' },
  textInput: { flex:1, background:'transparent', border:'none', color:C.white, fontSize:'0.9rem', fontFamily:"'Inter',sans-serif", outline:'none', padding:'0.4rem' },
  sendBtn: { background:`linear-gradient(135deg, ${C.cyan}, ${C.teal})`, border:'none', borderRadius:'8px', width:'38px', height:'38px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 },
  uploadBtn: { background:'rgba(0,201,177,0.1)', border:`1px solid rgba(0,201,177,0.2)`, borderRadius:'8px', width:'38px', height:'38px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 },
  uploadedBadge: { fontSize:'0.75rem', color:C.cyan, padding:'0.2rem 0.6rem', background:'rgba(0,201,177,0.08)', border:`1px solid rgba(0,201,177,0.2)`, borderRadius:'6px', marginBottom:'0.5rem', display:'inline-block' },
};

// ===== SIGNUP =====
function Signup({ onSwitch, onSuccess }) {
  const [f, setF] = useState({ username:'', email:'', password:'', confirm:'' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!f.username || !f.email || !f.password) return setErr('Sabhi fields fill karein');
    if (f.password !== f.confirm) return setErr('Passwords match nahi kar rahe');
    if (f.password.length < 6) return setErr('Password minimum 6 characters ka hona chahiye');
    setLoading(true); setErr('');
    try {
      const res = await axios.post(`${API}/register`, { username: f.username, email: f.email, password: f.password });
      onSuccess(res.data.access_token, res.data.username);
    } catch(e) { setErr(e.response?.data?.detail || 'Registration failed'); }
    setLoading(false);
  };

  return (
    <div style={S.authPage}>
      <div style={S.authGrid}/>
      <div style={S.authCard}>
        <div style={S.logoWrap}>
          <div style={S.logoTitle}>🏦 WaveSoft</div>
          <span style={S.logoSub}>Finance AI Assistant</span>
        </div>
        <h2 style={S.authH2}>Create Account</h2>
        <p style={S.authP}>WaveSoft Finance AI se judein</p>
        {err && <div style={S.errBox}>{err}</div>}
        {[['username','Username','text','e.g. rajanverma'],['email','Email','email','aap@example.com'],['password','Password','password','Min 6 characters'],['confirm','Confirm Password','password','Dobara daalen']].map(([k,l,t,ph])=>(
          <div key={k} style={S.fg}>
            <label style={S.label}>{l}</label>
            <input style={S.input} type={t} placeholder={ph} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})} onKeyDown={e=>e.key==='Enter'&&submit()}/>
          </div>
        ))}
        <button style={S.btnPrimary} onClick={submit} disabled={loading}>{loading?'Creating...':'Create Account →'}</button>
        <p style={S.switchP}>Pehle se account hai? <span style={S.switchA} onClick={onSwitch}>Login karein</span></p>
      </div>
    </div>
  );
}

// ===== LOGIN =====
function Login({ onSwitch, onSuccess }) {
  const [f, setF] = useState({ username:'', password:'' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!f.username || !f.password) return setErr('Username aur password daalen');
    setLoading(true); setErr('');
    try {
      const res = await axios.post(`${API}/login`, f);
      onSuccess(res.data.access_token, res.data.username);
    } catch(e) { setErr(e.response?.data?.detail || 'Login failed'); }
    setLoading(false);
  };

  return (
    <div style={S.authPage}>
      <div style={S.authGrid}/>
      <div style={S.authCard}>
        <div style={S.logoWrap}>
          <div style={S.logoTitle}>🏦 WaveSoft</div>
          <span style={S.logoSub}>Finance AI Assistant</span>
        </div>
        <h2 style={S.authH2}>Welcome Back!</h2>
        <p style={S.authP}>Apne account mein login karein</p>
        {err && <div style={S.errBox}>{err}</div>}
        <div style={S.fg}>
          <label style={S.label}>Username</label>
          <input style={S.input} placeholder="Aapka username" value={f.username} onChange={e=>setF({...f,username:e.target.value})}/>
        </div>
        <div style={S.fg}>
          <label style={S.label}>Password</label>
          <input style={S.input} type="password" placeholder="Aapka password" value={f.password} onChange={e=>setF({...f,password:e.target.value})} onKeyDown={e=>e.key==='Enter'&&submit()}/>
        </div>
        <button style={S.btnPrimary} onClick={submit} disabled={loading}>{loading?'Logging in...':'Login →'}</button>
        <p style={S.switchP}>Naya account? <span style={S.switchA} onClick={onSwitch}>Sign Up karein</span></p>
      </div>
    </div>
  );
}

// ===== CHAT =====
const suggestions = [
  "Personal loan ke liye kya documents chahiye?",
  "FD ki interest rate kya hai abhi?",
  "Credit card limit kaise badhayein?",
  "Home loan ke liye minimum salary kya chahiye?"
];

function Chat({ token, username, onLogout }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [msgs, loading]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    const newMsgs = [...msgs, {role:'user', content: uploadedDoc ? `[Document: ${uploadedDoc.name}]\n${msg}` : msg}];
    setMsgs(newMsgs);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/chat`, { message: msg, chat_history: newMsgs.slice(-6), token });
      setMsgs([...newMsgs, {role:'assistant', content: res.data.response}]);
    } catch {
      setMsgs([...newMsgs, {role:'assistant', content:'Server se connect nahi ho pa raha. Thodi der mein try karein.'}]);
    }
    setLoading(false);
    setUploadedDoc(null);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    form.append('token', token);
    try {
      const res = await axios.post(`${API}/upload`, form);
      setUploadedDoc({ name: file.name, text: res.data.text });
      setInput(`Is document ke baare mein bata: ${file.name}`);
    } catch { alert('File upload failed'); }
  };

  return (
    <div style={S.chatPage}>
      <style>{`
        @keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        .d1{animation:bounce 1.2s infinite 0s}.d2{animation:bounce 1.2s infinite 0.2s}.d3{animation:bounce 1.2s infinite 0.4s}
        .sug:hover{border-color:rgba(0,201,177,0.4)!important;transform:translateY(-2px)}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0a1628}::-webkit-scrollbar-thumb{background:#1a3a6b;border-radius:4px}
        .md-content p{margin:0.4rem 0;color:#fff;font-size:0.9rem;line-height:1.65}
        .md-content ul{padding-left:1.2rem;margin:0.4rem 0}
        .md-content li{color:#e2e8f0;font-size:0.88rem;margin:0.2rem 0}
        .md-content strong{color:#00c9b1}
        @media(max-width:600px){
          .chat-navbar{padding:0 1rem!important}
          .chat-body{padding:1rem!important}
          .sug-grid{grid-template-columns:1fr!important}
          .bubble{max-width:90%!important}
          .input-area{padding:0.8rem 1rem!important}
        }
      `}</style>

      {/* NAVBAR */}
      <div style={S.navbar} className="chat-navbar">
        <div style={S.navL}>
          <span style={S.navLogo}>🏦 WaveSoft</span>
          <span style={S.navBadge}>Finance AI</span>
        </div>
        <div style={S.navR}>
          <span style={S.userBadge}>👤 {username}</span>
          <button style={S.logoutBtn} onClick={onLogout}>Logout</button>
        </div>
      </div>

      {/* MESSAGES */}
      <div style={S.chatBody} className="chat-body">
        {msgs.length === 0 && (
          <div style={S.welcome}>
            <div style={S.welcomeIcon}>🏦</div>
            <h2 style={S.welcomeTitle}>WaveSoft Finance AI</h2>
            <p style={S.welcomeSub}>Namaste {username}! Aaj main aapki kya madad kar sakta hun?</p>
            <div style={S.sugGrid} className="sug-grid">
              {suggestions.map((s,i)=>(
                <div key={i} className="sug" style={S.sugCard} onClick={()=>send(s)}>
                  <p style={S.sugText}>💬 {s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m,i)=>(
          <div key={i} style={{...S.msgRow,...(m.role==='user'?S.msgRowUser:{})}}>
            <div style={{...S.av,...(m.role==='user'?S.avUser:S.avAI)}}>{m.role==='user'?'👤':'🤖'}</div>
            <div style={{...S.bubble,...(m.role==='user'?S.bubbleUser:S.bubbleAI)}} className="bubble">
              {m.role==='assistant'
                ? <div className="md-content"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                : m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={S.msgRow}>
            <div style={{...S.av,...S.avAI}}>🤖</div>
            <div style={{...S.bubble,...S.bubbleAI}}>
              <div style={S.typingWrap}>
                <div style={S.dot} className="d1"/><div style={S.dot} className="d2"/><div style={S.dot} className="d3"/>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* INPUT */}
      <div style={S.inputArea} className="input-area">
        {uploadedDoc && <div style={S.uploadedBadge}>📎 {uploadedDoc.name}</div>}
        <div style={S.inputRow}>
          <input ref={fileRef} type="file" accept=".pdf,.xlsx,.xls,.txt" style={{display:'none'}} onChange={handleUpload}/>
          <button style={S.uploadBtn} onClick={()=>fileRef.current.click()} title="Upload Document">📎</button>
          <input style={S.textInput} placeholder="Apna sawaal poochein... (Hindi ya English mein)"
            value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!loading&&send()}/>
          <button style={S.sendBtn} onClick={()=>send()} disabled={loading}>➤</button>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN =====
export default function App() {
  const [page, setPage] = useState('login');
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');

  const onSuccess = (tok, user) => { setToken(tok); setUsername(user); setPage('chat'); };
  const onLogout = () => { setToken(''); setUsername(''); setPage('login'); };

  if (page==='chat' && token) return <Chat token={token} username={username} onLogout={onLogout}/>;
  if (page==='signup') return <Signup onSwitch={()=>setPage('login')} onSuccess={onSuccess}/>;
  return <Login onSwitch={()=>setPage('signup')} onSuccess={onSuccess}/>;
}

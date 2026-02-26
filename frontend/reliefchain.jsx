import { useState, useEffect, useRef } from "react";

/* ============================================================
   STYLES
============================================================ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --ink:#050f1c;
  --deep:#071525;
  --panel:#0c1f38;
  --card:#0e2244;
  --sky:#0ea5e9;
  --cyan:#22d3ee;
  --gold:#f59e0b;
  --emerald:#10b981;
  --rose:#f43f5e;
  --white:#f0f9ff;
  --muted:#7ea8cc;
  --border:rgba(14,165,233,0.13);
  --glow:rgba(14,165,233,0.22);
}
html{scroll-behavior:smooth}
body{font-family:'Outfit',sans-serif;background:var(--deep);color:var(--white);overflow-x:hidden;min-height:100vh}

/* ── Animated deep-water background ── */
.bg-layer{
  position:fixed;inset:0;z-index:0;
  background:
    radial-gradient(ellipse 80% 60% at 15% 40%, rgba(8,40,80,0.9) 0%, transparent 70%),
    radial-gradient(ellipse 60% 80% at 85% 70%, rgba(6,30,60,0.8) 0%, transparent 70%),
    linear-gradient(180deg,#040e1a 0%,#071525 50%,#0a1e35 100%);
}
.bg-glow{
  position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;
}
.bg-glow::before{
  content:'';position:absolute;
  width:700px;height:700px;border-radius:50%;
  background:radial-gradient(circle,rgba(14,165,233,0.07) 0%,transparent 70%);
  top:-200px;left:-100px;
  animation:driftA 18s ease-in-out infinite;
}
.bg-glow::after{
  content:'';position:absolute;
  width:500px;height:500px;border-radius:50%;
  background:radial-gradient(circle,rgba(34,211,238,0.05) 0%,transparent 70%);
  bottom:-100px;right:-50px;
  animation:driftB 14s ease-in-out infinite;
}
@keyframes driftA{0%,100%{transform:translate(0,0)}50%{transform:translate(60px,40px)}}
@keyframes driftB{0%,100%{transform:translate(0,0)}50%{transform:translate(-40px,-30px)}}

/* rain */
.rain{position:fixed;inset:0;pointer-events:none;z-index:1}
.drop{
  position:absolute;width:1px;
  background:linear-gradient(to bottom,transparent,rgba(14,165,233,0.3));
  animation:rain linear infinite;
}
@keyframes rain{
  0%{transform:translateY(-100px);opacity:0}
  8%{opacity:1}
  92%{opacity:0.4}
  100%{transform:translateY(110vh);opacity:0}
}

/* ── transitions ── */
.fade-up{animation:fadeUp .55s cubic-bezier(.16,1,.3,1) both}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
.fade-in{animation:fIn .4s ease both}
@keyframes fIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}

/* ============================================================
   AUTH SCREEN
============================================================ */
.auth-wrap{
  position:relative;z-index:2;
  min-height:100vh;display:grid;
  grid-template-columns:1.1fr 0.9fr;
}
/* left hero */
.auth-left{
  display:flex;flex-direction:column;justify-content:center;
  padding:72px 80px;gap:32px;
}
.logo{display:flex;align-items:center;gap:12px}
.logo-orb{
  width:48px;height:48px;border-radius:14px;
  background:linear-gradient(135deg,var(--sky),var(--cyan));
  display:flex;align-items:center;justify-content:center;
  font-size:24px;
  box-shadow:0 0 30px rgba(14,165,233,0.5),0 0 0 1px rgba(255,255,255,0.06);
}
.logo-wordmark{font-family:'Syne',sans-serif;font-weight:800;font-size:20px;letter-spacing:-.3px}
.logo-wordmark span{color:var(--cyan)}

.auth-headline{
  font-family:'Syne',sans-serif;font-weight:800;
  font-size:clamp(38px,4.5vw,62px);line-height:1.03;letter-spacing:-2.5px;
}
.auth-headline .em{color:var(--cyan);display:block}

.auth-body{color:var(--muted);font-size:15px;line-height:1.8;max-width:370px}

.stat-chips{display:flex;gap:14px;flex-wrap:wrap}
.chip{
  padding:12px 20px;border-radius:14px;
  background:rgba(14,165,233,0.07);
  border:1px solid var(--border);
  text-align:center;
}
.chip-val{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:var(--cyan)}
.chip-lbl{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;margin-top:2px}

.tech-badges{display:flex;gap:8px;flex-wrap:wrap}
.tbadge{
  padding:5px 13px;border-radius:999px;font-size:12px;
  border:1px solid rgba(14,165,233,0.25);
  color:var(--sky);background:rgba(14,165,233,0.06);
}

/* right card */
.auth-right{display:flex;align-items:center;justify-content:center;padding:48px 40px}
.auth-card{
  width:100%;max-width:440px;
  background:rgba(10,28,52,0.85);
  backdrop-filter:blur(32px);
  border:1px solid var(--border);
  border-radius:28px;padding:48px 46px;
  box-shadow:0 48px 100px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.03);
  animation:cardIn .6s cubic-bezier(.16,1,.3,1) both;
}
@keyframes cardIn{from{opacity:0;transform:translateY(36px)}to{opacity:1;transform:translateY(0)}}

.tabs{
  display:flex;background:rgba(255,255,255,0.04);
  border-radius:12px;padding:5px;margin-bottom:32px;gap:5px;
}
.t-btn{
  flex:1;padding:10px;text-align:center;font-size:14px;font-weight:500;
  border-radius:9px;cursor:pointer;border:none;
  background:transparent;color:var(--muted);
  font-family:'Outfit',sans-serif;transition:all .28s;
}
.t-btn.on{
  background:linear-gradient(135deg,var(--sky),var(--cyan));
  color:#fff;box-shadow:0 4px 18px rgba(14,165,233,0.38);
}

.c-title{font-family:'Syne',sans-serif;font-size:26px;font-weight:700;letter-spacing:-.4px;margin-bottom:4px}
.c-sub{font-size:13px;color:var(--muted);margin-bottom:30px}

.field{margin-bottom:17px}
.field label{
  display:block;font-size:11px;font-weight:600;
  color:var(--muted);text-transform:uppercase;letter-spacing:.7px;margin-bottom:8px;
}
.field input{
  width:100%;background:rgba(255,255,255,0.04);
  border:1px solid rgba(255,255,255,0.08);
  border-radius:12px;padding:13px 17px;
  font-size:14px;color:var(--white);
  font-family:'Outfit',sans-serif;outline:none;
  transition:border-color .2s,box-shadow .2s,background .2s;
}
.field input::placeholder{color:rgba(126,168,204,0.45)}
.field input:focus{
  border-color:var(--sky);
  box-shadow:0 0 0 3px rgba(14,165,233,0.14);
  background:rgba(14,165,233,0.04);
}
.field input.er{border-color:var(--rose)}
.errtxt{font-size:12px;color:var(--rose);margin-top:5px}

.btn-primary{
  width:100%;padding:15px;
  background:linear-gradient(135deg,var(--sky),var(--cyan));
  border:none;border-radius:13px;
  color:#fff;font-size:15px;font-weight:600;
  font-family:'Outfit',sans-serif;cursor:pointer;margin-top:6px;
  transition:opacity .2s,transform .15s,box-shadow .2s;
  box-shadow:0 10px 28px rgba(14,165,233,0.34);
  position:relative;overflow:hidden;
}
.btn-primary:hover{opacity:.9;transform:translateY(-2px);box-shadow:0 16px 38px rgba(14,165,233,0.44)}
.btn-primary:active{transform:translateY(0)}
.btn-primary.ld::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);
  animation:sh 1s linear infinite;
}
@keyframes sh{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}

.divider{display:flex;align-items:center;gap:12px;margin:20px 0;color:var(--muted);font-size:12px}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.07)}

.btn-meta{
  width:100%;padding:13px;background:rgba(255,255,255,0.04);
  border:1px solid rgba(255,255,255,0.09);border-radius:12px;
  color:var(--white);font-size:14px;font-family:'Outfit',sans-serif;
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;
  transition:background .2s,border-color .2s;
}
.btn-meta:hover{background:rgba(255,255,255,0.08);border-color:rgba(14,165,233,0.3)}

.switch{text-align:center;margin-top:22px;font-size:13px;color:var(--muted)}
.switch button{
  background:none;border:none;color:var(--cyan);cursor:pointer;
  font-size:13px;font-family:'Outfit',sans-serif;font-weight:600;
  text-decoration:underline;text-underline-offset:3px;transition:opacity .2s;
}
.switch button:hover{opacity:.7}

/* success flash inside card */
.flash{text-align:center;padding:16px 0;animation:fIn .4s ease}
.flash-orb{
  width:68px;height:68px;border-radius:50%;
  background:linear-gradient(135deg,#10b981,#34d399);
  display:flex;align-items:center;justify-content:center;font-size:30px;
  margin:0 auto 16px;
  box-shadow:0 0 40px rgba(16,185,129,0.5);
}

/* ============================================================
   HOMEPAGE
============================================================ */
.home{position:relative;z-index:2}

/* NAV */
.nav{
  position:sticky;top:0;z-index:50;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 52px;height:68px;
  background:rgba(5,15,28,0.8);
  backdrop-filter:blur(24px);
  border-bottom:1px solid var(--border);
}
.nav-left{display:flex;align-items:center;gap:40px}
.nav-logo{display:flex;align-items:center;gap:10px}
.nav-gem{
  width:36px;height:36px;border-radius:10px;
  background:linear-gradient(135deg,var(--sky),var(--cyan));
  display:flex;align-items:center;justify-content:center;font-size:17px;
  box-shadow:0 0 18px rgba(14,165,233,0.4);
}
.nav-name{font-family:'Syne',sans-serif;font-weight:800;font-size:17px}
.nav-name span{color:var(--cyan)}

.nav-links{display:flex;gap:28px}
.nl{
  font-size:14px;color:var(--muted);cursor:pointer;
  border:none;background:none;font-family:'Outfit',sans-serif;
  transition:color .2s;padding:0;
}
.nl:hover{color:var(--white)}
.nl.active{color:var(--white)}

.nav-right{display:flex;align-items:center;gap:12px}
.wallet-badge{
  display:flex;align-items:center;gap:7px;
  padding:7px 14px 7px 8px;
  background:rgba(16,185,129,0.1);
  border:1px solid rgba(16,185,129,0.25);
  border-radius:999px;font-size:13px;
}
.w-dot{width:7px;height:7px;background:var(--emerald);border-radius:50%;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.5)}50%{box-shadow:0 0 0 6px rgba(16,185,129,0)}}
.w-addr{color:var(--emerald);font-weight:500}

.user-pill{
  display:flex;align-items:center;gap:8px;
  padding:6px 14px 6px 6px;
  background:rgba(14,165,233,0.09);
  border:1px solid var(--border);
  border-radius:999px;cursor:pointer;transition:background .2s;
}
.user-pill:hover{background:rgba(14,165,233,0.17)}
.u-avatar{
  width:30px;height:30px;border-radius:50%;
  background:linear-gradient(135deg,var(--sky),var(--cyan));
  display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:700;
}
.u-name{font-size:13px;font-weight:500}

.btn-logout{
  padding:8px 16px;background:transparent;
  border:1px solid rgba(255,255,255,0.1);border-radius:9px;
  color:var(--muted);font-size:13px;font-family:'Outfit',sans-serif;
  cursor:pointer;transition:all .2s;
}
.btn-logout:hover{border-color:rgba(244,63,94,0.4);color:var(--rose)}

/* ── HERO ── */
.hero{
  padding:96px 64px 72px;
  display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center;
}
.hero-eyebrow{
  display:inline-flex;align-items:center;gap:8px;
  padding:6px 14px;background:rgba(14,165,233,0.1);
  border:1px solid var(--border);border-radius:999px;
  font-size:12px;color:var(--cyan);margin-bottom:24px;letter-spacing:.3px;
}
.live-dot{width:7px;height:7px;background:var(--emerald);border-radius:50%;animation:pulse 2s infinite}

.hero-h1{
  font-family:'Syne',sans-serif;font-weight:800;
  font-size:clamp(44px,5.5vw,74px);line-height:1.0;letter-spacing:-3px;
  margin-bottom:24px;
}
.hero-h1 .glow{
  color:var(--cyan);
  text-shadow:0 0 50px rgba(34,211,238,0.35);
}

.hero-p{color:var(--muted);font-size:16px;line-height:1.85;max-width:460px;margin-bottom:40px}

.hero-actions{display:flex;gap:14px;flex-wrap:wrap}
.btn-cta{
  padding:16px 38px;
  background:linear-gradient(135deg,var(--sky),var(--cyan));
  border:none;border-radius:14px;color:#fff;
  font-size:16px;font-weight:600;font-family:'Outfit',sans-serif;
  cursor:pointer;
  transition:opacity .2s,transform .15s,box-shadow .2s;
  box-shadow:0 12px 36px rgba(14,165,233,0.38);
}
.btn-cta:hover{opacity:.9;transform:translateY(-2px);box-shadow:0 20px 44px rgba(14,165,233,0.5)}
.btn-cta:active{transform:translateY(0)}

.btn-outline{
  padding:16px 30px;background:transparent;
  border:1px solid var(--border);border-radius:14px;
  color:var(--white);font-size:15px;font-family:'Outfit',sans-serif;
  cursor:pointer;transition:background .2s,border-color .2s;
}
.btn-outline:hover{background:rgba(255,255,255,0.05);border-color:rgba(14,165,233,0.4)}

/* hero visual */
.hero-vis{position:relative}
.hv-card{
  background:rgba(10,28,52,0.9);backdrop-filter:blur(20px);
  border:1px solid var(--border);border-radius:26px;padding:32px;
  box-shadow:0 40px 90px rgba(0,0,0,0.45);
  animation:floatCard 6s ease-in-out infinite;
}
@keyframes floatCard{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
.hv-label{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.7px;margin-bottom:6px}
.hv-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;margin-bottom:4px}
.hv-ngo{font-size:13px;color:var(--muted);margin-bottom:20px}
.hv-bar-bg{height:8px;background:rgba(255,255,255,0.07);border-radius:99px;overflow:hidden;margin-bottom:12px}
.hv-bar-fill{
  height:100%;border-radius:99px;
  background:linear-gradient(90deg,var(--sky),var(--cyan));
  box-shadow:0 0 14px rgba(34,211,238,0.5);
  animation:barIn 2.2s cubic-bezier(.16,1,.3,1) both;
}
@keyframes barIn{from{width:0%}}
.hv-amounts{display:flex;justify-content:space-between;font-size:13px;margin-bottom:20px}
.hv-raised{color:var(--cyan);font-weight:600}
.hv-goal{color:var(--muted)}
.hv-minis{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.hv-mini{
  background:rgba(255,255,255,0.04);border:1px solid var(--border);
  border-radius:14px;padding:14px;text-align:center;
}
.hv-mnum{font-family:'Syne',sans-serif;font-size:20px;font-weight:700}
.hv-mlbl{font-size:11px;color:var(--muted);margin-top:3px}

.floating-tag{
  position:absolute;top:-22px;right:-22px;
  background:rgba(16,185,129,0.14);
  border:1px solid rgba(16,185,129,0.35);
  border-radius:14px;padding:10px 18px;
  display:flex;align-items:center;gap:8px;
  animation:tagFloat 4.5s ease-in-out infinite;
}
@keyframes tagFloat{0%,100%{transform:translate(0,0) rotate(-1deg)}50%{transform:translate(0,-10px) rotate(1deg)}}
.tag-pip{width:8px;height:8px;background:var(--emerald);border-radius:50%}
.tag-text{font-size:12px;font-weight:600;color:var(--emerald)}

/* ── METRICS BAR ── */
.metrics{
  margin:0 64px;
  display:grid;grid-template-columns:repeat(4,1fr);
  border:1px solid var(--border);border-radius:22px;overflow:hidden;
  background:var(--border);gap:1px;
}
.metric-cell{
  background:rgba(10,28,52,0.75);backdrop-filter:blur(14px);
  padding:30px 28px;text-align:center;
  transition:background .25s;position:relative;overflow:hidden;
}
.metric-cell::before{
  content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);
  width:60%;height:2px;background:linear-gradient(90deg,transparent,var(--sky),transparent);
  opacity:0;transition:opacity .3s;
}
.metric-cell:hover{background:rgba(14,165,233,0.08)}
.metric-cell:hover::before{opacity:1}
.m-val{font-family:'Syne',sans-serif;font-size:36px;font-weight:800;color:var(--cyan);line-height:1}
.m-lbl{font-size:13px;color:var(--muted);margin-top:8px}
.m-change{font-size:12px;color:var(--emerald);margin-top:4px;font-weight:500}

/* ── CAMPAIGNS ── */
.section{padding:80px 64px}
.sec-hdr{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:42px}
.sec-title{font-family:'Syne',sans-serif;font-size:32px;font-weight:800;letter-spacing:-1px}
.sec-sub{font-size:14px;color:var(--muted);margin-top:7px}
.sec-btn{
  padding:10px 22px;background:transparent;
  border:1px solid var(--border);border-radius:10px;
  color:var(--cyan);font-size:13px;font-family:'Outfit',sans-serif;
  cursor:pointer;transition:background .2s;white-space:nowrap;margin-top:4px;
}
.sec-btn:hover{background:rgba(14,165,233,0.09)}

.camp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.camp{
  background:rgba(10,28,52,0.85);backdrop-filter:blur(16px);
  border:1px solid var(--border);border-radius:22px;
  overflow:hidden;cursor:pointer;
  transition:transform .28s cubic-bezier(.16,1,.3,1),box-shadow .28s;
}
.camp:hover{transform:translateY(-8px);box-shadow:0 32px 70px rgba(0,0,0,0.45),0 0 0 1px rgba(14,165,233,0.22)}
.camp-cover{
  height:156px;display:flex;align-items:center;justify-content:center;
  font-size:60px;position:relative;overflow:hidden;
}
.camp-cover::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(to bottom,transparent 30%,rgba(10,28,52,0.95));
}
.camp-body{padding:22px}
.camp-tag-pill{
  display:inline-block;padding:4px 11px;border-radius:999px;
  font-size:11px;font-weight:600;margin-bottom:11px;
  border:1px solid;text-transform:uppercase;letter-spacing:.4px;
}
.urgent{color:var(--rose);border-color:rgba(244,63,94,0.35);background:rgba(244,63,94,0.08)}
.active{color:var(--emerald);border-color:rgba(16,185,129,0.35);background:rgba(16,185,129,0.08)}
.relief{color:var(--gold);border-color:rgba(245,158,11,0.35);background:rgba(245,158,11,0.08)}

.camp-name{font-family:'Syne',sans-serif;font-size:17px;font-weight:700;margin-bottom:8px;letter-spacing:-.3px;line-height:1.3}
.camp-desc{font-size:13px;color:var(--muted);line-height:1.65;margin-bottom:16px}
.prog-bg{height:5px;background:rgba(255,255,255,0.07);border-radius:99px;overflow:hidden;margin-bottom:12px}
.prog-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--sky),var(--cyan))}
.camp-foot{display:flex;justify-content:space-between;align-items:center}
.c-raised{color:var(--cyan);font-weight:600;font-size:14px}
.c-pct{font-size:12px;color:var(--muted)}
.c-donors{font-size:12px;color:var(--muted)}

/* ── ACTIVITY ── */
.activity{display:flex;flex-direction:column;gap:12px}
.act-row{
  display:flex;align-items:center;gap:16px;
  background:rgba(10,28,52,0.8);backdrop-filter:blur(14px);
  border:1px solid var(--border);border-radius:16px;padding:18px 22px;
  transition:background .22s,transform .22s;
}
.act-row:hover{background:rgba(14,165,233,0.07);transform:translateX(4px)}
.act-ico{
  width:44px;height:44px;border-radius:13px;
  display:flex;align-items:center;justify-content:center;
  font-size:20px;flex-shrink:0;
}
.act-info{flex:1}
.act-title{font-size:14px;font-weight:500}
.act-sub{font-size:12px;color:var(--muted);margin-top:3px}
.act-right{text-align:right}
.act-amt{font-family:'Syne',sans-serif;font-weight:700;font-size:15px;color:var(--cyan)}
.act-time{font-size:11px;color:var(--muted);margin-top:3px}

/* verified badge on act */
.ver-chip{
  display:inline-flex;align-items:center;gap:4px;
  padding:2px 8px;border-radius:999px;
  background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.28);
  font-size:11px;color:var(--emerald);font-weight:500;margin-left:8px;
}

/* ── DONATE CTA BANNER ── */
.cta-banner{
  margin:0 64px 80px;
  padding:56px 64px;
  background:linear-gradient(135deg,rgba(14,165,233,0.12) 0%,rgba(34,211,238,0.06) 100%);
  border:1px solid rgba(14,165,233,0.22);border-radius:28px;
  display:flex;align-items:center;justify-content:space-between;gap:40px;
  position:relative;overflow:hidden;
}
.cta-banner::before{
  content:'';position:absolute;
  width:300px;height:300px;border-radius:50%;
  background:radial-gradient(circle,rgba(14,165,233,0.12) 0%,transparent 70%);
  right:-60px;top:-80px;
}
.cta-text .sec-title{font-size:28px}
.cta-text .sec-sub{margin-top:10px;font-size:15px}
.cta-actions{display:flex;gap:12px;flex-shrink:0}

/* ── FOOTER ── */
.footer{
  border-top:1px solid var(--border);
  padding:44px 64px;
  display:flex;justify-content:space-between;align-items:center;
}
.f-brand{font-family:'Syne',sans-serif;font-size:16px;font-weight:800}
.f-brand span{color:var(--cyan)}
.f-links{display:flex;gap:28px}
.f-link{font-size:13px;color:var(--muted);cursor:pointer;transition:color .2s}
.f-link:hover{color:var(--white)}
.f-copy{font-size:12px;color:rgba(126,168,204,0.45)}

@media(max-width:1024px){
  .hero{grid-template-columns:1fr;padding:72px 40px 60px}
  .hero-vis{display:none}
  .metrics{margin:0 40px;grid-template-columns:1fr 1fr}
  .camp-grid{grid-template-columns:1fr 1fr}
  .section{padding:60px 40px}
  .cta-banner{margin:0 40px 60px;padding:40px}
}
@media(max-width:768px){
  .auth-wrap{grid-template-columns:1fr}
  .auth-left{display:none}
  .auth-right{padding:24px}
  .nav{padding:0 20px}
  .nav-links{display:none}
  .hero{padding:60px 20px}
  .metrics{margin:0 20px;grid-template-columns:1fr 1fr}
  .section,.footer{padding:48px 20px}
  .camp-grid{grid-template-columns:1fr}
  .cta-banner{flex-direction:column;margin:0 20px 48px;padding:32px 24px}
  .cta-actions{width:100%}
  .btn-cta,.btn-outline{width:100%;text-align:center}
}
`;

/* ============================================================
   RAIN DROPS
============================================================ */
const DROPS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  height: `${35 + Math.random() * 80}px`,
  delay: `${Math.random() * 7}s`,
  dur: `${0.5 + Math.random() * 1.2}s`,
  op: 0.12 + Math.random() * 0.4,
}));

function Rain() {
  return (
    <div className="rain">
      {DROPS.map(d => (
        <div key={d.id} className="drop" style={{
          left: d.left, height: d.height,
          animationDelay: d.delay, animationDuration: d.dur, opacity: d.op
        }} />
      ))}
    </div>
  );
}

/* ============================================================
   AUTH PAGE
============================================================ */
/* Field component lives OUTSIDE AuthPage so it never remounts on re-render */
function AuthField({ fieldKey, label, type, ph, value, error, onChange, onEnter }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        type={type}
        placeholder={ph}
        className={error ? "er" : ""}
        value={value}
        onChange={ev => onChange(fieldKey, ev.target.value)}
        onKeyDown={ev => ev.key === "Enter" && onEnter()}
      />
      {error && <div className="errtxt">{error}</div>}
    </div>
  );
}

function AuthPage({ onEnter }) {
  const [tab, setTab] = useState("login");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [e, setE]               = useState({});
  const [loading, setLoading]   = useState(false);

  const clearE = (k) => setE(p => ({ ...p, [k]: "" }));

  const validateLogin = () => {
    const err = {};
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) err.email = "Enter a valid email";
    if (!password) err.password = "Password required";
    return err;
  };

  const validateSignup = () => {
    const err = {};
    if (!name.trim()) err.name = "Full name required";
    if (!email.match(/^[^\s@]+@gmail\.com$/)) err.email = "Must be a @gmail.com address";
    if (password.length < 6) err.password = "Min 6 characters";
    if (password !== confirm) err.confirm = "Passwords don't match";
    return err;
  };

  const submit = async () => {
    const errs = tab === "login" ? validateLogin() : validateSignup();
    if (Object.keys(errs).length) { setE(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    const displayName = tab === "signup" ? name : email.split("@")[0];
    onEnter(displayName, email);
  };

  const switchTab = (t) => { setTab(t); setE({}); setName(""); setEmail(""); setPassword(""); setConfirm(""); };


  return (
    <div className="auth-wrap fade-in">
      {/* left hero */}
      <div className="auth-left">
        <div className="logo">
          <div className="logo-orb">💧</div>
          <div className="logo-wordmark">Relief<span>Chain</span></div>
        </div>
        <div className="auth-headline">
          Flood Relief<em className="em">On-Chain.</em>
        </div>
        <div className="auth-body">
          Every rupee tracked immutably on Polygon. Expense proofs locked on IPFS.
          No black boxes — only radical transparency for those who need help most.
        </div>
        <div className="stat-chips">
          {[["₹2.4Cr","Raised"],["18","Campaigns"],["100%","On-Chain"]].map(([val,lbl]) => (
            <div className="chip" key={lbl}>
              <div className="chip-val">{val}</div>
              <div className="chip-lbl">{lbl}</div>
            </div>
          ))}
        </div>
        <div className="tech-badges">
          {["Polygon Amoy","Solidity","IPFS + Pinata","MetaMask","Hardhat"].map(t => (
            <span className="tbadge" key={t}>{t}</span>
          ))}
        </div>
      </div>

      {/* right card */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="tabs">
            <button className={`t-btn ${tab === "login" ? "on" : ""}`} onClick={() => switchTab("login")}>Sign In</button>
            <button className={`t-btn ${tab === "signup" ? "on" : ""}`} onClick={() => switchTab("signup")}>Sign Up</button>
          </div>

          {tab === "login" ? (
            <>
              <div className="c-title">Welcome back</div>
              <div className="c-sub">Sign in to track donations & campaigns</div>
              <div className="field"><label>Email Address</label><input type="email" placeholder="you@gmail.com" className={e.email ? "er" : ""} value={email} onChange={ev => { setEmail(ev.target.value); clearE("email"); }} onKeyDown={ev => ev.key === "Enter" && submit()} />{e.email && <div className="errtxt">{e.email}</div>}</div>
              <div className="field"><label>Password</label><input type="password" placeholder="••••••••" className={e.password ? "er" : ""} value={password} onChange={ev => { setPassword(ev.target.value); clearE("password"); }} onKeyDown={ev => ev.key === "Enter" && submit()} />{e.password && <div className="errtxt">{e.password}</div>}</div>
            </>
          ) : (
            <>
              <div className="c-title">Create account</div>
              <div className="c-sub">Join the transparent relief network</div>
              <div className="field"><label>Full Name</label><input type="text" placeholder="Jane Doe" className={e.name ? "er" : ""} value={name} onChange={ev => { setName(ev.target.value); clearE("name"); }} onKeyDown={ev => ev.key === "Enter" && submit()} />{e.name && <div className="errtxt">{e.name}</div>}</div>
              <div className="field"><label>Gmail Address</label><input type="email" placeholder="you@gmail.com" className={e.email ? "er" : ""} value={email} onChange={ev => { setEmail(ev.target.value); clearE("email"); }} onKeyDown={ev => ev.key === "Enter" && submit()} />{e.email && <div className="errtxt">{e.email}</div>}</div>
              <div className="field"><label>Password</label><input type="password" placeholder="Min 6 characters" className={e.password ? "er" : ""} value={password} onChange={ev => { setPassword(ev.target.value); clearE("password"); }} onKeyDown={ev => ev.key === "Enter" && submit()} />{e.password && <div className="errtxt">{e.password}</div>}</div>
              <div className="field"><label>Confirm Password</label><input type="password" placeholder="Re-enter password" className={e.confirm ? "er" : ""} value={confirm} onChange={ev => { setConfirm(ev.target.value); clearE("confirm"); }} onKeyDown={ev => ev.key === "Enter" && submit()} />{e.confirm && <div className="errtxt">{e.confirm}</div>}</div>
            </>
          )}

          <button className={`btn-primary${loading ? " ld" : ""}`} onClick={submit}>
            {loading ? (tab === "login" ? "Signing in…" : "Creating account…") : (tab === "login" ? "Sign In" : "Create Account")}
          </button>

          <div className="divider">or continue with</div>
          <button className="btn-meta">🦊 &nbsp;MetaMask Wallet</button>

          <div className="switch">
            {tab === "login"
              ? <>New here? <button onClick={() => switchTab("signup")}>Create an account</button></>
              : <>Already have one? <button onClick={() => switchTab("login")}>Sign in</button></>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   HOMEPAGE
============================================================ */
const CAMPAIGNS = [
  { id:1, emoji:"🌊", bg:"rgba(14,165,233,0.12)", tag:"urgent", label:"URGENT", name:"Kerala Flash Floods 2025", desc:"Thousands displaced across Wayanad and Idukki districts. Immediate shelter, food, and medical aid needed.", raised:1840000, goal:3000000, donors:2341, pct:61 },
  { id:2, emoji:"🏠", bg:"rgba(16,185,129,0.1)", tag:"active", label:"ACTIVE", name:"Assam Brahmaputra Relief", desc:"Annual flooding leaves riverside communities without homes. Rebuilding permanent flood-resistant structures.", raised:920000, goal:2000000, donors:1087, pct:46 },
  { id:3, emoji:"🚰", bg:"rgba(245,158,11,0.1)", tag:"relief", label:"RELIEF", name:"Bihar Clean Water Drive", desc:"Post-flood contamination in 80+ villages. Deploying water purification units and medical teams urgently.", raised:560000, goal:800000, donors:743, pct:70 },
  { id:4, emoji:"🏥", bg:"rgba(244,63,94,0.1)", tag:"urgent", label:"URGENT", name:"Odisha Cyclone Medical Aid", desc:"Cyclone aftermath — clinics overwhelmed. Funding mobile medical units and emergency drug supplies.", raised:2100000, goal:2500000, donors:3102, pct:84 },
  { id:5, emoji:"🌾", bg:"rgba(16,185,129,0.1)", tag:"active", label:"ACTIVE", name:"Andhra Crop Restoration", desc:"Floods destroyed 60% of paddy crops. Supporting 4,000+ farming families with seeds and equipment.", raised:380000, goal:1200000, donors:512, pct:32 },
  { id:6, emoji:"📚", bg:"rgba(245,158,11,0.1)", tag:"relief", label:"RELIEF", name:"Flood-hit Schools Rebuild", desc:"12 government schools in Tamil Nadu destroyed. Rebuilding with modern flood-proof design for 8,000 students.", raised:720000, goal:1500000, donors:890, pct:48 },
];

const ACTIVITY = [
  { ico:"💸", bg:"rgba(14,165,233,0.12)", title:"Donation verified on-chain", sub:"Kerala Flash Floods 2025", amt:"₹5,000", time:"2 min ago", verified:true },
  { ico:"📄", bg:"rgba(16,185,129,0.12)", title:"Expense proof uploaded to IPFS", sub:"Bihar Clean Water Drive — QmX3a9…", amt:"", time:"14 min ago", verified:true },
  { ico:"🏛️", bg:"rgba(245,158,11,0.12)", title:"NGO registered on Polygon", sub:"Karnataka Flood Relief Foundation", amt:"", time:"1 hr ago", verified:false },
  { ico:"💸", bg:"rgba(14,165,233,0.12)", title:"Donation verified on-chain", sub:"Odisha Cyclone Medical Aid", amt:"₹25,000", time:"2 hr ago", verified:true },
  { ico:"🎯", bg:"rgba(244,63,94,0.12)", title:"New campaign launched", sub:"Andhra Crop Restoration Fund", amt:"", time:"5 hr ago", verified:false },
];

function fmt(n) {
  if (n >= 10000000) return `₹${(n/10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n/100000).toFixed(1)}L`;
  return `₹${(n/1000).toFixed(0)}K`;
}

function HomePage({ user, onLogout }) {
  const initials = user.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="home fade-up">
      {/* NAV */}
      <nav className="nav">
        <div className="nav-left">
          <div className="nav-logo">
            <div className="nav-gem">💧</div>
            <div className="nav-name">Relief<span>Chain</span></div>
          </div>
          <div className="nav-links">
            {["Campaigns","Dashboard","NGOs","Transactions","About"].map(l => (
              <button key={l} className={`nl${l==="Campaigns"?" active":""}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="nav-right">
          <div className="wallet-badge">
            <div className="w-dot" />
            <span className="w-addr">0x4f2…9e8a</span>
          </div>
          <div className="user-pill">
            <div className="u-avatar">{initials}</div>
            <span className="u-name">{user.split(" ")[0]}</span>
          </div>
          <button className="btn-logout" onClick={onLogout}>Sign out</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div>
          <div className="hero-eyebrow">
            <div className="live-dot" />
            Live on Polygon Amoy Testnet
          </div>
          <h1 className="hero-h1">
            Transparent<br />
            <span className="glow">Relief Funding</span><br />
            for India.
          </h1>
          <p className="hero-p">
            Blockchain-verified donations. IPFS-backed expense proofs.
            Every NGO accountable on a public ledger — so your generosity
            reaches those who need it, not bureaucratic black holes.
          </p>
          <div className="hero-actions">
            <button className="btn-cta">Donate Now</button>
            <button className="btn-outline">View All Campaigns</button>
          </div>
        </div>

        <div className="hero-vis">
          <div className="floating-tag">
            <div className="tag-pip" />
            <span className="tag-text">Verified on-chain ✓</span>
          </div>
          <div className="hv-card">
            <div className="hv-label">Featured Campaign</div>
            <div className="hv-title">Kerala Flash Floods 2025</div>
            <div className="hv-ngo">by Kerala Disaster Relief NGO</div>
            <div className="hv-bar-bg">
              <div className="hv-bar-fill" style={{ width: "61%" }} />
            </div>
            <div className="hv-amounts">
              <span className="hv-raised">₹18.4L raised</span>
              <span className="hv-goal">of ₹30L goal</span>
            </div>
            <div className="hv-minis">
              <div className="hv-mini">
                <div className="hv-mnum" style={{ color: "var(--cyan)" }}>2,341</div>
                <div className="hv-mlbl">Donors</div>
              </div>
              <div className="hv-mini">
                <div className="hv-mnum" style={{ color: "var(--emerald)" }}>61%</div>
                <div className="hv-mlbl">Funded</div>
              </div>
              <div className="hv-mini">
                <div className="hv-mnum" style={{ color: "var(--gold)" }}>12</div>
                <div className="hv-mlbl">Proofs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <div className="metrics">
        {[
          { val: "₹7.2Cr", lbl: "Total Raised", change: "+₹40L this week" },
          { val: "18",     lbl: "Active Campaigns", change: "+3 this month" },
          { val: "9,800+", lbl: "Total Donors", change: "+240 today" },
          { val: "100%",   lbl: "On-Chain Verified", change: "Zero off-chain funds" },
        ].map(m => (
          <div className="metric-cell" key={m.lbl}>
            <div className="m-val">{m.val}</div>
            <div className="m-lbl">{m.lbl}</div>
            <div className="m-change">{m.change}</div>
          </div>
        ))}
      </div>

      {/* CAMPAIGNS */}
      <section className="section">
        <div className="sec-hdr">
          <div>
            <div className="sec-title">Active Campaigns</div>
            <div className="sec-sub">All donations recorded immutably on Polygon blockchain</div>
          </div>
          <button className="sec-btn">View all →</button>
        </div>
        <div className="camp-grid">
          {CAMPAIGNS.map((c, i) => (
            <div className="camp" key={c.id} style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="camp-cover" style={{ background: c.bg }}>{c.emoji}</div>
              <div className="camp-body">
                <span className={`camp-tag-pill ${c.tag}`}>{c.label}</span>
                <div className="camp-name">{c.name}</div>
                <div className="camp-desc">{c.desc}</div>
                <div className="prog-bg">
                  <div className="prog-fill" style={{ width: `${c.pct}%` }} />
                </div>
                <div className="camp-foot">
                  <span className="c-raised">{fmt(c.raised)} raised</span>
                  <span className="c-pct">{c.pct}%</span>
                  <span className="c-donors">{c.donors.toLocaleString()} donors</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ACTIVITY */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="sec-hdr">
          <div>
            <div className="sec-title">Live Transactions</div>
            <div className="sec-sub">Real-time blockchain activity — public, permanent, tamper-proof</div>
          </div>
          <button className="sec-btn">Explore ledger →</button>
        </div>
        <div className="activity">
          {ACTIVITY.map((a, i) => (
            <div className="act-row" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="act-ico" style={{ background: a.bg }}>{a.ico}</div>
              <div className="act-info">
                <div className="act-title">
                  {a.title}
                  {a.verified && <span className="ver-chip">✓ On-chain</span>}
                </div>
                <div className="act-sub">{a.sub}</div>
              </div>
              <div className="act-right">
                {a.amt && <div className="act-amt">{a.amt}</div>}
                <div className="act-time">{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <div className="cta-banner">
        <div className="cta-text">
          <div className="sec-title">Ready to make a difference?</div>
          <div className="sec-sub">Connect your MetaMask wallet and donate directly. Every transaction is on-chain.</div>
        </div>
        <div className="cta-actions">
          <button className="btn-cta">🦊 &nbsp;Connect & Donate</button>
          <button className="btn-outline">Register NGO</button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="f-brand">Relief<span>Chain</span></div>
        <div className="f-links">
          {["Campaigns","Transparency","NGOs","Docs","GitHub"].map(l => (
            <span className="f-link" key={l}>{l}</span>
          ))}
        </div>
        <div className="f-copy">Built on Polygon · IPFS · Solidity © 2025</div>
      </footer>
    </div>
  );
}

/* ============================================================
   ROOT APP
============================================================ */
export default function App() {
  const [user, setUser] = useState(null); // null = not logged in

  const handleLogin = (name, email) => {
    setUser(name || email.split("@")[0]);
  };

  const handleLogout = () => setUser(null);

  return (
    <>
      <style>{CSS}</style>
      <div className="bg-layer" />
      <div className="bg-glow" />
      <Rain />
      {user
        ? <HomePage user={user} onLogout={handleLogout} />
        : <AuthPage onEnter={handleLogin} />
      }
    </>
  );
}


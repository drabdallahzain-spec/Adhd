import { useState, useEffect, useRef } from "react";
import {
  Plus, Check, Flame, Star, Trophy, Zap, Award,
  Play, Pause, RotateCcw, Shuffle, Home, Brain, Target, Sparkles
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════
//  CLINICAL DATABASE  (Psychiatry + Behavioral Modification)
// ══════════════════════════════════════════════════════════════════

const ENERGY_LEVELS = [
  { id:"crisis", emoji:"🆘", label:"Crisis",  desc:"Just exist. That's enough today.",     border:"border-red-300",    bg:"bg-red-50",     text:"text-red-600"     },
  { id:"low",    emoji:"🪫", label:"Drained", desc:"Basics only. Be gentle with yourself.", border:"border-orange-300", bg:"bg-orange-50",  text:"text-orange-600"  },
  { id:"medium", emoji:"⚡", label:"Okay",    desc:"You can manage a few things.",          border:"border-blue-300",   bg:"bg-blue-50",    text:"text-blue-600"    },
  { id:"high",   emoji:"🔋", label:"Charged", desc:"Let's make this count!",                border:"border-green-300",  bg:"bg-green-50",   text:"text-green-600"   },
];

// HALT = core ADHD needs check (Hungry / Anxious / Lonely / Tired)
const HALT = [
  { id:"hungry",  emoji:"🍽️", label:"Hungry?",   fix:"Have something to eat first",        task:{ emoji:"🍽️", text:"Eat something nourishing",         category:"Self-care", timeMin:10, difficulty:"easy", energyNeeded:"low"  } },
  { id:"anxious", emoji:"😰", label:"Anxious?",   fix:"3 slow breaths → then start",       task:{ emoji:"💨", text:"Take 5 deep breaths",               category:"Calm",      timeMin:2,  difficulty:"easy", energyNeeded:"low"  } },
  { id:"lonely",  emoji:"💙", label:"Lonely?",    fix:"Send one quick text to someone",    task:{ emoji:"💙", text:"Text someone you care about",        category:"Self-care", timeMin:2,  difficulty:"easy", energyNeeded:"low"  } },
  { id:"tired",   emoji:"😴", label:"Tired?",     fix:"Water + 5-min rest first",          task:{ emoji:"💧", text:"Drink water & rest for 5 minutes",   category:"Self-care", timeMin:5,  difficulty:"easy", energyNeeded:"low"  } },
];

// CBT-based "stuck" reframes (evidence-based for ADHD)
const STUCK_TIPS = [
  { title:"2-Minute Rule",     body:"Commit to just 2 minutes. Tell yourself you can stop after that. Starting is the hardest part — your brain will usually keep going." },
  { title:"Shrink the Step",   body:"Break it down to the absolute smallest first action. Not 'clean room' — just 'pick up ONE item.' Lower the bar until it feels ridiculous." },
  { title:"Move Your Body",    body:"Stand up, shake your hands, walk 5 steps. Physical movement boosts dopamine and activates the prefrontal cortex within seconds." },
  { title:"Anchor It",         body:"Pair this task with something you already do: 'After I make my coffee, I'll do this.' Habit stacking bypasses initiation difficulty." },
  { title:"Change Location",   body:"Move somewhere else — even one chair over. New environments reduce the activation energy needed to start a task." },
  { title:"Name the Block",    body:"Say out loud: 'I notice I'm avoiding this.' Naming your avoidance activates your prefrontal cortex and weakens the freeze response." },
  { title:"Imperfect Action",  body:"Give yourself permission to do it badly. A messy attempt is neurologically superior to a perfect plan never started." },
  { title:"3-2-1 Launch",      body:"Count down from 3 out loud. At 1, your body moves before your brain can object. Used by astronauts and athletes to override hesitation." },
];

// ADHD psychoeducation (evidence-based neuroscience)
const ADHD_SCIENCE = [
  "ADHD brains need 3× more external rewards than neurotypical brains. Celebrating small wins is literally medicine — it triggers real dopamine release.",
  "Time blindness is neurological, not laziness. ADHD brains have impaired prospective memory. Using timers re-trains your brain's time-keeping circuits.",
  "Decision fatigue hits ADHD brains twice as fast. Pre-planning choices the night before (clothes, meals, tasks) saves critical executive function for what matters.",
  "Body doubling works because social presence activates the prefrontal cortex. Working with someone nearby — even virtually — is a legitimate ADHD accommodation.",
  "The 'just start' technique works: 85% of people who begin a task continue once started. Your brain only needs to overcome initiation — momentum does the rest.",
  "ADHD brains run on interest, novelty, challenge, or urgency — not importance. Building these elements into tasks isn't cheating; it's working with your neurology.",
  "5 minutes of movement increases dopamine, norepinephrine, and serotonin by up to 20%. Move before you need to focus — it's the most underused ADHD tool.",
  "Sleep deprivation mimics and amplifies ADHD symptoms. Consistent sleep timing — even on weekends — can reduce ADHD severity significantly.",
];

// Shame-reducing affirmations (ADHD-aware)
const AFFIRMATIONS = [
  "Your brain is wired for creativity and hyperfocus. That's a genuine superpower.",
  "You don't have a willpower problem. You have a dopamine regulation difference.",
  "Done imperfectly today is better than perfect in your head forever.",
  "You are not broken. You are differently wired — and that difference has value.",
  "Every small win produces real dopamine. Celebrate every single one.",
  "Rest is not laziness. Rest is neurological maintenance.",
  "Showing up today, even a little, is a genuine victory for your brain.",
];

// 5-4-3-2-1 Grounding (sensory grounding for anxiety/overwhelm)
const GROUNDING = [
  { n:5, emoji:"👁️",  sense:"see",   prompt:"Name 5 things you can SEE right now"                   },
  { n:4, emoji:"✋",  sense:"touch", prompt:"Name 4 things you can TOUCH or feel right now"          },
  { n:3, emoji:"👂",  sense:"hear",  prompt:"Name 3 sounds you can HEAR right now"                   },
  { n:2, emoji:"👃",  sense:"smell", prompt:"Name 2 things you can SMELL (or love to smell)"         },
  { n:1, emoji:"👅",  sense:"taste", prompt:"Name 1 thing you can TASTE or notice in your mouth"     },
];

// Achievements (token economy — behavioral modification)
const ACHIEVEMENTS = [
  { id:"first",    emoji:"🌱", label:"First Step",   desc:"Complete your first task",          check: (t,x,s) => t.filter(k=>k.done).length >= 1      },
  { id:"quick",    emoji:"⚡", label:"Quick Winner",  desc:"Complete a task under 3 min",       check: (t,x,s) => t.some(k=>k.done&&k.timeMin<=3)       },
  { id:"hard",     emoji:"💪", label:"Hard Mode",     desc:"Complete a hard-difficulty task",   check: (t,x,s) => t.some(k=>k.done&&k.difficulty==="hard") },
  { id:"streak",   emoji:"🔥", label:"3-Day Streak",  desc:"Maintain a 3-day streak",           check: (t,x,s) => s >= 3                               },
  { id:"xp100",    emoji:"⭐", label:"XP Collector",  desc:"Earn 100 XP",                       check: (t,x,s) => x >= 100                             },
  { id:"allday",   emoji:"🏆", label:"Full Day",      desc:"Complete every task today",         check: (t,x,s) => t.length>0&&t.every(k=>k.done)       },
  { id:"dump",     emoji:"🧠", label:"Mind Clear",    desc:"Use the Brain Dump feature",        check: (t,x,s) => t.some(k=>k.id.startsWith("bd"))      },
  { id:"focus",    emoji:"🎯", label:"Deep Focus",    desc:"Complete a focus session",          check: (t,x,s) => x >= 45                              },
  { id:"prayers5", emoji:"🕌", label:"5 Pillars",     desc:"Complete all 5 daily prayers",      check: (t,x,s) => t.filter(k=>k.category==="Prayer"&&k.done).length >= 5 },
];

// Tasks with full behavioral metadata
const DEFAULT_TASKS = [
  { id:"p1", category:"Prayer", emoji:"🌅", text:"صلاة الفجر — Fajr",    timeMin:5,  difficulty:"easy", energyNeeded:"low", habitStack:"right after waking",   done:false },
  { id:"p2", category:"Prayer", emoji:"☀️",  text:"صلاة الظهر — Dhuhr",   timeMin:8,  difficulty:"easy", energyNeeded:"low", habitStack:"pause work at midday", done:false },
  { id:"p3", category:"Prayer", emoji:"🌤️", text:"صلاة العصر — Asr",     timeMin:8,  difficulty:"easy", energyNeeded:"low", habitStack:"mid-afternoon break",  done:false },
  { id:"p4", category:"Prayer", emoji:"🌆", text:"صلاة المغرب — Maghrib", timeMin:5,  difficulty:"easy", energyNeeded:"low", habitStack:"right at sunset",      done:false },
  { id:"p5", category:"Prayer", emoji:"🌙", text:"صلاة العشاء — Isha",    timeMin:10, difficulty:"easy", energyNeeded:"low", habitStack:"before sleep routine",  done:false },
  { id:"t1", category:"Productivity", emoji:"🛏️", text:"Make your bed",                    timeMin:2,  difficulty:"easy",   energyNeeded:"low",    habitStack:"right after waking",  done:false },
  { id:"t2", category:"Self-care",    emoji:"🪥", text:"Brush and floss your teeth",        timeMin:3,  difficulty:"easy",   energyNeeded:"low",    habitStack:"after breakfast",     done:false },
  { id:"t3", category:"Self-care",    emoji:"💧", text:"Drink a full glass of water",       timeMin:1,  difficulty:"easy",   energyNeeded:"low",    habitStack:"first thing you do",  done:false },
  { id:"t4", category:"Productivity", emoji:"⏱️", text:"Focus on one task for 25 minutes",  timeMin:25, difficulty:"hard",   energyNeeded:"high",   habitStack:"mid-morning peak",    done:false },
  { id:"t5", category:"Move",         emoji:"🏃", text:"Stand up and move for 5 minutes",   timeMin:5,  difficulty:"easy",   energyNeeded:"medium", habitStack:"every 90 minutes",    done:false },
  { id:"t6", category:"Mindfulness",  emoji:"💗", text:"Write one thing that went well",    timeMin:3,  difficulty:"easy",   energyNeeded:"low",    habitStack:"before sleep",        done:false },
  { id:"t7", category:"Self-care",    emoji:"🥣", text:"Eat a proper meal",                 timeMin:15, difficulty:"medium", energyNeeded:"medium", habitStack:"midday",              done:false },
  { id:"t8", category:"Calm",         emoji:"💨", text:"Take 5 deep, slow breaths",         timeMin:2,  difficulty:"easy",   energyNeeded:"low",    habitStack:"when stressed",       done:false },
];

const SUGGESTIONS = {
  "Self-care": [
    { id:"sc1", emoji:"💧", text:"Drink a full glass of water",        timeMin:1,  difficulty:"easy",   energyNeeded:"low",    category:"Self-care"   },
    { id:"sc2", emoji:"🥣", text:"Have breakfast",                      timeMin:10, difficulty:"medium", energyNeeded:"medium", category:"Self-care"   },
    { id:"sc3", emoji:"💊", text:"Take your medication",                timeMin:1,  difficulty:"easy",   energyNeeded:"low",    category:"Self-care"   },
    { id:"sc4", emoji:"📵", text:"Screens off 30 min before bed",       timeMin:2,  difficulty:"easy",   energyNeeded:"low",    category:"Self-care"   },
    { id:"sc5", emoji:"🚿", text:"Take a warm shower",                  timeMin:10, difficulty:"medium", energyNeeded:"medium", category:"Self-care"   },
    { id:"sc6", emoji:"🪥", text:"Brush and floss your teeth",          timeMin:3,  difficulty:"easy",   energyNeeded:"low",    category:"Self-care"   },
    { id:"sc7", emoji:"🧴", text:"Moisturize your skin",                timeMin:2,  difficulty:"easy",   energyNeeded:"low",    category:"Self-care"   },
    { id:"sc8", emoji:"🥑", text:"Prepare a healthy snack",             timeMin:5,  difficulty:"easy",   energyNeeded:"low",    category:"Self-care"   },
  ],
  "Calm": [
    { id:"ca1", emoji:"🌬️", text:"Get some fresh air",                 timeMin:5,  difficulty:"easy",   energyNeeded:"low",    category:"Calm"        },
    { id:"ca2", emoji:"🎵", text:"Listen to calming music",             timeMin:10, difficulty:"easy",   energyNeeded:"low",    category:"Calm"        },
    { id:"ca3", emoji:"💨", text:"Box breathing (4-4-4-4)",             timeMin:5,  difficulty:"easy",   energyNeeded:"low",    category:"Calm"        },
    { id:"ca4", emoji:"🍵", text:"Make a warm drink and savor it",      timeMin:10, difficulty:"easy",   energyNeeded:"low",    category:"Calm"        },
    { id:"ca5", emoji:"⏱️", text:"15-minute screen break",              timeMin:15, difficulty:"easy",   energyNeeded:"low",    category:"Calm"        },
  ],
  "Mindfulness": [
    { id:"mi1", emoji:"🕯️", text:"Practice mindful breathing",         timeMin:3,  difficulty:"easy",   energyNeeded:"low",    category:"Mindfulness" },
    { id:"mi2", emoji:"🌤️", text:"5-4-3-2-1 grounding exercise",       timeMin:5,  difficulty:"easy",   energyNeeded:"low",    category:"Mindfulness" },
    { id:"mi3", emoji:"💗", text:"Write one thing that went well",      timeMin:3,  difficulty:"easy",   energyNeeded:"low",    category:"Mindfulness" },
    { id:"mi4", emoji:"💝", text:"Name one thing you're grateful for",  timeMin:2,  difficulty:"easy",   energyNeeded:"low",    category:"Mindfulness" },
    { id:"mi5", emoji:"🪨", text:"5-minute body scan",                  timeMin:5,  difficulty:"easy",   energyNeeded:"low",    category:"Mindfulness" },
  ],
  "Move": [
    { id:"mv1", emoji:"🏃", text:"Walk for 10 minutes",                 timeMin:10, difficulty:"medium", energyNeeded:"medium", category:"Move"        },
    { id:"mv2", emoji:"🧘", text:"5 minutes of gentle stretching",      timeMin:5,  difficulty:"easy",   energyNeeded:"low",    category:"Move"        },
    { id:"mv3", emoji:"💪", text:"10 jumping jacks",                    timeMin:2,  difficulty:"medium", energyNeeded:"medium", category:"Move"        },
    { id:"mv4", emoji:"🚶", text:"Stand up and walk around",            timeMin:3,  difficulty:"easy",   energyNeeded:"low",    category:"Move"        },
  ],
};

const CAT = {
  "Productivity": { color:"text-amber-500",   bg:"bg-amber-50"   },
  "Self-care":    { color:"text-rose-400",    bg:"bg-rose-50"    },
  "Move":         { color:"text-emerald-500", bg:"bg-emerald-50" },
  "Mindfulness":  { color:"text-violet-500",  bg:"bg-violet-50"  },
  "Calm":         { color:"text-sky-500",     bg:"bg-sky-50"     },
  "Prayer":       { color:"text-teal-600",    bg:"bg-teal-50"    },
};

// Prayer metadata (shown in PrayerTracker card)
const PRAYERS_META = [
  { id:"p1", ar:"الفجر",  en:"Fajr",    emoji:"🌅", time:"Dawn",      desc:"Start the day with Allah" },
  { id:"p2", ar:"الظهر",  en:"Dhuhr",   emoji:"☀️",  time:"Midday",    desc:"Pause & reconnect"        },
  { id:"p3", ar:"العصر",  en:"Asr",     emoji:"🌤️", time:"Afternoon", desc:"Reflect mid-day"          },
  { id:"p4", ar:"المغرب", en:"Maghrib", emoji:"🌆", time:"Sunset",    desc:"Gratitude at day's end"   },
  { id:"p5", ar:"العشاء", en:"Isha",    emoji:"🌙", time:"Night",     desc:"Close the day in peace"   },
];

const DIFF = {
  easy:   { label:"Easy",   color:"text-emerald-600", bg:"bg-emerald-50" },
  medium: { label:"Medium", color:"text-amber-600",   bg:"bg-amber-50"   },
  hard:   { label:"Hard",   color:"text-rose-600",    bg:"bg-rose-50"    },
};

const ENERGY_RANK = { low:1, medium:2, high:3 };
const ENERGY_CAP  = { crisis:0, low:1, medium:2, high:3 };
const XP_MAP      = { easy:10, medium:20, hard:35 };

const pad = n => String(n).padStart(2,"0");
const fmt = s => `${pad(Math.floor(s/60))}:${pad(s%60)}`;
const todayStr = () => new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});

// ══════════════════════════════════════════════════════════════════
//  COMPONENTS
// ══════════════════════════════════════════════════════════════════

// ── Energy Selector ───────────────────────────────────────────────
function EnergySelector({ energy, onChange }) {
  return (
    <div className="bg-white rounded-2xl p-3.5 shadow-sm">
      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2.5">🧠 How's your brain right now?</p>
      <div className="grid grid-cols-4 gap-1.5">
        {ENERGY_LEVELS.map(e => (
          <button key={e.id} onClick={() => onChange(e.id)}
            className={`flex flex-col items-center gap-1 rounded-xl py-2.5 border-2 transition-all ${
              energy === e.id ? `${e.border} ${e.bg} ${e.text}` : "border-gray-100 text-gray-400"
            }`}>
            <span className="text-xl">{e.emoji}</span>
            <span className="text-[10px] font-black leading-tight">{e.label}</span>
          </button>
        ))}
      </div>
      {energy && (
        <p className="mt-2.5 text-xs text-gray-500 font-semibold text-center italic">
          "{ENERGY_LEVELS.find(e=>e.id===energy)?.desc}"
        </p>
      )}
    </div>
  );
}

// ── HALT Banner (psychiatric needs check) ────────────────────────
function HALTBanner({ onAddTask }) {
  const [ticked, setTicked] = useState({});
  const [gone,   setGone]   = useState(false);
  if (gone) return null;
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-amber-700 font-black text-[11px] uppercase tracking-widest">⚡ HALT Check-In</p>
        <button onClick={() => setGone(true)} className="text-amber-400 font-black text-xs">✕</button>
      </div>
      <p className="text-gray-500 text-[11px] font-semibold mb-2.5">Before tasks — check your basic needs:</p>
      <div className="grid grid-cols-2 gap-1.5">
        {HALT.map(h => (
          <button key={h.id} onClick={() => {
              if (!ticked[h.id]) { onAddTask(h.task); setTicked(c=>({...c,[h.id]:true})); }
            }}
            className={`flex items-center gap-2 rounded-xl px-2.5 py-2 border transition-all text-left ${
              ticked[h.id] ? "border-amber-300 bg-amber-100" : "border-transparent bg-white"
            }`}>
            <span className="text-base">{h.emoji}</span>
            <div>
              <p className="text-[11px] font-black text-gray-700">{h.label}</p>
              {ticked[h.id] && <p className="text-[10px] text-amber-600 font-semibold">{h.fix}</p>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Task Card ─────────────────────────────────────────────────────
function TaskCard({ task, onToggle, onFocus, highlight }) {
  const cat  = CAT[task.category]  || CAT["Mindfulness"];
  const diff = DIFF[task.difficulty] || DIFF.easy;
  return (
    <div className={`bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3 transition-all duration-300
      ${task.done ? "opacity-40" : ""}
      ${highlight ? "border-l-4 border-emerald-300" : ""}`}>
      <span className="text-2xl leading-none flex-shrink-0">{task.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className={`text-[10px] font-black uppercase tracking-wider ${cat.color}`}>{task.category}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${diff.bg} ${diff.color}`}>{diff.label}</span>
          <span className="text-[10px] text-gray-400 font-bold">~{task.timeMin}m</span>
        </div>
        <p className={`font-bold text-gray-800 text-sm leading-snug ${task.done ? "line-through text-gray-400" : ""}`}>
          {task.text}
        </p>
        {task.habitStack && !task.done && (
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">📌 {task.habitStack}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5 items-center flex-shrink-0">
        {!task.done && onFocus && (
          <button onClick={() => onFocus(task)}
            className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center" title="Focus on this">
            <Target size={12} className="text-blue-500"/>
          </button>
        )}
        <button onClick={() => onToggle(task.id)}
          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
            task.done ? "bg-blue-400 border-blue-400" : "border-gray-200 hover:border-blue-300"
          }`}>
          {task.done && <Check size={13} className="text-white" strokeWidth={3}/>}
        </button>
      </div>
    </div>
  );
}

// ── Pomodoro Timer ────────────────────────────────────────────────
function PomodoroTimer({ taskName }) {
  const WORK_S = 25 * 60, BREAK_S = 5 * 60;
  const [secs,    setSecs]    = useState(WORK_S);
  const [running, setRunning] = useState(false);
  const [phase,   setPhase]   = useState("work");
  const [tomatoes,setTomatoes]= useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setSecs(s => {
        if (s > 1) return s - 1;
        clearInterval(ref.current);
        setRunning(false);
        if (phase === "work") { setTomatoes(c=>c+1); setPhase("break"); return BREAK_S; }
        setPhase("work"); return WORK_S;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [running, phase]);

  const reset = () => { clearInterval(ref.current); setRunning(false); setPhase("work"); setSecs(WORK_S); };
  const total  = phase === "work" ? WORK_S : BREAK_S;
  const pct    = ((total - secs) / total) * 100;
  const R = 52, C = 2 * Math.PI * R;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className={`text-xs font-black uppercase tracking-widest ${phase==="work" ? "text-blue-500" : "text-emerald-500"}`}>
            {phase === "work" ? "🎯 Focus Session" : "☕ Rest Break"}
          </p>
          {taskName && <p className="text-[11px] text-gray-400 font-semibold mt-0.5 max-w-[170px] truncate">{taskName}</p>}
        </div>
        {tomatoes > 0 && (
          <span className="bg-red-50 text-red-500 font-black text-xs px-2.5 py-1 rounded-full">🍅 {tomatoes}</span>
        )}
      </div>

      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={R} fill="none" stroke="#f3f4f6" strokeWidth="8"/>
          <circle cx="60" cy="60" r={R} fill="none"
            stroke={phase==="work" ? "#60a5fa" : "#34d399"}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - pct/100)}
            style={{transition:"stroke-dashoffset 1s linear"}}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-gray-800 tabular-nums">{fmt(secs)}</span>
          <span className="text-[10px] text-gray-400 font-bold">{phase==="work" ? "stay focused" : "you earned it"}</span>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        <button onClick={() => setRunning(r=>!r)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all ${
            running ? "bg-gray-100 text-gray-600" : "bg-blue-500 text-white shadow-lg shadow-blue-200"
          }`}>
          {running ? <Pause size={14}/> : <Play size={14}/>}
          {running ? "Pause" : "Start Focus"}
        </button>
        <button onClick={reset} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
          <RotateCcw size={14}/>
        </button>
      </div>
    </div>
  );
}

// ── Box Breathing (4-4-4-4) ───────────────────────────────────────
function BoxBreathing({ onClose }) {
  const PHASES = ["Inhale","Hold","Exhale","Hold"];
  const COLORS  = ["text-blue-500","text-violet-500","text-emerald-500","text-amber-500"];
  const [phase,  setPhase]  = useState(0);
  const [count,  setCount]  = useState(4);
  const [cycles, setCycles] = useState(0);
  const [active, setActive] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!active || cycles >= 4) { clearInterval(ref.current); if(cycles>=4) setActive(false); return; }
    ref.current = setInterval(() => {
      setCount(c => {
        if (c > 1) return c - 1;
        setPhase(p => { const n=(p+1)%4; if(n===0) setCycles(cy=>cy+1); return n; });
        return 4;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [active, cycles]);

  const scaleVal = (phase===0||phase===2) ? 1 + (4-count)*0.04 : 1;

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-blue-700 font-black text-[11px] uppercase tracking-widest">📦 Box Breathing 4-4-4-4</p>
        <button onClick={onClose} className="text-gray-400 font-black text-sm">✕</button>
      </div>
      <div className="text-center py-2">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-white border-4 border-blue-200 flex items-center justify-center mb-3 transition-transform duration-700"
          style={{transform:`scale(${scaleVal})`}}>
          <span className={`text-3xl font-black ${COLORS[phase]}`}>{count}</span>
        </div>
        <p className={`text-lg font-black ${COLORS[phase]} mb-1`}>{PHASES[phase]}</p>
        <p className="text-xs text-gray-400 font-semibold">{cycles}/4 cycles {cycles>=4 && "✓ Complete"}</p>
      </div>
      <button onClick={() => { if(cycles>=4){ setCycles(0); setPhase(0); setCount(4); } setActive(a=>!a); }}
        className={`w-full py-2.5 rounded-xl font-black text-sm mt-2 transition-all ${
          active ? "bg-gray-100 text-gray-600" : "bg-blue-500 text-white shadow-md shadow-blue-200"
        }`}>
        {active ? "Pause" : cycles >= 4 ? "Restart" : "Start"}
      </button>
    </div>
  );
}

// ── 5-4-3-2-1 Grounding ──────────────────────────────────────────
function Grounding({ onClose }) {
  const [step,   setStep]   = useState(0);
  const [inputs, setInputs] = useState(Array(5).fill(""));
  const g = GROUNDING[step];

  const setInput = (val) => {
    const a = [...inputs]; a[step] = val; setInputs(a);
  };

  return (
    <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-violet-700 font-black text-[11px] uppercase tracking-widest">🌿 5-4-3-2-1 Grounding</p>
        <button onClick={onClose} className="text-violet-400 font-black text-sm">✕</button>
      </div>
      <div className="flex gap-1 mb-4">
        {GROUNDING.map((_,i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i<=step?"bg-violet-400":"bg-violet-200"}`}/>
        ))}
      </div>
      <div className="text-center mb-3">
        <span className="text-4xl block mb-2">{g.emoji}</span>
        <p className="text-violet-700 font-black text-sm">{g.prompt}</p>
      </div>
      <textarea value={inputs[step]} onChange={e=>setInput(e.target.value)}
        placeholder="Type here..." rows={2}
        className="w-full bg-white rounded-xl p-3 text-sm font-semibold text-gray-700 resize-none outline-none border border-violet-100"/>
      <div className="flex gap-2 mt-2">
        {step > 0 && (
          <button onClick={() => setStep(s=>s-1)} className="flex-1 py-2 bg-violet-100 text-violet-600 font-black text-sm rounded-xl">← Back</button>
        )}
        {step < 4
          ? <button onClick={() => setStep(s=>s+1)} className="flex-1 py-2 bg-violet-500 text-white font-black text-sm rounded-xl">Next →</button>
          : <button onClick={onClose} className="flex-1 py-2 bg-emerald-500 text-white font-black text-sm rounded-xl">✓ I feel grounded</button>
        }
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  TABS
// ══════════════════════════════════════════════════════════════════

// ── Prayer Tracker ────────────────────────────────────────────────
function PrayerTracker({ tasks, onToggle, onBonusXP }) {
  const prayers  = tasks.filter(t => t.category === "Prayer");
  const doneCnt  = prayers.filter(t => t.done).length;
  const allDone  = doneCnt === 5;
  const prevDone = useRef(doneCnt);

  useEffect(() => {
    if (doneCnt === 5 && prevDone.current < 5) onBonusXP(50);
    prevDone.current = doneCnt;
  }, [doneCnt]);

  return (
    <div className={`rounded-2xl p-4 shadow-sm transition-all duration-500 ${
      allDone ? "bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100" : "bg-white"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🕌</span>
          <div>
            <p className="font-black text-gray-800 text-sm">الصلوات الخمس</p>
            <p className="text-[10px] text-gray-400 font-semibold tracking-wide">Daily Prayers</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-black ${allDone ? "text-teal-600" : "text-gray-500"}`}>{doneCnt}/5</span>
          {allDone && (
            <span className="text-[10px] bg-teal-100 text-teal-700 font-black px-2 py-0.5 rounded-full">
              +50 XP 🎉
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width:`${(doneCnt/5)*100}%`, background:"linear-gradient(90deg,#2dd4bf,#10b981)" }}/>
      </div>

      {/* Prayer rows */}
      <div className="space-y-1.5">
        {PRAYERS_META.map(p => {
          const task = prayers.find(t => t.id === p.id);
          if (!task) return null;
          return (
            <button key={p.id} onClick={() => onToggle(task.id)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all text-left ${
                task.done ? "bg-teal-50" : "bg-gray-50 hover:bg-gray-100 active:scale-[0.98]"
              }`}>
              <span className="text-lg leading-none">{p.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-black text-sm ${task.done ? "text-teal-700" : "text-gray-800"}`}>
                  {p.ar}
                </p>
                <p className="text-[10px] text-gray-400 font-semibold">{p.en} · {p.time}</p>
              </div>
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                task.done ? "bg-teal-500 border-teal-500" : "border-gray-200"
              }`}>
                {task.done && <Check size={11} className="text-white" strokeWidth={3}/>}
              </div>
            </button>
          );
        })}
      </div>

      {allDone && (
        <p className="text-center text-teal-600 font-black text-xs mt-3 py-1">
          🌟 الحمد لله — All prayers complete today!
        </p>
      )}
    </div>
  );
}
function TodayTab({ tasks, energy, onEnergyChange, onToggle, onFocusTask, onAddTask, onOpenAdd, xp, onBonusXP }) {
  const cap       = ENERGY_CAP[energy];
  const visible   = (energy === "crisis"
    ? tasks.filter(t => t.difficulty === "easy" && t.timeMin <= 3)
    : tasks.filter(t => ENERGY_RANK[t.energyNeeded] <= cap + 1)
  ).filter(t => t.category !== "Prayer");
  const quickWins = visible.filter(t => !t.done && t.timeMin <= 3);
  const done      = tasks.filter(t => t.done).length;
  const total     = tasks.length;
  const pct       = total > 0 ? Math.round((done/total)*100) : 0;

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <EnergySelector energy={energy} onChange={onEnergyChange}/>

      {/* ── Prayer Tracker ── */}
      <PrayerTracker tasks={tasks} onToggle={onToggle} onBonusXP={onBonusXP}/>

      {energy === "crisis" && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <p className="text-red-700 font-black text-[11px] uppercase tracking-widest mb-1">🆘 Crisis Mode Active</p>
          <p className="text-gray-700 font-semibold text-sm leading-relaxed">
            Showing only the easiest tasks (under 3 min). Your only job right now is to exist. That is genuinely enough.
          </p>
        </div>
      )}

      <HALTBanner onAddTask={onAddTask}/>

      {/* Progress */}
      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <p className="font-black text-gray-800 text-sm">{visible.length} tasks for your energy level</p>
          <button onClick={() => onFocusTask(null)}
            className="text-[11px] font-black text-blue-500 bg-blue-50 rounded-full px-2.5 py-1">
            Focus Mode →
          </button>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width:`${pct}%`, background: pct===100 ? "linear-gradient(90deg,#a78bfa,#f472b6)" : "linear-gradient(90deg,#60a5fa,#93c5fd)" }}/>
        </div>
        <p className="text-right text-[10px] text-gray-400 mt-1 font-semibold">{done}/{total} complete · {pct}%</p>
      </div>

      {/* Quick wins */}
      {quickWins.length > 0 && (
        <div>
          <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-2">⚡ Quick Wins — Under 3 Min</p>
          <div className="space-y-2">
            {quickWins.slice(0,3).map(t => (
              <TaskCard key={t.id} task={t} onToggle={onToggle} onFocus={onFocusTask} highlight/>
            ))}
          </div>
        </div>
      )}

      {/* All tasks */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">All Tasks</p>
          <button onClick={onOpenAdd} className="flex items-center gap-1 text-[11px] font-black text-blue-500">
            <Plus size={11}/> Add task
          </button>
        </div>
        <div className="space-y-2">
          {visible.map(t => <TaskCard key={t.id} task={t} onToggle={onToggle} onFocus={onFocusTask}/>)}
        </div>
        {visible.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm font-bold text-gray-300">No tasks match your current energy.</p>
            <p className="text-xs text-gray-300 mt-1">Raise your energy level above, or add simple tasks.</p>
          </div>
        )}
      </div>

      <button onClick={onOpenAdd}
        className="w-full flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3 shadow-sm text-blue-500 font-black text-sm hover:shadow-md transition-shadow">
        <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center">
          <Plus size={14} className="text-blue-500"/>
        </div>
        Add a task
      </button>
    </div>
  );
}

// ── FOCUS TAB ─────────────────────────────────────────────────────
function FocusTab({ tasks, onToggle }) {
  const pending = tasks.filter(t => !t.done);
  const [idx,        setIdx]        = useState(0);
  const [stuckIdx,   setStuckIdx]   = useState(0);
  const [showStuck,  setShowStuck]  = useState(false);
  const [showGround, setShowGround] = useState(false);
  const [showBreath, setShowBreath] = useState(false);

  if (pending.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
        <span className="text-7xl">🥳</span>
        <h2 className="text-2xl font-black text-gray-800">Every task complete!</h2>
        <p className="text-gray-500 font-semibold leading-relaxed">Your brain worked genuinely hard today. You've earned rest without guilt.</p>
        <div className="bg-violet-50 rounded-2xl p-4 text-left w-full">
          <p className="text-violet-600 font-black text-[11px] uppercase tracking-widest mb-2">🧠 What just happened in your brain</p>
          <p className="text-gray-700 font-semibold text-sm leading-relaxed">
            Completing tasks triggered real dopamine releases all day. Your prefrontal cortex literally strengthened with each win. Rest now — it consolidates everything.
          </p>
        </div>
      </div>
    );
  }

  const safe = Math.min(idx, pending.length - 1);
  const task = pending[safe];
  const cat  = CAT[task.category]  || CAT["Mindfulness"];
  const diff = DIFF[task.difficulty] || DIFF.easy;

  const complete = () => {
    onToggle(task.id);
    setIdx(i => Math.max(0, Math.min(i, pending.length - 2)));
    setShowStuck(false);
  };
  const shuffle = () => { setIdx(Math.floor(Math.random()*pending.length)); setShowStuck(false); };
  const skip    = () => { setIdx(i => (i+1)%pending.length); setShowStuck(false); };

  const closeAll = () => { setShowStuck(false); setShowGround(false); setShowBreath(false); };

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
          {pending.length} task{pending.length!==1?"s":""} remaining
        </p>
        <button onClick={shuffle} className="flex items-center gap-1.5 text-[11px] font-black text-blue-500 bg-blue-50 rounded-full px-3 py-1.5">
          <Shuffle size={11}/> Pick for me
        </button>
      </div>

      {/* Hero task card */}
      <div className="bg-white rounded-3xl p-5 shadow-md text-center">
        <span className="text-5xl block mb-3">{task.emoji}</span>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className={`text-[10px] font-black uppercase tracking-wider ${cat.color}`}>{task.category}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${diff.bg} ${diff.color}`}>{diff.label}</span>
        </div>
        <h2 className="text-xl font-black text-gray-800 leading-tight mb-1">{task.text}</h2>
        <p className="text-gray-400 font-semibold text-xs">~{task.timeMin} minute{task.timeMin!==1?"s":""}</p>
        {task.habitStack && (
          <span className="inline-block mt-2 bg-gray-50 text-gray-400 text-[11px] font-semibold rounded-xl px-3 py-1.5">
            📌 Best: {task.habitStack}
          </span>
        )}
      </div>

      <PomodoroTimer taskName={task.text}/>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => { closeAll(); setShowStuck(s=>!s); }}
          className="py-3 rounded-xl bg-amber-50 text-amber-600 font-black text-sm flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-colors">
          😵‍💫 I'm Stuck
        </button>
        <button onClick={complete}
          className="py-3 rounded-xl bg-blue-500 text-white font-black text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-200 hover:bg-blue-600 transition-colors">
          <Check size={15} strokeWidth={3}/> Done!
        </button>
      </div>

      {/* Regulation tools */}
      <div className="flex gap-2">
        <button onClick={() => { closeAll(); setShowGround(s=>!s); }}
          className={`flex-1 py-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-colors ${
            showGround ? "bg-violet-200 text-violet-700" : "bg-violet-50 text-violet-600"}`}>
          🌿 Ground Me
        </button>
        <button onClick={() => { closeAll(); setShowBreath(s=>!s); }}
          className={`flex-1 py-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-colors ${
            showBreath ? "bg-blue-200 text-blue-700" : "bg-blue-50 text-blue-500"}`}>
          💨 Breathe
        </button>
        {pending.length > 1 && (
          <button onClick={skip} className="flex-1 py-2 rounded-xl text-[11px] font-black text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors">
            Skip →
          </button>
        )}
      </div>

      {/* CBT stuck panel */}
      {showStuck && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <p className="text-amber-700 font-black text-[11px] uppercase tracking-widest mb-2">💡 {STUCK_TIPS[stuckIdx].title}</p>
          <p className="text-gray-700 font-semibold text-sm leading-relaxed">{STUCK_TIPS[stuckIdx].body}</p>
          <button onClick={() => setStuckIdx(i=>(i+1)%STUCK_TIPS.length)}
            className="mt-2.5 text-[11px] font-black text-amber-600 underline underline-offset-2">
            Another strategy →
          </button>
        </div>
      )}

      {showGround && <Grounding onClose={() => setShowGround(false)}/>}
      {showBreath && <BoxBreathing onClose={() => setShowBreath(false)}/>}
    </div>
  );
}

// ── BRAIN DUMP TAB ────────────────────────────────────────────────
function DumpTab({ onAddTask }) {
  const MOODS = [
    {id:"great",emoji:"😄",label:"Great"},{id:"okay",emoji:"😐",label:"Okay"},
    {id:"anxious",emoji:"😰",label:"Anxious"},{id:"sad",emoji:"😔",label:"Sad"},
    {id:"angry",emoji:"😠",label:"Angry"},{id:"overwhelmed",emoji:"🤯",label:"Overwhelmed"},
  ];

  const [mood,   setMood]   = useState(null);
  const [text,   setText]   = useState("");
  const [dumps,  setDumps]  = useState([]);
  const ref = useRef(null);

  const dump = () => {
    const lines = text.split("\n").map(l=>l.trim()).filter(Boolean);
    if (!lines.length) return;
    setDumps(d => [...d, ...lines.map((l,i) => ({ id:`bd${Date.now()}${i}`, text:l, converted:false }))]);
    setText("");
    ref.current?.focus();
  };

  const convert = (item) => {
    onAddTask({ emoji:"📝", text:item.text, category:"Productivity", timeMin:5, difficulty:"medium", energyNeeded:"medium", habitStack:"" });
    setDumps(d => d.map(dd => dd.id===item.id ? {...dd,converted:true} : dd));
  };

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {/* Mood check */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2.5">💭 How are you feeling?</p>
        <div className="flex gap-1.5 flex-wrap">
          {MOODS.map(m => (
            <button key={m.id} onClick={() => setMood(m.id)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 border transition-all text-xs font-black ${
                mood===m.id ? "border-blue-300 bg-blue-50 text-blue-600" : "border-gray-100 text-gray-500"}`}>
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
        {mood === "overwhelmed" && (
          <div className="mt-2.5 bg-violet-50 rounded-xl p-2.5">
            <p className="text-violet-700 font-bold text-xs leading-relaxed">
              🌿 That's okay. Overwhelm is your brain's signal that it's carrying too much. Dump everything below — getting it out of your head is the first step.
            </p>
          </div>
        )}
        {mood === "anxious" && (
          <div className="mt-2.5 bg-blue-50 rounded-xl p-2.5">
            <p className="text-blue-700 font-bold text-xs leading-relaxed">
              💨 Try 3 slow breaths before you start. Anxiety narrows focus — dumping your thoughts will help widen it again.
            </p>
          </div>
        )}
      </div>

      {/* Brain dump */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">🧠 Brain Dump</p>
        <p className="text-gray-400 text-[11px] font-semibold mb-3">
          No filter. No judgment. One thought per line. Just get it out of your head.
        </p>
        <textarea ref={ref} value={text} onChange={e=>setText(e.target.value)}
          placeholder={"Anything on your mind...\nWorries, ideas, to-dos, anything.\nOne thought per line."}
          rows={5}
          className="w-full text-sm text-gray-800 font-semibold resize-none outline-none placeholder-gray-300 leading-relaxed"/>
        <button onClick={dump} disabled={!text.trim()}
          className="mt-3 w-full bg-blue-500 text-white font-black text-sm py-2.5 rounded-xl disabled:opacity-30 hover:bg-blue-600 transition-colors shadow-md shadow-blue-100">
          Dump It 🧠
        </button>
        <p className="text-center text-[10px] text-gray-300 mt-2 font-semibold">Clearing working memory reduces cognitive load</p>
      </div>

      {/* Captured thoughts */}
      {dumps.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
            Captured ({dumps.filter(d=>!d.converted).length} to process)
          </p>
          {dumps.map(d => (
            <div key={d.id} className={`bg-white rounded-xl px-4 py-3 shadow-sm flex items-start gap-3 transition-all ${d.converted?"opacity-30":""}`}>
              <span className="text-gray-700 font-semibold text-sm flex-1 leading-snug">{d.text}</span>
              {d.converted
                ? <Check size={14} className="text-emerald-400 flex-shrink-0 mt-0.5"/>
                : <button onClick={() => convert(d)} className="text-[11px] font-black text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5">
                    → Task
                  </button>
              }
            </div>
          ))}
          {dumps.some(d=>!d.converted) && (
            <p className="text-[10px] text-gray-400 text-center font-semibold">Tap "→ Task" to add anything to your task list</p>
          )}
        </div>
      )}

      {dumps.length === 0 && (
        <div className="text-center py-8 text-gray-300">
          <span className="text-4xl block mb-2">🧠</span>
          <p className="text-sm font-semibold">Your captured thoughts will appear here</p>
          <p className="text-[11px] mt-1">Externalizing thoughts frees up ADHD working memory</p>
        </div>
      )}
    </div>
  );
}

// ── WINS TAB (Progress + Achievements) ────────────────────────────
function WinsTab({ tasks, xp, streak }) {
  const done      = tasks.filter(t=>t.done).length;
  const total     = tasks.length;
  const pct       = total > 0 ? Math.round((done/total)*100) : 0;
  const level     = Math.floor(xp/100) + 1;
  const lvlXP     = xp % 100;
  const dayIdx    = new Date().getDay();
  const hardDone  = tasks.filter(t=>t.done && t.difficulty==="hard").length;
  const usedDump  = tasks.some(t=>t.id.startsWith("bd"));

  const unlocked = ACHIEVEMENTS.filter(a => a.check(tasks, xp, streak));

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {/* Daily affirmation */}
      <div className="bg-gradient-to-br from-violet-50 via-blue-50 to-fuchsia-50 rounded-2xl p-4 border border-violet-100">
        <p className="text-violet-600 font-black text-[11px] uppercase tracking-widest mb-2">✨ Today's Affirmation</p>
        <p className="text-gray-800 font-black text-base leading-snug">"{AFFIRMATIONS[dayIdx % AFFIRMATIONS.length]}"</p>
      </div>

      {/* XP + Level */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-black text-gray-800 text-base">Level {level}</p>
            <p className="text-gray-400 text-xs font-semibold">{100-lvlXP} XP until next level</p>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 rounded-full px-3 py-1.5">
            <Star size={13} className="text-amber-400"/>
            <span className="font-black text-amber-600 text-sm">{xp} XP</span>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width:`${lvlXP}%`, background:"linear-gradient(90deg,#f59e0b,#fbbf24)" }}/>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon:<Flame size={22} className="mx-auto text-orange-400 mb-1"/>, val:streak,    label:"Day Streak"   },
          { icon:<Trophy size={22} className="mx-auto text-amber-400 mb-1"/>,  val:`${done}/${total}`, label:"Done Today" },
          { icon:<Zap size={22} className="mx-auto text-blue-400 mb-1"/>,      val:`${pct}%`,  label:"Completed"    },
          { icon:<Award size={22} className="mx-auto text-violet-400 mb-1"/>,  val:hardDone,   label:"Hard Wins"    },
        ].map((s,i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm text-center">
            {s.icon}
            <p className="text-2xl font-black text-gray-800">{s.val}</p>
            <p className="text-[11px] text-gray-400 font-bold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
          🏆 Achievements — {unlocked.length}/{ACHIEVEMENTS.length} unlocked
        </p>
        <div className="grid grid-cols-4 gap-2">
          {ACHIEVEMENTS.map(a => {
            const got = unlocked.some(u=>u.id===a.id);
            return (
              <div key={a.id} title={a.desc}
                className={`rounded-xl p-2 text-center border transition-all ${got ? "bg-amber-50 border-amber-100" : "bg-gray-50 border-gray-100 opacity-35"}`}>
                <span className="text-2xl block">{a.emoji}</span>
                <p className="text-[9px] font-black text-gray-700 mt-1 leading-tight">{a.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADHD Science tip */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
        <p className="text-blue-600 font-black text-[11px] uppercase tracking-widest mb-2">🔬 ADHD Science</p>
        <p className="text-gray-700 font-semibold text-sm leading-relaxed">
          {ADHD_SCIENCE[dayIdx % ADHD_SCIENCE.length]}
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  ADD TASK SHEET
// ══════════════════════════════════════════════════════════════════
function AddSheet({ addedSet, onAdd, onClose }) {
  const [cat, setCat] = useState("Self-care");
  const tabs = Object.keys(SUGGESTIONS);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{maxWidth:"384px",margin:"0 auto",left:0,right:0}}>
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-gray-50 rounded-t-3xl shadow-2xl flex flex-col z-10" style={{maxHeight:"78vh"}}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 bg-gray-200 rounded-full"/>
        </div>
        <div className="bg-white mx-3 rounded-2xl shadow-sm p-4 mb-2">
          <div className="flex items-center justify-between">
            <p className="font-black text-gray-800">Add a task</p>
            <button onClick={onClose} className="bg-gray-100 text-gray-500 text-[11px] font-black rounded-full px-3 py-1.5">Close</button>
          </div>
          <p className="text-gray-400 text-[11px] font-semibold mt-1">Tasks with time estimates help with ADHD time blindness.</p>
        </div>
        <div className="flex border-b border-gray-100 bg-white px-3">
          {tabs.map(t => (
            <button key={t} onClick={() => setCat(t)}
              className={`flex-1 text-[10px] font-black py-2.5 border-b-2 transition-all ${cat===t ? "border-blue-400 text-blue-500" : "border-transparent text-gray-400"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {SUGGESTIONS[cat].map(item => {
            const added = addedSet.has(item.text);
            const d = DIFF[item.difficulty];
            return (
              <button key={item.id} onClick={() => !added && onAdd(item)} disabled={added}
                className={`w-full bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm text-left transition-all ${
                  added ? "opacity-40 cursor-default" : "hover:shadow-md active:scale-[0.98]"}`}>
                <span className="text-xl flex-shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${d.bg} ${d.color}`}>{d.label}</span>
                    <span className="text-[10px] text-gray-400 font-bold">~{item.timeMin}m</span>
                  </div>
                  <span className="font-bold text-gray-800 text-sm">{item.text}</span>
                </div>
                {added ? <Check size={13} className="text-emerald-400 flex-shrink-0"/> : <Plus size={13} className="text-gray-300 flex-shrink-0"/>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════════════════════════════
export default function ADHDApp() {
  const [tasks,   setTasks]   = useState(DEFAULT_TASKS);
  const [energy,  setEnergy]  = useState("medium");
  const [tab,     setTab]     = useState("today");
  const [showAdd, setShowAdd] = useState(false);
  const [xp,      setXp]      = useState(30);
  const [streak]              = useState(3);
  const [toast,   setToast]   = useState(null);

  const done  = tasks.filter(t=>t.done).length;
  const total = tasks.length;
  const pct   = total > 0 ? Math.round((done/total)*100) : 0;

  const cloudFace = pct===100 ? "🥳" : pct>=50 ? "😊" : pct>0 ? "🙂" : "😴";
  const cloudGlow = pct===100 ? "from-violet-100 to-fuchsia-50"
    : energy==="crisis" ? "from-red-50 to-orange-50"
    : pct>=50 ? "from-cyan-100 to-sky-50" : "from-blue-100 to-indigo-50";

  const toast2 = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 2000); };

  const toggleTask = (id) => {
    const t = tasks.find(k=>k.id===id); if (!t) return;
    const completing = !t.done;
    setTasks(ts => ts.map(k => k.id===id ? {...k,done:!k.done} : k));
    if (completing) { const earned = XP_MAP[t.difficulty]||10; setXp(x=>x+earned); toast2(`+${earned} XP! 🎉`); }
  };

  const addTask = (item) => {
    if (tasks.some(t=>t.text===item.text)) return;
    setTasks(ts => [...ts, { id:`u${Date.now()}`, ...item, done:false }]);
    setShowAdd(false);
    toast2("Task added ✓");
  };

  const addedSet = new Set(tasks.map(t=>t.text));

  const TABS = [
    { id:"today", icon:<Home size={18}/>,   label:"Today"  },
    { id:"focus", icon:<Target size={18}/>, label:"Focus"  },
    { id:"dump",  icon:<Brain size={18}/>,  label:"Dump"   },
    { id:"wins",  icon:<Award size={18}/>,  label:"Wins"   },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-sm min-h-screen flex flex-col relative">

        {/* XP Toast */}
        {toast && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[70] bg-blue-500 text-white text-sm font-black px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 whitespace-nowrap"
            style={{animation:"none"}}>
            <Sparkles size={13}/> {toast}
          </div>
        )}

        {/* Header */}
        <div className={`bg-gradient-to-b ${cloudGlow} pt-10 pb-4 px-4 transition-all duration-700`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 bg-white/70 rounded-full px-2.5 py-1 shadow-sm">
              <Flame size={13} className="text-orange-400"/>
              <span className="text-sm font-black text-gray-700">{streak} day streak</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/70 rounded-full px-2.5 py-1 shadow-sm">
              <Star size={13} className="text-amber-400"/>
              <span className="text-sm font-black text-amber-600">{xp} XP</span>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="relative flex-shrink-0">
              <span className="text-6xl select-none" style={{filter:"drop-shadow(0 4px 12px rgba(147,197,253,0.5))"}}>☁️</span>
              <span className="absolute inset-0 flex items-center justify-center text-2xl pb-1.5 pointer-events-none">{cloudFace}</span>
            </div>
            <div>
              <p className="font-black text-gray-800 text-sm">{todayStr()}</p>
              <p className="text-[11px] text-gray-500 font-semibold">{done}/{total} done · {pct}% complete</p>
              {pct === 100 && <p className="text-[11px] text-violet-600 font-black mt-0.5 flex items-center gap-1"><Sparkles size={11}/> All done — incredible!</p>}
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto pb-20">
          {tab==="today" && (
            <TodayTab
              tasks={tasks} energy={energy}
              onEnergyChange={setEnergy}
              onToggle={toggleTask}
              onFocusTask={() => setTab("focus")}
              onAddTask={addTask}
              onOpenAdd={() => setShowAdd(true)}
              xp={xp}
              onBonusXP={earned => { setXp(x=>x+earned); toast2(`+${earned} XP Bonus! 🕌`); }}
            />
          )}
          {tab==="focus" && <FocusTab tasks={tasks} onToggle={toggleTask}/>}
          {tab==="dump"  && <DumpTab  onAddTask={addTask}/>}
          {tab==="wins"  && <WinsTab  tasks={tasks} xp={xp} streak={streak}/>}
        </div>

        {/* Bottom nav */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100 flex px-2 py-2 z-40 shadow-xl">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-1 rounded-xl transition-all ${
                tab===t.id ? "text-blue-500 bg-blue-50" : "text-gray-400"}`}>
              {t.icon}
              <span className="text-[10px] font-black">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Add sheet */}
        {showAdd && <AddSheet addedSet={addedSet} onAdd={addTask} onClose={() => setShowAdd(false)}/>}
      </div>
    </div>
  );
}

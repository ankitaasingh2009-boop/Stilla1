import React, { useState, useEffect, useMemo } from 'react'
import { Preferences } from '@capacitor/preferences'
import { LocalNotifications } from '@capacitor/local-notifications'

/* ---------------- storage (native on phone, localStorage on web) ---------------- */
const store = {
  async get(key, fb) {
    try { const { value } = await Preferences.get({ key }); return value != null ? JSON.parse(value) : fb }
    catch { return fb }
  },
  async set(key, val) { try { await Preferences.set({ key, value: JSON.stringify(val) }) } catch {} },
}

/* ---------------- date helpers ---------------- */
const dk = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}` }
const todayK = () => dk(new Date())
const dayNum = () => Math.floor(Date.now() / 86400000)
const niceDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) }

/* ---------------- content ---------------- */
const MOODS = [
  { v: 1, e: '😞', label: 'Low' },
  { v: 2, e: '😕', label: 'Meh' },
  { v: 3, e: '😐', label: 'Okay' },
  { v: 4, e: '🙂', label: 'Good' },
  { v: 5, e: '😄', label: 'Great' },
]

const AFFIRMATIONS = [
  'You are allowed to take up space.',
  'Rest is productive too.',
  'You have survived 100% of your hardest days.',
  'Your worth is not measured by what you get done.',
  'You can do hard things, gently.',
  'It is okay to put yourself first today.',
  'You are growing, even when it feels slow.',
  'Your feelings are valid and they will pass.',
  'Small steps still move you forward.',
  'You deserve the same kindness you give others.',
  'You are more than enough, exactly as you are.',
  'Breathe. You are doing better than you think.',
]

const TINY_ACTS = [
  'Drink a full glass of water right now.',
  'Step outside for 2 minutes of fresh air.',
  'Stretch your arms over your head and roll your shoulders.',
  'Text someone you love just to say hi.',
  'Tidy one small surface near you.',
  'Put on a song you love and let it play.',
  'Wash your face with warm water.',
  'Write down one thing you are looking forward to.',
  'Unclench your jaw and drop your shoulders.',
  'Make yourself a warm drink and actually sit with it.',
]

const CORTISOL_TIPS = [
  { tip: 'Get sunlight on your face within an hour of waking.', why: 'Morning light anchors your cortisol rhythm so it peaks early and dips at night — better energy and sleep.' },
  { tip: 'Make your exhale longer than your inhale a few times.', why: 'A long exhale switches on the calming (parasympathetic) nervous system and lowers stress hormones.' },
  { tip: 'Eat some protein with breakfast before heavy caffeine.', why: 'Caffeine on an empty stomach can spike cortisol; food first keeps it steadier.' },
  { tip: 'Keep a steady sleep and wake time, even weekends.', why: 'Irregular sleep is read by the body as stress and raises baseline cortisol.' },
  { tip: 'Put your phone down 30 minutes before bed.', why: 'Late screens and scrolling keep cortisol elevated and delay melatonin.' },
  { tip: 'Take a short walk after a stressful moment.', why: 'Gentle movement helps clear stress hormones from your system.' },
  { tip: 'Reach out to someone you feel safe with today.', why: 'Warm social connection releases oxytocin, which directly buffers cortisol.' },
  { tip: 'Swap one coffee for water or herbal tea this afternoon.', why: 'Less afternoon caffeine means cortisol can wind down before bedtime.' },
]

const VIBES = {
  Move:    { e: '🚶‍♀️', tint: '#ffe0e9', ideas: ['Take a 15-minute walk outside', 'Do a 10-minute home workout', 'Stretch or do gentle yoga', 'Put on music and dance one song', 'Take the stairs and move your body', 'Do 20 squats and 10 wall push-ups'] },
  Treat:   { e: '🛍️', tint: '#fff0d9', ideas: ['Browse and buy yourself one small thing', 'Do a face mask or skincare ritual', 'Order your favourite meal or coffee', 'Window-shop a wishlist online', 'Paint your nails', 'Run a warm bath or long shower'] },
  Create:  { e: '🎨', tint: '#f0e6ff', ideas: ['Doodle or colour for 10 minutes', 'Write a page in a journal', 'Cook or bake something new', 'Take photos of things you find pretty', 'Start a Pinterest board for a dream', 'Rearrange a corner of a room'] },
  Connect: { e: '💬', tint: '#dff3ff', ideas: ['Call a friend or family member', 'Send a voice note to someone you miss', 'Plan a coffee date this week', 'Compliment someone genuinely', 'Reply to that message you keep putting off', 'Join an online community you like'] },
  Rest:    { e: '🌙', tint: '#e8eaff', ideas: ['Take a 20-minute nap', 'Lie down and listen to calm music', 'Read a few pages of a book', 'Watch a comfort movie or show', 'Do nothing on purpose for 10 minutes', 'Make tea and sit by a window'] },
  Explore: { e: '🧭', tint: '#dffaf0', ideas: ['Try a new café or restaurant', 'Walk a route you have never taken', 'Plan a day trip or weekend away', 'Visit a bookshop, market or gallery', 'Learn one new thing on YouTube', 'Try a recipe from a new cuisine'] },
  Calm:    { e: '🫧', tint: '#e0f7f4', ideas: ['Do 6 slow breaths with a long exhale', 'Sit in sunlight for a few minutes', 'Make a warm herbal tea (no caffeine)', 'Do a 1-minute body scan, head to toe', 'Write down what is on your mind to empty it', 'Put your phone away and just be for 5 minutes'] },
}
const VIBE_NAMES = Object.keys(VIBES)

/* ---------------- Keep Moving: workouts ---------------- */
const STRENGTH = {
  Chest: [
    { n: 'Push-ups', loc: 'Home' }, { n: 'Incline push-ups', loc: 'Home' }, { n: 'Decline push-ups', loc: 'Home' },
    { n: 'Knee push-ups', loc: 'Home' }, { n: 'Wide push-ups', loc: 'Home' }, { n: 'Diamond push-ups', loc: 'Home' },
    { n: 'Archer push-ups', loc: 'Home' }, { n: 'Clap (plyo) push-ups', loc: 'Home' },
    { n: 'Barbell bench press', loc: 'Gym' }, { n: 'Incline barbell press', loc: 'Gym' }, { n: 'Dumbbell bench press', loc: 'Gym' },
    { n: 'Incline dumbbell press', loc: 'Gym' }, { n: 'Dumbbell fly', loc: 'Gym' }, { n: 'Cable crossover', loc: 'Gym' },
    { n: 'Pec deck machine', loc: 'Gym' }, { n: 'Chest dips', loc: 'Gym' }, { n: 'Machine chest press', loc: 'Gym' },
  ],
  Back: [
    { n: 'Pull-ups', loc: 'Home' }, { n: 'Chin-ups', loc: 'Home' }, { n: 'Inverted rows (under a table)', loc: 'Home' },
    { n: 'Superman', loc: 'Home' }, { n: 'Reverse snow angels', loc: 'Home' }, { n: 'Resistance band row', loc: 'Home' },
    { n: 'Band lat pulldown', loc: 'Home' }, { n: 'Towel rows', loc: 'Home' },
    { n: 'Lat pulldown', loc: 'Gym' }, { n: 'Seated cable row', loc: 'Gym' }, { n: 'Barbell bent-over row', loc: 'Gym' },
    { n: 'T-bar row', loc: 'Gym' }, { n: 'Single-arm dumbbell row', loc: 'Gym' }, { n: 'Deadlift', loc: 'Gym' },
    { n: 'Face pull', loc: 'Gym' }, { n: 'Straight-arm pulldown', loc: 'Gym' },
  ],
  Shoulders: [
    { n: 'Pike push-ups', loc: 'Home' }, { n: 'Wall handstand hold', loc: 'Home' }, { n: 'Lateral raise (water bottles)', loc: 'Home' },
    { n: 'Front raise (bottles)', loc: 'Home' }, { n: 'Band pull-apart', loc: 'Home' }, { n: 'Band overhead press', loc: 'Home' },
    { n: 'Overhead barbell press', loc: 'Gym' }, { n: 'Seated dumbbell press', loc: 'Gym' }, { n: 'Arnold press', loc: 'Gym' },
    { n: 'Lateral raise', loc: 'Gym' }, { n: 'Front raise', loc: 'Gym' }, { n: 'Rear delt fly', loc: 'Gym' },
    { n: 'Upright row', loc: 'Gym' }, { n: 'Cable lateral raise', loc: 'Gym' }, { n: 'Shrugs', loc: 'Gym' },
  ],
  Arms: [
    { n: 'Chair dips', loc: 'Home' }, { n: 'Diamond push-ups', loc: 'Home' }, { n: 'Band biceps curl', loc: 'Home' },
    { n: 'Band triceps pushdown', loc: 'Home' }, { n: 'Towel curl', loc: 'Home' }, { n: 'Backpack curl', loc: 'Home' },
    { n: 'Close-grip push-ups', loc: 'Home' }, { n: 'Isometric curl hold', loc: 'Home' },
    { n: 'Barbell curl', loc: 'Gym' }, { n: 'Dumbbell curl', loc: 'Gym' }, { n: 'Hammer curl', loc: 'Gym' },
    { n: 'Preacher curl', loc: 'Gym' }, { n: 'Cable curl', loc: 'Gym' }, { n: 'Concentration curl', loc: 'Gym' },
    { n: 'Triceps pushdown', loc: 'Gym' }, { n: 'Overhead triceps extension', loc: 'Gym' }, { n: 'Skull crushers', loc: 'Gym' },
    { n: 'Close-grip bench press', loc: 'Gym' }, { n: 'Triceps dips', loc: 'Gym' },
  ],
  Legs: [
    { n: 'Bodyweight squat', loc: 'Home' }, { n: 'Jump squat', loc: 'Home' }, { n: 'Forward lunge', loc: 'Home' },
    { n: 'Reverse lunge', loc: 'Home' }, { n: 'Bulgarian split squat', loc: 'Home' }, { n: 'Curtsy lunge', loc: 'Home' },
    { n: 'Glute bridge', loc: 'Home' }, { n: 'Single-leg glute bridge', loc: 'Home' }, { n: 'Wall sit', loc: 'Home' },
    { n: 'Step-ups', loc: 'Home' }, { n: 'Calf raises', loc: 'Home' }, { n: 'Donkey kicks', loc: 'Home' },
    { n: 'Fire hydrants', loc: 'Home' }, { n: 'Side-lying leg raises', loc: 'Home' }, { n: 'Squat pulses', loc: 'Home' },
    { n: 'Back squat', loc: 'Gym' }, { n: 'Front squat', loc: 'Gym' }, { n: 'Leg press', loc: 'Gym' },
    { n: 'Hack squat', loc: 'Gym' }, { n: 'Leg extension', loc: 'Gym' }, { n: 'Lying leg curl', loc: 'Gym' },
    { n: 'Romanian deadlift', loc: 'Gym' }, { n: 'Hip thrust', loc: 'Gym' }, { n: 'Walking lunges (dumbbell)', loc: 'Gym' },
    { n: 'Goblet squat', loc: 'Gym' }, { n: 'Standing calf raise', loc: 'Gym' }, { n: 'Cable glute kickback', loc: 'Gym' },
    { n: 'Hip abductor machine', loc: 'Gym' },
  ],
  Core: [
    { n: 'Plank', loc: 'Home' }, { n: 'Side plank', loc: 'Home' }, { n: 'Crunches', loc: 'Home' },
    { n: 'Bicycle crunches', loc: 'Home' }, { n: 'Reverse crunches', loc: 'Home' }, { n: 'Leg raises', loc: 'Home' },
    { n: 'Flutter kicks', loc: 'Home' }, { n: 'Mountain climbers', loc: 'Home' }, { n: 'Russian twists', loc: 'Home' },
    { n: 'Dead bug', loc: 'Home' }, { n: 'Hollow hold', loc: 'Home' }, { n: 'V-ups', loc: 'Home' },
    { n: 'Bird dog', loc: 'Home' }, { n: 'Toe touches', loc: 'Home' },
    { n: 'Cable crunch', loc: 'Gym' }, { n: 'Hanging leg raise', loc: 'Gym' }, { n: 'Captain’s chair raise', loc: 'Gym' },
    { n: 'Ab wheel rollout', loc: 'Gym' }, { n: 'Weighted Russian twist', loc: 'Gym' }, { n: 'Decline sit-up', loc: 'Gym' },
    { n: 'Cable woodchopper', loc: 'Gym' },
  ],
  'Full body': [
    { n: 'Burpees', loc: 'Home' }, { n: 'Mountain climbers', loc: 'Home' }, { n: 'Jumping jacks', loc: 'Home' },
    { n: 'High knees', loc: 'Home' }, { n: 'Bear crawl', loc: 'Home' }, { n: 'Squat-to-press (bottles)', loc: 'Home' },
    { n: 'Inchworm', loc: 'Home' }, { n: 'Skaters', loc: 'Home' },
    { n: 'Kettlebell swing', loc: 'Gym' }, { n: 'Clean and press', loc: 'Gym' }, { n: 'Thruster', loc: 'Gym' },
    { n: 'Farmer’s carry', loc: 'Gym' }, { n: 'Battle ropes', loc: 'Gym' }, { n: 'Box jumps', loc: 'Gym' },
    { n: 'Sled push', loc: 'Gym' }, { n: 'Medicine ball slam', loc: 'Gym' },
  ],
}

const MOVE_TYPES = {
  Yoga:     { e: '🧘‍♀️', options: ['Sun salutation flow', 'Downward dog', 'Cat-cow', 'Child’s pose', 'Warrior I & II', 'Tree pose', 'Cobra', 'Pigeon pose', 'Bridge pose', 'Seated forward fold', 'Hatha flow (20 min)', 'Vinyasa flow', 'Yin yoga', 'Morning stretch flow', 'Bedtime wind-down flow'] },
  Pilates:  { e: '🤸‍♀️', options: ['The Hundred', 'Roll-up', 'Single-leg circles', 'Rolling like a ball', 'Single-leg stretch', 'Double-leg stretch', 'Criss-cross', 'Spine stretch', 'Saw', 'Swan', 'Side kicks', 'Teaser', 'Pilates plank', 'Pilates bridge', 'Full mat flow (20 min)'] },
  Strength: { e: '💪', groups: STRENGTH },
  HIIT:     { e: '🔥', options: ['Tabata (20s on / 10s off)', '30-20-10 intervals', 'EMOM (every minute)', 'AMRAP 15 min', 'Sprint intervals', 'Bodyweight HIIT circuit', 'Dumbbell HIIT', 'Jump-rope intervals', 'Burpee ladder', 'Stair sprints'] },
  Hyrox:    { e: '🏟️', options: ['SkiErg — 1000m', 'Sled push — 50m', 'Sled pull — 50m', 'Burpee broad jumps — 80m', 'Row — 1000m', 'Farmers carry — 200m', 'Sandbag lunges — 100m', 'Wall balls — 100 reps', 'Run 1km (between stations)', 'Full Hyrox simulation', 'Compromised-running drill', 'Roxzone transition practice'] },
  CrossFit: { e: '🏋️‍♀️', options: ['WOD: Fran', 'WOD: Cindy', 'WOD: Murph', 'WOD: Helen', 'AMRAP circuit', 'Box jumps', 'Wall balls', 'Kettlebell swings', 'Thrusters', 'Double-unders', 'Toes-to-bar', 'Clean & jerk practice'] },
  Run:      { e: '🏃‍♀️', options: ['Easy 20-min run', '5K run', 'Interval sprints', 'Tempo run', 'Long run', 'Couch-to-5K session', 'Treadmill run', 'Hill sprints', 'Recovery jog'] },
  Walk:     { e: '🚶‍♀️', options: ['Brisk 30-min walk', 'Nature walk', 'Power walk', '10,000 steps', 'Incline treadmill walk', 'Evening stroll', 'Walk + podcast', 'Lunchtime walk'] },
  Hiking:   { e: '🥾', options: ['Easy nature trail', 'Hill hike', 'Long-distance hike', 'Steep incline climb', 'Stair / step climbing', 'Weighted ruck walk', 'Coastal walk'] },
  Cycling:  { e: '🚴‍♀️', options: ['Spin class (45 min)', 'Steady endurance ride', 'Hill-climb intervals', 'Sprint intervals', 'Recovery spin', 'Outdoor road ride', 'Stationary bike (30 min)'] },
  Swimming: { e: '🏊‍♀️', options: ['Freestyle laps', 'Breaststroke laps', 'Backstroke laps', 'Interval sets', 'Kickboard drills', 'Pull-buoy drills', 'Open-water swim', 'Aqua aerobics'] },
  Dance:    { e: '💃', options: ['Zumba class', 'Dance cardio', 'Hip-hop routine', 'Latin dance workout', 'Barre-dance fusion', 'Freestyle dance', 'Just-dance session'] },
  Boxing:   { e: '🥊', options: ['Shadow boxing', 'Heavy-bag rounds', 'Pad work', 'Boxing HIIT', 'Jump rope + combos', 'Kickboxing class', 'Speed-bag drills'] },
  Barre:    { e: '🩰', options: ['Full barre class', 'Lower-body barre', 'Core barre', 'Arms & abs barre', 'Stretch barre', 'Glute barre burn'] },
  Mobility: { e: '🧎‍♀️', options: ['Full-body stretch', 'Hip mobility flow', 'Shoulder mobility', 'Foam rolling', 'Dynamic warm-up', 'Cool-down stretch', 'Splits progression', 'Neck & back release'] },
}
const MOVE_NAMES = Object.keys(MOVE_TYPES)

const PATTERNS = {
  '478': { name: 'Calm 4-7-8', note: 'Long exhale — best for stress', steps: [['Breathe in', 4, 1], ['Hold', 7, 1], ['Breathe out', 8, 0.55]] },
  'box': { name: 'Box 4-4-4-4', note: 'Even and steadying', steps: [['Breathe in', 4, 1], ['Hold', 4, 1], ['Breathe out', 4, 0.55], ['Hold', 4, 0.55]] },
}

/* ---------------- streak ---------------- */
function computeStreak(dateSet) {
  if (!dateSet.size) return 0
  let d = new Date()
  if (!dateSet.has(dk(d))) { d.setDate(d.getDate() - 1); if (!dateSet.has(dk(d))) return 0 }
  let n = 0
  while (dateSet.has(dk(d))) { n++; d.setDate(d.getDate() - 1) }
  return n
}

/* ================================================================= */
export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [tab, setTab] = useState('today')

  const [moods, setMoods] = useState([])
  const [wins, setWins] = useState([])
  const [acts, setActs] = useState([])
  const [breaths, setBreaths] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [actDone, setActDone] = useState('')
  const [pin, setPin] = useState(null)
  const [reminder, setReminder] = useState('')

  const [aff, setAff] = useState(dayNum() % AFFIRMATIONS.length)
  const [tipI, setTipI] = useState(dayNum() % CORTISOL_TIPS.length)
  const tinyAct = TINY_ACTS[dayNum() % TINY_ACTS.length]

  const [locked, setLocked] = useState(false)
  const [keypad, setKeypad] = useState(null)
  const [settings, setSettings] = useState(false)
  const [breathe, setBreathe] = useState(null)
  const [vibe, setVibe] = useState(null)
  const [idea, setIdea] = useState('')
  const [draft, setDraft] = useState('')
  const [toast, setToast] = useState('')

  // Keep Moving state
  const [moveType, setMoveType] = useState('Yoga')
  const [sGroup, setSGroup] = useState('Chest')
  const [sLoc, setSLoc] = useState('All')
  const [copyOpen, setCopyOpen] = useState(false)

  useEffect(() => {
    (async () => {
      setMoods(await store.get('moods', []))
      setWins(await store.get('wins', []))
      setActs(await store.get('acts', []))
      setBreaths(await store.get('breaths', []))
      setWorkouts(await store.get('workouts', []))
      setActDone(await store.get('actDone', ''))
      const p = await store.get('pin', null)
      setPin(p); if (p) { setLocked(true); setKeypad('unlock') }
      setReminder(await store.get('reminder', ''))
      setLoaded(true)
    })()
  }, [])

  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 1800) }

  const todaysMood = useMemo(() => moods.find(m => m.d === todayK()), [moods])
  const activeDates = useMemo(() => {
    const s = new Set()
    moods.forEach(m => s.add(m.d)); wins.forEach(w => s.add(w.d))
    acts.forEach(a => s.add(a.d)); breaths.forEach(b => s.add(b.d)); workouts.forEach(w => s.add(w.d))
    return s
  }, [moods, wins, acts, breaths, workouts])
  const streak = useMemo(() => computeStreak(activeDates), [activeDates])
  const last7 = useMemo(() => [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); const key = dk(d)
    const m = moods.find(x => x.d === key)
    return { day: d.toLocaleDateString(undefined, { weekday: 'short' })[0], v: m ? m.v : 0 }
  }), [moods])

  const logMood = (v) => { const next = [...moods.filter(m => m.d !== todayK()), { d: todayK(), v }]; setMoods(next); store.set('moods', next); flash('Mood saved 💖') }
  const addWin = () => { const t = draft.trim(); if (!t) return; const next = [{ id: Date.now(), t, d: todayK() }, ...wins]; setWins(next); store.set('wins', next); setDraft(''); flash('Added to your wins ✨') }
  const delWin = (id) => { const next = wins.filter(w => w.id !== id); setWins(next); store.set('wins', next) }
  const doTinyAct = () => { const t = todayK(); setActDone(t); store.set('actDone', t); flash('Lovely. One kind thing done 🌷') }
  const shuffleAff = () => setAff(Math.floor(Math.random() * AFFIRMATIONS.length))
  const shuffleTip = () => setTipI((tipI + 1) % CORTISOL_TIPS.length)

  const pickVibe = (name) => { setVibe(name); setIdea(VIBES[name].ideas[Math.floor(Math.random() * VIBES[name].ideas.length)]) }
  const anotherIdea = () => { if (!vibe) return; const list = VIBES[vibe].ideas; let n = idea; while (list.length > 1 && n === idea) n = list[Math.floor(Math.random() * list.length)]; setIdea(n) }
  const didIt = () => { const next = [{ id: Date.now(), label: idea, vibe, d: todayK() }, ...acts]; setActs(next); store.set('acts', next); flash('Logged. Proud of you 🌟'); setVibe(null); setIdea('') }

  const finishBreath = (cycles) => { const next = [{ id: Date.now(), pattern: breathe, cycles, d: todayK() }, ...breaths]; setBreaths(next); store.set('breaths', next); setBreathe(null); if (cycles > 0) flash(`${cycles} calm breaths done 🫧`) }

  // workouts
  const logWorkout = (type, name) => { const next = [{ id: Date.now() + Math.floor(Math.random() * 1000), type, name, d: todayK() }, ...workouts]; setWorkouts(next); store.set('workouts', next); flash(`Logged: ${name} 💪`) }
  const delWorkout = (id) => { const next = workouts.filter(w => w.id !== id); setWorkouts(next); store.set('workouts', next) }
  const todaysWorkouts = useMemo(() => workouts.filter(w => w.d === todayK()), [workouts])
  const prevDates = useMemo(() => {
    const map = {}
    workouts.forEach(w => { if (w.d !== todayK()) map[w.d] = (map[w.d] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 14)
  }, [workouts])
  const copyFrom = (date) => {
    const items = workouts.filter(w => w.d === date)
    const copies = items.map((w, i) => ({ id: Date.now() + i, type: w.type, name: w.name, d: todayK() }))
    const next = [...copies, ...workouts]; setWorkouts(next); store.set('workouts', next)
    setCopyOpen(false); flash(`Copied ${items.length} from ${niceDate(date)} ✅`)
  }

  const onKeypad = (code) => {
    if (keypad === 'unlock') {
      if (code === pin) { setLocked(false); setKeypad(null) } else { flash('Wrong PIN'); return false }
    } else if (keypad === 'set') {
      setPin(code); store.set('pin', code); setKeypad(null); flash('PIN set 🔒')
    }
    return true
  }
  const removePin = () => { setPin(null); store.set('pin', null); flash('PIN removed') }

  const saveReminder = async (time) => {
    setReminder(time); store.set('reminder', time)
    try {
      const perm = await LocalNotifications.requestPermissions()
      await LocalNotifications.cancel({ notifications: [{ id: 1001 }] })
      if (perm.display === 'granted' && time) {
        const [h, m] = time.split(':').map(Number)
        await LocalNotifications.schedule({ notifications: [{ id: 1001, title: 'Stilla 🌸', body: 'Time for your check-in. How are you feeling today?', schedule: { on: { hour: h, minute: m }, repeats: true, allowWhileIdle: true } }] })
        flash('Daily reminder set ⏰')
      } else if (!time) { flash('Reminder turned off') }
    } catch { flash('Reminder saved (enable notifications to get alerts)') }
  }

  if (!loaded) return <div className="splash"><div className="logo">🌸</div></div>
  if (locked && keypad === 'unlock') return <Keypad title="Welcome back" subtitle="Enter your PIN" onSubmit={onKeypad} />

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const strengthList = STRENGTH[sGroup].filter(x => sLoc === 'All' || x.loc === sLoc)

  return (
    <div className="app">
      <header className="top">
        <div>
          <div className="hi">{greeting} 🌸</div>
          <div className="sub">Let's make today a little kinder</div>
        </div>
        <button className="gear" onClick={() => setSettings(true)} aria-label="Settings">⚙</button>
      </header>

      <main className="screen">
        {tab === 'today' && (
          <>
            <section className="card">
              <h3>How are you feeling?</h3>
              <div className="moods">
                {MOODS.map(m => (
                  <button key={m.v} className={'mood' + (todaysMood?.v === m.v ? ' on' : '')} onClick={() => logMood(m.v)}>
                    <span className="me">{m.e}</span><span className="ml">{m.label}</span>
                  </button>
                ))}
              </div>
              <div className="trend">
                {last7.map((d, i) => (
                  <div className="bar-col" key={i}>
                    <div className="bar-track"><div className="bar-fill" style={{ height: (d.v ? d.v / 5 * 100 : 4) + '%', opacity: d.v ? 1 : 0.25 }} /></div>
                    <span className="bar-day">{d.day}</span>
                  </div>
                ))}
              </div>
              <p className="muted">Your last 7 days</p>
            </section>

            <section className="card affirm">
              <div className="row"><span className="tagline">Today's affirmation</span><button className="mini" onClick={shuffleAff}>↻</button></div>
              <p className="big-quote">{AFFIRMATIONS[aff]}</p>
            </section>

            <section className="card">
              <span className="tagline">One tiny act of self-care</span>
              <p className="act-text">{tinyAct}</p>
              <button className={'check' + (actDone === todayK() ? ' done' : '')} onClick={doTinyAct} disabled={actDone === todayK()}>
                {actDone === todayK() ? '✓ Done today' : 'Mark as done'}
              </button>
            </section>

            <section className="card cortisol">
              <div className="row"><span className="tagline">🫧 Calm your cortisol</span><button className="mini" onClick={shuffleTip}>↻</button></div>
              <p className="act-text">{CORTISOL_TIPS[tipI].tip}</p>
              <p className="why"><b>Why:</b> {CORTISOL_TIPS[tipI].why}</p>
              <button className="breathe-btn" onClick={() => setBreathe('478')}>🌬️ Start a breathing reset</button>
            </section>

            <section className="card">
              <h3>Wins &amp; gratitude</h3>
              <div className="add">
                <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Something good, big or small…" onKeyDown={e => e.key === 'Enter' && addWin()} />
                <button onClick={addWin}>Add</button>
              </div>
              {wins.length === 0 && <p className="muted">No entries yet — what went right today?</p>}
              <ul className="wins">{wins.map(w => (<li key={w.id}><span>{w.t}</span><button className="x" onClick={() => delWin(w.id)}>×</button></li>))}</ul>
            </section>
          </>
        )}

        {tab === 'move' && (
          <>
            <section className="card">
              <h3>Keep moving 🏃‍♀️</h3>
              <p className="muted">Pick a workout and tap to log it.</p>
              <div className="movechips">
                {MOVE_NAMES.map(t => (
                  <button key={t} className={'mchip' + (moveType === t ? ' on' : '')} onClick={() => { setMoveType(t); setCopyOpen(false) }}>
                    <span className="mc-e">{MOVE_TYPES[t].e}</span> {t}
                  </button>
                ))}
              </div>
            </section>

            <section className="card">
              {moveType === 'Strength' ? (
                <>
                  <div className="seg loc">
                    {['All', 'Gym', 'Home'].map(l => (<button key={l} className={sLoc === l ? 'on' : ''} onClick={() => setSLoc(l)}>{l}</button>))}
                  </div>
                  <div className="chips">
                    {Object.keys(STRENGTH).map(g => (<button key={g} className={'chip' + (sGroup === g ? ' on' : '')} onClick={() => setSGroup(g)}>{g}</button>))}
                  </div>
                  <ul className="exlist">
                    {strengthList.map((x, i) => (
                      <li key={i}><span>{x.n} <em className={'loc-tag ' + x.loc.toLowerCase()}>{x.loc}</em></span><button className="logbtn" onClick={() => logWorkout('Strength', x.n)}>+ Log</button></li>
                    ))}
                  </ul>
                </>
              ) : (
                <ul className="exlist">
                  {MOVE_TYPES[moveType].options.map((o, i) => (
                    <li key={i}><span>{o}</span><button className="logbtn" onClick={() => logWorkout(moveType, o)}>+ Log</button></li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card">
              <h3>Today's workout</h3>
              <button className="copy-toggle" onClick={() => setCopyOpen(!copyOpen)}>📋 Copy from a previous date</button>
              {copyOpen && (
                <div className="copybox">
                  {prevDates.length === 0 && <p className="tiny">No earlier workouts to copy yet.</p>}
                  {prevDates.map(([date, count]) => (
                    <div className="copyrow" key={date}><span>{niceDate(date)} · {count} item{count > 1 ? 's' : ''}</span><button className="logbtn" onClick={() => copyFrom(date)}>Copy</button></div>
                  ))}
                </div>
              )}
              {todaysWorkouts.length === 0 && <p className="muted">Nothing logged yet today.</p>}
              <ul className="wins">
                {todaysWorkouts.map(w => (
                  <li key={w.id}><span>{MOVE_TYPES[w.type]?.e} {w.name} <em className="type-tag">{w.type}</em></span><button className="x" onClick={() => delWorkout(w.id)}>×</button></li>
                ))}
              </ul>
            </section>
          </>
        )}

        {tab === 'lift' && (
          <>
            <section className="card">
              <h3>Need a lift?</h3>
              <p className="muted">Pick a vibe and I'll suggest something.</p>
              {todaysMood && todaysMood.v <= 2 && <p className="gentle">You marked today as low — let's start gentle. 💗</p>}
              <div className="vibes">
                {VIBE_NAMES.map(n => (
                  <button key={n} className={'vibe' + (vibe === n ? ' on' : '')} style={{ background: VIBES[n].tint }} onClick={() => pickVibe(n)}>
                    <span className="ve">{VIBES[n].e}</span><span>{n}</span>
                  </button>
                ))}
              </div>
            </section>
            {vibe && (
              <section className="card idea">
                <span className="tagline">{VIBES[vibe].e} {vibe}</span>
                <p className="big-quote">{idea}</p>
                <div className="idea-btns"><button className="ghost" onClick={anotherIdea}>Another</button><button className="primary" onClick={didIt}>I did it</button></div>
              </section>
            )}
          </>
        )}

        {tab === 'you' && (
          <>
            <section className="card streak-card">
              <div className="streak-num">{streak}</div>
              <div className="streak-label">day streak {streak > 0 ? '🔥' : ''}</div>
              <p className="muted">Show up in any small way to keep it going.</p>
            </section>
            <div className="stats">
              <Stat n={moods.length} label="check-ins" />
              <Stat n={workouts.length} label="workouts" />
              <Stat n={wins.length} label="wins logged" />
              <Stat n={acts.length} label="activities" />
              <Stat n={breaths.length} label="breathing" />
            </div>
            <section className="card">
              <h3>Recent activity</h3>
              {(acts.length + workouts.length) === 0 && <p className="muted">Nothing yet — try the Move or Lift tab.</p>}
              <ul className="wins">
                {workouts.slice(0, 4).map(a => <li key={'w' + a.id}><span>{MOVE_TYPES[a.type]?.e} {a.name}</span></li>)}
                {acts.slice(0, 4).map(a => <li key={'a' + a.id}><span>{VIBES[a.vibe]?.e} {a.label}</span></li>)}
              </ul>
            </section>
            <p className="disclaimer">Stilla shares general wellbeing ideas, not medical advice. If stress or low mood is ongoing, please reach out to a doctor or mental-health professional.</p>
          </>
        )}
      </main>

      <nav className="tabs">
        <button className={tab === 'today' ? 'on' : ''} onClick={() => setTab('today')}><span>🏠</span>Today</button>
        <button className={tab === 'move' ? 'on' : ''} onClick={() => setTab('move')}><span>🏃‍♀️</span>Move</button>
        <button className={tab === 'lift' ? 'on' : ''} onClick={() => setTab('lift')}><span>✨</span>Lift</button>
        <button className={tab === 'you' ? 'on' : ''} onClick={() => setTab('you')}><span>🌷</span>You</button>
      </nav>

      {toast && <div className="toast">{toast}</div>}
      {breathe && <Breathe pattern={breathe} setPattern={setBreathe} onDone={finishBreath} />}
      {keypad === 'set' && <Keypad title="Set a PIN" subtitle="Choose 4 digits" onSubmit={onKeypad} onCancel={() => setKeypad(null)} />}
      {settings && (
        <Settings pin={pin} reminder={reminder}
          onSetPin={() => { setSettings(false); setKeypad('set') }}
          onRemovePin={removePin} onReminder={saveReminder} onClose={() => setSettings(false)} />
      )}
    </div>
  )
}

/* ---------------- small components ---------------- */
function Stat({ n, label }) {
  return <div className="stat"><div className="stat-n">{n}</div><div className="stat-l">{label}</div></div>
}

function Keypad({ title, subtitle, onSubmit, onCancel }) {
  const [code, setCode] = useState('')
  const [shake, setShake] = useState(false)
  const press = (d) => {
    if (code.length >= 4) return
    const next = code + d
    setCode(next)
    if (next.length === 4) {
      setTimeout(() => { const ok = onSubmit(next); if (ok === false) { setShake(true); setTimeout(() => { setShake(false); setCode('') }, 400) } else setCode('') }, 120)
    }
  }
  return (
    <div className="lock">
      <div className="logo sm">🌸</div>
      <h2>{title}</h2>
      <p className="muted">{subtitle}</p>
      <div className={'dots' + (shake ? ' shake' : '')}>{[0, 1, 2, 3].map(i => <span key={i} className={'dot' + (code.length > i ? ' fill' : '')} />)}</div>
      <div className="pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => <button key={d} onClick={() => press(d)}>{d}</button>)}
        <button className="blank" onClick={onCancel}>{onCancel ? '✕' : ''}</button>
        <button onClick={() => press(0)}>0</button>
        <button className="blank" onClick={() => setCode(code.slice(0, -1))}>⌫</button>
      </div>
    </div>
  )
}

function Breathe({ pattern, setPattern, onDone }) {
  const p = PATTERNS[pattern]
  const [idx, setIdx] = useState(0)
  const [rem, setRem] = useState(p.steps[0][1])
  const [cycles, setCycles] = useState(0)
  useEffect(() => { setIdx(0); setRem(p.steps[0][1]); setCycles(0) }, [pattern])
  useEffect(() => {
    const t = setInterval(() => {
      setRem(r => {
        if (r > 1) return r - 1
        setIdx(i => { const ni = (i + 1) % p.steps.length; if (ni === 0) setCycles(c => c + 1); return ni })
        return 0
      })
    }, 1000)
    return () => clearInterval(t)
  }, [pattern])
  useEffect(() => { setRem(p.steps[idx][1]) }, [idx])
  const [label, secs, scale] = p.steps[idx]
  return (
    <div className="modal">
      <div className="breathe-box">
        <div className="seg">{Object.keys(PATTERNS).map(k => (<button key={k} className={k === pattern ? 'on' : ''} onClick={() => setPattern(k)}>{PATTERNS[k].name}</button>))}</div>
        <p className="muted">{p.note}</p>
        <div className="breathe-stage">
          <div className="breathe-circle" style={{ transform: `scale(${scale})`, transitionDuration: secs + 's' }} />
          <div className="breathe-text"><div className="phase">{label}</div><div className="count">{Math.max(1, rem)}</div></div>
        </div>
        <p className="cycles">{cycles} cycle{cycles === 1 ? '' : 's'} complete</p>
        <button className="primary wide" onClick={() => onDone(cycles)}>Done</button>
      </div>
    </div>
  )
}

function Settings({ pin, reminder, onSetPin, onRemovePin, onReminder, onClose }) {
  const [time, setTime] = useState(reminder || '09:00')
  return (
    <div className="modal" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-grip" />
        <h2>Settings</h2>
        <div className="set-group">
          <div className="set-title">🔒 App lock</div>
          <p className="muted">A PIN keeps your entries private on this phone.</p>
          <button className="primary wide" onClick={onSetPin}>{pin ? 'Change PIN' : 'Set a PIN'}</button>
          {pin && <button className="ghost wide" onClick={onRemovePin}>Turn off PIN</button>}
          <p className="tiny">Tip: fingerprint / face unlock can be added in a future update.</p>
        </div>
        <div className="set-group">
          <div className="set-title">⏰ Daily reminder</div>
          <p className="muted">A gentle nudge to check in each day.</p>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="time" />
          <button className="primary wide" onClick={() => { onReminder(time); onClose() }}>Save reminder</button>
          {reminder && <button className="ghost wide" onClick={() => { onReminder(''); onClose() }}>Turn off reminder</button>}
        </div>
        <button className="ghost wide" onClick={onClose}>Close</button>
        <p className="disclaimer">Stilla shares general wellbeing ideas, not medical advice.</p>
      </div>
    </div>
  )
}

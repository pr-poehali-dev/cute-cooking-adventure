import { useState, useCallback } from "react";

// ── Картинки ──────────────────────────────────────────────────
const IMG = {
  cat:        "https://cdn.poehali.dev/projects/d32992dd-8906-418d-87bc-7f2e13522f39/files/9ab5a895-07bf-4111-b9bf-d446dd76a89d.jpg",
  dog:        "https://cdn.poehali.dev/projects/d32992dd-8906-418d-87bc-7f2e13522f39/files/ae9f9a4e-9705-4523-bf5e-8900bc76a549.jpg",
  chinchilla: "https://cdn.poehali.dev/projects/d32992dd-8906-418d-87bc-7f2e13522f39/files/4426271b-a56b-4b72-b8b6-7c89808fe7bf.jpg",
  frog:       "https://cdn.poehali.dev/projects/d32992dd-8906-418d-87bc-7f2e13522f39/files/e2ba878a-fdf4-4ca5-90f6-fe7c24ff04c8.jpg",
  kitchen:    "https://cdn.poehali.dev/projects/d32992dd-8906-418d-87bc-7f2e13522f39/files/69ccb4e9-6120-48ef-a8b5-5e48204ec0d7.jpg",
  // Скины котика
  cat_unicorn:     "https://cdn.poehali.dev/projects/d32992dd-8906-418d-87bc-7f2e13522f39/files/cb02b3e3-0c2b-4be9-bca2-6c8c8f82e09d.jpg",
  cat_strawberry:  "https://cdn.poehali.dev/projects/d32992dd-8906-418d-87bc-7f2e13522f39/files/c9fb267b-3b1a-42e4-be04-426a5e256499.jpg",
  cat_astronaut:   "https://cdn.poehali.dev/projects/d32992dd-8906-418d-87bc-7f2e13522f39/files/e0c9db5d-8110-42a5-8e48-7ce8454c4655.jpg",
  // Скины пёсика
  dog_bee:         "https://cdn.poehali.dev/projects/d32992dd-8906-418d-87bc-7f2e13522f39/files/43a1ef50-fd1a-44fa-99a7-7d3726dc1f85.jpg",
  dog_bear:        "https://cdn.poehali.dev/projects/d32992dd-8906-418d-87bc-7f2e13522f39/files/462b1826-6787-4526-a83f-da2353d92815.jpg",
  dog_prince:      "https://cdn.poehali.dev/projects/d32992dd-8906-418d-87bc-7f2e13522f39/files/573a32c4-e16a-4dc0-99d7-a2d95972ba62.jpg",
  // Скины шиншиллика
  chin_fairy:      "https://cdn.poehali.dev/projects/d32992dd-8906-418d-87bc-7f2e13522f39/files/d58c8810-4241-43c6-b16a-f7bcefea4691.jpg",
  chin_dino:       "https://cdn.poehali.dev/projects/d32992dd-8906-418d-87bc-7f2e13522f39/files/b033d8b7-7bdf-4358-91d2-a013d4055845.jpg",
  chin_mermaid:    "https://cdn.poehali.dev/projects/d32992dd-8906-418d-87bc-7f2e13522f39/files/313822ab-7685-47b2-8860-380a3a3323ef.jpg",
  // Скины лягушонка
  frog_rainbow:    "https://cdn.poehali.dev/projects/d32992dd-8906-418d-87bc-7f2e13522f39/files/53114d9b-1846-457c-8278-343874875ded.jpg",
  frog_watermelon: "https://cdn.poehali.dev/projects/d32992dd-8906-418d-87bc-7f2e13522f39/files/954f26f8-95df-46b5-aeef-f0c87ce69663.jpg",
  frog_dragon:     "https://cdn.poehali.dev/projects/d32992dd-8906-418d-87bc-7f2e13522f39/files/6f1473ae-4d29-46ac-beba-32d1be0de3e8.jpg",
} as const;

// ── Типы ──────────────────────────────────────────────────────
type Screen = "start" | "character" | "menu" | "drinks" | "cooking" | "eating" | "done" | "shop" | "profile";
type CharId = "cat" | "dog" | "chinchilla" | "frog";

interface Character { id: CharId; name: string; emoji: string; color: string; }
interface Dish { id: string; name: string; emoji: string; steps: CookStep[]; }
interface Drink { id: string; name: string; emoji: string; color: string; }
interface CookStep { action: string; emoji: string; ingredient: string; }
interface Skin { id: string; name: string; img: keyof typeof IMG; price: number; color: string; }
interface ProfileData {
  names: Record<CharId, string>;
  coins: number;
  dishCounts: Record<string, number>;
  drinkCounts: Record<string, number>;
  charCounts: Record<string, number>;
  ownedSkins: string[];
  activeSkins: Record<CharId, string>;
}

// ── Персонажи ─────────────────────────────────────────────────
const CHARS: Character[] = [
  { id: "cat",       name: "Котик",    emoji: "🐱", color: "#FF9BB3" },
  { id: "dog",       name: "Пёсик",    emoji: "🐶", color: "#FFB347" },
  { id: "chinchilla",name: "Шиншиллик",emoji: "🐭", color: "#B8A9E0" },
  { id: "frog",      name: "Лягушонок",emoji: "🐸", color: "#7EC87E" },
];

// ── Скины (3 на каждого) ──────────────────────────────────────
const SKINS: Record<CharId, Skin[]> = {
  cat: [
    { id: "cat_unicorn",    name: "Единорожка",   img: "cat_unicorn",    price: 100, color: "#FF9DE8" },
    { id: "cat_strawberry", name: "Клубничка",    img: "cat_strawberry", price: 100, color: "#FF4D6A" },
    { id: "cat_astronaut",  name: "Космонавтик",  img: "cat_astronaut",  price: 100, color: "#7EB8FF" },
  ],
  dog: [
    { id: "dog_bee",    name: "Пчёлка",      img: "dog_bee",   price: 100, color: "#FFD93D" },
    { id: "dog_bear",   name: "Мишка",       img: "dog_bear",  price: 100, color: "#C8956C" },
    { id: "dog_prince", name: "Принц",       img: "dog_prince",price: 100, color: "#6B9FFF" },
  ],
  chinchilla: [
    { id: "chin_fairy",   name: "Феечка",    img: "chin_fairy",   price: 100, color: "#DDA0DD" },
    { id: "chin_dino",    name: "Динозаврик",img: "chin_dino",    price: 100, color: "#7EC8A0" },
    { id: "chin_mermaid", name: "Русалочка", img: "chin_mermaid", price: 100, color: "#5BC8C8" },
  ],
  frog: [
    { id: "frog_rainbow",    name: "Радужка",   img: "frog_rainbow",    price: 100, color: "#FF9BB3" },
    { id: "frog_watermelon", name: "Арбузик",   img: "frog_watermelon", price: 100, color: "#5CB85C" },
    { id: "frog_dragon",     name: "Дракончик", img: "frog_dragon",     price: 100, color: "#9B59B6" },
  ],
};

// ── Блюда с шагами (50-70 кликов суммарно) ────────────────────
const DISHES: Dish[] = [
  {
    id: "olivier", name: "Оливьешка", emoji: "🥗",
    steps: [
      { action: "Варим картошечку", emoji: "🥔", ingredient: "картошку" },
      { action: "Варим морковочку", emoji: "🥕", ingredient: "морковку" },
      { action: "Варим яйца", emoji: "🥚", ingredient: "яйца" },
      { action: "Режем колбаску", emoji: "🌭", ingredient: "колбаску" },
      { action: "Режем огурчики", emoji: "🥒", ingredient: "огурчики" },
      { action: "Режем картошечку", emoji: "🔪", ingredient: "картошечку" },
      { action: "Режем морковочку", emoji: "🔪", ingredient: "морковочку" },
      { action: "Мешаем майонезик", emoji: "🥄", ingredient: "майонезик" },
    ],
  },
  {
    id: "caesar", name: "Цезарик", emoji: "🥙",
    steps: [
      { action: "Моем листья салатика", emoji: "🥬", ingredient: "салатик" },
      { action: "Жарим курочку", emoji: "🍗", ingredient: "курочку" },
      { action: "Режем курочку", emoji: "🔪", ingredient: "курочку" },
      { action: "Натираем пармезанчик", emoji: "🧀", ingredient: "пармезанчик" },
      { action: "Делаем сухарики", emoji: "🍞", ingredient: "хлебушек" },
      { action: "Поливаем соусиком", emoji: "🫙", ingredient: "соусик" },
      { action: "Перемешиваем", emoji: "🥄", ingredient: "всё вместе" },
    ],
  },
  {
    id: "pelmeni", name: "Пельмешки", emoji: "🥟",
    steps: [
      { action: "Месим тесточко", emoji: "🫓", ingredient: "тесточко" },
      { action: "Лепим фарш", emoji: "🥩", ingredient: "фаршик" },
      { action: "Лепим пельмешки", emoji: "🤲", ingredient: "пельмешки" },
      { action: "Ещё лепим!", emoji: "🤲", ingredient: "больше пельмешек" },
      { action: "Кидаем в кастрюльку", emoji: "🫕", ingredient: "пельмешки" },
      { action: "Варим пельмешки", emoji: "♨️", ingredient: "пельмешки" },
      { action: "Кладём маслице", emoji: "🧈", ingredient: "маслице" },
      { action: "Добавляем сметанку", emoji: "🥛", ingredient: "сметанку" },
    ],
  },
  {
    id: "borscht", name: "Борщик", emoji: "🍲",
    steps: [
      { action: "Варим бульончик", emoji: "🥩", ingredient: "мясо" },
      { action: "Режем свёколку", emoji: "🔪", ingredient: "свёколку" },
      { action: "Режем капусточку", emoji: "🔪", ingredient: "капусточку" },
      { action: "Режем картошечку", emoji: "🔪", ingredient: "картошечку" },
      { action: "Жарим лучок и морковку", emoji: "🧅", ingredient: "лучок" },
      { action: "Добавляем томатик", emoji: "🍅", ingredient: "томатик" },
      { action: "Всё в кастрюльку!", emoji: "🫕", ingredient: "все овощи" },
      { action: "Добавляем сметанку", emoji: "🥛", ingredient: "сметанку" },
    ],
  },
  {
    id: "ukha", name: "Уха", emoji: "🐟",
    steps: [
      { action: "Чистим рыбку", emoji: "🐠", ingredient: "рыбку" },
      { action: "Режем рыбку", emoji: "🔪", ingredient: "рыбку" },
      { action: "Режем картошечку", emoji: "🔪", ingredient: "картошечку" },
      { action: "Режем лучок", emoji: "🔪", ingredient: "лучок" },
      { action: "Режем морковочку", emoji: "🔪", ingredient: "морковочку" },
      { action: "Варим бульончик", emoji: "♨️", ingredient: "рыбу" },
      { action: "Добавляем овощи", emoji: "🫕", ingredient: "овощи" },
      { action: "Кладём укропчик", emoji: "🌿", ingredient: "укропчик" },
    ],
  },
  {
    id: "kotlety", name: "Котлетки с пюрешкой", emoji: "🍽️",
    steps: [
      { action: "Лепим котлетки", emoji: "🥩", ingredient: "фаршик" },
      { action: "Обваливаем в сухариках", emoji: "🍞", ingredient: "панировку" },
      { action: "Жарим котлетки", emoji: "🍳", ingredient: "котлетки" },
      { action: "Переворачиваем", emoji: "🔄", ingredient: "котлетки" },
      { action: "Варим картошечку", emoji: "🥔", ingredient: "картошечку" },
      { action: "Толчём пюрешку", emoji: "🥄", ingredient: "пюрешку" },
      { action: "Добавляем маслице", emoji: "🧈", ingredient: "маслице" },
      { action: "Добавляем молочко", emoji: "🥛", ingredient: "молочко" },
    ],
  },
  {
    id: "burger", name: "Бургерчик", emoji: "🍔",
    steps: [
      { action: "Жарим котлетку", emoji: "🍳", ingredient: "котлетку" },
      { action: "Режем помидорчик", emoji: "🔪", ingredient: "помидорчик" },
      { action: "Режем огурчик", emoji: "🔪", ingredient: "огурчик" },
      { action: "Рвём листик салата", emoji: "🥬", ingredient: "салатик" },
      { action: "Кладём булочку", emoji: "🍞", ingredient: "булочку" },
      { action: "Намазываем соусик", emoji: "🫙", ingredient: "соусик" },
      { action: "Собираем бургерчик", emoji: "🤲", ingredient: "слои" },
    ],
  },
  {
    id: "fish", name: "Рыбка с овощами", emoji: "🐟",
    steps: [
      { action: "Маринуем рыбку", emoji: "🐟", ingredient: "рыбку" },
      { action: "Режем кабачок", emoji: "🔪", ingredient: "кабачок" },
      { action: "Режем перчик", emoji: "🔪", ingredient: "перчик" },
      { action: "Режем помидорчик", emoji: "🔪", ingredient: "помидорчик" },
      { action: "Запекаем рыбку", emoji: "🔥", ingredient: "рыбку" },
      { action: "Жарим овощи", emoji: "🍳", ingredient: "овощи" },
      { action: "Поливаем лимончиком", emoji: "🍋", ingredient: "лимончик" },
      { action: "Украшаем зеленью", emoji: "🌿", ingredient: "зеленью" },
    ],
  },
];

// ── Напитки ───────────────────────────────────────────────────
const DRINKS: Drink[] = [
  { id: "black_tea",  name: "Чаёк чёрный",    emoji: "🫖", color: "#8B4513" },
  { id: "green_tea",  name: "Чаёк зелёный",   emoji: "🍵", color: "#90EE90" },
  { id: "coffee",     name: "Кофеёк",          emoji: "☕", color: "#6B3A2A" },
  { id: "unicorn",    name: "Напиток единорожки", emoji: "🦄", color: "#FF69B4" },
  { id: "cola",       name: "Колка",           emoji: "🥤", color: "#2C2C2C" },
  { id: "fanta",      name: "Фантик",          emoji: "🧡", color: "#FF8C00" },
  { id: "sprite",     name: "Спрайтик",        emoji: "💚", color: "#7CFC00" },
  { id: "summer",     name: "Коктейль Лето",   emoji: "🍹", color: "#FF6347" },
];

// ── Действия при поедании ─────────────────────────────────────
const EAT_STEPS = [
  { action: "Берём ложечку", emoji: "🥄" },
  { action: "Нюхаем — пахнет вкусненько!", emoji: "👃" },
  { action: "Кушаем первую ложечку", emoji: "😋" },
  { action: "Кушаем ещё!", emoji: "🍽️" },
  { action: "Вкусненько!", emoji: "😍" },
  { action: "Запиваем напиточком", emoji: "🥤" },
  { action: "Ещё глоточек", emoji: "😌" },
  { action: "Объедение!", emoji: "🤤" },
  { action: "Почти всё съели!", emoji: "🍴" },
  { action: "Вытираем губки", emoji: "😊" },
];

// ── Локальное хранилище ───────────────────────────────────────
const SAVE_KEY = "veselaya_kukhnya_v2";

function loadProfile(): ProfileData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { void e; }
  return {
    names: { cat: "Котик", dog: "Пёсик", chinchilla: "Шиншиллик", frog: "Лягушонок" },
    coins: 0,
    dishCounts: {},
    drinkCounts: {},
    charCounts: {},
    ownedSkins: [],
    activeSkins: { cat: "", dog: "", chinchilla: "", frog: "" },
  };
}

function saveProfile(p: ProfileData) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(p));
}

// ── Утилита звука ─────────────────────────────────────────────
function playPop() {
  try {
    const AudioCtx = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  } catch (e) { void e; }
}

function playCoin() {
  try {
    const AudioCtx = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    [660, 880, 1100].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = f;
      osc.type = "triangle";
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.2);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.2);
    });
  } catch (e) { void e; }
}

// ── Главный компонент ─────────────────────────────────────────
export default function Index() {
  const [screen, setScreen] = useState<Screen>("start");
  const [profile, setProfile] = useState<ProfileData>(loadProfile);
  const [selectedChar, setSelectedChar] = useState<CharId>("cat");
  const [selectedDish, setSelectedDish] = useState<Dish>(DISHES[0]);
  const [selectedDrink, setSelectedDrink] = useState<Drink>(DRINKS[0]);
  const [clickCount, setClickCount] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepClicks, setStepClicks] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const [shake, setShake] = useState(false);
  const [nameEdit, setNameEdit] = useState<CharId | null>(null);
  const [nameVal, setNameVal] = useState("");
  const particleId = { current: 0 };

  // Сколько кликов на шаг
  const CLICKS_PER_STEP = 7;
  const totalCookSteps = selectedDish.steps.length;
  const totalCookClicks = totalCookSteps * CLICKS_PER_STEP;
  const EAT_TOTAL = 20;

  const upProfile = useCallback((fn: (p: ProfileData) => ProfileData) => {
    setProfile(prev => {
      const next = fn(prev);
      saveProfile(next);
      return next;
    });
  }, []);

  // ── Спавн частиц ──
  const spawnParticle = (e: React.MouseEvent, emoji: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const id = ++particleId.current;
    const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 60;
    const y = rect.top + (Math.random() - 0.5) * 30;
    setParticles(p => [...p, { id, x, y, emoji }]);
    setTimeout(() => setParticles(p => p.filter(pt => pt.id !== id)), 800);
  };

  // ── Клик готовки ──
  const handleCookClick = (e: React.MouseEvent) => {
    playPop();
    const step = selectedDish.steps[currentStep];
    spawnParticle(e, step.emoji);
    setShake(true);
    setTimeout(() => setShake(false), 150);

    const nextStepClicks = stepClicks + 1;
    if (nextStepClicks >= CLICKS_PER_STEP) {
      const nextStep = currentStep + 1;
      if (nextStep >= totalCookSteps) {
        setScreen("eating");
        setClickCount(0);
        setCurrentStep(0);
        setStepClicks(0);
      } else {
        setCurrentStep(nextStep);
        setStepClicks(0);
      }
    } else {
      setStepClicks(nextStepClicks);
    }
    setClickCount(c => c + 1);
  };

  // ── Клик поедания ──
  const handleEatClick = (e: React.MouseEvent) => {
    playPop();
    const eatStep = EAT_STEPS[Math.min(currentStep, EAT_STEPS.length - 1)];
    spawnParticle(e, eatStep.emoji);
    setShake(true);
    setTimeout(() => setShake(false), 150);

    const next = clickCount + 1;
    if (next >= EAT_TOTAL) {
      // Победа!
      playCoin();
      upProfile(p => {
        const dc = { ...p.dishCounts, [selectedDish.id]: (p.dishCounts[selectedDish.id] || 0) + 1 };
        const drk = { ...p.drinkCounts, [selectedDrink.id]: (p.drinkCounts[selectedDrink.id] || 0) + 1 };
        const cc = { ...p.charCounts, [selectedChar]: (p.charCounts[selectedChar] || 0) + 1 };
        return { ...p, coins: p.coins + 20, dishCounts: dc, drinkCounts: drk, charCounts: cc };
      });
      setScreen("done");
      setClickCount(0);
      setCurrentStep(0);
      setStepClicks(0);
    } else {
      setClickCount(next);
      setCurrentStep(Math.floor((next / EAT_TOTAL) * EAT_STEPS.length));
    }
  };

  const startGame = (charId: CharId) => {
    setSelectedChar(charId);
    upProfile(p => ({ ...p, charCounts: { ...p.charCounts, [charId]: (p.charCounts[charId] || 0) } }));
    setScreen("menu");
  };

  const char = CHARS.find(c => c.id === selectedChar)!;
  const charName = profile.names[selectedChar];
  const activeSkinsForChar = SKINS[selectedChar];

  // Получить активный скин для произвольного персонажа
  const getActiveSkin = (charId: CharId) => {
    const skinId = profile.activeSkins[charId];
    if (!skinId) return null;
    return SKINS[charId].find(s => s.id === skinId) || null;
  };

  // Аватар персонажа — показывает скин если активен, иначе базовую картинку
  const CharAvatar = ({ charId, size = 80, className = "" }: { charId: CharId; size?: number; className?: string }) => {
    const c = CHARS.find(x => x.id === charId)!;
    const activeSkin = getActiveSkin(charId);
    const shaking = charId === selectedChar && shake;
    const imgSrc = activeSkin ? IMG[activeSkin.img] : IMG[charId];
    const borderColor = activeSkin ? activeSkin.color : c.color;
    return (
      <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
        <img src={imgSrc} alt={c.name}
          className="rounded-full object-cover w-full h-full"
          style={{
            border: `3px solid ${borderColor}`,
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            transform: shaking ? "scale(1.15)" : "scale(1)",
            transition: "transform 0.1s",
          }} />
      </div>
    );
  };

  // Лучшее блюдо и напиток
  const bestDish = Object.entries(profile.dishCounts).sort((a, b) => b[1] - a[1])[0];
  const bestDrink = Object.entries(profile.drinkCounts).sort((a, b) => b[1] - a[1])[0];
  const bestDishName = bestDish ? DISHES.find(d => d.id === bestDish[0])?.name : null;
  const bestDrinkName = bestDrink ? DRINKS.find(d => d.id === bestDrink[0])?.name : null;

  const cookProgress = totalCookClicks > 0 ? (clickCount / totalCookClicks) * 100 : 0;
  const eatProgress = (clickCount / EAT_TOTAL) * 100;
  const currentCookStep = selectedDish.steps[Math.min(currentStep, selectedDish.steps.length - 1)];

  return (
    <div className="min-h-screen font-nunito" style={{ background: "linear-gradient(160deg, #FFF5E6 0%, #FFF0F8 50%, #F0F8FF 100%)" }}>

      {/* Частицы */}
      {particles.map(pt => (
        <div key={pt.id} className="fixed pointer-events-none z-50 text-2xl"
          style={{ left: pt.x, top: pt.y, animation: "floatUp 0.8s ease-out forwards" }}>
          {pt.emoji}
        </div>
      ))}

      {/* Монеты в шапке */}
      {screen !== "start" && screen !== "character" && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-1.5 px-4 py-2 rounded-2xl font-black text-sm"
          style={{ background: "#FFD93D", border: "3px solid rgba(0,0,0,0.12)", boxShadow: "0 4px 0 rgba(0,0,0,0.15)", color: "#7C4F00" }}>
          🪙 {profile.coins}
        </div>
      )}

      {/* ══ СТАРТОВЫЙ ЭКРАН ══════════════════════════════════ */}
      {screen === "start" && (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="text-7xl mb-4" style={{ animation: "float 3s ease-in-out infinite" }}>🍽️</div>
          <h1 className="text-4xl font-black mb-2" style={{ color: "#FF7A2F" }}>Вкусняшкина<br/>Кухонька</h1>
          <p className="text-base font-semibold opacity-60 mb-8 max-w-xs">Выбери пушистика-повара и готовь вкусненькое!</p>
          <button onClick={() => setScreen("character")}
            className="cartoon-btn px-10 py-4 rounded-3xl text-xl font-black text-white"
            style={{ background: "linear-gradient(135deg, #FF7A2F, #FF4D8D)", border: "3px solid rgba(0,0,0,0.1)" }}>
            🎮 Начать готовить!
          </button>
          <div className="flex gap-4 mt-10 text-4xl">
            {CHARS.map(c => (
              <span key={c.id} style={{ animation: `float ${2.5 + Math.random()}s ease-in-out infinite` }}>{c.emoji}</span>
            ))}
          </div>
        </div>
      )}

      {/* ══ ВЫБОР ПЕРСОНАЖА ══════════════════════════════════ */}
      {screen === "character" && (
        <div className="min-h-screen flex flex-col items-center px-4 py-8">
          <h2 className="text-3xl font-black mb-1 text-center" style={{ color: "#FF7A2F" }}>Выбери пушистика!</h2>
          <p className="text-sm opacity-50 font-bold mb-8">Все в колпачках и фартучках 🎩</p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            {CHARS.map(c => (
              <button key={c.id} onClick={() => startGame(c.id)}
                className="rounded-3xl p-4 text-center bounce-hover"
                style={{ background: "#fff", border: `3px solid ${c.color}`, boxShadow: `0 6px 0 ${c.color}88` }}>
                <div className="flex justify-center mb-3"><CharAvatar charId={c.id} size={96} /></div>
                <div className="font-black text-base" style={{ color: c.color }}>{c.emoji} {c.name}</div>
                <div className="text-xs opacity-50 font-semibold mt-1">{profile.names[c.id]}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ МЕНЮ ЕДЫ ══════════════════════════════════════════ */}
      {screen === "menu" && (
        <div className="min-h-screen flex flex-col items-center px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <CharAvatar charId={selectedChar} size={48} />
            <div>
              <div className="font-black text-lg" style={{ color: char.color }}>{charName}</div>
              <div className="text-xs opacity-50">Что будем готовить? 🍳</div>
            </div>
          </div>
          <h2 className="text-2xl font-black mb-4" style={{ color: "#FF7A2F" }}>Менюшка</h2>
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {DISHES.map(dish => (
              <button key={dish.id} onClick={() => { setSelectedDish(dish); setScreen("drinks"); }}
                className="rounded-3xl p-4 text-center bounce-hover"
                style={{ background: "#fff", border: "3px solid rgba(0,0,0,0.07)", boxShadow: "0 5px 0 rgba(0,0,0,0.1)" }}>
                <div className="text-4xl mb-2">{dish.emoji}</div>
                <div className="font-black text-sm">{dish.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ МЕНЮ НАПИТКОВ ═════════════════════════════════════ */}
      {screen === "drinks" && (
        <div className="min-h-screen flex flex-col items-center px-4 py-6">
          <div className="text-center mb-2">
            <div className="text-2xl">{selectedDish.emoji}</div>
            <div className="font-black text-base" style={{ color: "#FF7A2F" }}>{selectedDish.name}</div>
          </div>
          <h2 className="text-2xl font-black mb-4" style={{ color: "#4DA6FF" }}>Что выпьем? 🥤</h2>
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {DRINKS.map(drink => (
              <button key={drink.id}
                onClick={() => { setSelectedDrink(drink); setClickCount(0); setCurrentStep(0); setStepClicks(0); setScreen("cooking"); }}
                className="rounded-3xl p-4 text-center bounce-hover"
                style={{ background: "#fff", border: `3px solid ${drink.color}44`, boxShadow: `0 5px 0 ${drink.color}66` }}>
                <div className="text-4xl mb-2">{drink.emoji}</div>
                <div className="font-black text-sm">{drink.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ КУХНЯ — ГОТОВКА ══════════════════════════════════ */}
      {screen === "cooking" && currentCookStep && (
        <div className="min-h-screen flex flex-col items-center px-4 py-6">
          {/* Фоновая кухня */}
          <div className="relative w-full max-w-sm rounded-3xl overflow-hidden mb-4"
            style={{ border: "3px solid rgba(0,0,0,0.08)", boxShadow: "0 6px 0 rgba(0,0,0,0.1)" }}>
            <img src={IMG.kitchen} alt="кухня" className="w-full h-44 object-cover" />
            {/* Персонаж на кухне */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
              <CharAvatar charId={selectedChar} size={80} />
            </div>
          </div>

          {/* Прогресс */}
          <div className="w-full max-w-sm mb-3">
            <div className="flex justify-between text-xs font-black opacity-60 mb-1">
              <span>Готовим {selectedDish.name} {selectedDish.emoji}</span>
              <span>{clickCount}/{totalCookClicks}</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ background: "#F0F0F0", border: "2px solid rgba(0,0,0,0.08)" }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${cookProgress}%`, background: "linear-gradient(90deg, #FF7A2F, #FF4D8D)" }} />
            </div>
            <div className="text-xs text-center mt-1 opacity-40">Шаг {currentStep + 1} из {totalCookSteps}</div>
          </div>

          {/* Текущий шаг */}
          <div className="w-full max-w-sm rounded-3xl p-4 mb-4 text-center"
            style={{ background: "#fff", border: "3px solid rgba(0,0,0,0.07)", boxShadow: "0 5px 0 rgba(0,0,0,0.08)" }}>
            <div className="text-4xl mb-1">{currentCookStep.emoji}</div>
            <div className="font-black text-base">{currentCookStep.action}</div>
            <div className="text-xs opacity-50 mt-1">Режем {currentCookStep.ingredient}</div>
            <div className="mt-2 flex justify-center gap-1">
              {Array.from({ length: CLICKS_PER_STEP }).map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full"
                  style={{ background: i < stepClicks ? "#FF7A2F" : "rgba(0,0,0,0.1)" }} />
              ))}
            </div>
          </div>

          {/* Кнопка клика */}
          <button onClick={handleCookClick}
            className="w-full max-w-sm py-5 rounded-3xl font-black text-xl text-white cartoon-btn"
            style={{ background: "linear-gradient(135deg, #FF7A2F, #FF4D8D)", border: "3px solid rgba(0,0,0,0.1)" }}>
            {currentCookStep.emoji} Нажимай!
          </button>
        </div>
      )}

      {/* ══ ПОЕДАНИЕ ══════════════════════════════════════════ */}
      {screen === "eating" && (
        <div className="min-h-screen flex flex-col items-center px-4 py-6">
          <div className="relative w-full max-w-sm rounded-3xl overflow-hidden mb-4"
            style={{ border: "3px solid rgba(0,0,0,0.08)", boxShadow: "0 6px 0 rgba(0,0,0,0.1)" }}>
            <img src={IMG.kitchen} alt="кухня" className="w-full h-44 object-cover" style={{ filter: "brightness(1.1)" }} />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
              <CharAvatar charId={selectedChar} size={80} />
            </div>
            {/* Блюдо */}
            <div className="absolute top-3 right-3 text-4xl">{selectedDish.emoji}</div>
            <div className="absolute top-3 left-3 text-4xl">{selectedDrink.emoji}</div>
          </div>

          <div className="w-full max-w-sm mb-3">
            <div className="flex justify-between text-xs font-black opacity-60 mb-1">
              <span>Кушаем {selectedDish.name}! 😋</span>
              <span>{clickCount}/{EAT_TOTAL}</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ background: "#F0F0F0", border: "2px solid rgba(0,0,0,0.08)" }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${eatProgress}%`, background: "linear-gradient(90deg, #3CC97A, #4DA6FF)" }} />
            </div>
          </div>

          <div className="w-full max-w-sm rounded-3xl p-4 mb-4 text-center"
            style={{ background: "#fff", border: "3px solid rgba(0,0,0,0.07)", boxShadow: "0 5px 0 rgba(0,0,0,0.08)" }}>
            <div className="text-4xl mb-1">{EAT_STEPS[Math.min(currentStep, EAT_STEPS.length - 1)].emoji}</div>
            <div className="font-black text-base">{EAT_STEPS[Math.min(currentStep, EAT_STEPS.length - 1)].action}</div>
          </div>

          <button onClick={handleEatClick}
            className="w-full max-w-sm py-5 rounded-3xl font-black text-xl text-white cartoon-btn"
            style={{ background: "linear-gradient(135deg, #3CC97A, #4DA6FF)", border: "3px solid rgba(0,0,0,0.1)" }}>
            😋 Кушать!
          </button>
        </div>
      )}

      {/* ══ ГОТОВО — ПОБЕДА ══════════════════════════════════ */}
      {screen === "done" && (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="text-7xl mb-4" style={{ animation: "float 2s ease-in-out infinite" }}>🎉</div>
          <h2 className="text-3xl font-black mb-2" style={{ color: "#FF7A2F" }}>Объедение!</h2>
          <p className="text-base font-bold opacity-60 mb-2">{charName} скушал {selectedDish.name} и выпил {selectedDrink.name}!</p>
          <div className="px-6 py-3 rounded-2xl font-black text-xl mb-8"
            style={{ background: "#FFD93D", color: "#7C4F00", border: "3px solid rgba(0,0,0,0.1)", boxShadow: "0 5px 0 rgba(0,0,0,0.12)" }}>
            +20 монеток! 🪙
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button onClick={() => setScreen("menu")}
              className="py-4 rounded-3xl font-black text-lg text-white cartoon-btn"
              style={{ background: "linear-gradient(135deg, #FF7A2F, #FF4D8D)", border: "3px solid rgba(0,0,0,0.1)" }}>
              🍳 Готовить ещё!
            </button>
            <button onClick={() => setScreen("character")}
              className="py-4 rounded-3xl font-black text-lg text-white cartoon-btn"
              style={{ background: "linear-gradient(135deg, #A855F7, #4DA6FF)", border: "3px solid rgba(0,0,0,0.1)" }}>
              🐾 Сменить пушистика
            </button>
            <div className="flex gap-3">
              <button onClick={() => setScreen("shop")} className="flex-1 py-3 rounded-3xl font-black text-base text-white cartoon-btn"
                style={{ background: "#3CC97A", border: "3px solid rgba(0,0,0,0.1)" }}>🛒 Магазинчик</button>
              <button onClick={() => setScreen("profile")} className="flex-1 py-3 rounded-3xl font-black text-base text-white cartoon-btn"
                style={{ background: "#FF9BB3", border: "3px solid rgba(0,0,0,0.1)" }}>👤 Профиль</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ МАГАЗИНЧИК ════════════════════════════════════════ */}
      {screen === "shop" && (
        <div className="min-h-screen flex flex-col items-center px-4 py-6 pb-24">
          <h2 className="text-3xl font-black mb-1 text-center" style={{ color: "#3CC97A" }}>🛒 Магазинчик</h2>
          <div className="mb-1 font-bold opacity-50 text-sm">У тебя: 🪙 {profile.coins} монеток</div>

          {/* Смена персонажа бесплатно */}
          <div className="w-full max-w-sm rounded-3xl p-4 mb-4 mt-4"
            style={{ background: "#fff", border: "3px solid rgba(0,0,0,0.07)", boxShadow: "0 5px 0 rgba(0,0,0,0.08)" }}>
            <div className="font-black text-base mb-3" style={{ color: "#FF7A2F" }}>🐾 Сменить пушистика (бесплатно)</div>
            <div className="grid grid-cols-4 gap-2">
              {CHARS.map(c => (
                <button key={c.id} onClick={() => { setSelectedChar(c.id); upProfile(p => p); }}
                  className="rounded-2xl p-2 text-center bounce-hover"
                  style={{ background: selectedChar === c.id ? c.color + "33" : "#F8F8F8", border: `2px solid ${selectedChar === c.id ? c.color : "transparent"}` }}>
                  <div className="text-xl">{c.emoji}</div>
                  <div className="text-xs font-black mt-1" style={{ color: c.color, fontSize: "10px" }}>{c.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Скины для выбранного */}
          <div className="w-full max-w-sm">
            <div className="font-black text-base mb-3" style={{ color: "#A855F7" }}>
              ✨ Скины для {char.emoji} {charName}
            </div>
            <div className="grid grid-cols-1 gap-3">
              {activeSkinsForChar.map(skin => {
                const owned = profile.ownedSkins.includes(skin.id);
                const active = profile.activeSkins[selectedChar] === skin.id;
                return (
                  <div key={skin.id} className="rounded-3xl p-3 flex items-center gap-3"
                    style={{ background: active ? skin.color + "18" : "#fff", border: `3px solid ${active ? skin.color : "rgba(0,0,0,0.07)"}`, boxShadow: `0 4px 0 ${active ? skin.color + "88" : "rgba(0,0,0,0.08)"}` }}>
                    <img src={IMG[skin.img]} alt={skin.name}
                      className="rounded-2xl object-cover flex-shrink-0"
                      style={{ width: 72, height: 72, border: `2px solid ${skin.color}`, opacity: owned ? 1 : 0.5 }} />
                    <div className="flex-1">
                      <div className="font-black text-sm">{skin.name}</div>
                      <div className="text-xs opacity-50">{owned ? (active ? "✅ Активен" : "Куплено") : `🪙 ${skin.price} монеток`}</div>
                    </div>
                    {owned ? (
                      <button onClick={() => {
                        upProfile(p => ({ ...p, activeSkins: { ...p.activeSkins, [selectedChar]: active ? "" : skin.id } }));
                      }}
                        className="px-3 py-2 rounded-2xl font-black text-xs text-white"
                        style={{ background: active ? "#999" : skin.color, border: "2px solid rgba(0,0,0,0.1)" }}>
                        {active ? "Снять" : "Надеть"}
                      </button>
                    ) : (
                      <button onClick={() => {
                        if (profile.coins < skin.price) return;
                        playCoin();
                        upProfile(p => ({ ...p, coins: p.coins - skin.price, ownedSkins: [...p.ownedSkins, skin.id] }));
                      }}
                        className="px-3 py-2 rounded-2xl font-black text-xs text-white bounce-hover"
                        style={{ background: profile.coins >= skin.price ? skin.color : "#ccc", border: "2px solid rgba(0,0,0,0.1)" }}>
                        Купить
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ ПРОФИЛЬ ════════════════════════════════════════════ */}
      {screen === "profile" && (
        <div className="min-h-screen flex flex-col items-center px-4 py-6 pb-24">
          <h2 className="text-3xl font-black mb-4 text-center" style={{ color: "#FF9BB3" }}>👤 Профилик</h2>

          {/* Карточки пушистиков */}
          <div className="w-full max-w-sm grid grid-cols-2 gap-3 mb-4">
            {CHARS.map(c => {
              const cName = profile.names[c.id];
              const plays = profile.charCounts[c.id] || 0;
              const isEditing = nameEdit === c.id;
              return (
                <div key={c.id} className="rounded-3xl p-3 text-center"
                  style={{ background: "#fff", border: `3px solid ${c.color}`, boxShadow: `0 5px 0 ${c.color}88` }}>
                  <div className="flex justify-center mb-2"><CharAvatar charId={c.id} size={72} /></div>
                  {isEditing ? (
                    <div className="flex gap-1 mb-1">
                      <input value={nameVal} onChange={e => setNameVal(e.target.value)}
                        className="flex-1 text-xs font-black rounded-xl px-2 py-1 text-center outline-none"
                        style={{ border: `2px solid ${c.color}`, maxWidth: "100%" }}
                        maxLength={10} autoFocus />
                      <button onClick={() => {
                        if (nameVal.trim()) upProfile(p => ({ ...p, names: { ...p.names, [c.id]: nameVal.trim() } }));
                        setNameEdit(null);
                      }} className="text-xs px-2 rounded-xl font-black text-white" style={{ background: c.color }}>✓</button>
                    </div>
                  ) : (
                    <button onClick={() => { setNameEdit(c.id); setNameVal(cName); }}
                      className="font-black text-sm w-full text-center" style={{ color: c.color }}>
                      {cName} ✏️
                    </button>
                  )}
                  <div className="text-xs opacity-50 font-bold mt-1">Игр: {plays}</div>
                </div>
              );
            })}
          </div>

          {/* Статистика */}
          <div className="w-full max-w-sm rounded-3xl p-4 mb-4"
            style={{ background: "#fff", border: "3px solid rgba(0,0,0,0.07)", boxShadow: "0 5px 0 rgba(0,0,0,0.08)" }}>
            <div className="font-black text-base mb-3" style={{ color: "#FF7A2F" }}>📊 Статистика</div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-3 py-2 px-3 rounded-2xl" style={{ background: "#FFF8E7" }}>
                <span className="text-2xl">🍽️</span>
                <div>
                  <div className="text-xs opacity-50 font-bold">Любимое блюдо</div>
                  <div className="font-black text-sm">{bestDishName || "Пока не готовили 🥺"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 px-3 rounded-2xl" style={{ background: "#F0F8FF" }}>
                <span className="text-2xl">🥤</span>
                <div>
                  <div className="text-xs opacity-50 font-bold">Любимый напиток</div>
                  <div className="font-black text-sm">{bestDrinkName || "Пока не пили 🥺"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 px-3 rounded-2xl" style={{ background: "#FFF0F8" }}>
                <span className="text-2xl">🪙</span>
                <div>
                  <div className="text-xs opacity-50 font-bold">Монеток всего</div>
                  <div className="font-black text-sm">{profile.coins} монеток</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ НИЖНЯЯ НАВИГАЦИЯ (кроме старта/персонажа/готовки) ══ */}
      {!["start", "character", "cooking", "eating"].includes(screen) && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-3"
          style={{ background: "rgba(255,248,231,0.96)", backdropFilter: "blur(16px)", borderTop: "3px solid rgba(255,165,0,0.15)" }}>
          <div className="max-w-sm mx-auto grid grid-cols-3 gap-2">
            {[
              { key: "menu" as Screen, emoji: "🍳", label: "Кухонька", color: "#FF7A2F" },
              { key: "shop" as Screen, emoji: "🛒", label: "Магазинчик", color: "#3CC97A" },
              { key: "profile" as Screen, emoji: "👤", label: "Профилик", color: "#FF9BB3" },
            ].map(tab => {
              const active = screen === tab.key || (tab.key === "menu" && ["menu", "drinks", "done"].includes(screen));
              return (
                <button key={tab.key} onClick={() => setScreen(tab.key)}
                  className="flex flex-col items-center gap-1 py-2 rounded-2xl transition-all"
                  style={{ background: active ? tab.color + "22" : "transparent", border: active ? `2px solid ${tab.color}44` : "2px solid transparent" }}>
                  <span className="text-2xl">{tab.emoji}</span>
                  <span className="text-xs font-black" style={{ color: active ? tab.color : "rgba(0,0,0,0.38)" }}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes floatUp { 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(-60px) scale(1.5);opacity:0} }
        .font-nunito { font-family: 'Nunito', sans-serif; }
        .bounce-hover { transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        .bounce-hover:hover { transform: scale(1.06) translateY(-2px); }
        .cartoon-btn { box-shadow: 0 5px 0 rgba(0,0,0,0.18); transition: all 0.1s; transform: translateY(0); }
        .cartoon-btn:active { box-shadow: 0 2px 0 rgba(0,0,0,0.18); transform: translateY(3px); }
      `}</style>
    </div>
  );
}
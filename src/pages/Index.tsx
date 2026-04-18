import { useState, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const KITCHEN_IMG = "https://cdn.poehali.dev/projects/d32992dd-8906-418d-87bc-7f2e13522f39/files/8c9cd92a-83d9-439d-b0bb-299e42ac9cf7.jpg";
const SHOP_IMG = "https://cdn.poehali.dev/projects/d32992dd-8906-418d-87bc-7f2e13522f39/files/f967b1a8-5a38-4ab3-9216-26d9526ed664.jpg";
const PROFILE_IMG = "https://cdn.poehali.dev/projects/d32992dd-8906-418d-87bc-7f2e13522f39/files/1c140429-50d3-45cf-ad19-3916ae770294.jpg";

type Section = "home" | "kitchen" | "shop" | "profile";

interface FlyingCoin { id: number; x: number; y: number; }
interface Dish { id: number; emoji: string; name: string; time: number; reward: number; color: string; }
interface ShopItem { id: number; emoji: string; name: string; price: number; color: string; owned: boolean; }

const DISHES: Dish[] = [
  { id: 1, emoji: "🍕", name: "Пицца", time: 5, reward: 30, color: "#FF7A2F" },
  { id: 2, emoji: "🍜", name: "Лапша", time: 3, reward: 20, color: "#FFD93D" },
  { id: 3, emoji: "🧁", name: "Капкейк", time: 8, reward: 50, color: "#FF4D8D" },
  { id: 4, emoji: "🍣", name: "Суши", time: 4, reward: 35, color: "#4DA6FF" },
  { id: 5, emoji: "🍔", name: "Бургер", time: 6, reward: 40, color: "#3CC97A" },
  { id: 6, emoji: "🍦", name: "Мороженое", time: 2, reward: 15, color: "#A855F7" },
];

const SHOP_ITEMS: ShopItem[] = [
  { id: 1, emoji: "👨‍🍳", name: "Шеф-кок", price: 100, color: "#FF7A2F", owned: false },
  { id: 2, emoji: "🎨", name: "Кисти", price: 80, color: "#FF4D8D", owned: false },
  { id: 3, emoji: "🌟", name: "Звезда", price: 150, color: "#FFD93D", owned: false },
  { id: 4, emoji: "🎵", name: "Музыка", price: 60, color: "#4DA6FF", owned: false },
  { id: 5, emoji: "🏠", name: "Домик", price: 200, color: "#3CC97A", owned: false },
  { id: 6, emoji: "🌈", name: "Радуга", price: 120, color: "#A855F7", owned: false },
];

const ACHIEVEMENTS = [
  { emoji: "🍕", name: "Повар", desc: "Приготовь блюдо" },
  { emoji: "💰", name: "Богач", desc: "Собери 100 монет" },
  { emoji: "🛒", name: "Покупатель", desc: "Первая покупка" },
  { emoji: "⭐", name: "Звезда", desc: "Достигни уровня 5" },
];

function useSound() {
  const playSound = useCallback((type: "click" | "coin" | "cook" | "buy" | "error") => {
    const AudioCtx = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    try {
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const configs: Record<string, { freq: number[]; dur: number; wave: OscillatorType }> = {
        click: { freq: [440, 550], dur: 0.1, wave: "sine" },
        coin: { freq: [660, 880, 1100], dur: 0.3, wave: "triangle" },
        cook: { freq: [330, 440, 550], dur: 0.35, wave: "sine" },
        buy: { freq: [440, 550, 660, 880], dur: 0.45, wave: "triangle" },
        error: { freq: [200, 180], dur: 0.2, wave: "sawtooth" },
      };
      const cfg = configs[type];
      cfg.freq.forEach((f, i) => osc.frequency.setValueAtTime(f, ctx.currentTime + i * (cfg.dur / cfg.freq.length)));
      osc.type = cfg.wave;
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + cfg.dur);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + cfg.dur);
    } catch (err) {
      console.warn("Audio error:", err);
    }
  }, []);
  return { playSound };
}

export default function Index() {
  const [section, setSection] = useState<Section>("home");
  const [coins, setCoins] = useState(50);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [flyingCoins, setFlyingCoins] = useState<FlyingCoin[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>(SHOP_ITEMS);
  const [cooking, setCooking] = useState<Record<number, number>>({});
  const [cooked, setCooked] = useState<Record<number, boolean>>({});
  const [everCooked, setEverCooked] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [shakeKey, setShakeKey] = useState<string | null>(null);
  const coinIdRef = useRef(0);
  const { playSound } = useSound();

  const maxXp = level * 100;
  const ownedCount = shopItems.filter(i => i.owned).length;

  const showNotif = (msg: string, type: "success" | "error" = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 2000);
  };

  const spawnCoins = (x: number, y: number, count = 3) => {
    const newCoins = Array.from({ length: count }, () => ({
      id: ++coinIdRef.current,
      x: x + (Math.random() - 0.5) * 60,
      y: y + (Math.random() - 0.5) * 40,
    }));
    setFlyingCoins(prev => [...prev, ...newCoins]);
    setTimeout(() => setFlyingCoins(prev => prev.filter(c => !newCoins.find(n => n.id === c.id))), 900);
  };

  const addXp = (amount: number) => {
    setXp(prev => {
      const next = prev + amount;
      if (next >= maxXp) {
        setLevel(l => l + 1);
        showNotif("🎉 Новый уровень!");
        return next - maxXp;
      }
      return next;
    });
  };

  const navigate = (s: Section) => {
    playSound("click");
    setSection(s);
    setShakeKey(s);
    setTimeout(() => setShakeKey(null), 400);
  };

  const startCooking = (dish: Dish, e: React.MouseEvent) => {
    if (cooking[dish.id] !== undefined || cooked[dish.id]) return;
    playSound("cook");
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    spawnCoins(rect.left + rect.width / 2, rect.top);
    setCooking(prev => ({ ...prev, [dish.id]: dish.time }));

    const interval = setInterval(() => {
      setCooking(prev => {
        const t = (prev[dish.id] ?? 1) - 1;
        if (t <= 0) {
          clearInterval(interval);
          setCooking(p => { const n = { ...p }; delete n[dish.id]; return n; });
          setCooked(p => ({ ...p, [dish.id]: true }));
          setEverCooked(true);
          return prev;
        }
        return { ...prev, [dish.id]: t };
      });
    }, 1000);
  };

  const collectDish = (dish: Dish, e: React.MouseEvent) => {
    if (!cooked[dish.id]) return;
    playSound("coin");
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    spawnCoins(rect.left + rect.width / 2, rect.top, 5);
    setCoins(c => c + dish.reward);
    addXp(Math.floor(dish.reward / 2));
    setCooked(p => { const n = { ...p }; delete n[dish.id]; return n; });
    showNotif(`+${dish.reward} монет за ${dish.name}! 🎉`);
  };

  const buyItem = (item: ShopItem, e: React.MouseEvent) => {
    if (item.owned) { showNotif("Уже куплено!", "error"); return; }
    if (coins < item.price) { playSound("error"); showNotif("Недостаточно монет!", "error"); return; }
    playSound("buy");
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    spawnCoins(rect.left + rect.width / 2, rect.top, 6);
    setCoins(c => c - item.price);
    addXp(Math.floor(item.price / 3));
    setShopItems(prev => prev.map(i => i.id === item.id ? { ...i, owned: true } : i));
    showNotif(`${item.emoji} ${item.name} куплено!`);
  };

  return (
    <div className="min-h-screen font-nunito select-none" style={{ background: "linear-gradient(135deg, #FFF8E7 0%, #FFF0F5 50%, #F0F8FF 100%)" }}>

      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {["🌟", "🌈", "🎈", "⭐", "🎵", "🌸", "💫", "🍀"].map((em, i) => (
          <span key={i} className="absolute text-2xl opacity-15" style={{
            left: `${8 + i * 12}%`, top: `${5 + (i % 4) * 22}%`,
            animation: `float ${3 + i * 0.4}s ease-in-out ${i * 0.5}s infinite`,
          }}>{em}</span>
        ))}
      </div>

      {/* Flying coins */}
      {flyingCoins.map(coin => (
        <div key={coin.id} className="fixed z-50 text-2xl pointer-events-none coin-spin"
          style={{ left: coin.x, top: coin.y }}>🪙</div>
      ))}

      {/* Notification */}
      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl font-black text-white text-sm shadow-2xl pop-in ${notification.type === "success" ? "bg-green-500" : "bg-red-400"}`}
          style={{ border: "3px solid rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-3" style={{ background: "rgba(255,248,231,0.95)", backdropFilter: "blur(12px)", borderBottom: "3px solid rgba(255,165,0,0.2)" }}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button onClick={() => navigate("home")} className="flex items-center gap-2 bounce-hover">
            <span className="text-2xl float-anim">🏡</span>
            <span className="font-black text-xl" style={{ color: "var(--game-orange)" }}>Весёлый Городок</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl font-black text-sm"
              style={{ background: "#FFD93D", border: "3px solid rgba(0,0,0,0.12)", boxShadow: "0 3px 0 rgba(0,0,0,0.15)", color: "#7C5300" }}>
              🪙 {coins}
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl font-black text-sm text-white"
              style={{ background: "var(--game-purple)", border: "3px solid rgba(0,0,0,0.12)", boxShadow: "0 3px 0 rgba(0,0,0,0.15)" }}>
              ⭐ {level}
            </div>
          </div>
        </div>
        <div className="max-w-lg mx-auto mt-2">
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.08)", border: "2px solid rgba(0,0,0,0.08)" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, (xp / maxXp) * 100)}%`, background: "linear-gradient(90deg, #FF4D8D, #A855F7)" }} />
          </div>
          <p className="text-xs text-center mt-0.5 font-bold opacity-40">XP: {xp} / {maxXp}</p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 pb-28 pt-4 relative z-10">

        {/* HOME */}
        {section === "home" && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-black text-center mb-1" style={{ color: "var(--game-orange)" }}>Привет, Игрок! 👋</h1>
            <p className="text-center text-sm font-semibold opacity-50 mb-6">Куда отправимся сегодня?</p>

            <div className="grid grid-cols-1 gap-4 mb-6">
              {[
                { key: "kitchen" as Section, emoji: "👩‍🍳", label: "Кухня", desc: "Готовь вкусные блюда и зарабатывай монеты", color: "#FF7A2F", bg: "#FFF3E0", img: KITCHEN_IMG },
                { key: "shop" as Section, emoji: "🛒", label: "Магазин", desc: "Покупай предметы и украшения для городка", color: "#3CC97A", bg: "#E8F8F0", img: SHOP_IMG },
                { key: "profile" as Section, emoji: "🧑‍🎤", label: "Профиль", desc: "Твои достижения и статистика", color: "#A855F7", bg: "#F5F0FF", img: PROFILE_IMG },
              ].map(item => (
                <button key={item.key} onClick={() => navigate(item.key)}
                  className="bounce-hover overflow-hidden text-left rounded-3xl"
                  style={{ background: item.bg, border: "3px solid rgba(0,0,0,0.08)", boxShadow: "0 6px 0 rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.06)" }}>
                  <div className="flex items-stretch">
                    <div className="w-28 h-24 flex-shrink-0 overflow-hidden">
                      <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{item.emoji}</span>
                        <span className="text-xl font-black" style={{ color: item.color }}>{item.label}</span>
                      </div>
                      <p className="text-xs font-semibold opacity-55 leading-relaxed mb-2">{item.desc}</p>
                      <div className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full text-white"
                        style={{ background: item.color, width: "fit-content" }}>
                        Войти <Icon name="ChevronRight" size={12} />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Монет", value: coins, emoji: "🪙", bg: "#FFD93D", text: "#7C5300" },
                { label: "Уровень", value: level, emoji: "⭐", bg: "#A855F7", text: "#fff" },
                { label: "Покупок", value: ownedCount, emoji: "🛍️", bg: "#4DA6FF", text: "#fff" },
              ].map(stat => (
                <div key={stat.label} className="rounded-2xl p-3 text-center"
                  style={{ background: stat.bg, border: "3px solid rgba(0,0,0,0.1)", boxShadow: "0 4px 0 rgba(0,0,0,0.1)", color: stat.text }}>
                  <div className="text-2xl">{stat.emoji}</div>
                  <div className="font-black text-xl">{stat.value}</div>
                  <div className="text-xs font-bold opacity-75">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KITCHEN */}
        {section === "kitchen" && (
          <div className="animate-fade-in">
            <div className="text-center mb-5">
              <img src={KITCHEN_IMG} alt="Кухня" className="w-full h-36 object-cover rounded-3xl mb-3"
                style={{ border: "3px solid rgba(0,0,0,0.08)", boxShadow: "0 6px 0 rgba(0,0,0,0.1)" }} />
              <h2 className="text-2xl font-black" style={{ color: "var(--game-orange)" }}>👩‍🍳 Кухня</h2>
              <p className="text-xs opacity-50 font-bold">Нажми на блюдо чтобы готовить, потом — забрать монеты!</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {DISHES.map(dish => {
                const isCooking = cooking[dish.id] !== undefined;
                const isCooked = cooked[dish.id];
                return (
                  <button key={dish.id}
                    onClick={e => isCooked ? collectDish(dish, e) : startCooking(dish, e)}
                    disabled={isCooking}
                    className={`rounded-3xl p-4 text-center transition-all duration-200 ${isCooked ? "bounce-hover" : isCooking ? "" : "bounce-hover"}`}
                    style={{
                      background: isCooked ? "#F0FFF4" : isCooking ? "#FFFBF0" : "#fff",
                      border: `3px solid ${isCooked ? "#3CC97A" : isCooking ? "#FFD93D" : "rgba(0,0,0,0.07)"}`,
                      boxShadow: isCooked ? "0 6px 0 #22A85A" : isCooking ? "0 5px 0 #E6B800" : "0 5px 0 rgba(0,0,0,0.08)",
                    }}>
                    <div className={`text-4xl mb-2 ${isCooked ? "wiggle" : ""}`}>{isCooked ? "✨" + dish.emoji : dish.emoji}</div>
                    <div className="font-black text-sm mb-1">{dish.name}</div>
                    {isCooking ? (
                      <div>
                        <div className="text-xs font-bold text-amber-600 mb-1">⏱ {cooking[dish.id]}с...</div>
                        <div className="h-2 rounded-full bg-amber-100 overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                            style={{ width: `${((dish.time - (cooking[dish.id] ?? 0)) / dish.time) * 100}%` }} />
                        </div>
                      </div>
                    ) : isCooked ? (
                      <div className="text-xs font-black text-green-600 animate-bounce">Нажми — забрать!</div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs font-bold opacity-45">⏱ {dish.time}с</span>
                        <span className="text-xs font-black" style={{ color: "#B87333" }}>+{dish.reward}🪙</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SHOP */}
        {section === "shop" && (
          <div className="animate-fade-in">
            <div className="text-center mb-5">
              <img src={SHOP_IMG} alt="Магазин" className="w-full h-36 object-cover rounded-3xl mb-3"
                style={{ border: "3px solid rgba(0,0,0,0.08)", boxShadow: "0 6px 0 rgba(0,0,0,0.1)" }} />
              <h2 className="text-2xl font-black" style={{ color: "#3CC97A" }}>🛒 Магазин</h2>
              <div className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full font-black text-sm mt-1"
                style={{ background: "#FFD93D", color: "#7C5300", border: "3px solid rgba(0,0,0,0.08)" }}>
                🪙 У тебя: {coins} монет
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {shopItems.map(item => (
                <button key={item.id} onClick={e => buyItem(item, e)}
                  className={`rounded-3xl p-4 text-center ${item.owned ? "" : "bounce-hover"}`}
                  style={{
                    background: item.owned ? "#F4F4F4" : "#fff",
                    border: `3px solid ${item.owned ? "rgba(0,0,0,0.06)" : item.color + "55"}`,
                    boxShadow: item.owned ? "0 3px 0 rgba(0,0,0,0.05)" : `0 5px 0 ${item.color}66`,
                    opacity: item.owned ? 0.7 : 1,
                  }}>
                  <div className="text-4xl mb-2" style={{ filter: item.owned ? "grayscale(0.6)" : "none" }}>{item.emoji}</div>
                  <div className="font-black text-sm mb-2">{item.name}</div>
                  {item.owned ? (
                    <div className="text-xs font-black text-green-600">✅ Куплено</div>
                  ) : (
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-black"
                      style={{ background: item.color }}>
                      🪙 {item.price}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE */}
        {section === "profile" && (
          <div className="animate-fade-in">
            <div className="text-center mb-5">
              <div className="relative inline-block mb-3">
                <img src={PROFILE_IMG} alt="Профиль" className="w-28 h-28 rounded-full object-cover"
                  style={{ border: "4px solid var(--game-purple)", boxShadow: "0 6px 0 rgba(0,0,0,0.12)" }} />
                <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center text-lg"
                  style={{ background: "#FFD93D", border: "3px solid #fff" }}>⭐</div>
              </div>
              <h2 className="text-2xl font-black" style={{ color: "var(--game-purple)" }}>🧑‍🎤 Мой профиль</h2>
              <p className="text-sm font-bold opacity-50">Уровень {level} · Игрок</p>
            </div>

            <div className="rounded-3xl p-5 mb-4" style={{ background: "#fff", border: "3px solid rgba(0,0,0,0.07)", boxShadow: "0 6px 0 rgba(0,0,0,0.08)" }}>
              <h3 className="font-black text-base mb-4" style={{ color: "var(--game-purple)" }}>📊 Статистика</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Монеты", value: coins, emoji: "🪙", color: "#FFD93D", text: "#7C5300" },
                  { label: "Уровень", value: level, emoji: "⭐", color: "#A855F7", text: "#fff" },
                  { label: "Опыт", value: xp, emoji: "💪", color: "#4DA6FF", text: "#fff" },
                  { label: "Покупки", value: ownedCount, emoji: "🛍️", color: "#3CC97A", text: "#fff" },
                ].map(stat => (
                  <div key={stat.label} className="rounded-2xl p-3 flex items-center gap-3"
                    style={{ background: stat.color + "22", border: `2px solid ${stat.color}44` }}>
                    <span className="text-2xl">{stat.emoji}</span>
                    <div>
                      <div className="font-black text-xl" style={{ color: stat.color === "#FFD93D" ? "#7C5300" : stat.color }}>{stat.value}</div>
                      <div className="text-xs font-bold opacity-55">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1 opacity-50">
                  <span>До уровня {level + 1}</span>
                  <span>{xp}/{maxXp} XP</span>
                </div>
                <div className="h-4 rounded-full overflow-hidden" style={{ background: "#F0F0F0", border: "2px solid rgba(0,0,0,0.08)" }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, (xp / maxXp) * 100)}%`, background: "linear-gradient(90deg, #FF4D8D, #A855F7)" }} />
                </div>
              </div>
            </div>

            <div className="rounded-3xl p-5" style={{ background: "#fff", border: "3px solid rgba(0,0,0,0.07)", boxShadow: "0 6px 0 rgba(0,0,0,0.08)" }}>
              <h3 className="font-black text-base mb-4" style={{ color: "#FF7A2F" }}>🏆 Достижения</h3>
              <div className="grid grid-cols-2 gap-3">
                {ACHIEVEMENTS.map((ach, i) => {
                  const unlocked =
                    (i === 0 && everCooked) ||
                    (i === 1 && coins >= 100) ||
                    (i === 2 && ownedCount > 0) ||
                    (i === 3 && level >= 5);
                  return (
                    <div key={ach.name} className="rounded-2xl p-3 flex items-center gap-2"
                      style={{ background: unlocked ? "#FFF8E7" : "#F8F8F8", border: `2px solid ${unlocked ? "#FFD93D" : "rgba(0,0,0,0.05)"}`, opacity: unlocked ? 1 : 0.45 }}>
                      <span className="text-2xl" style={{ filter: unlocked ? "none" : "grayscale(1)" }}>{ach.emoji}</span>
                      <div>
                        <div className="font-black text-sm">{ach.name}</div>
                        <div className="text-xs opacity-55">{ach.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4"
        style={{ background: "rgba(255,248,231,0.96)", backdropFilter: "blur(16px)", borderTop: "3px solid rgba(255,165,0,0.15)" }}>
        <div className="max-w-lg mx-auto grid grid-cols-4 gap-2 pt-3">
          {[
            { key: "home" as Section, emoji: "🏡", label: "Главная", color: "#FF7A2F" },
            { key: "kitchen" as Section, emoji: "👩‍🍳", label: "Кухня", color: "#FF7A2F" },
            { key: "shop" as Section, emoji: "🛒", label: "Магазин", color: "#3CC97A" },
            { key: "profile" as Section, emoji: "🧑‍🎤", label: "Профиль", color: "#A855F7" },
          ].map(tab => {
            const active = section === tab.key;
            return (
              <button key={tab.key} onClick={() => navigate(tab.key)}
                className={`flex flex-col items-center gap-1 py-2 px-2 rounded-2xl transition-all duration-200 ${shakeKey === tab.key ? "wiggle" : ""}`}
                style={{
                  background: active ? tab.color + "20" : "transparent",
                  border: active ? `2px solid ${tab.color}44` : "2px solid transparent",
                  transform: active ? "translateY(-2px)" : "translateY(0)",
                }}>
                <span className="text-2xl" style={{ filter: active ? "none" : "grayscale(0.3)" }}>{tab.emoji}</span>
                <span className="text-xs font-bold" style={{ color: active ? tab.color : "rgba(0,0,0,0.38)" }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
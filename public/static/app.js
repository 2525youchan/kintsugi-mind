/**
 * KINTSUGI MIND - Frontend Application
 * The Japanese Art of Resilience
 */

// ========================================
// Seasonal System - 四季 (Shiki)
// ========================================

const SEASONS = {
  spring: {
    name: { en: 'Spring', ja: '春' },
    emoji: '🌸',
    colors: {
      primary: '#f8b4d9', // cherry blossom pink
      secondary: '#fce7f3',
      accent: '#ec4899'
    },
    messages: {
      en: [
        'Like cherry blossoms, embrace change with grace',
        'Spring rain nourishes new growth',
        'Each day is a fresh beginning'
      ],
      ja: [
        '桜のように、変化を優雅に受け入れて',
        '春の雨が新しい芽を育てる',
        '毎日が新しい始まり'
      ]
    },
    greetings: {
      morning: { en: 'Good morning 🌸', ja: 'おはようございます 🌸' },
      afternoon: { en: 'Good afternoon 🌷', ja: 'こんにちは 🌷' },
      evening: { en: 'Good evening 🌙', ja: 'こんばんは 🌙' }
    },
    bgGradient: 'from-pink-50 to-rose-100 dark:from-pink-950/20 dark:to-rose-950/20'
  },
  summer: {
    name: { en: 'Summer', ja: '夏' },
    emoji: '🌻',
    colors: {
      primary: '#22d3ee',
      secondary: '#e0f2fe',
      accent: '#0891b2'
    },
    messages: {
      en: [
        'Find coolness in the shade of your mind',
        'Like flowing water, let troubles pass',
        'Summer teaches us to slow down'
      ],
      ja: [
        '心の木陰で涼を感じて',
        '水のように、悩みを流して',
        '夏はゆっくりすることを教えてくれる'
      ]
    },
    greetings: {
      morning: { en: 'Good morning 🌻', ja: 'おはようございます 🌻' },
      afternoon: { en: 'Stay cool 🌊', ja: '涼しくお過ごしください 🌊' },
      evening: { en: 'Cool evening 🌙', ja: '涼しい夜を 🌙' }
    },
    bgGradient: 'from-cyan-50 to-sky-100 dark:from-cyan-950/20 dark:to-sky-950/20'
  },
  autumn: {
    name: { en: 'Autumn', ja: '秋' },
    emoji: '🍂',
    colors: {
      primary: '#f97316',
      secondary: '#fff7ed',
      accent: '#ea580c'
    },
    messages: {
      en: [
        'Like falling leaves, release what no longer serves',
        'Autumn invites deep reflection',
        'In letting go, we find peace'
      ],
      ja: [
        '落ち葉のように、手放す勇気を',
        '秋は深い内省を誘う',
        '手放すことで、平和を見つける'
      ]
    },
    greetings: {
      morning: { en: 'Good morning 🍂', ja: 'おはようございます 🍂' },
      afternoon: { en: 'Pleasant autumn day 🍁', ja: '秋の午後をお楽しみください 🍁' },
      evening: { en: 'Cool autumn night 🌙', ja: '秋の夜長を 🌙' }
    },
    bgGradient: 'from-orange-50 to-amber-100 dark:from-orange-950/20 dark:to-amber-950/20'
  },
  winter: {
    name: { en: 'Winter', ja: '冬' },
    emoji: '❄️',
    colors: {
      primary: '#94a3b8',
      secondary: '#f1f5f9',
      accent: '#475569'
    },
    messages: {
      en: [
        'In stillness, find inner warmth',
        'Winter teaches patience and rest',
        'Like snow, let silence bring clarity'
      ],
      ja: [
        '静けさの中に、内なる温もりを',
        '冬は忍耐と休息を教える',
        '雪のように、静寂が明晰さをもたらす'
      ]
    },
    greetings: {
      morning: { en: 'Good morning ❄️', ja: 'おはようございます ❄️' },
      afternoon: { en: 'Stay warm 🍵', ja: '温かくお過ごしください 🍵' },
      evening: { en: 'Cozy evening 🌙', ja: '温かい夜を 🌙' }
    },
    bgGradient: 'from-slate-50 to-gray-100 dark:from-slate-950/20 dark:to-gray-950/20'
  }
};

// ========================================
// Daily Zen Quotes - 禅語 (Zengo)
// ========================================

const ZEN_QUOTES = [
  // Classic Koans
  { en: "Two hands clap and there is a sound. What is the sound of one hand?", ja: "両手を打てば音がする。では、片手の音は？", source: { en: "Hakuin Ekaku", ja: "白隠慧鶴" },
    explanation: { en: "A famous koan that breaks logical thinking. There is no 'correct' answer — the point is to go beyond reason.", ja: "論理的思考を打ち破る有名な公案。「正解」はなく、理屈を超えることが目的です。" } },
  { en: "Before you were born, what was your original face?", ja: "父母未生以前、本来の面目は何か。", source: { en: "Zen Koan", ja: "禅の公案" },
    explanation: { en: "A question about your true self before social roles and conditioning. Who are you at the deepest level?", ja: "社会的な役割や条件づけの前の「本当の自分」を問う公案。最も深いレベルで、あなたは誰ですか？" } },
  { en: "Does a dog have Buddha nature?", ja: "狗子に仏性ありや。", source: { en: "Mumonkan", ja: "無門関" },
    explanation: { en: "The master answered 'Mu' (nothing). This koan asks us to see beyond yes/no dualities.", ja: "趙州和尚は「無」と答えました。この公案は「ある・ない」の二元論を超えることを求めています。" } },
  { en: "What is the color of wind?", ja: "風に色はあるか。", source: { en: "Zen Koan", ja: "禅の公案" },
    explanation: { en: "Invites you to perceive beyond the five senses. Not everything real can be measured.", ja: "五感を超えた知覚を促す問い。実在するすべてが測れるわけではありません。" } },
  { en: "Where does the flame go when the candle is blown out?", ja: "ろうそくを吹き消したとき、炎はどこへ行くのか。", source: { en: "Zen Koan", ja: "禅の公案" },
    explanation: { en: "A meditation on impermanence and the nature of existence. Things don't 'go' anywhere — they simply change form.", ja: "無常と存在の本質についての瞑想。ものはどこかへ「行く」のではなく、ただ形を変えるだけです。" } },
  
  // Zen Wisdom
  { en: "The obstacle is the path.", ja: "障害こそが道である。", source: { en: "Zen Proverb", ja: "禅のことわざ" },
    explanation: { en: "Difficulties are not detours — they are the journey itself. Growth comes through facing challenges.", ja: "困難は回り道ではなく、旅そのものです。成長は課題に向き合うことから生まれます。" } },
  { en: "Fall seven times, stand up eight.", ja: "七転び八起き。", source: { en: "Japanese Proverb", ja: "日本のことわざ" },
    explanation: { en: "Resilience is not about never falling — it's about always getting back up one more time.", ja: "回復力とは転ばないことではなく、何度でもまた立ち上がること。" } },
  { en: "In the beginner's mind there are many possibilities, but in the expert's mind there are few.", ja: "初心者の心には多くの可能性がある。達人の心には少ない。", source: { en: "Shunryu Suzuki", ja: "鈴木俊隆" },
    explanation: { en: "Expertise can narrow our vision. Approaching things with fresh, open eyes reveals new possibilities.", ja: "専門知識は視野を狭めることも。初心に返り、新鮮な目で物事を見ることで新たな可能性が開けます。" } },
  { en: "When you reach the top of the mountain, keep climbing.", ja: "山頂に達しても、なお登り続けよ。", source: { en: "Zen Proverb", ja: "禅のことわざ" },
    explanation: { en: "There is no final destination in self-improvement. The journey of growth never truly ends.", ja: "自己成長にゴールはありません。成長の旅は決して終わらないのです。" } },
  { en: "The quieter you become, the more you can hear.", ja: "静かになればなるほど、より多くが聞こえる。", source: { en: "Ram Dass", ja: "ラム・ダス" },
    explanation: { en: "Inner noise drowns out wisdom. Stillness creates space for deeper understanding.", ja: "心の雑音が知恵をかき消します。静けさが深い理解のための空間を生み出します。" } },
  
  // Morita Therapy Wisdom
  { en: "Accept your feelings as they are. Then do what needs to be done.", ja: "感情をあるがままに受け入れ、なすべきことをなせ。", source: { en: "Shoma Morita", ja: "森田正馬" },
    explanation: { en: "The core of Morita Therapy: don't fight feelings, but don't let them control your actions either.", ja: "森田療法の核心。感情と闘わず、しかし感情に行動を支配させない。" } },
  { en: "Your anxiety is not your enemy. It is simply part of being human.", ja: "不安は敵ではない。人間であることの一部に過ぎない。", source: { en: "Morita Therapy", ja: "森田療法" },
    explanation: { en: "Anxiety is natural, not a flaw. The problem arises when we fight against it instead of accepting it.", ja: "不安は欠陥ではなく自然なもの。問題は、不安を受け入れず闘おうとするときに生じます。" } },
  { en: "Action brings courage, not the other way around.", ja: "行動が勇気をもたらす。その逆ではない。", source: { en: "Morita Therapy", ja: "森田療法" },
    explanation: { en: "Don't wait to feel brave before acting. Courage emerges from taking action despite fear.", ja: "勇気が湧くのを待たないで。恐れがあっても行動することで、勇気が生まれます。" } },
  { en: "Feelings are like weather. Actions are like gardening.", ja: "感情は天気のよう。行動は園芸のよう。", source: { en: "Morita Therapy", ja: "森田療法" },
    explanation: { en: "You can't control the weather (feelings), but you can still tend your garden (take action).", ja: "天気（感情）はコントロールできませんが、庭の手入れ（行動）はできます。" } },
  { en: "Purpose-driven action frees us from the tyranny of mood.", ja: "目的のある行動は、気分の支配から我々を解放する。", source: { en: "Morita Therapy", ja: "森田療法" },
    explanation: { en: "When guided by purpose rather than mood, we reclaim control of our lives.", ja: "気分ではなく目的に導かれるとき、私たちは人生の主導権を取り戻します。" } },
  
  // Naikan Wisdom
  { en: "What have I received? What have I given? What troubles have I caused?", ja: "何をもらったか。何を返したか。どんな迷惑をかけたか。", source: { en: "Naikan", ja: "内観" },
    explanation: { en: "The three questions of Naikan practice. They shift focus from self-pity to gratitude and self-awareness.", ja: "内観の三つの問い。自己憐憫から感謝と自己認識へと視点を転換します。" } },
  { en: "Gratitude is not just a feeling, it is a way of seeing.", ja: "感謝は単なる感情ではない。ものの見方である。", source: { en: "Naikan", ja: "内観" },
    explanation: { en: "Gratitude as a lens changes everything. When we look for what we've received, the world transforms.", ja: "感謝というレンズはすべてを変えます。受け取ったものに目を向けると、世界が変わります。" } },
  { en: "When we truly examine our lives, we find we have received far more than we have given.", ja: "人生を真に見つめると、与えた以上に受け取ってきたことに気づく。", source: { en: "Naikan", ja: "内観" },
    explanation: { en: "A humbling realization through Naikan: we are supported by countless people and things.", ja: "内観を通じた気づき。私たちは数え切れない人やものに支えられています。" } },
  
  // Wabi-Sabi & Kintsugi
  { en: "Nothing lasts, nothing is finished, and nothing is perfect.", ja: "永遠のものはなく、完成されたものはなく、完璧なものはない。", source: { en: "Wabi-sabi", ja: "侘び寂び" },
    explanation: { en: "The three pillars of wabi-sabi: impermanence, incompleteness, and imperfection — and the beauty within them.", ja: "侘び寂びの三つの柱：無常、不完全、不完璧 ― そしてその中にある美しさ。" } },
  { en: "Your cracks are where the light enters.", ja: "ひび割れは、光が入る場所である。", source: { en: "Kintsugi Philosophy", ja: "金継ぎの哲学" },
    explanation: { en: "Our wounds and struggles become openings for growth, wisdom, and compassion.", ja: "傷や苦難は、成長・知恵・思いやりへの入り口になります。" } },
  { en: "Beauty is found in imperfection.", ja: "美は不完全さの中にある。", source: { en: "Wabi-sabi", ja: "侘び寂び" },
    explanation: { en: "Perfection is an illusion. True beauty lies in the natural, the worn, and the imperfect.", ja: "完璧は幻想。本当の美しさは、自然なもの、使い込まれたもの、不完全なものの中にあります。" } },
  { en: "The broken vessel, repaired with gold, becomes more beautiful than before.", ja: "金で修復された器は、以前より美しくなる。", source: { en: "Kintsugi", ja: "金継ぎ" },
    explanation: { en: "Kintsugi teaches that our history of breakage and repair adds value and beauty to who we are.", ja: "金継ぎは、壊れて修復された歴史が、私たちの価値と美しさを高めることを教えています。" } },
  
  // Japanese Proverbs
  { en: "Even dust, when accumulated, becomes a mountain.", ja: "塵も積もれば山となる。", source: { en: "Japanese Proverb", ja: "日本のことわざ" },
    explanation: { en: "Small efforts compound over time. Consistency matters more than intensity.", ja: "小さな努力は時間とともに積み重なります。激しさより継続が大切です。" } },
  { en: "The nail that sticks out gets hammered down, but the bamboo that bends survives the storm.", ja: "出る杭は打たれるが、しなる竹は嵐を生き延びる。", source: { en: "Japanese Wisdom", ja: "日本の知恵" },
    explanation: { en: "Flexibility and adaptability can be greater strengths than rigid resistance.", ja: "柔軟さと適応力は、頑固な抵抗よりも大きな強さになりえます。" } },
  { en: "If you chase two rabbits, you will catch neither.", ja: "二兎を追う者は一兎をも得ず。", source: { en: "Japanese Proverb", ja: "日本のことわざ" },
    explanation: { en: "Focus on one thing at a time. Dividing attention leads to achieving nothing.", ja: "一度にひとつのことに集中しよう。注意を分散させると何も成し遂げられません。" } },
  { en: "One who climbs Mount Fuji once is wise; one who climbs twice is a fool.", ja: "富士山に一度登る者は賢者、二度登る者は愚者。", source: { en: "Japanese Proverb", ja: "日本のことわざ" },
    explanation: { en: "Some experiences are precious because they happen once. Know when enough is enough.", ja: "一度きりだからこそ尊い体験がある。「足るを知る」ことの大切さ。" } },
  { en: "A frog in a well knows nothing of the great ocean.", ja: "井の中の蛙大海を知らず。", source: { en: "Japanese Proverb", ja: "日本のことわざ" },
    explanation: { en: "Limited experience leads to a narrow worldview. Step outside your comfort zone to gain perspective.", ja: "狭い経験は狭い世界観につながる。視野を広げるためにコンフォートゾーンの外へ出よう。" } },
  
  // Buddhist Wisdom
  { en: "Peace comes from within. Do not seek it without.", ja: "平和は内から来る。外に求めるな。", source: { en: "Buddha", ja: "釈迦" },
    explanation: { en: "External circumstances can't give lasting peace. True peace is cultivated within the mind.", ja: "外の環境は永続的な安らぎを与えられません。本当の平和は心の中で育まれます。" } },
  { en: "The mind is everything. What you think, you become.", ja: "心がすべてである。思うことが、あなた自身になる。", source: { en: "Buddha", ja: "釈迦" },
    explanation: { en: "Our thoughts shape our reality. By changing how we think, we change who we are.", ja: "思考が現実をつくります。考え方を変えれば、自分自身も変わります。" } },
  { en: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", ja: "過去にとらわれず、未来を夢見ず、今この瞬間に心を集中せよ。", source: { en: "Buddha", ja: "釈迦" },
    explanation: { en: "The only moment we truly have is now. Ruminating or worrying steals our present.", ja: "本当にあるのは「今」だけ。過去の後悔や未来の心配は、今を奪います。" } },
  { en: "You yourself must strive. The Buddhas only point the way.", ja: "自ら努めよ。仏は道を示すのみ。", source: { en: "Dhammapada", ja: "法句経" },
    explanation: { en: "No one can walk the path for you. Teachers guide, but the work of growth is yours alone.", ja: "誰もあなたの代わりに道を歩めません。師は導くだけで、成長の努力は自分自身のものです。" } },
  
  // Daily Mindfulness
  { en: "When walking, just walk. When eating, just eat.", ja: "歩くときは、ただ歩く。食べるときは、ただ食べる。", source: { en: "Zen Teaching", ja: "禅の教え" },
    explanation: { en: "Full presence in each activity is the essence of Zen. Multitasking divides the mind.", ja: "今していることに完全に集中する ― それが禅の本質。マルチタスクは心を分断します。" } },
  { en: "Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.", ja: "悟りの前、薪を割り水を汲む。悟りの後、薪を割り水を汲む。", source: { en: "Zen Proverb", ja: "禅のことわざ" },
    explanation: { en: "Spiritual awakening doesn't change daily life — it changes how you experience it.", ja: "悟りは日常を変えません ― 日常の「体験の仕方」が変わるのです。" } },
  { en: "Drink your tea slowly and reverently, as if it is the axis on which the whole earth revolves.", ja: "お茶をゆっくりと敬虔に飲め。それが地球が回る軸であるかのように。", source: { en: "Thich Nhat Hanh", ja: "ティク・ナット・ハン" },
    explanation: { en: "Every mundane moment can be sacred if we bring full attention to it.", ja: "全身全霊で向き合えば、どんな日常の瞬間も神聖なものになりえます。" } },
  { en: "Wherever you are, be there totally.", ja: "どこにいても、完全にそこにいなさい。", source: { en: "Eckhart Tolle", ja: "エックハルト・トール" },
    explanation: { en: "Half-presence is half-living. Give your complete attention to wherever you find yourself.", ja: "半分の存在は半分の人生。今いる場所に完全な注意を向けましょう。" } },
  
  // Acceptance & Flow
  { en: "Let go, or be dragged.", ja: "手放すか、引きずられるか。", source: { en: "Zen Proverb", ja: "禅のことわざ" },
    explanation: { en: "Clinging to what we can't control only causes suffering. Letting go is an act of strength.", ja: "コントロールできないものにしがみつくと苦しむだけ。手放すことは強さの表れです。" } },
  { en: "Be like water: flexible, soft, yet capable of wearing away stone.", ja: "水のようであれ。柔軟で、柔らかく、それでいて石をも削る。", source: { en: "Tao Te Ching", ja: "老子 道徳経" },
    explanation: { en: "True power is not force, but adaptability. Water wins by flowing, not by fighting.", ja: "本当の力は力ずくではなく適応力。水は闘わず流れることで勝ちます。" } },
  { en: "The river does not push; it just flows.", ja: "川は押さない。ただ流れる。", source: { en: "Zen Wisdom", ja: "禅の知恵" },
    explanation: { en: "Don't force outcomes. Like a river, find your natural path and trust the flow.", ja: "結果を無理に求めないで。川のように自然な道を見つけ、流れを信じましょう。" } },
  { en: "What the caterpillar calls the end, the rest of the world calls a butterfly.", ja: "毛虫が終わりと呼ぶものを、世界の残りは蝶と呼ぶ。", source: { en: "Lao Tzu", ja: "老子" },
    explanation: { en: "What feels like an ending is often a transformation. Pain can be the prelude to something beautiful.", ja: "終わりに感じることは、しばしば変容です。痛みは美しい何かへの序曲かもしれません。" } },
  
  // Self-Compassion
  { en: "You are not your thoughts. You are the awareness behind them.", ja: "あなたは思考ではない。その背後にある気づきである。", source: { en: "Eckhart Tolle", ja: "エックハルト・トール" },
    explanation: { en: "Thoughts come and go, but the 'you' that observes them remains. You are bigger than any thought.", ja: "思考は来ては去りますが、それを観察する「あなた」は変わりません。あなたはどんな思考よりも大きい存在です。" } },
  { en: "Be kind, for everyone you meet is fighting a hard battle.", ja: "親切であれ。出会うすべての人が、困難な戦いをしているのだから。", source: { en: "Attributed to Plato", ja: "プラトン（伝）" },
    explanation: { en: "Everyone carries invisible burdens. Kindness is never wasted.", ja: "誰もが見えない重荷を背負っています。親切は決して無駄にはなりません。" } },
  { en: "The wound is the place where the light enters you.", ja: "傷は、光があなたに入る場所である。", source: { en: "Rumi", ja: "ルーミー" },
    explanation: { en: "Our deepest wounds can become our greatest sources of wisdom and empathy.", ja: "最も深い傷が、最も大きな知恵と共感の源になりえます。" } },
  
  // Impermanence
  { en: "This too shall pass.", ja: "これもまた過ぎ去る。", source: { en: "Persian Adage", ja: "ペルシアの格言" },
    explanation: { en: "Both joy and sorrow are temporary. This truth brings comfort in dark times and humility in good times.", ja: "喜びも悲しみも一時的なもの。この真実は、辛い時に慰めを、良い時に謙虚さをもたらします。" } },
  { en: "The only constant is change.", ja: "唯一の不変は変化である。", source: { en: "Heraclitus", ja: "ヘラクレイトス" },
    explanation: { en: "Resisting change causes suffering. Embracing it brings freedom.", ja: "変化に抵抗すると苦しみが生まれます。受け入れれば自由になれます。" } },
  { en: "Every moment is a fresh beginning.", ja: "すべての瞬間が新しい始まりである。", source: { en: "T.S. Eliot", ja: "T.S. エリオット" },
    explanation: { en: "You are not trapped by yesterday. Each moment offers a chance to start anew.", ja: "昨日に縛られる必要はありません。すべての瞬間が新たに始めるチャンスです。" } },
  { en: "Like the moon, come out from behind the clouds and shine.", ja: "月のように、雲の後ろから出て輝け。", source: { en: "Buddha", ja: "釈迦" },
    explanation: { en: "Your inner light is always there, even when obscured by difficulties. Let it shine through.", ja: "あなたの内なる光は、困難に覆われていても常にそこにあります。輝かせましょう。" } },
  
  // Simplicity
  { en: "Simplicity is the ultimate sophistication.", ja: "シンプルさは究極の洗練である。", source: { en: "Leonardo da Vinci", ja: "レオナルド・ダ・ヴィンチ" },
    explanation: { en: "Complexity often hides confusion. True mastery shows itself in simplicity.", ja: "複雑さはしばしば混乱を隠します。本当の熟練はシンプルさに表れます。" } },
  { en: "Less is more.", ja: "少ないことは、より多いこと。", source: { en: "Mies van der Rohe", ja: "ミース・ファン・デル・ローエ" },
    explanation: { en: "By removing the unnecessary, we make space for what truly matters.", ja: "不要なものを取り除くことで、本当に大切なもののための余白が生まれます。" } },
  { en: "The greatest wealth is a poverty of desires.", ja: "最大の富は、欲望の貧しさである。", source: { en: "Seneca", ja: "セネカ" },
    explanation: { en: "True richness comes not from having more, but from wanting less.", ja: "本当の豊かさは、多くを持つことではなく、多くを求めないことから生まれます。" } },
  { en: "Have nothing in your house that you do not know to be useful or believe to be beautiful.", ja: "役立つと知らないもの、美しいと信じないものは家に置くな。", source: { en: "William Morris", ja: "ウィリアム・モリス" },
    explanation: { en: "Surround yourself only with things that serve or inspire you. Decluttering frees the mind.", ja: "役に立つもの、心を豊かにするものだけを身の回りに。整理は心を自由にします。" } }
];

// Get today's zen quote (same quote for everyone on the same day)
function getDailyZenQuote() {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today - startOfYear;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const quoteIndex = dayOfYear % ZEN_QUOTES.length;
  return ZEN_QUOTES[quoteIndex];
}

// Update daily zen quote display
function updateDailyZenQuote(lang = 'en') {
  const quoteEl = document.getElementById('daily-zen-quote');
  const sourceEl = document.getElementById('daily-zen-source');
  
  if (!quoteEl) return;
  
  const quote = getDailyZenQuote();
  quoteEl.textContent = `"${quote[lang]}"`;
  if (sourceEl) {
    sourceEl.textContent = `— ${quote.source[lang] || quote.source.en}`;
  }
  // Display explanation on home page
  const explanationEl = document.getElementById('daily-zen-explanation');
  if (explanationEl && quote.explanation) {
    explanationEl.textContent = quote.explanation[lang] || quote.explanation.en;
  }
}

// Share zen quote
function shareZenQuote(lang = 'en') {
  const quote = getDailyZenQuote();
  const text = lang === 'en'
    ? `"${quote.en}" — ${quote.source.en}\n\n#KintsugiMind #Zen #DailyWisdom`
    : `「${quote.ja}」— ${quote.source.ja}\n\n#KintsugiMind #禅語 #毎日の知恵`;
  
  const url = window.location.origin + '/?lang=' + lang;
  
  if (navigator.share) {
    navigator.share({
      title: lang === 'en' ? "Today's Zen" : '今日の禅語',
      text: text,
      url: url
    }).catch(() => {});
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(text + '\n' + url).then(() => {
      alert(lang === 'en' ? 'Copied to clipboard!' : 'クリップボードにコピーしました！');
    });
  }
}

// ========================================
// Zen Quote Archive System
// ========================================

// Add category metadata to quotes
const QUOTE_CATEGORIES = {
  'Zen Koan': 'zen',
  'Mumonkan': 'zen',
  'Hakuin Ekaku': 'zen',
  'Zen Proverb': 'zen',
  'Zen Teaching': 'mindfulness',
  'Zen Wisdom': 'zen',
  'Shoma Morita': 'morita',
  'Morita Therapy': 'morita',
  'Naikan': 'naikan',
  'Wabi-sabi': 'kintsugi',
  'Kintsugi': 'kintsugi',
  'Kintsugi Philosophy': 'kintsugi',
  'Japanese Proverb': 'proverbs',
  'Japanese Wisdom': 'proverbs',
  'Buddha': 'buddhism',
  'Dhammapada': 'buddhism',
  'Thich Nhat Hanh': 'mindfulness',
  'Eckhart Tolle': 'mindfulness',
  'Ram Dass': 'mindfulness',
  'Lao Tzu': 'mindfulness',
  'Tao Te Ching': 'mindfulness',
  'Rumi': 'mindfulness',
  'Shunryu Suzuki': 'zen',
  'Attributed to Plato': 'mindfulness',
  'Persian Adage': 'mindfulness',
  'Heraclitus': 'mindfulness',
  'T.S. Eliot': 'mindfulness',
  'Leonardo da Vinci': 'mindfulness',
  'Mies van der Rohe': 'mindfulness',
  'Seneca': 'mindfulness',
  'William Morris': 'mindfulness'
};

function getQuoteCategory(source) {
  const key = typeof source === 'object' ? source.en : source;
  return QUOTE_CATEGORIES[key] || 'mindfulness';
}

// Initialize zen archive page
function initZenArchive(lang = 'en') {
  const quotesGrid = document.getElementById('quotes-grid');
  const todayQuoteText = document.getElementById('today-quote-text');
  const todayQuoteSource = document.getElementById('today-quote-source');
  const shareTodayBtn = document.getElementById('share-today-quote-btn');
  
  if (!quotesGrid) return;
  
  // Display today's quote
  const todayQuote = getDailyZenQuote();
  if (todayQuoteText) {
    todayQuoteText.textContent = `"${todayQuote[lang]}"`;
  }
  if (todayQuoteSource) {
    todayQuoteSource.textContent = `— ${todayQuote.source[lang] || todayQuote.source.en}`;
  }
  // Display today's quote explanation
  const todayQuoteExplanation = document.getElementById('today-quote-explanation');
  if (todayQuoteExplanation && todayQuote.explanation) {
    todayQuoteExplanation.textContent = todayQuote.explanation[lang] || todayQuote.explanation.en;
  }
  
  // Share today's quote
  if (shareTodayBtn) {
    shareTodayBtn.addEventListener('click', () => shareZenQuote(lang));
  }
  
  // Build quotes grid with categories
  const enrichedQuotes = ZEN_QUOTES.map((quote, index) => ({
    ...quote,
    category: getQuoteCategory(quote.source),
    index
  }));
  
  function renderQuotes(category = 'all') {
    const filtered = category === 'all' 
      ? enrichedQuotes 
      : enrichedQuotes.filter(q => q.category === category);
    
    quotesGrid.innerHTML = filtered.map(quote => `
      <div class="quote-card bg-white/60 dark:bg-[#1e1e1e]/80 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow" data-category="${quote.category}">
        <blockquote class="text-lg text-indigo-800 dark:text-[#e8e4dc] italic leading-relaxed mb-2">
          "${quote[lang]}"
        </blockquote>
        ${quote.explanation ? `<p class="text-xs leading-relaxed text-ink-400 dark:text-[#a8a29e] mb-3 pl-2 border-l-2 border-gold/30 dark:border-gold/40">${quote.explanation[lang] || quote.explanation.en}</p>` : ''}
        <div class="flex items-center justify-between">
          <p class="text-xs text-ink-400 dark:text-[#78716c]">— ${quote.source[lang] || quote.source.en}</p>
          <button 
            class="share-quote-btn p-2 rounded-full hover:bg-indigo-800/10 dark:hover:bg-gold/10 transition-colors"
            data-index="${quote.index}"
            title="${lang === 'en' ? 'Share' : 'シェア'}"
          >
            <svg class="w-4 h-4 text-indigo-700 dark:text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
    
    // Add share event listeners
    quotesGrid.querySelectorAll('.share-quote-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        shareSpecificQuote(index, lang);
      });
    });
  }
  
  // Initial render
  renderQuotes('all');
  
  // Category filter buttons
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      document.querySelectorAll('.category-btn').forEach(b => {
        b.classList.remove('active', 'bg-indigo-800', 'text-white', 'dark:bg-gold', 'dark:text-black');
        b.classList.add('bg-ink-200/50', 'dark:bg-[#2d2d2d]', 'text-ink-500', 'dark:text-[#a8a29e]');
      });
      btn.classList.add('active', 'bg-indigo-800', 'text-white', 'dark:bg-gold', 'dark:text-black');
      btn.classList.remove('bg-ink-200/50', 'dark:bg-[#2d2d2d]', 'text-ink-500', 'dark:text-[#a8a29e]');
      
      // Filter quotes
      renderQuotes(btn.dataset.category);
    });
  });
}

// Share a specific quote
function shareSpecificQuote(index, lang = 'en') {
  const quote = ZEN_QUOTES[index];
  if (!quote) return;
  
  const text = lang === 'en'
    ? `"${quote.en}" — ${quote.source.en}\n\n#KintsugiMind #Zen #DailyWisdom`
    : `「${quote.ja}」— ${quote.source.ja}\n\n#KintsugiMind #禅語 #毎日の知恵`;
  
  const url = window.location.origin + '/zen-archive?lang=' + lang;
  
  if (navigator.share) {
    navigator.share({
      title: lang === 'en' ? 'Zen Wisdom' : '禅の知恵',
      text: text,
      url: url
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text + '\n' + url).then(() => {
      alert(lang === 'en' ? 'Copied to clipboard!' : 'クリップボードにコピーしました！');
    });
  }
}

// ========================================
// Seasonal System
// ========================================

// Get current season based on date
function getCurrentSeason() {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

// Get time of day
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}

// Get seasonal greeting
function getSeasonalGreeting(lang = 'en') {
  const season = getCurrentSeason();
  const time = getTimeOfDay();
  return SEASONS[season].greetings[time][lang];
}

// Get random seasonal message
function getSeasonalMessage(lang = 'en') {
  const season = getCurrentSeason();
  const messages = SEASONS[season].messages[lang];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Get seasonal info
function getSeasonalInfo() {
  const season = getCurrentSeason();
  return {
    season,
    ...SEASONS[season]
  };
}

// Apply seasonal theme to element
function applySeasonalTheme(element) {
  if (!element) return;
  
  const season = getCurrentSeason();
  const bgGradient = SEASONS[season].bgGradient;
  
  // Add seasonal gradient class
  element.classList.add('bg-gradient-to-br', ...bgGradient.split(' '));
}

// Update seasonal elements on the page
function updateSeasonalElements(lang = 'en') {
  // Update greeting elements
  const greetingEl = document.querySelector('[data-seasonal="greeting"]');
  if (greetingEl) {
    greetingEl.textContent = getSeasonalGreeting(lang);
  }
  
  // Update message elements
  const messageEl = document.querySelector('[data-seasonal="message"]');
  if (messageEl) {
    messageEl.textContent = getSeasonalMessage(lang);
  }
  
  // Update seasonal emoji
  const emojiEl = document.querySelector('[data-seasonal="emoji"]');
  if (emojiEl) {
    const season = getCurrentSeason();
    emojiEl.textContent = SEASONS[season].emoji;
  }
  
  // Update season name
  const seasonNameEl = document.querySelector('[data-seasonal="name"]');
  if (seasonNameEl) {
    const season = getCurrentSeason();
    seasonNameEl.textContent = SEASONS[season].name[lang];
  }
}

// ========================================
// Subscription System
// ========================================

let currentSubscription = { plan: 'free', limits: {}, usage: {} };

// Get subscription status
async function getSubscription() {
  try {
    const response = await fetch('/api/subscription');
    const data = await response.json();
    currentSubscription = data;
    return data;
  } catch (e) {
    console.error('Failed to get subscription:', e);
    return currentSubscription;
  }
}

// Check if feature is available
async function checkFeature(feature) {
  try {
    const response = await fetch(`/api/subscription/check/${feature}`);
    return await response.json();
  } catch (e) {
    console.error('Failed to check feature:', e);
    return { allowed: true, remaining: -1, limit: -1 };
  }
}

// Record feature usage
async function useFeature(feature) {
  try {
    const response = await fetch(`/api/subscription/use/${feature}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await response.json();
  } catch (e) {
    console.error('Failed to record usage:', e);
    return { success: false };
  }
}

// Show upgrade modal
function showUpgradeModal(feature, lang = 'en') {
  const messages = {
    ai_chat: {
      en: "You've reached your daily AI conversation limit.",
      ja: '本日のAI対話回数が上限に達しました。'
    },
    checkin: {
      en: "You've reached your daily check-in limit.",
      ja: '本日のチェックイン回数が上限に達しました。'
    },
    default: {
      en: 'This feature requires Premium.',
      ja: 'この機能はプレミアムで利用できます。'
    }
  };
  
  const message = messages[feature] || messages.default;
  
  // Create modal
  const modal = document.createElement('div');
  modal.id = 'upgrade-modal';
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 max-w-sm w-full shadow-xl animate-fade-in">
      <div class="text-center">
        <div class="text-4xl mb-4">✨</div>
        <h3 class="text-xl text-indigo-800 dark:text-[#e8e4dc] mb-2">
          ${lang === 'en' ? 'Upgrade to Premium' : 'プレミアムにアップグレード'}
        </h3>
        <p class="text-ink-500 dark:text-[#78716c] mb-6">
          ${message[lang]}
        </p>
        <div class="space-y-3">
          <a 
            href="/pricing?lang=${lang}" 
            class="block w-full px-6 py-3 bg-gold text-ink font-medium rounded-full hover:bg-gold-400 transition-colors"
          >
            ${lang === 'en' ? 'View Plans' : 'プランを見る'}
          </a>
          <button 
            onclick="closeUpgradeModal()"
            class="block w-full px-6 py-3 text-ink-500 dark:text-[#78716c] hover:text-ink-700 dark:hover:text-[#a8a29e] transition-colors"
          >
            ${lang === 'en' ? 'Maybe Later' : 'あとで'}
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeUpgradeModal();
  });
}

function closeUpgradeModal() {
  const modal = document.getElementById('upgrade-modal');
  if (modal) modal.remove();
}

// ========================================
// Authentication System
// ========================================

let currentUser = null;

// Check authentication status on page load
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/auth/status');
    const data = await response.json();
    
    if (data.authenticated && data.user) {
      currentUser = data.user;
      updateAuthUI(data.user);
      
      // If just logged in, sync local data to server
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('auth_success')) {
        await syncLocalDataToServer();
        // Remove auth_success param from URL
        urlParams.delete('auth_success');
        const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
        window.history.replaceState({}, '', newUrl);
      }
    }
  } catch (e) {
    console.error('Auth status check failed:', e);
  }
}

// Update UI based on auth status
function updateAuthUI(user) {
  const lang = getLang();
  
  // Header login button
  const loginBtn = document.getElementById('header-login-btn');
  const userAvatar = document.getElementById('header-user-avatar');
  const userPicture = document.getElementById('header-user-picture');
  
  if (loginBtn && userAvatar && userPicture && user) {
    loginBtn.classList.add('hidden');
    userAvatar.classList.remove('hidden');
    userAvatar.classList.add('flex');
    userPicture.src = user.picture;
    userPicture.alt = user.name;
  }
  
  // Profile page account banner
  const loggedOutBanner = document.getElementById('account-logged-out');
  const loggedInBanner = document.getElementById('account-logged-in');
  const userAvatarProfile = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  const userEmail = document.getElementById('user-email');
  
  if (loggedOutBanner && loggedInBanner && user) {
    loggedOutBanner.classList.add('hidden');
    loggedInBanner.classList.remove('hidden');
    
    if (userAvatarProfile) userAvatarProfile.src = user.picture;
    if (userName) userName.textContent = user.name;
    if (userEmail) userEmail.textContent = user.email;
  }
  
  // Mobile vessel text update
  const mobileVesselText = document.getElementById('mobile-vessel-text');
  if (mobileVesselText && user) {
    mobileVesselText.textContent = user.name.split(' ')[0]; // First name
  }
}

// Sync local data to server after login
async function syncLocalDataToServer() {
  const localProfile = loadProfile();
  const checkinHistory = getCheckinHistory();
  const vessel = getSelectedVessel();
  
  try {
    // Send local data to server
    const response = await fetch('/api/sync/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        profile: localProfile,
        checkins: checkinHistory,
        vessel: vessel
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('[Sync] Local data synced to server:', result);
      
      // Now fetch merged data from server and update local
      await syncServerDataToLocal();
    }
  } catch (e) {
    console.error('[Sync] Failed to sync to server:', e);
  }
}

// Sync server data to local (for logged-in users)
async function syncServerDataToLocal() {
  try {
    const response = await fetch('/api/sync/profile');
    if (!response.ok) return;
    
    const data = await response.json();
    if (data.source !== 'server' || !data.profile) return;
    
    // Update local profile with server data
    const localProfile = loadProfile();
    const mergedProfile = {
      ...localProfile,
      totalRepairs: Math.max(localProfile.totalRepairs || 0, data.profile.totalRepairs || 0),
      lastVisit: data.profile.lastVisit || localProfile.lastVisit,
      stats: {
        totalVisits: Math.max(localProfile.stats?.totalVisits || 0, data.profile.stats?.totalVisits || 0),
        currentStreak: Math.max(localProfile.stats?.currentStreak || 0, data.profile.stats?.currentStreak || 0),
        longestStreak: Math.max(localProfile.stats?.longestStreak || 0, data.profile.stats?.longestStreak || 0),
        gardenActions: Math.max(localProfile.stats?.gardenActions || 0, data.profile.stats?.gardenActions || 0),
        studySessions: Math.max(localProfile.stats?.studySessions || 0, data.profile.stats?.studySessions || 0),
        tatamiSessions: Math.max(localProfile.stats?.tatamiSessions || 0, data.profile.stats?.tatamiSessions || 0)
      }
    };
    
    saveProfile(mergedProfile);
    console.log('[Sync] Local profile updated from server');
    
    // Merge checkins
    if (data.checkins && data.checkins.length > 0) {
      const localCheckins = getCheckinHistory();
      const localDates = new Set(localCheckins.map(c => c.date));
      
      // Add server checkins that don't exist locally
      for (const serverCheckin of data.checkins) {
        const dateStr = serverCheckin.created_at?.split('T')[0];
        if (dateStr && !localDates.has(dateStr)) {
          localCheckins.push({
            date: dateStr,
            weather: serverCheckin.weather,
            timestamp: new Date(serverCheckin.created_at).getTime()
          });
        }
      }
      
      // Save merged checkins
      localStorage.setItem(CHECKIN_HISTORY_KEY, JSON.stringify(localCheckins));
      console.log('[Sync] Checkin history merged');
    }
    
    // Update UI if on profile page
    if (window.location.pathname === '/profile') {
      updateProfileUI(mergedProfile, getLang());
    }
    
  } catch (e) {
    console.error('[Sync] Failed to sync from server:', e);
  }
}

// Get checkin history for sync
function getCheckinHistory() {
  try {
    const data = localStorage.getItem(CHECKIN_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

// Update profile UI with new data (simple version for sync updates)
function updateProfileUISimple(profile) {
  const lang = getLang();
  // Try to use the full updateProfileUI if on profile page
  const vesselContainer = document.getElementById('vessel-container');
  if (vesselContainer) {
    // On profile page, use full update
    updateProfileUI(profile, lang);
  } else {
    // Simple update for other pages
    const totalVisitsEl = document.getElementById('stat-total-visits');
    const currentStreakEl = document.getElementById('stat-current-streak');
    if (totalVisitsEl) totalVisitsEl.textContent = profile.stats?.totalVisits || 0;
    if (currentStreakEl) currentStreakEl.textContent = profile.stats?.currentStreak || 0;
  }
}

// Logout handler
function initLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  if (!logoutBtn) return;
  
  logoutBtn.addEventListener('click', async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      currentUser = null;
      window.location.reload();
    } catch (e) {
      console.error('Logout failed:', e);
    }
  });
}

// ========================================
// Dark Mode System
// ========================================

const DARK_MODE_KEY = 'kintsugi-dark-mode';

// Initialize dark mode on page load (before DOM ready for no flash)
(function initDarkModeEarly() {
  const savedMode = localStorage.getItem(DARK_MODE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedMode === 'dark' || (savedMode === null && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
})();

// Initialize dark mode toggle after DOM ready
function initDarkMode() {
  const toggles = document.querySelectorAll('#dark-mode-toggle, #dark-mode-toggle-profile');
  if (toggles.length === 0) return;
  
  const isDark = document.documentElement.classList.contains('dark');
  updateDarkModeUI(isDark);
  
  function handleToggle() {
    const currentlyDark = document.documentElement.classList.contains('dark');
    const newMode = !currentlyDark;
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(DARK_MODE_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(DARK_MODE_KEY, 'light');
    }
    
    updateDarkModeUI(newMode);
    
    // Smooth transition feedback
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    // Vibrate for tactile feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }
  
  toggles.forEach(toggle => {
    toggle.addEventListener('click', handleToggle);
  });
  
  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const savedMode = localStorage.getItem(DARK_MODE_KEY);
    if (savedMode === null) {
      // Only auto-switch if user hasn't explicitly set preference
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      updateDarkModeUI(e.matches);
    }
  });
}

function updateDarkModeUI(isDark) {
  // Update all dark mode toggles
  document.querySelectorAll('#dark-mode-toggle, #dark-mode-toggle-profile').forEach(toggle => {
    toggle.setAttribute('aria-pressed', isDark);
    toggle.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  });
  
  // Update theme icon on profile page
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    themeIcon.textContent = isDark ? '🌙' : '☀️';
  }
  
  // Update meta theme color for mobile browsers
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.content = isDark ? '#121212' : '#1e3a5f';
  }
}

// ========================================
// Kintsugi Profile System (LocalStorage)
// ========================================

const STORAGE_KEY = 'kintsugi-profile';

// Default profile structure
function createDefaultProfile() {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    createdAt: now,
    lastVisit: now,
    cracks: [],
    totalRepairs: 0,
    activities: [],
    stats: {
      totalVisits: 1,
      currentStreak: 1,
      longestStreak: 1,
      gardenActions: 0,
      studySessions: 0,
      tatamiSessions: 0
    }
  };
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function toDateString(date) {
  return date.toISOString().split('T')[0];
}

function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Load profile from localStorage
function loadProfile() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load profile:', e);
  }
  return createDefaultProfile();
}

// Save profile to localStorage
function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
}

// Record a visit and update streak
function recordVisit(profile) {
  const today = toDateString(new Date());
  const lastVisit = profile.lastVisit.split('T')[0];
  
  if (today === lastVisit) {
    return profile; // Same day, no update
  }
  
  const daysDiff = daysBetween(lastVisit, today);
  let newStreak = profile.stats.currentStreak;
  const newCracks = [...profile.cracks];
  
  if (daysDiff === 1) {
    // Consecutive visit
    newStreak += 1;
  } else if (daysDiff > 1) {
    // Streak broken - add absence cracks
    for (let i = 1; i < Math.min(daysDiff, 7); i++) { // Max 7 cracks for absence
      const missedDate = new Date(lastVisit);
      missedDate.setDate(missedDate.getDate() + i);
      newCracks.push({
        id: generateId(),
        type: 'absence',
        date: toDateString(missedDate),
        repaired: false
      });
    }
    newStreak = 1;
  }
  
  return {
    ...profile,
    lastVisit: new Date().toISOString(),
    cracks: newCracks,
    stats: {
      ...profile.stats,
      totalVisits: profile.stats.totalVisits + 1,
      currentStreak: newStreak,
      longestStreak: Math.max(profile.stats.longestStreak, newStreak)
    }
  };
}

// Record anxiety (adds a crack)
function recordAnxiety(profile, text) {
  const newCrack = {
    id: generateId(),
    type: 'anxiety',
    date: new Date().toISOString(),
    text: text,
    repaired: false
  };
  
  return {
    ...profile,
    cracks: [...profile.cracks, newCrack]
  };
}

// Record activity (repairs a crack)
function recordActivityToProfile(profile, type, details = {}) {
  const activity = {
    id: generateId(),
    type,
    date: new Date().toISOString(),
    details
  };
  
  // Repair one unrepaired crack
  const updatedCracks = [...profile.cracks];
  const unrepairedIndex = updatedCracks.findIndex(c => !c.repaired);
  let repairCount = 0;
  
  if (unrepairedIndex !== -1) {
    updatedCracks[unrepairedIndex] = {
      ...updatedCracks[unrepairedIndex],
      repaired: true,
      repairedDate: new Date().toISOString()
    };
    repairCount = 1;
  }
  
  // Update stats
  const stats = { ...profile.stats };
  if (type === 'garden') {
    stats.gardenActions += details.actionCount || 1;
  } else if (type === 'study') {
    stats.studySessions += 1;
  } else if (type === 'tatami') {
    stats.tatamiSessions += 1;
  }
  
  const updatedProfile = {
    ...profile,
    cracks: updatedCracks,
    totalRepairs: profile.totalRepairs + repairCount,
    activities: [...profile.activities, activity],
    stats
  };
  
  // Sync activity to server (non-blocking)
  syncActivityToServer(type, details);
  
  return updatedProfile;
}

// Sync activity to server (for logged-in users)
async function syncActivityToServer(type, data) {
  if (!currentUser) return; // Only sync if logged in
  
  try {
    await fetch('/api/sync/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data })
    });
  } catch (e) {
    // Silently fail - data is saved locally anyway
    console.log('[Sync] Activity sync failed, saved locally');
  }
}

// Calculate vessel visual properties
function calculateVesselVisual(profile) {
  // Depth = activities + cracks + visits
  const depth = Math.min(100,
    (profile.activities.length * 5) +
    (profile.cracks.length * 3) +
    (profile.stats.totalVisits)
  );
  
  // Gold intensity = repair ratio × repair count
  const repairedCount = profile.cracks.filter(c => c.repaired).length;
  const repairRatio = profile.cracks.length > 0
    ? repairedCount / profile.cracks.length
    : 0;
  const goldIntensity = Math.min(100, repairRatio * 50 + profile.totalRepairs * 5);
  
  return { depth, goldIntensity, repairedCount };
}

// ========================================
// Photo-based Vessel Stage System
// ========================================

// Vessel stage images configuration
const VESSEL_STAGE_IMAGES = {
  chawan: {
    basePath: '/static/images/chawan/',
    stages: [
      { file: 'stage-0.png', name: { en: 'Pristine', ja: '無傷' } },
      { file: 'stage-1.png', name: { en: 'Shattered', ja: '破片' } },
      { file: 'stage-2.png', name: { en: 'Fragments', ja: '断片' } },
      { file: 'stage-3.png', name: { en: 'Assembling', ja: '組立中' } },
      { file: 'stage-4.png', name: { en: 'Forming', ja: '形成中' } },
      { file: 'stage-5.png', name: { en: 'Nearly Complete', ja: 'あと少し' } },
      { file: 'stage-6.png', name: { en: 'Complete', ja: '完成' } }
    ]
  },
  tsubo: {
    basePath: '/static/images/tsubo/',
    stages: [
      { file: 'stage-0.png', name: { en: 'Pristine', ja: '無傷' } },
      { file: 'stage-1.png', name: { en: 'Hairline Cracks', ja: '小さなヒビ' } },
      { file: 'stage-2.png', name: { en: 'Spreading Cracks', ja: 'ヒビ増加' } },
      { file: 'stage-3.png', name: { en: 'Kintsugi Begins', ja: '金継ぎ開始' } },
      { file: 'stage-4.png', name: { en: 'Half Repaired', ja: '半分修復' } },
      { file: 'stage-5.png', name: { en: 'Nearly Complete', ja: 'あと少し' } },
      { file: 'stage-6.png', name: { en: 'Complete', ja: '完成' } }
    ]
  },
  tokkuri: {
    basePath: '/static/images/tokkuri/',
    stages: [
      { file: 'stage-0.png', name: { en: 'Pristine', ja: '無傷' } },
      { file: 'stage-1.png', name: { en: 'Hairline Cracks', ja: '小さなヒビ' } },
      { file: 'stage-2.png', name: { en: 'Spreading Cracks', ja: 'ヒビ増加' } },
      { file: 'stage-3.png', name: { en: 'Kintsugi Begins', ja: '金継ぎ開始' } },
      { file: 'stage-4.png', name: { en: 'Half Repaired', ja: '半分修復' } },
      { file: 'stage-5.png', name: { en: 'Nearly Complete', ja: 'あと少し' } },
      { file: 'stage-6.png', name: { en: 'Complete', ja: '完成' } }
    ]
  },
  sara: {
    basePath: '/static/images/sara/',
    stages: [
      { file: 'stage-0.png', name: { en: 'Pristine', ja: '無傷' } },
      { file: 'stage-1.png', name: { en: 'Shattered', ja: '破片' } },
      { file: 'stage-2.png', name: { en: 'Joining Begins', ja: '繋がり始め' } },
      { file: 'stage-3.png', name: { en: 'Forming Chunks', ja: '塊に' } },
      { file: 'stage-4.png', name: { en: 'Two Halves', ja: '2つの半分' } },
      { file: 'stage-5.png', name: { en: 'Nearly Complete', ja: 'あと少し' } },
      { file: 'stage-6.png', name: { en: 'Complete', ja: '完成' } }
    ]
  },
  hachi: {
    basePath: '/static/images/hachi/',
    stages: [
      { file: 'stage-0.png', name: { en: 'Pristine', ja: '無傷' } },
      { file: 'stage-1.png', name: { en: 'Shattered', ja: '破片' } },
      { file: 'stage-2.png', name: { en: 'Joining Begins', ja: '繋がり始め' } },
      { file: 'stage-3.png', name: { en: 'Forming Chunks', ja: '塊に' } },
      { file: 'stage-4.png', name: { en: 'Two Halves', ja: '2つの半分' } },
      { file: 'stage-5.png', name: { en: 'Nearly Complete', ja: 'あと少し' } },
      { file: 'stage-6.png', name: { en: 'Complete', ja: '完成' } }
    ]
  }
};

// Determine which stage image to show based on goldIntensity
function getVesselStage(profile) {
  const { goldIntensity } = calculateVesselVisual(profile);
  const hasCracks = profile.cracks && profile.cracks.length > 0;
  
  // If no cracks yet, show pristine vessel (stage 0)
  if (!hasCracks) {
    return 0;
  }
  
  // Map goldIntensity (0-100) to stages (1-6)
  // Stage 1: 0%
  // Stage 2: 1-16%
  // Stage 3: 17-33%
  // Stage 4: 34-50%
  // Stage 5: 51-83%
  // Stage 6: 84-100%
  if (goldIntensity === 0) return 1;
  if (goldIntensity <= 16) return 2;
  if (goldIntensity <= 33) return 3;
  if (goldIntensity <= 50) return 4;
  if (goldIntensity <= 83) return 5;
  return 6;
}

// Get the image path for current vessel stage
function getVesselStageImage(vesselType, stage) {
  const vesselConfig = VESSEL_STAGE_IMAGES[vesselType];
  if (!vesselConfig) {
    // Fallback: return null to use legacy SVG
    return null;
  }
  return vesselConfig.basePath + vesselConfig.stages[stage].file;
}

// Get the stage name for display
function getVesselStageName(vesselType, stage, lang) {
  const vesselConfig = VESSEL_STAGE_IMAGES[vesselType];
  if (!vesselConfig) return '';
  return vesselConfig.stages[stage].name[lang] || vesselConfig.stages[stage].name.en;
}

// Generate crack SVG paths based on vessel type
// Photo-based crack patterns adjusted for 200x200 viewBox
function generateCrackPaths(cracks, vesselType = 'chawan') {
  // Different crack patterns for each vessel type
  // Photo茶碗用: 器は画像の中央に位置、縦長で上部が開いている形状
  const pathVariationsByType = {
    // 茶碗 Photo版: 自然な金継ぎ風のヒビパターン
    chawan: [
      // 左側の大きなヒビ（上から下へ）
      (h) => `M${55 + (h % 15)} ${60 + (h % 10)} 
               Q${50 + (h % 10)} ${80 + (h % 8)} ${52 + (h % 12)} ${100 + (h % 10)}
               Q${48 + (h % 8)} ${120 + (h % 10)} ${55 + (h % 10)} ${140 + (h % 8)}
               L${50 + (h % 12)} ${160 + (h % 10)}`,
      // 右側の斜めヒビ
      (h) => `M${145 + (h % 10)} ${65 + (h % 12)}
               Q${140 + (h % 8)} ${85 + (h % 10)} ${148 + (h % 10)} ${105 + (h % 8)}
               L${142 + (h % 12)} ${130 + (h % 10)}`,
      // 中央やや左のヒビ
      (h) => `M${80 + (h % 15)} ${70 + (h % 10)}
               L${75 + (h % 10)} ${95 + (h % 12)}
               Q${78 + (h % 8)} ${115 + (h % 10)} ${72 + (h % 12)} ${135 + (h % 8)}`,
      // 中央右側のヒビ
      (h) => `M${120 + (h % 12)} ${75 + (h % 10)}
               Q${125 + (h % 8)} ${95 + (h % 12)} ${118 + (h % 10)} ${115 + (h % 8)}
               L${122 + (h % 10)} ${140 + (h % 10)}`,
      // 下部の横ヒビ
      (h) => `M${60 + (h % 20)} ${150 + (h % 8)}
               Q${85 + (h % 15)} ${155 + (h % 6)} ${110 + (h % 12)} ${148 + (h % 10)}
               L${130 + (h % 15)} ${152 + (h % 8)}`,
      // 小さな枝分かれヒビ（左）
      (h) => `M${52 + (h % 8)} ${100 + (h % 10)}
               L${40 + (h % 10)} ${110 + (h % 8)}`,
      // 小さな枝分かれヒビ（右）
      (h) => `M${148 + (h % 8)} ${105 + (h % 10)}
               L${158 + (h % 10)} ${115 + (h % 8)}`,
    ],
    tsubo: [
      (h) => `M${80 + (h % 20)} 50 L${75 + (h % 25)} 90 L${85 + (h % 20)} 130 L${70 + (h % 30)} 170`,
      (h) => `M${120 + (h % 15)} 60 L${125 + (h % 20)} 100 L${115 + (h % 25)} 140 L${130 + (h % 15)} 180`,
      (h) => `M${100 + (h % 20)} 80 L${95 + (h % 25)} 120 L${105 + (h % 20)} 160`,
      (h) => `M${90 + (h % 15)} 100 L${85 + (h % 20)} 140 L${95 + (h % 15)} 180 L${88 + (h % 20)} 210`,
    ],
    sara: [
      (h) => `M${50 + (h % 30)} 100 L${60 + (h % 25)} 120 L${45 + (h % 35)} 140 L${55 + (h % 30)} 160`,
      (h) => `M${130 + (h % 30)} 100 L${140 + (h % 20)} 120 L${125 + (h % 25)} 140 L${135 + (h % 30)} 160`,
      (h) => `M${80 + (h % 25)} 95 L${95 + (h % 20)} 115 L${85 + (h % 25)} 135 L${100 + (h % 20)} 155`,
      (h) => `M${100 + (h % 20)} 90 L${110 + (h % 25)} 110 L${95 + (h % 30)} 130`,
    ],
    tokkuri: [
      (h) => `M${95 + (h % 10)} 30 L${90 + (h % 15)} 50 L${100 + (h % 10)} 70`,
      (h) => `M${70 + (h % 20)} 100 L${65 + (h % 25)} 140 L${75 + (h % 20)} 180 L${60 + (h % 30)} 210`,
      (h) => `M${130 + (h % 15)} 100 L${135 + (h % 20)} 140 L${125 + (h % 25)} 180 L${140 + (h % 15)} 210`,
      (h) => `M${100 + (h % 15)} 120 L${95 + (h % 20)} 160 L${105 + (h % 15)} 200`,
    ],
    hachi: [
      (h) => `M${60 + (h % 30)} 70 L${55 + (h % 25)} 110 L${65 + (h % 20)} 150 L${50 + (h % 30)} 190`,
      (h) => `M${140 + (h % 20)} 70 L${145 + (h % 15)} 110 L${135 + (h % 25)} 150 L${150 + (h % 15)} 190`,
      (h) => `M${100 + (h % 25)} 80 L${95 + (h % 20)} 120 L${105 + (h % 25)} 160 L${90 + (h % 30)} 200`,
      (h) => `M${80 + (h % 20)} 100 L${90 + (h % 25)} 140 L${75 + (h % 20)} 180`,
    ]
  };
  
  const pathVariations = pathVariationsByType[vesselType] || pathVariationsByType.chawan;
  
  return cracks.map((crack, index) => {
    // Simple hash from id
    let hash = 0;
    for (let i = 0; i < crack.id.length; i++) {
      hash = ((hash << 5) - hash) + crack.id.charCodeAt(i);
      hash = hash & hash;
    }
    hash = Math.abs(hash);
    
    const pathFn = pathVariations[(index + hash) % pathVariations.length];
    return {
      path: pathFn(hash),
      repaired: crack.repaired,
      type: crack.type
    };
  });
}

// ========================================
// Language & Utility Functions
// ========================================

function getLang() {
  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get('lang');
  if (lang === 'ja' || lang === 'en') {
    localStorage.setItem('kintsugi-lang', lang);
    return lang;
  }
  
  const stored = localStorage.getItem('kintsugi-lang');
  if (stored === 'ja' || stored === 'en') {
    return stored;
  }
  
  const dataLang = document.querySelector('[data-lang]')?.dataset?.lang;
  if (dataLang) return dataLang;
  
  return 'en';
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function vibrate(pattern) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

// ========================================
// Translations for dynamic content
// ========================================
const i18n = {
  garden: {
    guidanceResponses: {
      en: [
        "Feeling anxious? That's natural for a human being. So, what will your hands do?",
        "You don't need to erase that emotion. Emotions are like clouds in the sky. Action continues on the ground.",
        "Arugamama — Feeling and doing are separate things.",
        "Can you move your hands just once, while carrying that anxiety?",
        "Emotions are like weather. You can't change them. But you can carry an umbrella."
      ],
      ja: [
        "不安ですね。それは人間として自然です。では、手は何をしますか？",
        "その感情を消す必要はありません。感情は空の雲のようなもの。行動は地上で続きます。",
        "あるがまま (Arugamama) — 感じることと、することは別です。",
        "不安を抱えたまま、一つだけ手を動かしてみませんか？",
        "感情は天気。変えられません。でも、傘をさすことはできます。"
      ]
    }
  },
  study: {
    guideName: { en: 'Naikan Guide', ja: '内観ガイド' },
    questions: {
      1: {
        text: { 
          en: "Was there a moment today when someone's work or kindness helped you?",
          ja: "今日、誰かの仕事や優しさに助けられた瞬間はありましたか？"
        },
        hint: {
          en: "A store clerk, family, train operator... even the smallest things count.",
          ja: "コンビニの店員、家族、電車の運転手...どんな小さなことでも。"
        }
      },
      2: {
        text: {
          en: "What did you offer to the world today?",
          ja: "今日、あなたは世界に何を提供しましたか？"
        },
        hint: {
          en: "Work, a smile, words to someone... anything counts.",
          ja: "仕事、笑顔、誰かへの言葉...何でも構いません。"
        }
      },
      3: {
        text: {
          en: "Was there a moment when you relied on someone's tolerance?",
          ja: "誰かの寛容さに甘えた場面はありましたか？"
        },
        hint: {
          en: "This is not about guilt — it's about awareness of connection.",
          ja: "これは反省ではなく、繋がりへの気づきです。"
        }
      }
    },
    conclusion: {
      title: {
        en: "Thank you. Today's reflection is complete.",
        ja: "ありがとうございます。今日の内観が終わりました。"
      },
      message: {
        en: "You are supported by many connections, and you give much in return. You are not alone.",
        ja: "あなたは多くの縁に支えられ、また多くを与えています。孤独ではありません。"
      },
      quote: {
        en: '"Engi (縁起) — Everything exists within connection"',
        ja: '"縁起 — すべては繋がりの中に"'
      }
    }
  },
  tatami: {
    breatheIn: { en: 'Breathe in', ja: '息を吸う' },
    breatheOut: { en: 'Breathe out', ja: '息を吐く' }
  },
  profile: {
    repairMessage: {
      en: 'A crack has been repaired with gold. Your vessel grows more beautiful.',
      ja: 'ヒビが金で修復されました。あなたの器はより美しくなりました。'
    },
    newCrack: {
      en: 'A new crack has appeared. This is not damage — it is part of your story.',
      ja: '新しいヒビが入りました。これは傷ではありません。あなたの物語の一部です。'
    }
  }
};

// ========================================
// Profile Page Logic
// ========================================

function initProfile() {
  const lang = getLang();
  let profile = loadProfile();
  
  // Record visit
  profile = recordVisit(profile);
  saveProfile(profile);
  
  // Update UI
  updateProfileUI(profile, lang);
  
  // Initialize notification settings
  initNotificationSettings(lang);
  
  // Initialize check-in calendar (heatmap)
  initCheckinCalendar(lang);
  
  // Initialize emotion trend analysis
  initEmotionTrend(lang);
  
  // Check sync status if logged in
  if (currentUser) {
    updateSyncStatus(lang);
  }
}

// Update sync status display
async function updateSyncStatus(lang) {
  const statusEl = document.getElementById('sync-status');
  const statusText = document.getElementById('sync-status-text');
  
  if (!statusEl || !statusText) return;
  
  try {
    const response = await fetch('/api/sync/status');
    const data = await response.json();
    
    if (data.synced) {
      const lastSync = data.lastSync ? new Date(data.lastSync) : null;
      let syncText = lang === 'en' ? 'Synced to cloud' : 'クラウドに同期済み';
      
      if (lastSync) {
        const timeAgo = getTimeAgo(lastSync, lang);
        syncText += ` (${timeAgo})`;
      }
      
      statusText.textContent = syncText;
      statusEl.querySelector('svg').classList.remove('text-yellow-500');
      statusEl.querySelector('svg').classList.add('text-green-500');
    } else {
      statusText.textContent = lang === 'en' ? 'Not synced yet' : '未同期';
      statusEl.querySelector('svg').classList.remove('text-green-500');
      statusEl.querySelector('svg').classList.add('text-yellow-500');
    }
  } catch (e) {
    statusText.textContent = lang === 'en' ? 'Sync status unknown' : '同期状態不明';
  }
}

// Get relative time ago string
function getTimeAgo(date, lang) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) {
    return lang === 'en' ? 'just now' : 'たった今';
  } else if (diffMins < 60) {
    return lang === 'en' ? `${diffMins}m ago` : `${diffMins}分前`;
  } else if (diffHours < 24) {
    return lang === 'en' ? `${diffHours}h ago` : `${diffHours}時間前`;
  } else {
    return lang === 'en' ? `${diffDays}d ago` : `${diffDays}日前`;
  }
}

// Manual sync button handler
async function manualSync() {
  const lang = getLang();
  const statusText = document.getElementById('sync-status-text');
  const syncBtn = document.getElementById('sync-now-btn');
  
  if (statusText) {
    statusText.textContent = lang === 'en' ? 'Syncing...' : '同期中...';
  }
  if (syncBtn) {
    syncBtn.disabled = true;
    syncBtn.textContent = lang === 'en' ? 'Syncing...' : '同期中...';
  }
  
  try {
    await syncLocalDataToServer();
    
    if (statusText) {
      statusText.textContent = lang === 'en' ? 'Synced successfully!' : '同期完了！';
    }
    
    // Refresh UI after sync
    setTimeout(() => {
      updateSyncStatus(lang);
      if (syncBtn) {
        syncBtn.disabled = false;
        syncBtn.textContent = lang === 'en' ? 'Sync now' : '今すぐ同期';
      }
    }, 1500);
    
  } catch (e) {
    if (statusText) {
      statusText.textContent = lang === 'en' ? 'Sync failed' : '同期失敗';
    }
    if (syncBtn) {
      syncBtn.disabled = false;
      syncBtn.textContent = lang === 'en' ? 'Retry' : '再試行';
    }
  }
}

// Make manualSync globally accessible
window.manualSync = manualSync;

// ========================================
// Check-in Calendar
// ========================================

const CHECKIN_HISTORY_KEY = 'kintsugi-checkin-history';
const WEATHER_EMOJIS = {
  sunny: '☀️',
  cloudy: '⛅',
  rainy: '🌧️',
  stormy: '⛈️'
};

// Load check-in history from localStorage
function loadCheckinHistory() {
  try {
    const data = localStorage.getItem(CHECKIN_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

// Save check-in to history
function saveCheckinToHistory(weather, note = '') {
  const history = loadCheckinHistory();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Check if already checked in today
  const existingIndex = history.findIndex(h => h.date === today);
  if (existingIndex >= 0) {
    history[existingIndex] = { date: today, weather, note, timestamp: new Date().toISOString() };
  } else {
    history.push({ date: today, weather, note, timestamp: new Date().toISOString() });
  }
  
  // Keep only last 365 days
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const filtered = history.filter(h => new Date(h.date) >= oneYearAgo);
  
  localStorage.setItem(CHECKIN_HISTORY_KEY, JSON.stringify(filtered));
  return filtered;
}

// Get check-ins for a specific month
function getCheckinsForMonth(year, month) {
  const history = loadCheckinHistory();
  return history.filter(h => {
    const date = new Date(h.date);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  });
}

// ========================================
// Emotion Trend Analysis
// ========================================

// Get check-ins for last N days
function getCheckinsForDays(days = 30) {
  const history = loadCheckinHistory();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return history.filter(h => new Date(h.date) >= startDate);
}

// Calculate emotion statistics
function calculateEmotionStats(checkins) {
  const stats = {
    sunny: 0,
    cloudy: 0,
    rainy: 0,
    stormy: 0,
    total: 0
  };
  
  checkins.forEach(c => {
    if (c.weather && stats.hasOwnProperty(c.weather)) {
      stats[c.weather]++;
      stats.total++;
    }
  });
  
  return stats;
}

// Generate emotion insight message
function generateEmotionInsight(stats, lang = 'en') {
  if (stats.total === 0) {
    return lang === 'en' 
      ? 'Start tracking your emotions to see insights here.' 
      : '感情を記録して、ここで気づきを得ましょう。';
  }
  
  const positiveRatio = stats.sunny / stats.total;
  const negativeRatio = (stats.rainy + stats.stormy) / stats.total;
  
  if (positiveRatio >= 0.6) {
    const insights = {
      en: [
        "✨ You've been experiencing a lot of sunny days! Keep nurturing this positive energy.",
        "🌟 Your emotional weather has been bright lately. What's been bringing you joy?",
        "🎋 Like bamboo swaying in gentle breeze, you're finding balance and peace."
      ],
      ja: [
        "✨ 晴れの日が多いですね！このポジティブなエネルギーを大切にしてください。",
        "🌟 最近、心の天気が明るいです。何があなたに喜びをもたらしていますか？",
        "🎋 そよ風に揺れる竹のように、バランスと平和を見つけています。"
      ]
    };
    return insights[lang][Math.floor(Math.random() * insights[lang].length)];
  } else if (negativeRatio >= 0.5) {
    const insights = {
      en: [
        "🌿 Storms bring rain, and rain brings growth. You're building resilience.",
        "🍵 Remember: even cloudy days have their beauty. Be gentle with yourself.",
        "🪷 Like kintsugi, difficult times can lead to golden transformations."
      ],
      ja: [
        "🌿 嵐は雨をもたらし、雨は成長をもたらす。あなたは回復力を築いています。",
        "🍵 曇りの日にも美しさがあることを忘れないで。自分に優しくしてください。",
        "🪷 金継ぎのように、困難な時期は黄金の変容につながることがあります。"
      ]
    };
    return insights[lang][Math.floor(Math.random() * insights[lang].length)];
  } else {
    const insights = {
      en: [
        "🌈 Your emotional landscape shows beautiful variety, like the changing seasons.",
        "🎐 Life flows through all weathers. You're embracing the full spectrum.",
        "🌸 Like nature, your emotions cycle through different phases naturally."
      ],
      ja: [
        "🌈 移り変わる季節のように、感情の風景に美しい多様性があります。",
        "🎐 人生はすべての天気を通って流れます。全ての感情を受け入れています。",
        "🌸 自然のように、感情は異なる段階を自然に循環しています。"
      ]
    };
    return insights[lang][Math.floor(Math.random() * insights[lang].length)];
  }
}

// Initialize emotion trend display
function initEmotionTrend(lang = 'en') {
  const distributionBar = document.getElementById('emotion-distribution');
  const insightEl = document.getElementById('emotion-insight');
  const shareBtn = document.getElementById('share-emotion-trend-btn');
  
  if (!distributionBar) return;
  
  // Get last 30 days of check-ins
  const checkins = getCheckinsForDays(30);
  const stats = calculateEmotionStats(checkins);
  
  // Update counts
  ['sunny', 'cloudy', 'rainy', 'stormy'].forEach(weather => {
    const el = document.getElementById(`emotion-${weather}-count`);
    if (el) el.textContent = stats[weather];
  });
  
  // Update distribution bar
  if (stats.total > 0) {
    const colors = {
      sunny: 'bg-amber-400',
      cloudy: 'bg-sky-400',
      rainy: 'bg-blue-500',
      stormy: 'bg-purple-500'
    };
    
    distributionBar.innerHTML = ['sunny', 'cloudy', 'rainy', 'stormy']
      .filter(w => stats[w] > 0)
      .map(w => {
        const percent = (stats[w] / stats.total) * 100;
        return `<div class="${colors[w]} transition-all duration-500" style="width: ${percent}%" title="${w}: ${stats[w]}"></div>`;
      })
      .join('');
  }
  
  // Update insight
  if (insightEl) {
    const insight = generateEmotionInsight(stats, lang);
    insightEl.innerHTML = `<p class="text-sm text-indigo-800 dark:text-[#e8e4dc] italic">${insight}</p>`;
  }
  
  // Share functionality
  if (shareBtn) {
    shareBtn.addEventListener('click', () => shareEmotionTrend(stats, lang));
  }
}

// Share emotion trend
function shareEmotionTrend(stats, lang = 'en') {
  const total = stats.total;
  if (total === 0) {
    alert(lang === 'en' ? 'Start tracking emotions to share your journey!' : '感情を記録してからシェアしましょう！');
    return;
  }
  
  const percentages = {
    sunny: Math.round((stats.sunny / total) * 100),
    cloudy: Math.round((stats.cloudy / total) * 100),
    rainy: Math.round((stats.rainy / total) * 100),
    stormy: Math.round((stats.stormy / total) * 100)
  };
  
  const text = lang === 'en'
    ? `My emotion journey this month 🪷\n\n☀️ Sunny: ${percentages.sunny}%\n⛅ Cloudy: ${percentages.cloudy}%\n🌧️ Rainy: ${percentages.rainy}%\n⛈️ Stormy: ${percentages.stormy}%\n\nTracking my mental wellness with #KintsugiMind ✨`
    : `今月の心の天気 🪷\n\n☀️ 晴れ: ${percentages.sunny}%\n⛅ 曇り: ${percentages.cloudy}%\n🌧️ 雨: ${percentages.rainy}%\n⛈️ 嵐: ${percentages.stormy}%\n\n#KintsugiMind で心の健康を記録中 ✨`;
  
  const url = window.location.origin + '/profile?lang=' + lang;
  
  if (navigator.share) {
    navigator.share({
      title: lang === 'en' ? 'My Emotion Journey' : '心の天気レポート',
      text: text,
      url: url
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text + '\n' + url).then(() => {
      alert(lang === 'en' ? 'Copied to clipboard!' : 'クリップボードにコピーしました！');
    });
  }
}

// Initialize check-in calendar with heatmap
function initCheckinCalendar(lang) {
  const calendarGrid = document.getElementById('calendar-grid');
  const monthLabel = document.getElementById('calendar-month');
  const prevBtn = document.getElementById('calendar-prev');
  const nextBtn = document.getElementById('calendar-next');
  
  if (!calendarGrid || !monthLabel) return;
  
  let currentDate = new Date();
  let currentYear = currentDate.getFullYear();
  let currentMonth = currentDate.getMonth() + 1;
  
  const monthNames = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 
         'July', 'August', 'September', 'October', 'November', 'December'],
    ja: ['1月', '2月', '3月', '4月', '5月', '6月', 
         '7月', '8月', '9月', '10月', '11月', '12月']
  };
  
  async function renderCalendar(year, month) {
    // Update month label
    monthLabel.textContent = lang === 'ja' 
      ? `${year}年 ${monthNames.ja[month - 1]}`
      : `${monthNames.en[month - 1]} ${year}`;
    
    // Get checkins for this month (try server first, fallback to local)
    let checkins = [];
    let checkinMap = {};
    
    try {
      // Try to get from server
      const response = await fetch(`/api/checkins?year=${year}&month=${month}`);
      const data = await response.json();
      
      if (data.source === 'server' && data.checkins.length > 0) {
        checkins = data.checkins;
        // Map server checkins by date
        checkins.forEach(c => {
          const date = c.created_at.split('T')[0];
          if (!checkinMap[date]) {
            checkinMap[date] = c;
          }
        });
      } else {
        // Use local storage
        const localCheckins = getCheckinsForMonth(year, month);
        localCheckins.forEach(c => {
          checkinMap[c.date] = c;
        });
      }
    } catch (e) {
      // Fallback to local storage
      const localCheckins = getCheckinsForMonth(year, month);
      localCheckins.forEach(c => {
        checkinMap[c.date] = c;
      });
    }
    
    // Calculate calendar grid
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    // Clear grid
    calendarGrid.innerHTML = '';
    
    const today = new Date().toISOString().split('T')[0];
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < startDayOfWeek; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'aspect-square';
      calendarGrid.appendChild(emptyCell);
    }
    
    // Heatmap colors for different weather types
    const heatmapColors = {
      sunny: 'bg-amber-300 dark:bg-amber-500/80',
      cloudy: 'bg-sky-300 dark:bg-sky-500/80',
      rainy: 'bg-blue-400 dark:bg-blue-500/80',
      stormy: 'bg-purple-400 dark:bg-purple-500/80'
    };
    
    // Add day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const checkin = checkinMap[dateStr];
      const isToday = dateStr === today;
      const isFuture = new Date(dateStr) > new Date();
      
      const cell = document.createElement('div');
      
      // Determine background color based on weather
      let bgColor = 'bg-ecru-100/50 dark:bg-[#252525]';
      if (checkin && checkin.weather && heatmapColors[checkin.weather]) {
        bgColor = heatmapColors[checkin.weather];
      } else if (checkin) {
        bgColor = 'bg-gold/30 dark:bg-gold/40'; // Default for unknown weather
      }
      
      cell.className = `
        aspect-square flex flex-col items-center justify-center rounded-lg text-xs
        ${isToday ? 'ring-2 ring-gold ring-offset-1 dark:ring-offset-[#1e1e1e]' : ''}
        ${isFuture ? 'opacity-40' : ''}
        ${bgColor}
        ${!checkin && !isFuture ? 'hover:bg-ecru-200/70 dark:hover:bg-[#353535]' : ''}
        transition-all duration-200 cursor-default
        ${checkin ? 'shadow-sm hover:shadow-md hover:scale-105' : ''}
      `;
      
      // Day number
      const daySpan = document.createElement('span');
      daySpan.className = `text-[10px] font-medium ${isToday ? 'text-gold' : checkin ? 'text-white dark:text-white drop-shadow-sm' : 'text-ink-500 dark:text-[#78716c]'}`;
      daySpan.textContent = day;
      cell.appendChild(daySpan);
      
      // Weather emoji if checked in
      if (checkin) {
        const weatherSpan = document.createElement('span');
        weatherSpan.className = 'text-base leading-none mt-0.5 drop-shadow-sm';
        weatherSpan.textContent = WEATHER_EMOJIS[checkin.weather] || '✓';
        cell.appendChild(weatherSpan);
        
        // Tooltip with note if available
        const weatherNames = { sunny: '晴れ', cloudy: '曇り', rainy: '雨', stormy: '嵐' };
        const weatherNameEn = { sunny: 'Sunny', cloudy: 'Cloudy', rainy: 'Rainy', stormy: 'Stormy' };
        const weatherLabel = lang === 'ja' ? weatherNames[checkin.weather] : weatherNameEn[checkin.weather];
        cell.title = checkin.note ? `${weatherLabel}: ${checkin.note}` : weatherLabel || '';
      }
      
      calendarGrid.appendChild(cell);
    }
  }
  
  // Navigation
  prevBtn?.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 1) {
      currentMonth = 12;
      currentYear--;
    }
    renderCalendar(currentYear, currentMonth);
  });
  
  nextBtn?.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
    renderCalendar(currentYear, currentMonth);
  });
  
  // Initial render
  renderCalendar(currentYear, currentMonth);
}

function initNotificationSettings(lang) {
  const enableBtn = document.getElementById('enable-reminders-btn');
  const disableBtn = document.getElementById('disable-reminders-btn');
  const testBtn = document.getElementById('test-notification-btn');
  const settingsContainer = document.getElementById('reminder-settings');
  const toggleContainer = document.getElementById('reminder-toggle-container');
  const statusEl = document.getElementById('notification-status');
  const deniedEl = document.getElementById('notification-denied');
  const morningTimeInput = document.getElementById('morning-time');
  const eveningTimeInput = document.getElementById('evening-time');
  
  if (!enableBtn || !window.kintsugiNotifications) return;
  
  const notifications = window.kintsugiNotifications;
  
  // Update UI based on current state
  function updateNotificationUI() {
    const status = notifications.getStatus();
    
    if (status.permission === 'denied') {
      deniedEl?.classList.remove('hidden');
      enableBtn.disabled = true;
      enableBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
    
    if (status.enabled) {
      settingsContainer?.classList.remove('hidden');
      toggleContainer?.classList.add('hidden');
      statusEl.textContent = lang === 'en' ? 'On' : 'オン';
      statusEl.classList.remove('bg-ink-100', 'text-ink-500');
      statusEl.classList.add('bg-green-100', 'text-green-700');
      
      // Set current times
      if (morningTimeInput && status.morningReminder) {
        morningTimeInput.value = status.morningReminder.time;
      }
      if (eveningTimeInput && status.eveningReminder) {
        eveningTimeInput.value = status.eveningReminder.time;
      }
    } else {
      settingsContainer?.classList.add('hidden');
      toggleContainer?.classList.remove('hidden');
      statusEl.textContent = lang === 'en' ? 'Off' : 'オフ';
      statusEl.classList.remove('bg-green-100', 'text-green-700');
      statusEl.classList.add('bg-ink-100', 'text-ink-500');
    }
  }
  
  // Initial UI update
  updateNotificationUI();
  
  // Enable button
  enableBtn.addEventListener('click', async () => {
    const enabled = await notifications.enable();
    if (enabled) {
      updateNotificationUI();
    } else {
      const permission = notifications.checkPermission();
      if (permission === 'denied') {
        deniedEl?.classList.remove('hidden');
      }
    }
  });
  
  // Disable button
  disableBtn?.addEventListener('click', () => {
    notifications.disable();
    updateNotificationUI();
  });
  
  // Test button
  testBtn?.addEventListener('click', async () => {
    const sent = await notifications.testNotification();
    if (!sent) {
      alert(lang === 'en' 
        ? 'Could not send test notification. Please check permissions.' 
        : 'テスト通知を送信できませんでした。権限を確認してください。');
    }
  });
  
  // Time inputs
  morningTimeInput?.addEventListener('change', (e) => {
    notifications.updateReminder('morning', { time: e.target.value });
  });
  
  eveningTimeInput?.addEventListener('change', (e) => {
    notifications.updateReminder('evening', { time: e.target.value });
  });
}

// Vessel SVG paths for different vessel types
const VESSEL_PATHS = {
  // 茶碗 (Tea Bowl) - Default, wide and shallow
  chawan: {
    path: 'M40 60 Q40 20 100 20 Q160 20 160 60 L150 200 Q150 220 100 220 Q50 220 50 200 Z',
    viewBox: '0 0 200 240',
    name: { en: 'Tea Bowl', ja: '茶碗' },
    emoji: '🍵'
  },
  // 壺 (Jar) - Tall and rounded
  tsubo: {
    path: 'M70 30 Q70 10 100 10 Q130 10 130 30 L135 50 Q160 70 160 120 Q160 180 130 200 L125 220 Q125 230 100 230 Q75 230 75 220 L70 200 Q40 180 40 120 Q40 70 65 50 Z',
    viewBox: '0 0 200 240',
    name: { en: 'Jar', ja: '壺' },
    emoji: '🏺'
  },
  // 皿 (Plate) - Wide and flat
  sara: {
    path: 'M20 120 Q20 80 100 80 Q180 80 180 120 L170 160 Q170 180 100 180 Q30 180 30 160 Z',
    viewBox: '0 0 200 240',
    name: { en: 'Plate', ja: '皿' },
    emoji: '🍽️'
  },
  // 徳利 (Sake Bottle) - Narrow neck, wide body
  tokkuri: {
    path: 'M85 20 Q85 10 100 10 Q115 10 115 20 L115 50 Q115 60 120 70 L140 90 Q160 110 160 150 Q160 200 130 220 Q130 230 100 230 Q70 230 70 220 Q40 200 40 150 Q40 110 60 90 L80 70 Q85 60 85 50 Z',
    viewBox: '0 0 200 240',
    name: { en: 'Sake Bottle', ja: '徳利' },
    emoji: '🍶'
  },
  // 鉢 (Bowl) - Deep and rounded
  hachi: {
    path: 'M30 80 Q30 50 100 50 Q170 50 170 80 L165 180 Q165 220 100 220 Q35 220 35 180 Z',
    viewBox: '0 0 200 240',
    name: { en: 'Bowl', ja: '鉢' },
    emoji: '🥣'
  }
};

function updateProfileUI(profile, lang) {
  // Stats
  document.getElementById('stat-visits').textContent = profile.stats.totalVisits;
  document.getElementById('stat-streak').textContent = profile.stats.currentStreak;
  document.getElementById('stat-longest').textContent = profile.stats.longestStreak;
  document.getElementById('stat-repairs').textContent = profile.totalRepairs;
  document.getElementById('stat-garden').textContent = profile.stats.gardenActions;
  document.getElementById('stat-study').textContent = profile.stats.studySessions;
  document.getElementById('stat-tatami').textContent = profile.stats.tatamiSessions;
  
  // Cracks
  const repairedCount = profile.cracks.filter(c => c.repaired).length;
  const unrepairedCount = profile.cracks.length - repairedCount;
  document.getElementById('stat-repaired').textContent = repairedCount;
  document.getElementById('stat-unrepaired').textContent = unrepairedCount;
  
  // Update vessel shape based on selected type
  const vesselType = profile.vesselType || getSelectedVessel() || 'chawan';
  const vesselData = VESSEL_PATHS[vesselType] || VESSEL_PATHS.chawan;
  
  // Get current stage based on goldIntensity
  const currentStage = getVesselStage(profile);
  const stageImagePath = getVesselStageImage(vesselType, currentStage);
  const stageName = getVesselStageName(vesselType, currentStage, lang);
  
  // Update vessel photo or fallback to SVG
  const vesselPhoto = document.getElementById('vessel-photo');
  const vesselLegacy = document.getElementById('kintsugi-vessel-legacy');
  const vesselSvg = document.getElementById('kintsugi-vessel');
  
  if (stageImagePath && vesselPhoto) {
    // Use stage-based photo vessel
    vesselPhoto.src = stageImagePath;
    vesselPhoto.classList.remove('hidden');
    // Hide SVG overlay since we're using photos now
    if (vesselSvg) vesselSvg.classList.add('hidden');
    if (vesselLegacy) vesselLegacy.classList.add('hidden');
  } else if (vesselPhoto) {
    // Fallback to legacy SVG vessel
    vesselPhoto.classList.add('hidden');
    if (vesselSvg) vesselSvg.classList.add('hidden');
    if (vesselLegacy) {
      vesselLegacy.classList.remove('hidden');
      const vesselShape = vesselLegacy.querySelector('#vessel-shape');
      if (vesselShape) {
        vesselShape.setAttribute('d', vesselData.path);
      }
    }
  }
  
  // Update SVG path for legacy vessel (if visible)
  const vesselShape = document.getElementById('vessel-shape');
  if (vesselShape && !stageImagePath) {
    vesselShape.setAttribute('d', vesselData.path);
  }
  
  // Update vessel type display with stage info
  const vesselTypeDisplay = document.getElementById('vessel-type-display');
  if (vesselTypeDisplay) {
    vesselTypeDisplay.innerHTML = `${vesselData.emoji} ${vesselData.name[lang]} — ${stageName}`;
  }
  
  // Vessel visual
  const visual = calculateVesselVisual(profile);
  
  document.getElementById('depth-value').textContent = `${Math.round(visual.depth)}%`;
  document.getElementById('depth-bar').style.width = `${visual.depth}%`;
  document.getElementById('gold-value').textContent = `${Math.round(visual.goldIntensity)}%`;
  document.getElementById('gold-bar').style.width = `${visual.goldIntensity}%`;
  
  // Skip SVG crack rendering for photo-based vessels (cracks are in the photos)
  const cracksGroup = document.getElementById('cracks-group');
  if (cracksGroup && !stageImagePath) {
    // Only render SVG cracks for legacy vessels
    cracksGroup.innerHTML = '';
    const crackPaths = generateCrackPaths(profile.cracks, vesselType);
    
    crackPaths.forEach(crack => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', crack.path);
      path.setAttribute('fill', 'none');
      // 金継ぎ風のスタイリング
      if (crack.repaired) {
        // 金継ぎ（修復済み）: 金色で太めの線、輝きエフェクト
        path.setAttribute('stroke', '#d4af37');
        path.setAttribute('stroke-width', '2.5');
        path.setAttribute('filter', 'url(#goldGlow)');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.classList.add('gold-glow');
      } else {
        // 未修復のヒビ: 暗い色で細めの線
        path.setAttribute('stroke', '#3d3d3d');
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('opacity', '0.7');
      }
      cracksGroup.appendChild(path);
    });
  }
  
  // Update message based on stage
  const messageEl = document.getElementById('vessel-message');
  if (messageEl) {
    const stageMessages = {
      0: {
        en: 'Your vessel is pristine and whole. You were born complete.',
        ja: 'あなたの器は無傷で完全です。あなたは完璧な存在として生まれました。'
      },
      1: {
        en: 'Your vessel has shattered. But every piece holds value.',
        ja: '器は砕けてしまいました。でも、すべての破片に価値があります。'
      },
      2: {
        en: 'The fragments are gathering. Healing has begun.',
        ja: '破片が集まり始めています。癒しが始まりました。'
      },
      3: {
        en: 'Pieces are joining together. The golden repair progresses.',
        ja: '破片が繋がり始めています。金継ぎが進んでいます。'
      },
      4: {
        en: 'Your vessel is taking shape. The gold binds your story.',
        ja: '器の形が見えてきました。金があなたの物語を紡いでいます。'
      },
      5: {
        en: 'Almost complete. A few more repairs to go.',
        ja: 'もう少しで完成です。あと少しの修復を。'
      },
      6: {
        en: 'Your vessel is complete. More beautiful for having been broken.',
        ja: '器は完成しました。壊れたからこそ、より美しく。'
      }
    };
    
    const message = stageMessages[currentStage] || stageMessages[0];
    messageEl.textContent = message[lang] || message.en;
  }
}

// ========================================
// GARDEN Mode (Morita Therapy)
// ========================================

let clouds = [];
let plants = [];
let gardenActionCount = 0;
let completedActionIds = new Set(); // Track completed actions to prevent duplicate plants

// All possible micro-actions with categories
// 豊富なバリエーションでユーザーが飽きないように
const microActions = {
  // 身体を動かす (Body Movement)
  body: {
    en: [
      { id: 'stand', text: 'Stand up for just 1 minute', time: '1min' },
      { id: 'stretch', text: 'Do 3 simple stretches', time: '1min' },
      { id: 'walk', text: 'Walk to another room and back', time: '30s' },
      { id: 'shoulders', text: 'Roll your shoulders 5 times', time: '15s' },
      { id: 'stairs', text: 'Go up and down stairs once', time: '1min' },
      { id: 'tiptoe', text: 'Stand on tiptoes for 10 seconds', time: '15s' },
      { id: 'neck', text: 'Gently rotate your neck', time: '30s' },
      { id: 'hands', text: 'Open and close your hands 10 times', time: '15s' },
      { id: 'twist', text: 'Twist your upper body gently', time: '20s' },
      { id: 'shake', text: 'Shake out your arms and legs', time: '15s' },
      { id: 'squat', text: 'Do 3 slow squats', time: '30s' },
      { id: 'balance', text: 'Stand on one foot for 10 seconds', time: '20s' },
      { id: 'wrists', text: 'Rotate your wrists 5 times each', time: '15s' },
      { id: 'ankles', text: 'Circle your ankles 5 times each', time: '15s' },
      { id: 'sidebend', text: 'Bend gently to each side', time: '20s' },
      { id: 'armraise', text: 'Raise your arms overhead slowly', time: '15s' },
      { id: 'march', text: 'March in place for 30 seconds', time: '30s' },
      { id: 'fingerstretch', text: 'Spread your fingers wide, then relax', time: '10s' },
    ],
    ja: [
      { id: 'stand', text: '1分だけ立ち上がる', time: '1min' },
      { id: 'stretch', text: '3回だけストレッチする', time: '1min' },
      { id: 'walk', text: '別の部屋まで歩いて戻る', time: '30s' },
      { id: 'shoulders', text: '肩を5回まわす', time: '15s' },
      { id: 'stairs', text: '階段を一往復する', time: '1min' },
      { id: 'tiptoe', text: 'つま先立ちを10秒キープ', time: '15s' },
      { id: 'neck', text: '首をゆっくり回す', time: '30s' },
      { id: 'hands', text: '手を10回グーパーする', time: '15s' },
      { id: 'twist', text: '上半身をゆっくりひねる', time: '20s' },
      { id: 'shake', text: '腕と足を振ってほぐす', time: '15s' },
      { id: 'squat', text: 'ゆっくりスクワットを3回', time: '30s' },
      { id: 'balance', text: '片足で10秒立つ', time: '20s' },
      { id: 'wrists', text: '手首を左右5回ずつ回す', time: '15s' },
      { id: 'ankles', text: '足首を左右5回ずつ回す', time: '15s' },
      { id: 'sidebend', text: '体を左右にゆっくり倒す', time: '20s' },
      { id: 'armraise', text: '両腕をゆっくり上げる', time: '15s' },
      { id: 'march', text: 'その場で30秒足踏みする', time: '30s' },
      { id: 'fingerstretch', text: '指を大きく広げて、緩める', time: '10s' },
    ]
  },
  // 水・飲み物 (Hydration)
  water: {
    en: [
      { id: 'water', text: 'Drink a glass of water', time: '15s' },
      { id: 'tea', text: 'Make yourself a cup of tea', time: '3min' },
      { id: 'warmwater', text: 'Drink a glass of warm water', time: '15s' },
      { id: 'lemon', text: 'Add lemon to your water', time: '30s' },
      { id: 'herbal', text: 'Brew a cup of herbal tea', time: '3min' },
      { id: 'slowsip', text: 'Sip water slowly, counting 5 sips', time: '30s' },
      { id: 'coldwater', text: 'Splash cold water on your face', time: '15s' },
      { id: 'handwash', text: 'Wash your hands with warm water', time: '30s' },
      { id: 'gargle', text: 'Gargle with water', time: '15s' },
      { id: 'icecube', text: 'Hold an ice cube in your hand briefly', time: '15s' },
    ],
    ja: [
      { id: 'water', text: '水を一杯飲む', time: '15s' },
      { id: 'tea', text: 'お茶を一杯いれる', time: '3min' },
      { id: 'warmwater', text: '白湯を一杯飲む', time: '15s' },
      { id: 'lemon', text: 'レモン水を作って飲む', time: '30s' },
      { id: 'herbal', text: 'ハーブティーを淹れる', time: '3min' },
      { id: 'slowsip', text: '水を5口、ゆっくり飲む', time: '30s' },
      { id: 'coldwater', text: '顔に冷たい水をかける', time: '15s' },
      { id: 'handwash', text: '温かいお湯で手を洗う', time: '30s' },
      { id: 'gargle', text: '水でうがいをする', time: '15s' },
      { id: 'icecube', text: '氷を手に握ってみる', time: '15s' },
    ]
  },
  // 整理・片付け (Tidying)
  tidy: {
    en: [
      { id: 'cup', text: 'Wash a single cup', time: '30s' },
      { id: 'desk', text: 'Clear one item from your desk', time: '15s' },
      { id: 'trash', text: 'Throw away one piece of trash', time: '10s' },
      { id: 'fold', text: 'Fold one piece of clothing', time: '30s' },
      { id: 'wipe', text: 'Wipe one surface clean', time: '30s' },
      { id: 'arrange', text: 'Straighten something nearby', time: '15s' },
      { id: 'dish', text: 'Put one dish in the dishwasher', time: '15s' },
      { id: 'book', text: 'Return one book to its shelf', time: '15s' },
      { id: 'pen', text: 'Put one pen back in its place', time: '10s' },
      { id: 'pillow', text: 'Fluff a pillow or cushion', time: '15s' },
      { id: 'shoes', text: 'Align one pair of shoes', time: '10s' },
      { id: 'drawer', text: 'Organize one small drawer section', time: '1min' },
      { id: 'dust', text: 'Dust one small area', time: '30s' },
      { id: 'cord', text: 'Untangle or organize one cord', time: '30s' },
      { id: 'bag', text: 'Remove one item from your bag', time: '15s' },
      { id: 'plant', text: 'Remove one dead leaf from a plant', time: '15s' },
    ],
    ja: [
      { id: 'cup', text: 'コップを一つ洗う', time: '30s' },
      { id: 'desk', text: '机の上を一つだけ片付ける', time: '15s' },
      { id: 'trash', text: 'ゴミを一つ捨てる', time: '10s' },
      { id: 'fold', text: '服を一枚だけたたむ', time: '30s' },
      { id: 'wipe', text: 'どこか一カ所を拭く', time: '30s' },
      { id: 'arrange', text: '近くのものを整える', time: '15s' },
      { id: 'dish', text: 'お皿を一枚だけ洗う', time: '15s' },
      { id: 'book', text: '本を一冊だけ棚に戻す', time: '15s' },
      { id: 'pen', text: 'ペンを一本だけ元に戻す', time: '10s' },
      { id: 'pillow', text: 'クッションを整える', time: '15s' },
      { id: 'shoes', text: '靴を一足だけ揃える', time: '10s' },
      { id: 'drawer', text: '引き出しの一角を整理する', time: '1min' },
      { id: 'dust', text: '一カ所だけほこりを払う', time: '30s' },
      { id: 'cord', text: 'ケーブルを一本だけ整理する', time: '30s' },
      { id: 'bag', text: 'カバンから一つ物を出す', time: '15s' },
      { id: 'plant', text: '植物の枯れ葉を一枚取る', time: '15s' },
    ]
  },
  // 感覚を使う (Senses)
  senses: {
    en: [
      { id: 'window', text: 'Open a window and look outside', time: '30s' },
      { id: 'breathe', text: 'Take 3 deep breaths', time: '30s' },
      { id: 'listen', text: 'Close your eyes and listen for 30 seconds', time: '30s' },
      { id: 'touch', text: 'Touch 3 different textures around you', time: '30s' },
      { id: 'smell', text: 'Smell something pleasant (tea, soap, etc.)', time: '15s' },
      { id: 'sky', text: 'Look at the sky for 1 minute', time: '1min' },
      { id: 'plant', text: 'Look at a plant or photo of nature', time: '30s' },
      { id: 'feet', text: 'Feel the ground beneath your feet', time: '30s' },
      { id: 'colors', text: 'Find 3 things of the same color', time: '30s' },
      { id: 'farclose', text: 'Look at something far, then near', time: '20s' },
      { id: 'temperature', text: 'Notice the temperature of the air', time: '15s' },
      { id: 'heartbeat', text: 'Feel your heartbeat for 30 seconds', time: '30s' },
      { id: 'palms', text: 'Press your palms together and feel the warmth', time: '20s' },
      { id: 'sounds', text: 'Count how many sounds you can hear', time: '30s' },
      { id: 'light', text: 'Notice how light falls in the room', time: '30s' },
      { id: 'fabric', text: 'Feel the fabric of what you\'re wearing', time: '15s' },
    ],
    ja: [
      { id: 'window', text: '窓を開けて外を見る', time: '30s' },
      { id: 'breathe', text: '深呼吸を3回する', time: '30s' },
      { id: 'listen', text: '目を閉じて30秒間耳を澄ます', time: '30s' },
      { id: 'touch', text: '周りの3つの質感に触れる', time: '30s' },
      { id: 'smell', text: '良い香りを嗅ぐ（お茶、石鹸など）', time: '15s' },
      { id: 'sky', text: '1分間空を眺める', time: '1min' },
      { id: 'plant', text: '植物や自然の写真を見る', time: '30s' },
      { id: 'feet', text: '足の裏で床を感じる', time: '30s' },
      { id: 'colors', text: '同じ色のものを3つ探す', time: '30s' },
      { id: 'farclose', text: '遠く、近くを交互に見る', time: '20s' },
      { id: 'temperature', text: '空気の温度を感じる', time: '15s' },
      { id: 'heartbeat', text: '30秒間心臓の鼓動を感じる', time: '30s' },
      { id: 'palms', text: '両手を合わせて温かさを感じる', time: '20s' },
      { id: 'sounds', text: '聞こえる音を数えてみる', time: '30s' },
      { id: 'light', text: '部屋の光の当たり方を観察する', time: '30s' },
      { id: 'fabric', text: '着ている服の生地を感じる', time: '15s' },
    ]
  },
  // つながり (Connection)
  connect: {
    en: [
      { id: 'smile', text: 'Smile at yourself in a mirror', time: '10s' },
      { id: 'thanks', text: 'Think of one thing you\'re grateful for', time: '30s' },
      { id: 'message', text: 'Send a short message to someone', time: '1min' },
      { id: 'photo', text: 'Look at a favorite photo', time: '30s' },
      { id: 'pet', text: 'Pet an animal (or stuffed toy)', time: '1min' },
      { id: 'hug', text: 'Give yourself a hug', time: '15s' },
      { id: 'memory', text: 'Recall a happy memory for 30 seconds', time: '30s' },
      { id: 'compliment', text: 'Think of one thing you like about yourself', time: '30s' },
      { id: 'wish', text: 'Silently wish someone well', time: '15s' },
      { id: 'voice', text: 'Say something kind to yourself out loud', time: '15s' },
      { id: 'hands', text: 'Hold your own hand gently', time: '15s' },
      { id: 'face', text: 'Gently touch your face with kindness', time: '15s' },
    ],
    ja: [
      { id: 'smile', text: '鏡の自分に微笑む', time: '10s' },
      { id: 'thanks', text: '感謝できることを一つ思い浮かべる', time: '30s' },
      { id: 'message', text: '誰かに短いメッセージを送る', time: '1min' },
      { id: 'photo', text: 'お気に入りの写真を見る', time: '30s' },
      { id: 'pet', text: 'ペット（またはぬいぐるみ）を撫でる', time: '1min' },
      { id: 'hug', text: '自分を抱きしめる', time: '15s' },
      { id: 'memory', text: '幸せな思い出を30秒思い出す', time: '30s' },
      { id: 'compliment', text: '自分の好きなところを一つ考える', time: '30s' },
      { id: 'wish', text: '誰かの幸せを心の中で願う', time: '15s' },
      { id: 'voice', text: '自分に優しい言葉を声に出す', time: '15s' },
      { id: 'hands', text: '自分の手を優しく握る', time: '15s' },
      { id: 'face', text: '優しく自分の顔に触れる', time: '15s' },
    ]
  },
  // 創造性 (Creativity) - NEW
  creative: {
    en: [
      { id: 'doodle', text: 'Draw a tiny doodle', time: '30s' },
      { id: 'hum', text: 'Hum a tune for 20 seconds', time: '20s' },
      { id: 'cloud', text: 'Find a shape in the clouds or ceiling', time: '30s' },
      { id: 'word', text: 'Think of a word that describes how you feel', time: '15s' },
      { id: 'color', text: 'Pick a color that matches your mood', time: '10s' },
      { id: 'story', text: 'Make up a one-sentence story', time: '30s' },
      { id: 'rhyme', text: 'Think of two words that rhyme', time: '15s' },
      { id: 'imagine', text: 'Imagine your happy place for 30 seconds', time: '30s' },
      { id: 'rename', text: 'Give a nearby object a funny name', time: '15s' },
      { id: 'pattern', text: 'Find an interesting pattern nearby', time: '20s' },
    ],
    ja: [
      { id: 'doodle', text: '小さな落書きを描く', time: '30s' },
      { id: 'hum', text: '20秒間鼻歌を歌う', time: '20s' },
      { id: 'cloud', text: '雲や天井に形を見つける', time: '30s' },
      { id: 'word', text: '今の気持ちを一言で表す', time: '15s' },
      { id: 'color', text: '今の気分に合う色を選ぶ', time: '10s' },
      { id: 'story', text: '一文だけの物語を作る', time: '30s' },
      { id: 'rhyme', text: '韻を踏む言葉を2つ考える', time: '15s' },
      { id: 'imagine', text: '幸せな場所を30秒想像する', time: '30s' },
      { id: 'rename', text: '近くの物に面白い名前をつける', time: '15s' },
      { id: 'pattern', text: '近くの面白い模様を見つける', time: '20s' },
    ]
  },
  // マインドフルネス (Mindfulness) - NEW
  mindful: {
    en: [
      { id: 'present', text: 'Notice 5 things you can see right now', time: '30s' },
      { id: 'body', text: 'Scan your body from head to toe', time: '1min' },
      { id: 'anchor', text: 'Focus on one point for 20 seconds', time: '20s' },
      { id: 'pause', text: 'Simply pause and do nothing for 30 seconds', time: '30s' },
      { id: 'accept', text: 'Accept this moment as it is', time: '20s' },
      { id: 'nowfeel', text: 'Name one thing you feel right now', time: '15s' },
      { id: 'release', text: 'Breathe out and let go of tension', time: '20s' },
      { id: 'gentle', text: 'Soften your jaw and shoulders', time: '15s' },
      { id: 'slow', text: 'Do one thing very slowly', time: '30s' },
      { id: 'observe', text: 'Observe your thoughts without judging', time: '30s' },
    ],
    ja: [
      { id: 'present', text: '今見えるものを5つ数える', time: '30s' },
      { id: 'body', text: '頭からつま先まで体を感じる', time: '1min' },
      { id: 'anchor', text: '一点を20秒間見つめる', time: '20s' },
      { id: 'pause', text: '30秒間何もせず立ち止まる', time: '30s' },
      { id: 'accept', text: 'この瞬間をあるがままに受け入れる', time: '20s' },
      { id: 'nowfeel', text: '今感じていることを一つ言葉にする', time: '15s' },
      { id: 'release', text: '息を吐いて緊張を手放す', time: '20s' },
      { id: 'gentle', text: '顎と肩の力を抜く', time: '15s' },
      { id: 'slow', text: '何か一つをとてもゆっくりする', time: '30s' },
      { id: 'observe', text: '考えを批判せず観察する', time: '30s' },
    ]
  },
  // 季節・自然 (Nature/Seasonal) - NEW
  nature: {
    en: [
      { id: 'fresh', text: 'Step outside for 30 seconds', time: '30s' },
      { id: 'tree', text: 'Look at a tree or plant', time: '30s' },
      { id: 'breeze', text: 'Feel the air on your skin', time: '20s' },
      { id: 'sun', text: 'Feel warmth (sunlight or heating)', time: '30s' },
      { id: 'rain', text: 'Listen to or imagine rain', time: '30s' },
      { id: 'bird', text: 'Listen for birds or nature sounds', time: '30s' },
      { id: 'stone', text: 'Hold a small object from nature', time: '20s' },
      { id: 'green', text: 'Look at something green', time: '15s' },
      { id: 'moon', text: 'Think about what phase the moon is in', time: '15s' },
      { id: 'weather', text: 'Notice today\'s weather', time: '15s' },
    ],
    ja: [
      { id: 'fresh', text: '30秒だけ外に出る', time: '30s' },
      { id: 'tree', text: '木や植物を見る', time: '30s' },
      { id: 'breeze', text: '肌で風を感じる', time: '20s' },
      { id: 'sun', text: '温かさを感じる（日光や暖房）', time: '30s' },
      { id: 'rain', text: '雨の音を聴くか想像する', time: '30s' },
      { id: 'bird', text: '鳥の声や自然の音を聴く', time: '30s' },
      { id: 'stone', text: '自然のものを手に持つ', time: '20s' },
      { id: 'green', text: '緑色のものを見る', time: '15s' },
      { id: 'moon', text: '今の月の形を思い浮かべる', time: '15s' },
      { id: 'weather', text: '今日の天気を感じる', time: '15s' },
    ]
  }
};

// Select random actions from different categories
// Ensures maximum variety by picking from different categories
function getRandomActions(lang, count = 5) {
  const categories = Object.keys(microActions);
  const selectedActions = [];
  const usedIds = new Set();
  
  // Shuffle categories for randomness
  const shuffledCategories = [...categories].sort(() => Math.random() - 0.5);
  
  // First pass: pick one from each category until we have enough
  for (const category of shuffledCategories) {
    if (selectedActions.length >= count) break;
    
    const categoryActions = microActions[category][lang];
    // Shuffle actions within category
    const shuffledActions = [...categoryActions].sort(() => Math.random() - 0.5);
    
    for (const action of shuffledActions) {
      if (!usedIds.has(action.id)) {
        selectedActions.push({ ...action, category });
        usedIds.add(action.id);
        break;
      }
    }
  }
  
  // Second pass: if we need more, pick randomly from any category
  let attempts = 0;
  while (selectedActions.length < count && attempts < 50) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryActions = microActions[randomCategory][lang];
    const randomAction = categoryActions[Math.floor(Math.random() * categoryActions.length)];
    
    if (!usedIds.has(randomAction.id)) {
      selectedActions.push({ ...randomAction, category: randomCategory });
      usedIds.add(randomAction.id);
    }
    attempts++;
  }
  
  // Shuffle final result so order is random
  return selectedActions.sort(() => Math.random() - 0.5);
}

// Render action list
function renderActionList(actions, container, gardenPlants, lang) {
  container.innerHTML = '';
  
  actions.forEach((action, index) => {
    // Create unique ID for this action instance
    const actionUniqueId = `${action.id}-${index}-${Date.now()}`;
    
    const label = document.createElement('label');
    label.className = 'flex items-center gap-3 p-3 bg-white/60 dark:bg-[#2d2d2d]/60 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-[#3d3d3d]/80 transition-colors';
    label.innerHTML = `
      <input type="checkbox" class="w-5 h-5 accent-gold" data-action="${action.id}" data-unique-id="${actionUniqueId}" />
      <span class="text-ink-700 dark:text-[#e8e4dc]">${action.text}</span>
      <span class="text-ink-400 dark:text-[#78716c] text-xs ml-auto">${action.time}</span>
    `;
    
    const checkbox = label.querySelector('input');
    checkbox.addEventListener('change', () => {
      const uniqueId = checkbox.dataset.uniqueId;
      
      if (checkbox.checked) {
        // Only add plant if this specific action hasn't been completed
        if (!completedActionIds.has(uniqueId)) {
          completedActionIds.add(uniqueId);
          growPlant(gardenPlants);
          vibrate([50]);
          gardenActionCount++;
          
          // Record activity
          let profile = loadProfile();
          profile = recordActivityToProfile(profile, 'garden', { actionCount: 1 });
          saveProfile(profile);
          
          recordAction(action.id, true, lang);
        }
      } else {
        // When unchecked, remove from completed set (but don't remove plant - it stays as history)
        completedActionIds.delete(uniqueId);
      }
    });
    
    container.appendChild(label);
  });
}

function initGarden() {
  const emotionInput = document.getElementById('emotion-input');
  const addCloudBtn = document.getElementById('add-cloud-btn');
  const cloudContainer = document.getElementById('cloud-container');
  const actionList = document.getElementById('action-list');
  const gardenPlants = document.getElementById('garden-plants');
  const refreshBtn = document.getElementById('refresh-actions-btn');
  const lang = getLang();
  
  // Load profile and record visit
  let profile = loadProfile();
  profile = recordVisit(profile);
  saveProfile(profile);
  
  if (!emotionInput || !addCloudBtn) return;
  
  // Generate random actions (5 actions for more variety)
  let currentActions = getRandomActions(lang, 5);
  renderActionList(currentActions, actionList, gardenPlants, lang);
  
  // Refresh button functionality
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      // Animate the button
      refreshBtn.classList.add('animate-spin-once');
      setTimeout(() => refreshBtn.classList.remove('animate-spin-once'), 300);
      
      // Clear completed actions for old set (new actions = new tracking)
      completedActionIds.clear();
      
      // Get new random actions (different from current)
      currentActions = getRandomActions(lang, 5);
      
      // Fade out, update, fade in
      actionList.style.opacity = '0';
      actionList.style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        renderActionList(currentActions, actionList, gardenPlants, lang);
        actionList.style.opacity = '1';
        actionList.style.transform = 'translateY(0)';
      }, 200);
    });
    
    // Add transition styles
    actionList.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  }
  
  addCloudBtn.addEventListener('click', () => {
    const emotion = emotionInput.value.trim();
    if (emotion) {
      addCloud(emotion, cloudContainer);
      emotionInput.value = '';
      fetchMoritaGuidance(emotion, lang);
      
      // Record anxiety as a crack
      let profile = loadProfile();
      profile = recordAnxiety(profile, emotion);
      saveProfile(profile);
    }
  });
  
  emotionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addCloudBtn.click();
    }
  });
}

// Track used positions to prevent overlap
let usedCloudPositions = [];

function addCloud(text, container) {
  const placeholder = container.querySelector('.opacity-50');
  if (placeholder) {
    placeholder.remove();
  }
  
  const cloud = document.createElement('div');
  cloud.className = 'cloud absolute px-4 py-2 text-sm text-ink-600 dark:text-[#e8e4dc] max-w-xs animate-fade-in';
  cloud.textContent = text;
  
  // Calculate position that doesn't overlap with existing clouds
  const position = findNonOverlappingPosition();
  cloud.style.left = `${position.x}%`;
  cloud.style.top = `${position.y}%`;
  cloud.style.animationDelay = `${randomBetween(0, 1)}s`;
  
  container.appendChild(cloud);
  clouds.push({ text, element: cloud, position });
  usedCloudPositions.push(position);
}

// Find a position that doesn't overlap with existing clouds
function findNonOverlappingPosition() {
  // Predefined grid positions for better distribution
  const gridPositions = [
    { x: 15, y: 15 },
    { x: 55, y: 10 },
    { x: 35, y: 35 },
    { x: 10, y: 55 },
    { x: 60, y: 45 },
    { x: 40, y: 60 },
    { x: 70, y: 25 },
    { x: 25, y: 75 },
    { x: 65, y: 70 },
  ];
  
  // Use next available grid position
  const cloudIndex = usedCloudPositions.length;
  if (cloudIndex < gridPositions.length) {
    return gridPositions[cloudIndex];
  }
  
  // If all grid positions used, find random non-overlapping position
  const minDistance = 25; // Minimum distance between clouds (%)
  let attempts = 0;
  let bestPosition = { x: randomBetween(10, 65), y: randomBetween(10, 65) };
  
  while (attempts < 20) {
    const newPos = { x: randomBetween(10, 65), y: randomBetween(10, 65) };
    let isValid = true;
    
    for (const usedPos of usedCloudPositions) {
      const distance = Math.sqrt(
        Math.pow(newPos.x - usedPos.x, 2) + Math.pow(newPos.y - usedPos.y, 2)
      );
      if (distance < minDistance) {
        isValid = false;
        break;
      }
    }
    
    if (isValid) {
      return newPos;
    }
    attempts++;
  }
  
  return bestPosition;
}

function growPlant(container) {
  const placeholder = container.querySelector('.text-center');
  if (placeholder) {
    placeholder.remove();
  }
  
  // Limit max plants: 10 for mobile, 15 for desktop
  const isMobile = window.innerWidth < 768;
  const maxPlants = isMobile ? 8 : 12;
  
  // If at max, remove oldest plant before adding new one
  if (plants.length >= maxPlants) {
    const oldestPlant = plants.shift();
    if (oldestPlant && oldestPlant.parentNode) {
      oldestPlant.style.opacity = '0';
      oldestPlant.style.transform = 'scale(0)';
      setTimeout(() => oldestPlant.remove(), 300);
    }
  }
  
  const plantTypes = ['🌱', '🌿', '🍀', '🌾', '🌻', '🪴', '☘️', '🌸'];
  const plant = document.createElement('div');
  plant.className = 'text-2xl sm:text-3xl animate-grow inline-block';
  plant.textContent = plantTypes[plants.length % plantTypes.length];
  plant.style.animationDelay = '0.1s';
  plant.style.transition = 'opacity 0.3s, transform 0.3s';
  
  container.appendChild(plant);
  plants.push(plant);
}

async function fetchMoritaGuidance(emotion, lang) {
  try {
    const response = await fetch('/api/morita/guidance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emotion, lang })
    });
    const data = await response.json();
    
    const guidanceEl = document.getElementById('morita-guidance');
    if (guidanceEl) {
      guidanceEl.innerHTML = `
        <p class="text-ink-600 text-sm">
          <span class="text-gold">●</span> ${data.guidance}
        </p>
      `;
    }
  } catch (err) {
    console.error('Failed to fetch guidance:', err);
  }
}

async function recordAction(action, completed, lang) {
  try {
    await fetch('/api/garden/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, completed, lang })
    });
  } catch (err) {
    console.error('Failed to record action:', err);
  }
}

// ========================================
// STUDY Mode (Naikan Therapy) with Connection Mandala
// ========================================

let naikanStep = 1;
let naikanResponses = [];
let naikanConnections = []; // Store person + response for mandala

function initStudy() {
  console.log('[KINTSUGI] initStudy called');
  const chatContainer = document.getElementById('naikan-chat');
  const inputEl = document.getElementById('naikan-input');
  const personEl = document.getElementById('naikan-person');
  const sendBtn = document.getElementById('naikan-send-btn');
  const lang = getLang();
  
  console.log('[KINTSUGI] Elements found:', {
    chatContainer: !!chatContainer,
    inputEl: !!inputEl,
    personEl: !!personEl,
    sendBtn: !!sendBtn
  });
  
  // Load profile and record visit
  let profile = loadProfile();
  profile = recordVisit(profile);
  saveProfile(profile);
  
  if (!chatContainer || !inputEl || !sendBtn) {
    console.log('[KINTSUGI] Missing required elements, returning');
    return;
  }
  
  console.log('[KINTSUGI] Adding click listener to sendBtn');
  sendBtn.addEventListener('click', () => {
    console.log('[KINTSUGI] Send button clicked!');
    const response = inputEl.value.trim();
    const person = personEl ? personEl.value.trim() : '';
    console.log('[KINTSUGI] Input values:', { response, person });
    
    if (!response) {
      console.log('[KINTSUGI] Response is empty, showing validation');
      // Shake the input and show message
      inputEl.classList.add('shake-animation');
      inputEl.style.borderColor = '#d97706';
      inputEl.placeholder = lang === 'en' ? '⚠️ Please enter something...' : '⚠️ 何か入力してください...';
      setTimeout(() => {
        inputEl.classList.remove('shake-animation');
        inputEl.style.borderColor = '';
      }, 500);
      inputEl.focus();
      return;
    }
    
    // Process the response
    console.log('[KINTSUGI] Processing response...');
    
    // Store connection data
    const connectionTypes = ['received', 'given', 'forgiven'];
    const currentPerson = person || (lang === 'en' ? 'Someone' : '誰か');
    naikanConnections.push({
      person: currentPerson,
      description: response,
      type: connectionTypes[naikanStep - 1]
    });
    
    // Show user message with person name
    const displayMessage = person ? `${person}: ${response}` : response;
    addUserMessage(displayMessage, chatContainer);
    naikanResponses.push(response);
    
    // Clear inputs
    inputEl.value = '';
    if (personEl) personEl.value = '';
    
    // Get AI reflection
    const currentStep = naikanStep;
    fetchNaikanReflection(currentStep, currentPerson, response, lang, chatContainer).then(() => {
      naikanStep++;
      if (naikanStep <= 3) {
        setTimeout(() => {
          addNaikanQuestion(naikanStep, chatContainer, lang);
          updateProgress(naikanStep, lang);
          updatePersonInputLabel(naikanStep, lang);
        }, 500);
      } else {
        setTimeout(() => {
          showNaikanConclusion(chatContainer, lang);
          
          // Record study session completion
          let profile = loadProfile();
          profile = recordActivityToProfile(profile, 'study', { 
            questionsAnswered: 3,
            connections: naikanConnections 
          });
          saveProfile(profile);
          
          // Show mandala after a brief moment
          setTimeout(() => {
            showConnectionMandala(naikanConnections, lang);
          }, 2000);
        }, 500);
      }
    });
  });
  
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendBtn.click();
    }
  });
  
  if (personEl) {
    personEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        inputEl.focus();
      }
    });
  }
}

// Update the person input label based on question
function updatePersonInputLabel(step, lang) {
  const labels = {
    1: { en: 'Who helped you? (name or role)', ja: '誰に助けられましたか？（名前や役割）' },
    2: { en: 'Who did you help? (name or role)', ja: '誰を助けましたか？（名前や役割）' },
    3: { en: 'Who showed you patience? (name or role)', ja: '誰が寛容でしたか？（名前や役割）' }
  };
  
  const placeholders = {
    1: { en: 'e.g., Mom, a coworker, the barista...', ja: '例：母、同僚、カフェの店員...' },
    2: { en: 'e.g., A friend, my child, a stranger...', ja: '例：友人、子供、見知らぬ人...' },
    3: { en: 'e.g., My partner, my boss, myself...', ja: '例：パートナー、上司、自分自身...' }
  };
  
  const labelEl = document.querySelector('label[for="naikan-person"], label.text-xs.text-ink-500');
  const personEl = document.getElementById('naikan-person');
  
  if (labelEl && labels[step]) {
    labelEl.textContent = labels[step][lang];
  }
  if (personEl && placeholders[step]) {
    personEl.placeholder = placeholders[step][lang];
  }
}

function addUserMessage(text, container) {
  const message = document.createElement('div');
  message.className = 'chat-bubble user bg-indigo-100 p-4 max-w-[80%] ml-auto animate-fade-in';
  message.innerHTML = `<p class="text-ink-700">${text}</p>`;
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
}

// Fetch AI reflection for Naikan
async function fetchNaikanReflection(step, person, response, lang, container) {
  const guideName = i18n.study.guideName[lang];
  
  // Show typing indicator
  const typingId = 'typing-' + Date.now();
  const typingIndicator = document.createElement('div');
  typingIndicator.id = typingId;
  typingIndicator.className = 'chat-bubble bg-ecru-200 p-4 max-w-[80%] animate-fade-in';
  typingIndicator.innerHTML = `
    <p class="text-ink-700 text-sm mb-1">
      <span class="text-gold">${guideName}</span>
    </p>
    <p class="text-ink-400 text-sm">
      ${lang === 'en' ? '...' : '...'}
    </p>
  `;
  container.appendChild(typingIndicator);
  container.scrollTop = container.scrollHeight;
  
  try {
    const res = await fetch('/api/naikan/reflect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step, person, response, lang })
    });
    const data = await res.json();
    
    // Remove typing indicator and show response
    const typing = document.getElementById(typingId);
    if (typing) {
      typing.innerHTML = `
        <p class="text-ink-700 text-sm mb-1">
          <span class="text-gold">${guideName}</span>
        </p>
        <p class="text-ink-600">${data.reflection}</p>
      `;
    }
  } catch (err) {
    console.error('Failed to fetch Naikan reflection:', err);
    // Remove typing indicator on error
    const typing = document.getElementById(typingId);
    if (typing) typing.remove();
  }
}

function addNaikanQuestion(step, container, lang) {
  const q = i18n.study.questions[step];
  const guideName = i18n.study.guideName[lang];
  
  const message = document.createElement('div');
  message.className = 'chat-bubble bg-ecru-200 p-4 max-w-[80%] animate-fade-in';
  message.innerHTML = `
    <p class="text-ink-700 text-sm mb-1">
      <span class="text-gold">${guideName}</span>
    </p>
    <p class="text-ink-600">${q.text[lang]}</p>
    <p class="text-xs text-ink-400 mt-2">${q.hint[lang]}</p>
  `;
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
}

function updateProgress(step, lang) {
  const dots = document.querySelectorAll('.flex.justify-center.gap-2 div');
  dots.forEach((dot, index) => {
    if (index < step) {
      dot.className = 'w-3 h-3 rounded-full bg-gold';
    } else {
      dot.className = 'w-3 h-3 rounded-full bg-ecru-300';
    }
  });
  
  const progressText = document.querySelector('.text-ink-400.text-sm');
  if (progressText) {
    const questionLabel = lang === 'ja' ? '問い' : 'Question';
    progressText.textContent = `${questionLabel} ${Math.min(step, 3)} / 3`;
  }
}

function showNaikanConclusion(container, lang) {
  const c = i18n.study.conclusion;
  const guideName = i18n.study.guideName[lang];
  
  const message = document.createElement('div');
  message.className = 'chat-bubble bg-gold/20 p-4 max-w-[90%] animate-fade-in';
  message.innerHTML = `
    <p class="text-ink-700 text-sm mb-2">
      <span class="text-gold">${guideName}</span>
    </p>
    <p class="text-ink-600 mb-4">${c.title[lang]}</p>
    <p class="text-ink-600 mb-4">${c.message[lang]}</p>
    <p class="text-ink-500 text-sm italic">${c.quote[lang]}</p>
    <p class="text-ink-400 text-xs mt-4">
      ${lang === 'en' ? '✨ Preparing your Connection Mandala...' : '✨ 縁の曼荼羅を準備しています...'}
    </p>
  `;
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
  
  updateProgress(4, lang);
}

// ========================================
// Connection Mandala Visualization
// ========================================

function showConnectionMandala(connections, lang) {
  const chatSection = document.getElementById('study-chat-section');
  const mandalaSection = document.getElementById('mandala-section');
  const mandalaContainer = document.getElementById('mandala-container');
  
  if (!chatSection || !mandalaSection || !mandalaContainer) return;
  
  // Fade out chat, fade in mandala
  chatSection.classList.add('animate-fade-out');
  setTimeout(() => {
    chatSection.classList.add('hidden');
    mandalaSection.classList.remove('hidden');
    mandalaSection.classList.add('animate-fade-in');
    
    // Generate and render the mandala
    renderMandala(mandalaContainer, connections, lang);
  }, 500);
}

function renderMandala(container, connections, lang) {
  const size = 400;
  const center = size / 2;
  const innerRadius = 40;
  const outerRadius = 150;
  
  // Color scheme for connection types
  const colors = {
    received: { main: '#fbbf24', glow: 'rgba(251, 191, 36, 0.5)' },  // amber
    given: { main: '#4ade80', glow: 'rgba(74, 222, 128, 0.5)' },     // green
    forgiven: { main: '#c084fc', glow: 'rgba(192, 132, 252, 0.5)' }  // purple
  };
  
  // Create SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'w-full h-full');
  
  // Defs for gradients and filters
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  
  // Glow filter
  defs.innerHTML = `
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  `;
  svg.appendChild(defs);
  
  // Background circles (mandala rings)
  for (let i = 3; i >= 1; i--) {
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('cx', center);
    ring.setAttribute('cy', center);
    ring.setAttribute('r', innerRadius + (outerRadius - innerRadius) * (i / 3));
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', 'rgba(201, 162, 39, 0.15)');
    ring.setAttribute('stroke-width', '1');
    ring.classList.add('mandala-ring-anim');
    ring.style.animationDelay = `${i * 0.2}s`;
    svg.appendChild(ring);
  }
  
  // Center node (You)
  const centerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  centerGroup.classList.add('mandala-center');
  
  const centerGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  centerGlow.setAttribute('cx', center);
  centerGlow.setAttribute('cy', center);
  centerGlow.setAttribute('r', innerRadius);
  centerGlow.setAttribute('fill', 'rgba(201, 162, 39, 0.3)');
  centerGlow.setAttribute('filter', 'url(#softGlow)');
  centerGroup.appendChild(centerGlow);
  
  const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  centerCircle.setAttribute('cx', center);
  centerCircle.setAttribute('cy', center);
  centerCircle.setAttribute('r', innerRadius - 5);
  centerCircle.setAttribute('fill', '#c9a227');
  centerCircle.setAttribute('filter', 'url(#glow)');
  centerGroup.appendChild(centerCircle);
  
  const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  centerText.setAttribute('x', center);
  centerText.setAttribute('y', center + 5);
  centerText.setAttribute('text-anchor', 'middle');
  centerText.setAttribute('fill', '#1e3a5f');
  centerText.setAttribute('font-size', '14');
  centerText.setAttribute('font-weight', '600');
  centerText.textContent = lang === 'en' ? 'You' : 'あなた';
  centerGroup.appendChild(centerText);
  
  svg.appendChild(centerGroup);
  
  // Connection nodes
  const totalNodes = connections.length;
  connections.forEach((conn, index) => {
    const angle = (index / totalNodes) * 2 * Math.PI - Math.PI / 2;
    const nodeRadius = outerRadius - 20;
    const x = center + Math.cos(angle) * nodeRadius;
    const y = center + Math.sin(angle) * nodeRadius;
    
    const color = colors[conn.type] || colors.received;
    const delay = 0.5 + index * 0.3;
    
    // Connection line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', center);
    line.setAttribute('y1', center);
    line.setAttribute('x2', x);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', color.main);
    line.setAttribute('stroke-width', '2');
    line.setAttribute('opacity', '0.6');
    line.classList.add('mandala-line');
    line.style.animationDelay = `${delay}s`;
    svg.appendChild(line);
    
    // Node group
    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodeGroup.classList.add('mandala-node');
    nodeGroup.style.animationDelay = `${delay + 0.2}s`;
    
    // Node glow
    const nodeGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    nodeGlow.setAttribute('cx', x);
    nodeGlow.setAttribute('cy', y);
    nodeGlow.setAttribute('r', 35);
    nodeGlow.setAttribute('fill', color.glow);
    nodeGlow.setAttribute('filter', 'url(#softGlow)');
    nodeGroup.appendChild(nodeGlow);
    
    // Node circle
    const nodeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    nodeCircle.setAttribute('cx', x);
    nodeCircle.setAttribute('cy', y);
    nodeCircle.setAttribute('r', 28);
    nodeCircle.setAttribute('fill', color.main);
    nodeCircle.setAttribute('filter', 'url(#glow)');
    nodeGroup.appendChild(nodeCircle);
    
    // Person name
    const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameText.setAttribute('x', x);
    nameText.setAttribute('y', y + 4);
    nameText.setAttribute('text-anchor', 'middle');
    nameText.setAttribute('fill', '#1e3a5f');
    nameText.setAttribute('font-size', '11');
    nameText.setAttribute('font-weight', '500');
    // Truncate long names
    const displayName = conn.person.length > 8 ? conn.person.substring(0, 7) + '…' : conn.person;
    nameText.textContent = displayName;
    nodeGroup.appendChild(nameText);
    
    svg.appendChild(nodeGroup);
    
    // Tooltip with description (positioned below/beside node)
    const tooltipY = y > center ? y + 45 : y - 45;
    const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tooltip.setAttribute('x', x);
    tooltip.setAttribute('y', tooltipY);
    tooltip.setAttribute('text-anchor', 'middle');
    tooltip.setAttribute('fill', 'rgba(245, 240, 232, 0.7)');
    tooltip.setAttribute('font-size', '9');
    tooltip.classList.add('mandala-tooltip');
    tooltip.style.animationDelay = `${delay + 0.5}s`;
    // Truncate description
    const desc = conn.description.length > 25 ? conn.description.substring(0, 24) + '…' : conn.description;
    tooltip.textContent = desc;
    svg.appendChild(tooltip);
  });
  
  // Clear and append
  container.innerHTML = '';
  container.appendChild(svg);
}

// Add CSS for mandala animations
function addMandalaStyles() {
  if (document.getElementById('mandala-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'mandala-styles';
  style.textContent = `
    @keyframes mandalaFadeIn {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes mandalaLineGrow {
      from { stroke-dashoffset: 200; opacity: 0; }
      to { stroke-dashoffset: 0; opacity: 0.6; }
    }
    
    @keyframes mandalaNodePop {
      0% { opacity: 0; transform: scale(0); }
      70% { transform: scale(1.1); }
      100% { opacity: 1; transform: scale(1); }
    }
    
    @keyframes mandalaRingSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes tooltipFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .animate-fade-out {
      animation: fadeOut 0.5s ease-out forwards;
    }
    
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    
    .mandala-center {
      animation: mandalaFadeIn 0.8s ease-out forwards;
    }
    
    .mandala-line {
      stroke-dasharray: 200;
      stroke-dashoffset: 200;
      animation: mandalaLineGrow 0.6s ease-out forwards;
    }
    
    .mandala-node {
      opacity: 0;
      transform-origin: center;
      animation: mandalaNodePop 0.5s ease-out forwards;
    }
    
    .mandala-ring-anim {
      transform-origin: center;
      animation: mandalaRingSpin 60s linear infinite;
    }
    
    .mandala-tooltip {
      opacity: 0;
      animation: tooltipFadeIn 0.5s ease-out forwards;
    }
  `;
  document.head.appendChild(style);
}

// Initialize mandala styles on load
addMandalaStyles();

// ========================================
// TATAMI Mode (Zen / Breathing)
// ========================================

let zenSession = null;
let breathPhase = 'inhale';
let zenStartTime = null;

function initTatami() {
  const startBtn = document.getElementById('start-zen-btn');
  const breathingCircle = document.getElementById('breathing-circle');
  const breathInstruction = document.getElementById('breath-instruction');
  const breathInstructionSub = document.getElementById('breath-instruction-sub');
  const koanContainer = document.getElementById('koan-container');
  const lang = getLang();
  
  // Load profile and record visit
  let profile = loadProfile();
  profile = recordVisit(profile);
  saveProfile(profile);
  
  if (!startBtn || !breathingCircle) return;
  
  startBtn.addEventListener('click', () => {
    if (zenSession) {
      stopZenSession(lang);
      startBtn.textContent = startBtn.dataset.startText;
    } else {
      startZenSession(breathingCircle, breathInstruction, breathInstructionSub, koanContainer, lang);
      startBtn.textContent = startBtn.dataset.stopText;
    }
  });
}

function startZenSession(circle, instruction, instructionSub, koanContainer, lang) {
  zenStartTime = Date.now();
  breathPhase = 'inhale';
  updateBreathPhase(circle, instruction, instructionSub, lang);
  
  zenSession = setInterval(() => {
    breathPhase = breathPhase === 'inhale' ? 'exhale' : 'inhale';
    updateBreathPhase(circle, instruction, instructionSub, lang);
    vibrate(breathPhase === 'inhale' ? [100] : [50, 50, 50]);
  }, 4000);
  
  setTimeout(async () => {
    if (zenSession && koanContainer) {
      await showKoan(koanContainer, lang);
    }
  }, 24000);
}

function stopZenSession(lang) {
  if (zenSession) {
    clearInterval(zenSession);
    zenSession = null;
    
    // Calculate session duration
    const duration = zenStartTime ? Math.round((Date.now() - zenStartTime) / 60000) : 1;
    
    // Record tatami session
    let profile = loadProfile();
    profile = recordActivityToProfile(profile, 'tatami', { breathingMinutes: duration });
    saveProfile(profile);
    
    zenStartTime = null;
  }
}

function updateBreathPhase(circle, instruction, instructionSub, lang) {
  circle.classList.remove('inhale', 'exhale');
  void circle.offsetWidth;
  circle.classList.add(breathPhase);
  
  if (instruction) {
    const t = i18n.tatami;
    if (breathPhase === 'inhale') {
      instruction.textContent = t.breatheIn[lang];
      if (instructionSub) {
        instructionSub.textContent = lang === 'ja' ? 'Breathe in' : '';
      }
    } else {
      instruction.textContent = t.breatheOut[lang];
      if (instructionSub) {
        instructionSub.textContent = lang === 'ja' ? 'Breathe out' : '';
      }
    }
  }
}

async function showKoan(container, lang) {
  try {
    const response = await fetch(`/api/zen/koan?lang=${lang}`);
    const data = await response.json();
    
    const koanText = container.querySelector('#koan-text');
    if (koanText) {
      koanText.textContent = `"${data.text}"`;
    }
    
    container.classList.remove('hidden');
    container.classList.add('animate-fade-in');
  } catch (err) {
    console.error('Failed to fetch koan:', err);
  }
}

// ========================================
// Mobile Menu Toggle (initialized in initMobileMenu at DOMContentLoaded)
// ========================================
// Note: Main mobile menu functions are defined at end of file with initMobileMenu()

// ========================================
// Soundscape Control
// ========================================

function initSoundControl(mode) {
  const lang = getLang();
  
  if (mode === 'tatami') {
    initTatamiSoundControl(lang);
  } else if (mode === 'garden') {
    initGardenSoundControl(lang);
  }
}

function initTatamiSoundControl(lang) {
  const toggleBtn = document.getElementById('sound-toggle-btn');
  const iconOff = document.getElementById('sound-icon-off');
  const iconOn = document.getElementById('sound-icon-on');
  const presetsContainer = document.getElementById('sound-presets');
  const volumeControl = document.getElementById('volume-control');
  const volumeSlider = document.getElementById('volume-slider');
  const presetButtons = document.querySelectorAll('#sound-presets .sound-preset');
  
  if (!toggleBtn || !window.soundscape) return;
  
  let currentPreset = 'tatami';
  let isPlaying = false;
  
  // Toggle button
  toggleBtn.addEventListener('click', async () => {
    if (isPlaying) {
      window.soundscape.stop();
      isPlaying = false;
      iconOff.classList.remove('hidden');
      iconOn.classList.add('hidden');
      presetsContainer.classList.add('hidden');
      volumeControl.classList.add('hidden');
    } else {
      await window.soundscape.play(currentPreset);
      isPlaying = true;
      iconOff.classList.add('hidden');
      iconOn.classList.remove('hidden');
      presetsContainer.classList.remove('hidden');
      presetsContainer.classList.add('flex');
      volumeControl.classList.remove('hidden');
      volumeControl.classList.add('flex');
      updatePresetButtons(currentPreset, presetButtons);
    }
  });
  
  // Preset buttons
  presetButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      currentPreset = btn.dataset.preset;
      await window.soundscape.play(currentPreset);
      isPlaying = true;
      iconOff.classList.add('hidden');
      iconOn.classList.remove('hidden');
      updatePresetButtons(currentPreset, presetButtons);
    });
  });
  
  // Volume slider
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      window.soundscape.setVolume(e.target.value / 100);
    });
  }
}

function initGardenSoundControl(lang) {
  const toggleBtn = document.getElementById('garden-sound-toggle');
  const iconOff = document.getElementById('garden-sound-icon-off');
  const iconOn = document.getElementById('garden-sound-icon-on');
  const presetsContainer = document.getElementById('garden-sound-presets');
  const volumeSlider = document.getElementById('garden-volume-slider');
  const presetButtons = document.querySelectorAll('#garden-sound-presets .sound-preset');
  const soundControl = document.getElementById('garden-sound-control');
  
  if (!toggleBtn || !window.soundscape) {
    console.log('[Soundscape] Garden sound control not initialized - missing elements');
    return;
  }
  
  console.log('[Soundscape] Garden sound control initialized');
  
  let currentPreset = 'garden';
  let isPlaying = false;
  let menuOpen = false;
  
  // Helper function to open menu
  function openMenu() {
    presetsContainer.classList.remove('hidden');
    presetsContainer.classList.add('flex', 'flex-col');
    menuOpen = true;
    console.log('[Soundscape] Menu opened');
  }
  
  // Helper function to close menu
  function closeMenu() {
    presetsContainer.classList.add('hidden');
    presetsContainer.classList.remove('flex', 'flex-col');
    menuOpen = false;
    console.log('[Soundscape] Menu closed');
  }
  
  // Helper function to stop sound
  function stopSound() {
    window.soundscape.stop();
    isPlaying = false;
    iconOff.classList.remove('hidden');
    iconOn.classList.add('hidden');
    console.log('[Soundscape] Sound stopped');
  }
  
  // Toggle button - toggle menu AND sound
  toggleBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('[Soundscape] Toggle clicked, menuOpen:', menuOpen);
    
    if (!menuOpen) {
      // Open menu and start playing if not already
      openMenu();
      
      if (!isPlaying) {
        await window.soundscape.play(currentPreset);
        isPlaying = true;
        iconOff.classList.add('hidden');
        iconOn.classList.remove('hidden');
        updatePresetButtons(currentPreset, presetButtons);
      }
    } else {
      // Close menu (but keep sound playing)
      closeMenu();
    }
  });
  
  // Long press to stop sound (both mouse and touch)
  let pressTimer;
  const startPress = () => {
    pressTimer = setTimeout(() => {
      if (isPlaying) {
        stopSound();
        closeMenu();
      }
    }, 500);
  };
  const endPress = () => clearTimeout(pressTimer);
  
  toggleBtn.addEventListener('mousedown', startPress);
  toggleBtn.addEventListener('mouseup', endPress);
  toggleBtn.addEventListener('mouseleave', endPress);
  toggleBtn.addEventListener('touchstart', startPress, { passive: true });
  toggleBtn.addEventListener('touchend', endPress);
  toggleBtn.addEventListener('touchcancel', endPress);
  
  // Click/Touch outside to close menu (but keep sound playing)
  function handleOutsideClick(e) {
    if (!menuOpen) return;
    if (!soundControl) return;
    
    const target = e.target;
    const isInsideControl = soundControl.contains(target);
    
    console.log('[Soundscape] Outside click check:', { menuOpen, isInsideControl, target: target.id || target.className });
    
    if (!isInsideControl) {
      closeMenu();
    }
  }
  
  // Use capture phase for better detection
  document.addEventListener('click', handleOutsideClick, true);
  document.addEventListener('touchend', (e) => {
    // Small delay to allow click to process first
    setTimeout(() => handleOutsideClick(e), 10);
  }, { passive: true });
  
  // Preset buttons - switch sound
  presetButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      currentPreset = btn.dataset.preset;
      await window.soundscape.play(currentPreset);
      isPlaying = true;
      iconOff.classList.add('hidden');
      iconOn.classList.remove('hidden');
      updatePresetButtons(currentPreset, presetButtons);
    });
  });
  
  // Volume slider
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      window.soundscape.setVolume(e.target.value / 100);
    });
  }
  
  // Stop button
  const stopBtn = document.getElementById('garden-sound-stop');
  if (stopBtn) {
    stopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      stopSound();
      closeMenu();
    });
  }
}

function updatePresetButtons(activePreset, buttons) {
  buttons.forEach(btn => {
    if (btn.dataset.preset === activePreset) {
      btn.classList.add('bg-gold/30', 'text-gold', 'border-gold/50');
      btn.classList.remove('bg-ecru/10', 'text-ecru/60');
    } else {
      btn.classList.remove('bg-gold/30', 'text-gold', 'border-gold/50');
      btn.classList.add('bg-ecru/10', 'text-ecru/60');
    }
  });
}

// ========================================
// Weekly Report
// ========================================

function initWeeklyReport() {
  const lang = getLang();
  const profile = loadProfile();
  
  // Calculate week range
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
  
  // Format date range
  const formatDate = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return lang === 'en' 
      ? `${month}/${day}`
      : `${month}月${day}日`;
  };
  
  const dateRangeEl = document.getElementById('report-date-range');
  if (dateRangeEl) {
    dateRangeEl.textContent = `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  }
  
  // Calculate weekly stats from activities
  const weekStart = startOfWeek.toISOString().split('T')[0];
  const weeklyActivities = profile.activities.filter(a => {
    const activityDate = a.date.split('T')[0];
    return activityDate >= weekStart;
  });
  
  // Count by type
  const gardenCount = weeklyActivities.filter(a => a.type === 'garden').length;
  const studyCount = weeklyActivities.filter(a => a.type === 'study').length;
  const tatamiCount = weeklyActivities.filter(a => a.type === 'tatami').length;
  const totalSessions = gardenCount + studyCount + tatamiCount;
  
  // Count repairs this week
  const weeklyRepairs = profile.cracks.filter(c => {
    if (!c.repaired || !c.repairedDate) return false;
    const repairDate = c.repairedDate.split('T')[0];
    return repairDate >= weekStart;
  }).length;
  
  // Update summary cards
  document.getElementById('report-streak').textContent = profile.stats.currentStreak;
  document.getElementById('report-total-sessions').textContent = totalSessions;
  document.getElementById('report-repairs').textContent = weeklyRepairs;
  
  // Most active mode
  const mostActiveIcon = document.getElementById('report-most-active-icon');
  const mostActiveName = document.getElementById('report-most-active-name');
  if (mostActiveIcon && mostActiveName) {
    const modes = [
      { count: gardenCount, icon: '🌱', name: { en: 'Garden', ja: '庭' } },
      { count: studyCount, icon: '📚', name: { en: 'Study', ja: '書斎' } },
      { count: tatamiCount, icon: '🧘', name: { en: 'Tatami', ja: '座敷' } }
    ];
    const mostActive = modes.reduce((a, b) => a.count > b.count ? a : b);
    if (mostActive.count > 0) {
      mostActiveIcon.textContent = mostActive.icon;
      mostActiveName.textContent = mostActive.name[lang];
    } else {
      mostActiveIcon.textContent = '—';
      mostActiveName.textContent = lang === 'en' ? 'None yet' : 'まだなし';
    }
  }
  
  // Activity breakdown bars
  const maxCount = Math.max(gardenCount, studyCount, tatamiCount, 1);
  document.getElementById('report-garden-count').textContent = gardenCount;
  document.getElementById('report-garden-bar').style.width = `${(gardenCount / maxCount) * 100}%`;
  document.getElementById('report-study-count').textContent = studyCount;
  document.getElementById('report-study-bar').style.width = `${(studyCount / maxCount) * 100}%`;
  document.getElementById('report-tatami-count').textContent = tatamiCount;
  document.getElementById('report-tatami-bar').style.width = `${(tatamiCount / maxCount) * 100}%`;
  
  // Daily calendar
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + i);
    const dayStr = dayDate.toISOString().split('T')[0];
    
    const dayEl = document.getElementById(`day-${i}`);
    const dayContent = document.getElementById(`day-${i}-content`);
    
    if (!dayEl || !dayContent) continue;
    
    // Count activities on this day
    const dayActivities = weeklyActivities.filter(a => a.date.split('T')[0] === dayStr);
    const dayRepairs = profile.cracks.filter(c => 
      c.repaired && c.repairedDate && c.repairedDate.split('T')[0] === dayStr
    ).length;
    
    const activityCount = dayActivities.length;
    
    // Style based on activity
    dayEl.classList.remove('bg-ecru-200', 'bg-green-200', 'bg-green-400', 'bg-gold');
    
    if (dayRepairs > 0) {
      dayEl.classList.add('bg-gold');
      dayContent.textContent = '✦';
      dayContent.classList.remove('text-ink-400');
      dayContent.classList.add('text-white');
    } else if (activityCount >= 3) {
      dayEl.classList.add('bg-green-400');
      dayContent.textContent = activityCount;
      dayContent.classList.remove('text-ink-400');
      dayContent.classList.add('text-white');
    } else if (activityCount >= 1) {
      dayEl.classList.add('bg-green-200');
      dayContent.textContent = activityCount;
      dayContent.classList.remove('text-white');
      dayContent.classList.add('text-green-800');
    } else {
      dayEl.classList.add('bg-ecru-200');
      dayContent.textContent = '-';
      dayContent.classList.remove('text-white', 'text-green-800');
      dayContent.classList.add('text-ink-400');
    }
  }
  
  // Weekly encouragement (based on performance)
  const encouragements = {
    excellent: {
      en: [
        '"You\'ve shown remarkable dedication this week. Your vessel shines brightly."',
        '"Every session has added golden light to your journey. Well done."',
        '"Your commitment to mindfulness is inspiring. Keep walking this beautiful path."'
      ],
      ja: [
        '「今週は素晴らしい取り組みでした。あなたの器は輝いています。」',
        '「すべてのセッションが、あなたの歩みに金の光を加えました。」',
        '「マインドフルネスへの取り組みは素晴らしいです。この美しい道を歩み続けてください。」'
      ]
    },
    good: {
      en: [
        '"Every step forward, no matter how small, is progress."',
        '"You\'re building something beautiful, one moment at a time."',
        '"Your presence here matters. Every breath is a victory."'
      ],
      ja: [
        '「どんなに小さくても、前への一歩は進歩です。」',
        '「一瞬一瞬、美しいものを築いています。」',
        '「ここにいること自体が大切です。一呼吸ごとが勝利です。」'
      ]
    },
    starting: {
      en: [
        '"The journey of a thousand miles begins with a single step."',
        '"Be gentle with yourself. You\'re exactly where you need to be."',
        '"Your vessel awaits. When you\'re ready, it will welcome you."'
      ],
      ja: [
        '「千里の道も一歩から。」',
        '「自分に優しくしてください。今いる場所が、今の正しい場所です。」',
        '「あなたの器は待っています。準備ができたら、迎え入れてくれます。」'
      ]
    }
  };
  
  let category = 'starting';
  if (totalSessions >= 7) {
    category = 'excellent';
  } else if (totalSessions >= 3) {
    category = 'good';
  }
  
  const messages = encouragements[category][lang];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  const encouragementEl = document.getElementById('weekly-encouragement');
  if (encouragementEl) {
    encouragementEl.textContent = randomMessage;
  }
  
  // Initialize share functionality
  initShareFeature(profile, totalSessions, randomMessage, lang);
}

// ========================================
// Share Feature
// ========================================

function initShareFeature(profile, totalSessions, encouragement, lang) {
  // Update share card values
  const shareStreakEl = document.getElementById('share-streak-value');
  const shareMessageEl = document.getElementById('share-message');
  
  if (shareStreakEl) {
    shareStreakEl.textContent = profile.stats.currentStreak;
  }
  if (shareMessageEl) {
    // Use a shorter version for share
    const shareMessages = {
      en: [
        '"Your scars make you beautiful."',
        '"One step at a time, one breath at a time."',
        '"Every day is a new beginning."',
        '"In stillness, find strength."'
      ],
      ja: [
        '「傷は、あなたを美しくする。」',
        '「一歩ずつ、一呼吸ずつ。」',
        '「毎日が新しい始まり。」',
        '「静けさの中に、強さを見つける。」'
      ]
    };
    const msg = shareMessages[lang][Math.floor(Math.random() * shareMessages[lang].length)];
    shareMessageEl.textContent = msg;
  }
  
  // Generate share text
  const generateShareText = () => {
    const streakText = lang === 'en' 
      ? `🎯 ${profile.stats.currentStreak} day streak`
      : `🎯 ${profile.stats.currentStreak}日連続`;
    
    const sessionText = lang === 'en'
      ? `📊 ${totalSessions} sessions this week`
      : `📊 今週${totalSessions}セッション`;
    
    const tagline = lang === 'en'
      ? '✨ Your scars make you beautiful'
      : '✨ 傷が、あなたを美しくする';
    
    return `${streakText}\n${sessionText}\n\n${tagline}\n\n#KintsugiMind #金継ぎ #Mindfulness`;
  };
  
  // Copy text button
  const copyBtn = document.getElementById('share-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const text = generateShareText();
      try {
        await navigator.clipboard.writeText(text);
        // Show feedback
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>${lang === 'en' ? 'Copied!' : 'コピーしました！'}`;
        copyBtn.classList.add('bg-green-100', 'text-green-700');
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.classList.remove('bg-green-100', 'text-green-700');
        }, 2000);
      } catch (e) {
        console.error('Copy failed:', e);
      }
    });
  }
  
  // Twitter/X button
  const twitterBtn = document.getElementById('share-twitter-btn');
  if (twitterBtn) {
    twitterBtn.addEventListener('click', () => {
      const text = generateShareText();
      const url = window.location.origin;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, '_blank', 'width=550,height=420');
    });
  }
  
  // Native share button
  const nativeBtn = document.getElementById('share-native-btn');
  if (nativeBtn) {
    // Only show if Web Share API is supported
    if (navigator.share) {
      nativeBtn.addEventListener('click', async () => {
        const text = generateShareText();
        try {
          await navigator.share({
            title: 'KINTSUGI MIND',
            text: text,
            url: window.location.origin
          });
        } catch (e) {
          if (e.name !== 'AbortError') {
            console.error('Share failed:', e);
          }
        }
      });
    } else {
      // Hide native share button if not supported
      nativeBtn.style.display = 'none';
    }
  }
}

// ========================================
// Onboarding System
// ========================================

const ONBOARDING_KEY = 'kintsugi-onboarding-complete';
const VESSEL_KEY = 'kintsugi-vessel';

let currentOnboardingStep = 1;
let selectedVessel = null;

// Check if user has completed onboarding
function hasCompletedOnboarding() {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

// Mark onboarding as complete
function markOnboardingComplete() {
  localStorage.setItem(ONBOARDING_KEY, 'true');
}

// Get selected vessel
function getSelectedVessel() {
  return localStorage.getItem(VESSEL_KEY) || 'chawan';
}

// Save selected vessel
function saveSelectedVessel(vesselId) {
  localStorage.setItem(VESSEL_KEY, vesselId);
}

// Navigate to onboarding step
function goToStep(step) {
  const prevStep = document.getElementById(`onboarding-step-${currentOnboardingStep}`);
  const nextStep = document.getElementById(`onboarding-step-${step}`);
  const prevDot = document.getElementById(`dot-${currentOnboardingStep}`);
  const nextDot = document.getElementById(`dot-${step}`);
  
  if (prevStep && nextStep) {
    // Fade out current step
    prevStep.classList.add('opacity-0', 'pointer-events-none');
    prevStep.classList.remove('opacity-100');
    
    // Fade in next step
    setTimeout(() => {
      nextStep.classList.remove('opacity-0', 'pointer-events-none');
      nextStep.classList.add('opacity-100');
    }, 300);
    
    // Update dots
    if (prevDot) {
      prevDot.classList.remove('bg-gold', 'w-4');
      prevDot.classList.add('bg-indigo-300', 'dark:bg-[#4a4a4a]', 'w-2');
    }
    if (nextDot) {
      nextDot.classList.remove('bg-indigo-300', 'dark:bg-[#4a4a4a]', 'w-2');
      nextDot.classList.add('bg-gold', 'w-4');
    }
    
    currentOnboardingStep = step;
    
    // Trigger crack animation on step 2
    if (step === 2) {
      setTimeout(() => {
        const crackLine = document.getElementById('crack-line');
        if (crackLine) {
          crackLine.style.strokeDashoffset = '0';
          crackLine.style.transition = 'stroke-dashoffset 2s ease-out';
        }
      }, 500);
    }
    
    // Initialize vessel quiz on step 4
    if (step === 4) {
      setTimeout(() => {
        initVesselQuiz(getLang());
      }, 400);
    }
  }
}

// Select a vessel
function selectVessel(vesselId) {
  selectedVessel = vesselId;
  
  // Update UI
  document.querySelectorAll('.vessel-option').forEach(btn => {
    btn.classList.remove('border-gold', 'ring-2', 'ring-gold/30', 'scale-105');
    btn.classList.add('border-transparent');
  });
  
  const selected = document.querySelector(`[data-vessel="${vesselId}"]`);
  if (selected) {
    selected.classList.remove('border-transparent');
    selected.classList.add('border-gold', 'ring-2', 'ring-gold/30', 'scale-105');
    
    // Show confirm section
    const confirmSection = document.getElementById('vessel-confirm');
    const vesselNameEl = document.getElementById('selected-vessel-name');
    if (confirmSection && vesselNameEl) {
      confirmSection.classList.remove('hidden');
      
      const vesselNames = {
        chawan: { en: 'Tea Bowl', ja: '茶碗' },
        tsubo: { en: 'Jar', ja: '壺' },
        sara: { en: 'Plate', ja: '皿' },
        tokkuri: { en: 'Sake Bottle', ja: '徳利' },
        hachi: { en: 'Bowl', ja: '鉢' }
      };
      const lang = getLang();
      vesselNameEl.textContent = vesselNames[vesselId]?.[lang] || vesselId;
    }
  }
  
  // Haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

// ========================================
// Vessel Diagnosis Quiz System
// ========================================

const VESSEL_QUIZ = {
  questions: [
    {
      en: "When facing a challenge, you prefer to...",
      ja: "困難に直面したとき、あなたは...",
      answers: [
        { en: "Take immediate action and solve it", ja: "すぐに行動して解決する", vessels: ['hachi', 'tsubo'] },
        { en: "Reflect deeply before responding", ja: "深く考えてから対応する", vessels: ['chawan', 'sara'] },
        { en: "Stay calm and wait for the right moment", ja: "静かに待ち、適切な時を待つ", vessels: ['tokkuri', 'chawan'] },
        { en: "Seek guidance from others", ja: "他者の助言を求める", vessels: ['sara', 'hachi'] }
      ]
    },
    {
      en: "What resonates most with your heart?",
      ja: "あなたの心に最も響くものは？",
      answers: [
        { en: "The warmth of everyday moments", ja: "日常の何気ない温もり", vessels: ['chawan', 'chawan'] },
        { en: "The depth of silent contemplation", ja: "静かな瞑想の深み", vessels: ['tsubo', 'tokkuri'] },
        { en: "The openness of sharing with others", ja: "他者と分かち合う開放感", vessels: ['sara', 'sara'] },
        { en: "The quiet strength of endurance", ja: "耐え忍ぶ静かな強さ", vessels: ['tokkuri', 'tsubo'] },
        { en: "The joy of nurturing growth", ja: "成長を育む喜び", vessels: ['hachi', 'hachi'] }
      ]
    },
    {
      en: "In relationships, you value most...",
      ja: "人間関係で最も大切にしていること...",
      answers: [
        { en: "Creating comfortable, welcoming spaces", ja: "心地よく迎え入れる空間を作る", vessels: ['chawan', 'sara'] },
        { en: "Holding space for others' emotions", ja: "他者の感情を受け止める", vessels: ['tsubo', 'hachi'] },
        { en: "Being a steady, reliable presence", ja: "安定した頼れる存在である", vessels: ['tokkuri', 'tsubo'] },
        { en: "Encouraging and supporting growth", ja: "成長を励まし支える", vessels: ['hachi', 'chawan'] }
      ]
    },
    {
      en: "When you feel broken, you...",
      ja: "心が折れそうなとき、あなたは...",
      answers: [
        { en: "Find comfort in simple daily rituals", ja: "シンプルな日課に癒しを見出す", vessels: ['chawan', 'chawan'] },
        { en: "Go inward and process silently", ja: "内面に向き合い静かに処理する", vessels: ['tsubo', 'tokkuri'] },
        { en: "Reach out and connect with others", ja: "他者とつながりを求める", vessels: ['sara', 'hachi'] },
        { en: "Transform pain into purpose", ja: "痛みを目的に変える", vessels: ['tokkuri', 'hachi'] }
      ]
    },
    {
      en: "Your ideal form of self-care is...",
      ja: "理想的なセルフケアの形は...",
      answers: [
        { en: "A quiet cup of tea", ja: "静かなお茶の時間", vessels: ['chawan', 'chawan', 'tokkuri'] },
        { en: "Journaling or meditation", ja: "日記や瞑想", vessels: ['tsubo', 'tsubo', 'tokkuri'] },
        { en: "Sharing a meal with loved ones", ja: "大切な人との食事", vessels: ['sara', 'sara', 'hachi'] },
        { en: "Tending to plants or creating", ja: "植物の世話や創作活動", vessels: ['hachi', 'hachi', 'chawan'] }
      ]
    }
  ],
  
  vesselData: {
    chawan: {
      emoji: '🍵',
      name: { en: 'Tea Bowl', ja: '茶碗' },
      tagline: { en: 'Everyday Warmth', ja: '日常の温もり' },
      description: {
        en: 'Like the tea bowl, you find beauty in simplicity and everyday moments. Your warmth creates a safe space for others, and you understand that the most profound healing happens in small, gentle moments. Your quiet presence is a gift.',
        ja: '茶碗のように、あなたはシンプルさと日常の瞬間に美しさを見出します。あなたの温かさは他者にとって安全な場所を作り、最も深い癒しは小さく優しい瞬間に起こることを理解しています。あなたの静かな存在は贈り物です。'
      },
      traits: [
        { icon: '🌿', en: 'Grounded', ja: '落ち着き' },
        { icon: '💫', en: 'Warm', ja: '温かさ' },
        { icon: '🍃', en: 'Mindful', ja: '気づき' }
      ]
    },
    tsubo: {
      emoji: '🏺',
      name: { en: 'Jar', ja: '壺' },
      tagline: { en: 'Deep Capacity', ja: '深い包容力' },
      description: {
        en: 'Like the ancient jar, you have depth and capacity that others may not see at first. You hold experiences, emotions, and wisdom within you, slowly fermenting them into something valuable. Your patience and depth are rare treasures.',
        ja: '古い壺のように、あなたには最初は見えないかもしれない深さと包容力があります。経験、感情、知恵を内に秘め、ゆっくりと価値あるものへと醸成させます。あなたの忍耐と深さは稀有な宝物です。'
      },
      traits: [
        { icon: '🌊', en: 'Deep', ja: '深遠' },
        { icon: '⏳', en: 'Patient', ja: '忍耐' },
        { icon: '🔮', en: 'Wise', ja: '知恵' }
      ]
    },
    sara: {
      emoji: '🍽️',
      name: { en: 'Plate', ja: '皿' },
      tagline: { en: 'Open Acceptance', ja: '開かれた受容' },
      description: {
        en: 'Like the plate, you are open and generous with your space. You naturally bring people together and create opportunities for sharing. Your openness invites connection, and you find joy in offering what you have to others.',
        ja: '皿のように、あなたは自分の空間に対してオープンで寛大です。自然と人々を集め、分かち合いの機会を作ります。あなたの開放性はつながりを招き、自分の持っているものを他者に提供する喜びを見出します。'
      },
      traits: [
        { icon: '🤝', en: 'Generous', ja: '寛大' },
        { icon: '🌸', en: 'Open', ja: '開放的' },
        { icon: '🎁', en: 'Giving', ja: '与える' }
      ]
    },
    tokkuri: {
      emoji: '🍶',
      name: { en: 'Sake Bottle', ja: '徳利' },
      tagline: { en: 'Quiet Strength', ja: '静かな強さ' },
      description: {
        en: 'Like the sake bottle, you possess quiet strength and refined elegance. You pour yourself carefully and meaningfully, knowing the value of what you offer. Your measured presence brings quality over quantity to every interaction.',
        ja: '徳利のように、あなたは静かな強さと洗練されたエレガンスを持っています。自分が提供するものの価値を知り、慎重に意味を込めて注ぎます。あらゆる交流に量より質をもたらす、節度ある存在感です。'
      },
      traits: [
        { icon: '🎯', en: 'Focused', ja: '集中' },
        { icon: '✨', en: 'Refined', ja: '洗練' },
        { icon: '💎', en: 'Purposeful', ja: '目的' }
      ]
    },
    hachi: {
      emoji: '🥣',
      name: { en: 'Bowl', ja: '鉢' },
      tagline: { en: 'Nurturing Spirit', ja: '育む心' },
      description: {
        en: 'Like the nurturing bowl, you are naturally caring and supportive. You hold space for growth and nourishment, whether for yourself or others. Your practical warmth and steady support help things flourish around you.',
        ja: '育みの鉢のように、あなたは自然と思いやりがあり支えとなります。自分自身や他者のために、成長と栄養のための空間を保ちます。あなたの実際的な温かさと安定したサポートが、周囲のものを育てます。'
      },
      traits: [
        { icon: '🌱', en: 'Nurturing', ja: '育成' },
        { icon: '💚', en: 'Caring', ja: '思いやり' },
        { icon: '🏠', en: 'Supportive', ja: 'サポート' }
      ]
    }
  }
};

let quizCurrentQuestion = 0;
let quizAnswers = [];

// Initialize vessel diagnosis quiz
function initVesselQuiz(lang = 'en') {
  quizCurrentQuestion = 0;
  quizAnswers = [];
  
  // Reset UI
  document.getElementById('vessel-quiz-view')?.classList.remove('hidden');
  document.getElementById('vessel-result-view')?.classList.add('hidden');
  
  renderQuizQuestion(lang);
}

// Render current quiz question
function renderQuizQuestion(lang = 'en') {
  const question = VESSEL_QUIZ.questions[quizCurrentQuestion];
  if (!question) return;
  
  const questionEl = document.getElementById('quiz-question');
  const answersEl = document.getElementById('quiz-answers');
  const progressText = document.getElementById('quiz-progress-text');
  const progressPercent = document.getElementById('quiz-progress-percent');
  const progressBar = document.getElementById('quiz-progress-bar');
  
  if (!questionEl || !answersEl) return;
  
  // Update progress
  const progress = (quizCurrentQuestion / VESSEL_QUIZ.questions.length) * 100;
  if (progressText) {
    progressText.textContent = lang === 'ja' 
      ? `質問 ${quizCurrentQuestion + 1}/${VESSEL_QUIZ.questions.length}`
      : `Question ${quizCurrentQuestion + 1} of ${VESSEL_QUIZ.questions.length}`;
  }
  if (progressPercent) progressPercent.textContent = `${Math.round(progress)}%`;
  if (progressBar) progressBar.style.width = `${progress}%`;
  
  // Update question
  questionEl.textContent = question[lang];
  
  // Render answers
  answersEl.innerHTML = question.answers.map((answer, index) => `
    <button 
      onclick="selectQuizAnswer(${index})"
      class="w-full p-4 text-left bg-white/60 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md hover:border-gold/50 border-2 border-transparent transition-all duration-300"
    >
      <span class="text-indigo-800 dark:text-[#e8e4dc]">${answer[lang]}</span>
    </button>
  `).join('');
}

// Handle quiz answer selection
function selectQuizAnswer(answerIndex) {
  const question = VESSEL_QUIZ.questions[quizCurrentQuestion];
  if (!question) return;
  
  // Store the vessels associated with this answer
  quizAnswers.push(...question.answers[answerIndex].vessels);
  
  // Haptic feedback
  if (navigator.vibrate) navigator.vibrate(10);
  
  quizCurrentQuestion++;
  
  if (quizCurrentQuestion >= VESSEL_QUIZ.questions.length) {
    // Show results
    showQuizResults();
  } else {
    // Next question
    renderQuizQuestion(getLang());
  }
}

// Calculate and show quiz results
function showQuizResults() {
  const lang = getLang();
  
  // Count vessel mentions
  const vesselCounts = {};
  quizAnswers.forEach(v => {
    vesselCounts[v] = (vesselCounts[v] || 0) + 1;
  });
  
  // Find the most mentioned vessel
  let maxCount = 0;
  let resultVessel = 'chawan';
  Object.entries(vesselCounts).forEach(([vessel, count]) => {
    if (count > maxCount) {
      maxCount = count;
      resultVessel = vessel;
    }
  });
  
  // Save result
  selectedVessel = resultVessel;
  
  // Get vessel data
  const vesselData = VESSEL_QUIZ.vesselData[resultVessel];
  
  // Update result UI
  document.getElementById('result-vessel-emoji').textContent = vesselData.emoji;
  document.getElementById('result-vessel-name').textContent = vesselData.name[lang];
  document.getElementById('result-vessel-tagline').textContent = vesselData.tagline[lang];
  document.getElementById('result-description').textContent = vesselData.description[lang];
  
  // Update traits
  vesselData.traits.forEach((trait, i) => {
    document.getElementById(`trait-${i + 1}-icon`).textContent = trait.icon;
    document.getElementById(`trait-${i + 1}-text`).textContent = trait[lang];
  });
  
  // Show result view
  document.getElementById('vessel-quiz-view')?.classList.add('hidden');
  document.getElementById('vessel-result-view')?.classList.remove('hidden');
  
  // Update progress to 100%
  const progressBar = document.getElementById('quiz-progress-bar');
  if (progressBar) progressBar.style.width = '100%';
  
  // Setup share button
  const shareBtn = document.getElementById('share-result-btn');
  if (shareBtn) {
    shareBtn.onclick = () => shareVesselResult(resultVessel, lang);
  }
  
  // Setup retake button
  const retakeBtn = document.getElementById('retake-quiz-btn');
  if (retakeBtn) {
    retakeBtn.onclick = () => initVesselQuiz(lang);
  }
}

// Share vessel diagnosis result
function shareVesselResult(vesselId, lang = 'en') {
  const vesselData = VESSEL_QUIZ.vesselData[vesselId];
  if (!vesselData) return;
  
  const text = lang === 'en'
    ? `My vessel is ${vesselData.emoji} ${vesselData.name.en} — ${vesselData.tagline.en}\n\n${vesselData.traits.map(t => `${t.icon} ${t.en}`).join(' | ')}\n\nDiscover your vessel at #KintsugiMind ✨`
    : `私の器は ${vesselData.emoji} ${vesselData.name.ja} — ${vesselData.tagline.ja}\n\n${vesselData.traits.map(t => `${t.icon} ${t.ja}`).join(' | ')}\n\n#KintsugiMind で自分の器を見つけよう ✨`;
  
  const url = window.location.origin + '/diagnosis?lang=' + lang;
  
  if (navigator.share) {
    navigator.share({
      title: lang === 'en' ? 'My Kintsugi Vessel' : '私の金継ぎの器',
      text: text,
      url: url
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text + '\n' + url).then(() => {
      alert(lang === 'en' ? 'Copied to clipboard!' : 'クリップボードにコピーしました！');
    });
  }
}

// Direct vessel selection (skip quiz)
function selectVesselDirect(vesselId) {
  selectedVessel = vesselId;
  const lang = getLang();
  
  // Show result for directly selected vessel
  const vesselData = VESSEL_QUIZ.vesselData[vesselId];
  
  document.getElementById('result-vessel-emoji').textContent = vesselData.emoji;
  document.getElementById('result-vessel-name').textContent = vesselData.name[lang];
  document.getElementById('result-vessel-tagline').textContent = vesselData.tagline[lang];
  document.getElementById('result-description').textContent = vesselData.description[lang];
  
  vesselData.traits.forEach((trait, i) => {
    document.getElementById(`trait-${i + 1}-icon`).textContent = trait.icon;
    document.getElementById(`trait-${i + 1}-text`).textContent = trait[lang];
  });
  
  document.getElementById('vessel-quiz-view')?.classList.add('hidden');
  document.getElementById('vessel-result-view')?.classList.remove('hidden');
  
  const shareBtn = document.getElementById('share-result-btn');
  if (shareBtn) {
    shareBtn.onclick = () => shareVesselResult(vesselId, lang);
  }
  
  if (navigator.vibrate) navigator.vibrate(10);
}

// Complete onboarding
function completeOnboarding() {
  if (selectedVessel) {
    saveSelectedVessel(selectedVessel);
  }
  markOnboardingComplete();
  
  // Add profile vessel type
  let profile = loadProfile();
  profile.vesselType = selectedVessel || 'chawan';
  saveProfile(profile);
  
  // Redirect to home with animation
  const container = document.getElementById('onboarding-container');
  if (container) {
    container.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
    container.style.opacity = '0';
    container.style.transform = 'scale(1.1)';
  }
  
  setTimeout(() => {
    const lang = getLang();
    window.location.href = `/?lang=${lang}`;
  }, 500);
}

// Skip onboarding
function skipOnboarding() {
  markOnboardingComplete();
  const lang = getLang();
  window.location.href = `/?lang=${lang}`;
}

// ========================================
// Standalone Diagnosis Page
// ========================================

// Initialize standalone diagnosis page
function initDiagnosisPage(lang = 'en') {
  const introView = document.getElementById('diagnosis-intro');
  const quizView = document.getElementById('diagnosis-quiz');
  const resultView = document.getElementById('diagnosis-result');
  const startBtn = document.getElementById('start-diagnosis-btn');
  const retakeBtn = document.getElementById('retake-diagnosis-btn');
  
  if (!introView) return;
  
  // Reset state
  quizCurrentQuestion = 0;
  quizAnswers = [];
  
  // Start button
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      introView.classList.add('hidden');
      quizView.classList.remove('hidden');
      resultView.classList.add('hidden');
      renderQuizQuestion(lang);
    });
  }
  
  // Retake button
  if (retakeBtn) {
    retakeBtn.addEventListener('click', () => {
      quizCurrentQuestion = 0;
      quizAnswers = [];
      introView.classList.add('hidden');
      quizView.classList.remove('hidden');
      resultView.classList.add('hidden');
      renderQuizQuestion(lang);
    });
  }
}

// Override showQuizResults for standalone page
const originalShowQuizResults = showQuizResults;
showQuizResults = function() {
  const lang = getLang();
  
  // Count vessel mentions
  const vesselCounts = {};
  quizAnswers.forEach(v => {
    vesselCounts[v] = (vesselCounts[v] || 0) + 1;
  });
  
  // Find the most mentioned vessel
  let maxCount = 0;
  let resultVessel = 'chawan';
  Object.entries(vesselCounts).forEach(([vessel, count]) => {
    if (count > maxCount) {
      maxCount = count;
      resultVessel = vessel;
    }
  });
  
  // Save result
  selectedVessel = resultVessel;
  
  // Save to profile
  let profile = loadProfile();
  profile.vesselType = resultVessel;
  saveProfile(profile);
  
  // Get vessel data
  const vesselData = VESSEL_QUIZ.vesselData[resultVessel];
  
  // Update result UI
  const emojiEl = document.getElementById('result-vessel-emoji');
  const nameEl = document.getElementById('result-vessel-name');
  const taglineEl = document.getElementById('result-vessel-tagline');
  const descEl = document.getElementById('result-description');
  
  if (emojiEl) emojiEl.textContent = vesselData.emoji;
  if (nameEl) nameEl.textContent = vesselData.name[lang];
  if (taglineEl) taglineEl.textContent = vesselData.tagline[lang];
  if (descEl) descEl.textContent = vesselData.description[lang];
  
  // Update traits
  vesselData.traits.forEach((trait, i) => {
    const iconEl = document.getElementById(`trait-${i + 1}-icon`);
    const textEl = document.getElementById(`trait-${i + 1}-text`);
    if (iconEl) iconEl.textContent = trait.icon;
    if (textEl) textEl.textContent = trait[lang];
  });
  
  // Handle view switching for standalone page
  const introView = document.getElementById('diagnosis-intro');
  const quizView = document.getElementById('diagnosis-quiz');
  const resultView = document.getElementById('diagnosis-result');
  
  // For standalone diagnosis page
  if (introView && quizView && resultView) {
    introView.classList.add('hidden');
    quizView.classList.add('hidden');
    resultView.classList.remove('hidden');
  }
  
  // For onboarding page
  const vesselQuizView = document.getElementById('vessel-quiz-view');
  const vesselResultView = document.getElementById('vessel-result-view');
  if (vesselQuizView && vesselResultView) {
    vesselQuizView.classList.add('hidden');
    vesselResultView.classList.remove('hidden');
  }
  
  // Update progress to 100%
  const progressBar = document.getElementById('quiz-progress-bar');
  if (progressBar) progressBar.style.width = '100%';
  
  // Setup share button
  const shareBtn = document.getElementById('share-result-btn');
  if (shareBtn) {
    shareBtn.onclick = () => shareVesselResult(resultVessel, lang);
  }
  
  // Setup retake buttons
  const retakeBtn = document.getElementById('retake-quiz-btn');
  if (retakeBtn) {
    retakeBtn.onclick = () => initVesselQuiz(lang);
  }
}

// Check and redirect to onboarding if needed
function checkOnboardingRedirect() {
  const path = window.location.pathname;
  
  // Don't redirect if already on welcome page
  if (path === '/welcome') return false;
  
  // Only redirect from home page
  if (path === '/' && !hasCompletedOnboarding()) {
    const lang = getLang();
    window.location.href = `/welcome?lang=${lang}`;
    return true;
  }
  
  return false;
}

// Initialize onboarding page
function initOnboarding() {
  console.log('[Onboarding] Initializing...');
  
  // Make functions globally available
  window.goToStep = goToStep;
  window.selectVessel = selectVessel;
  window.completeOnboarding = completeOnboarding;
  window.skipOnboarding = skipOnboarding;
  
  // Set initial dot state
  const dot1 = document.getElementById('dot-1');
  if (dot1) {
    dot1.classList.add('w-4');
    dot1.classList.remove('w-2');
  }
}

// ========================================
// Initialize based on current page
// ========================================

console.log('[KINTSUGI] app.js loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('[KINTSUGI] DOMContentLoaded fired');
  const path = window.location.pathname;
  console.log('[KINTSUGI] Current path:', path);
  
  // Initialize dark mode toggle
  initDarkMode();
  
  // Check authentication status (non-blocking)
  checkAuthStatus();
  
  // Initialize logout button if present
  initLogout();
  
  // Save language preference
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  if (langParam) {
    localStorage.setItem('kintsugi-lang', langParam);
  }
  
  // Check for onboarding redirect (only on home page)
  if (checkOnboardingRedirect()) {
    return; // Stop further initialization if redirecting
  }
  
  // Initialize based on page
  if (path === '/welcome') {
    initOnboarding();
  } else if (path === '/profile') {
    initProfile();
  } else if (path === '/check-in') {
    // Record visit
    let profile = loadProfile();
    profile = recordVisit(profile);
    saveProfile(profile);
    
    // Save weather check-in to history if weather is selected
    const weatherParam = urlParams.get('weather');
    if (weatherParam && ['sunny', 'cloudy', 'rainy', 'stormy'].includes(weatherParam)) {
      saveCheckinToHistory(weatherParam);
      
      // Also send to server (non-blocking)
      fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weather: weatherParam })
      }).catch(e => console.log('Server checkin failed, saved locally'));
    }
  } else if (path === '/garden') {
    initGarden();
    initSoundControl('garden');
  } else if (path === '/study') {
    initStudy();
  } else if (path === '/tatami') {
    initTatami();
    initSoundControl('tatami');
  } else if (path === '/report') {
    initWeeklyReport();
  } else if (path === '/') {
    // Home page - record visit and update seasonal elements
    let profile = loadProfile();
    profile = recordVisit(profile);
    saveProfile(profile);
    
    // Update seasonal greetings and messages
    const lang = getLang();
    updateSeasonalElements(lang);
    
    // Update daily zen quote
    updateDailyZenQuote(lang);
    
    // Initialize zen quote share button
    const shareZenBtn = document.getElementById('share-zen-btn');
    if (shareZenBtn) {
      shareZenBtn.addEventListener('click', () => shareZenQuote(lang));
    }
    
    // Update challenge progress mini display
    updateChallengeMini();
  } else if (path === '/challenge') {
    // Challenge page is handled by inline script
  }
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  
  // Update language switcher to preserve current path
  document.querySelectorAll('.rounded-full a[href^="?lang="]').forEach(link => {
    const lang = link.href.includes('lang=ja') ? 'ja' : 'en';
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('lang', lang);
    link.href = currentUrl.toString();
  });
  
  // Initialize mobile menu
  initMobileMenu();
});

// ========================================
// Challenge Progress Mini Display
// ========================================

function updateChallengeMini() {
  const CHALLENGE_KEY = 'kintsugi-challenge';
  const progressBar = document.getElementById('challenge-bar-mini');
  const daysText = document.getElementById('challenge-days-mini');
  
  if (!progressBar || !daysText) return;
  
  try {
    const saved = localStorage.getItem(CHALLENGE_KEY);
    if (saved) {
      const challenge = JSON.parse(saved);
      const completed = challenge.completedDays?.length || 0;
      const progress = (completed / 7) * 100;
      
      progressBar.style.width = progress + '%';
      daysText.textContent = completed + '/7';
    }
  } catch (e) {
    console.log('Challenge progress load failed');
  }
}

// ========================================
// Mobile Menu System
// ========================================

let mobileMenuOpen = false;

function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');
  
  if (!mobileMenu) return;
  
  mobileMenuOpen = !mobileMenuOpen;
  
  if (mobileMenuOpen) {
    mobileMenu.classList.remove('hidden');
    if (iconOpen) iconOpen.classList.add('hidden');
    if (iconClose) iconClose.classList.remove('hidden');
  } else {
    mobileMenu.classList.add('hidden');
    if (iconOpen) iconOpen.classList.remove('hidden');
    if (iconClose) iconClose.classList.add('hidden');
  }
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');
  
  if (!mobileMenu) return;
  
  mobileMenuOpen = false;
  mobileMenu.classList.add('hidden');
  if (iconOpen) iconOpen.classList.remove('hidden');
  if (iconClose) iconClose.classList.add('hidden');
}

function initMobileMenu() {
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuBtn = document.getElementById('mobile-menu-btn');
    
    if (!mobileMenu || !menuBtn) return;
    
    // Check if click is outside menu and menu button
    if (mobileMenuOpen && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
      closeMobileMenu();
    }
  });
  
  // Close menu when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenuOpen) {
      closeMobileMenu();
    }
  });
  
  // Close menu when clicking on menu links
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });
  }
}

// Make toggleMobileMenu globally accessible
window.toggleMobileMenu = toggleMobileMenu;

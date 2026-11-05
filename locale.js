globalThis.TemuulLocale = (() => {
  const key='temuul.language';
  let language='mn';
  try{if(localStorage.getItem(key)==='en')language='en';}catch{}
  const english=new Map(Object.entries({
    'Тэмүүл — Personal Growth OS':'Temuul — Personal Growth OS',
    'Тэмүүл':'Temuul','Тэмүүлэл':'Temuul','ТЭМҮҮЛЭЛ':'TEMUUL',
    'Эхэлцгээе':'Let’s get started','Эхлэх':'Start','Хөөргөх':'Launch',
    'Тэмүүлэл — Өдөр бүр өөдөө. Апп нээгдэж байна.':'Temuul — Opening your workspace.',
    'ТАНЫ ДАРААГИЙН АЛХАМ':'YOUR NEXT STEP',
    'Жижиг алхам. Том өөрчлөлт.':'Small steps. Big changes.',
    'Өөрийн хэмнэлээр, өөдөө.':'Move forward at your own pace.',
    'Өдөр бүр өөдөө.':'Grow every day.','Өдөр бүр':'Grow','өөдөө.':'every day.',
    'Өдөртөө зай гарга. Хичээл, зорилго, дадал, бодлоо нэг тайван орон зайд цэгцэл.':'Make room for your day. Organize school, goals, habits, and thoughts in one calm space.',
    'ТАНЫ ДАРААГИЙН ЖИЖИГ ЯЛАЛТ':'YOUR NEXT SMALL WIN',
    'Өнөөдрөө өөрийн хэмнэлээр.':'Take today at your own pace.',
    'Төлөвлө. Төвлөр. Урагшил.':'Plan. Focus. Move forward.',
    'Өдөр бүр өөдөө · Elbex Labs':'Grow every day · Elbex Labs',
    'ТАНЫ ӨДӨР · ТАНЫ ХЭМНЭЛ':'YOUR DAY · YOUR PACE',
    'Өнөөдрөө утгатай болгоё.':'Make today count.',
    'Өнөөдөр':'Today','Тоглоом':'Games','Чат':'Chat','Үндсэн цэс':'Main navigation',
    'Хурдан нэмэх':'Quick add','＋ Ажил нэмэх':'＋ Add task','＋ Task нэмэх':'＋ Add task',
    'Төвлөрөх цаг':'Focus time','Нэг зүйлд анхаарлаа өг':'Focus on one thing',
    'Бодлоо бичье':'Write a thought','Өөртөө түр завсарлага':'Take a moment',
    'AI-тай ярилцах':'Talk to AI','Дараагийн алхмаа ол':'Find your next step',
    'НЭГ АЛХАМ НЭГ УДАА':'ONE STEP AT A TIME','Өдрийн ахиц':'Daily progress',
    'Өнөөдрийн ажлуудаа эхлүүлээрэй.':'Start your tasks for today.',
    'Миний хамтрагч':'My companion','Pet нээх ↗':'Open pet ↗','Сануулгын төв':'Reminder center',
    'Дараагийн сануулгыг бэлдэж байна…':'Getting your next reminder ready…',
    'Хийх ажлууд':'Tasks','Өөрийн хэмнэлээр':'At your own pace','Одоогоор task алга':'No tasks yet',
    '🎯 Одоо юу хийх вэ?':'🎯 What should I do now?','Нэг жижиг алхмаас эхэлье':'Start with one small step',
    '🌙 Оройн 30 секундийн дүгнэлт':'🌙 30-second evening review',
    'Өнөөдөр юу бүтээв?':'What did you accomplish today?',
    'Маргаашийн хамгийн чухал ажил юу вэ?':'What is your top priority tomorrow?',
    'Маргааш Today дээр автоматаар санал болгоно. Planner-д давхар ажил үүсгэхгүй.':'This appears in Today tomorrow without creating a duplicate task.',
    'Дүгнэлт хадгалах':'Save review','Ирээдүйн өдрөө тайван төлөвлө.':'Plan your next day at your own pace.',
    'Сонгосон өдөр':'Selected day','Өглөө':'Morning','Өдөр':'Afternoon','Орой':'Evening',
    'ТАНЫ ӨДӨР ТУТМЫН ХАМТРАГЧ':'YOUR DAILY COMPANION','Миний Pet':'My pet',
    'Хамтдаа өсөж, шинэ шагналуудаа нээгээрэй.':'Grow together and unlock new rewards.',
    '✧ AI Coach нээх':'✧ Open AI Coach','Сайн уу!':'Hello!',
    'Өнөөдрийн нэг жижиг алхмаа хамт хийцгээе.':'Let’s take one small step together today.',
    'Намайг дарж AI Coach-той ярилцаарай →':'Tap me to talk to AI Coach →',
    'Хамтдаа өнгөрүүлэх мөч':'Time together','🤍 Илэх':'🤍 Pet','🍎 Хооллох':'🍎 Feed','🎾 Тоглуулах':'🎾 Play',
    'Ажлаа дуусгаад зоос цуглуулж, хамтрагчийнхаа орчинг тохижуулаарай.':'Complete tasks to earn coins and decorate your companion’s home.',
    '🛍️ Pet дэлгүүр · орчин ба хэрэгсэл':'🛍️ Pet shop · scenes and accessories',
    'Бүгд':'All','Орчин':'Scenes','Хэрэгсэл':'Accessories','Миний авсан':'Owned','Үндсэн орчин':'Default scene',
    '🏡 Өрөөгөө тохижуулах':'🏡 Decorate the room',
    'Дэлгүүрээс авсан хэрэгслүүдээ хамт байрлуулна. Зоос дахин хасагдахгүй.':'Place your owned accessories together for free.',
    'Хамтрагчийн хувцасны шүүгээ':'Companion wardrobe','Ажлаа хийгээд хамтдаа өсөөрэй':'Complete tasks and grow together',
    'Өдөр бүр 3 жижиг ялалт байгуулж pet XP аваарай.':'Earn pet XP with three small wins each day.',
    'Миний ахиц':'My progress','Дадал, төвлөрөл, долоо хоногийн тойм.':'Habits, focus, and a weekly overview.',
    'Өнөөдрийн Momentum':'Today’s momentum','Habit Lab нээх':'Open Habit Lab','Долоо хоногийн тайлан':'Weekly report','↓ Тайлан татах':'↓ Download report',
    'Хичээлийн хуваарь, даалгавар, focus-оо нэг дор удирд.':'Manage your timetable, assignments, and focus time together.',
    '＋ Даалгавар':'＋ Assignment','＋ Хичээл':'＋ Class','Хичээлээ нэмээрэй':'Add a class',
    'ӨНӨӨДРИЙН ХИЧЭЭЛ':'TODAY’S CLASSES','ДАРААГИЙН ХИЧЭЭЛ':'NEXT CLASS','ДААЛГАВАР':'ASSIGNMENTS','ЭНЭ 7 ХОНОГ':'THIS WEEK',
    '🎓 Шалгалтын давтлага':'🎓 Exam review','＋ Шалгалт':'＋ Exam',
    'Шалгалтын өдрөөс өмнөх 7 хүртэл хоногт 25 минутын жижиг давтлага төлөвлөнө.':'Plan 25-minute review sessions up to seven days before the exam.',
    '🗓️ 7 цагийн хичээлийн хуваарь':'🗓️ Seven-period timetable',
    'Хоосон нүд дарахад сонгосон өдөр, цаг автоматаар бөглөгдөнө.':'Select an empty slot to fill in the day and time automatically.',
    '7 хоногийн хуваарь':'Weekly timetable','Даалгавар':'Assignment','Хичээлийн булан':'Study hub','Хичээл':'Class',
    'БЯЦХАН ЗАВСАРЛАГА · ТОМ ИНЭЭМСЭГЛЭЛ':'A SMALL BREAK · A BIG SMILE','Тоглоомын булан':'Game arcade',
    'Толгойгоо амрааж, өөрийгөө сорь. Нэг жижиг тоглолт хийгээд өдөртөө эргээд ороорой.':'Take a break and challenge yourself with a quick game.',
    'Хосоо олоорой':'Match the pairs','16 картын цаана нуугдсан 8 хос амьтныг олоорой.':'Find eight animal pairs hiding behind 16 cards.',
    'Ой тогтоолт':'Memory','1–3 минут':'1–3 minutes','Хос карт тоглох':'Play matching cards',
    'Гялс дараарай':'Quick reflexes','Ногоон дохиог хүлээгээд, хэр хурдан хариу үйлдэл үзүүлэхээ шалга.':'Wait for green and see how quickly you react.',
    'Хурд':'Speed','3 оролдлого':'3 attempts','Хурдаа шалгах':'Test your speed',
    'Бяцхан цэцэрлэг':'Little garden','Зургийн хэсгүүдийг гулсуулж, тайван цэцэрлэгээ эвлүүл.':'Slide the pieces to rebuild the garden picture.',
    'Эвлүүлдэг зураг':'Sliding puzzle','Зураг эвлүүлэх':'Solve the picture puzzle',
    'Ижил тоонуудыг нийлүүлж, 2048-д хүрээрэй.':'Merge matching numbers to reach 2048.',
    'Тоон таавар':'Number puzzle','2048 тоглох':'Play 2048','Мина илрүүлэгч':'Minesweeper','Логик':'Logic','Мина хайх':'Play Minesweeper',
    'Тоон дохиогоор зургаан мина хаана байгааг олж, аюулгүй нүднүүдийг нээ.':'Use the number clues to find six mines and uncover safe squares.',
    '3 дараалуулах':'Tic-tac-toe','3 дараалуулах тоглох':'Play tic-tac-toe',
    'Компьютерийн эсрэг тоглож, X-ээ гурвууланг нь нэг шугамд оруул.':'Play the computer and line up three Xs.',
    'Стратеги':'Strategy','Компьютерийн эсрэг':'Against the computer',
    'Гэрлийн хэмнэл':'Light sequence','Гэрлийн хэмнэл тоглох':'Play light sequence',
    'Анивчсан дүрсүүдийг дарааллаар нь дар. Шат бүр нэг дүрс нэмэгдэнэ.':'Repeat the flashing shapes in order. Each level adds one shape.',
    'Дараалал':'Sequence','20 шат хүртэл':'Up to 20 levels',
    'Жимсчин могой':'Fruit snake','Могой тоглох':'Play Snake','Жимс идэх тусам урт болно. Хана болон сүүлнээсээ болгоомжлоорой.':'Eat fruit to grow. Watch out for walls and your tail.',
    'Солирын бороо':'Meteor dodge','Солироос бултах':'Play Meteor Dodge','Хөлгөө зүүн, баруун тийш хөдөлгөж, хурдлах солируудаас булт.':'Move your ship left and right to dodge falling meteors.',
    'Лабиринт':'Maze','Лабиринтад орох':'Enter the maze','Тоглолт бүрийн шинэ замаар явж, тугтай гарцыг ол.':'Find the flagged exit in a new maze each round.',
    'Нууц үг':'Word scramble','Үг таах':'Guess the word','Монгол тайлбарыг уншаад холилдсон үсгүүдээр үг бүтээ.':'Read a Mongolian clue and unscramble the letters.',
    'Гэрэл унтраагч':'Lights out','Гэрэл унтраах':'Play Lights Out','Нэг нүд дарахад хөршүүд нь солигдоно. Бүх гэрлийг унтраа.':'Toggle a square and its neighbors to turn off every light.',
    'Тооны сорил':'Math challenge','Бодлого бодох':'Start math challenge','Нэмэх, үржүүлэх 10 бодлогоос хэдийг зөв бодохоо үз.':'Try ten addition and multiplication problems.',
    '4 дараалуулах':'Four in a row','4 дараалуулах тоглох':'Play four in a row','Компьютерийн эсрэг тоглож, дөрвөн тэмдгээ нэг шугамд оруул.':'Play the computer and line up four of your tokens.',
    '← Тоглоомууд':'← Games','↻ Дахин':'↻ Restart','Олсон хос':'Pairs found','Алхалт':'Moves','Хугацаа':'Time','Оролдлого':'Attempts','Бэлэн үү?':'Ready?',
    'Энд дараад эхлээрэй':'Tap here to start','Нүүдэл':'Moves','Оноо':'Score','Нээсэн':'Revealed','Туг':'Flags','🚩 Туг тавих горим':'🚩 Flag mode','Дараалсан ялалт':'Win streak','Давсан шат':'Levels cleared',
    'Зүүн':'Left','Баруун':'Right','Дээш':'Up','Доош':'Down',
    'Хэрэгтэй зүйлээ нэг газраас нээгээрэй.':'Open everything you need from one place.','Холбоо ба чат':'Friends and chat',
    'Төлөвлөлт ба ахиц':'Planning and progress','Хувийн орон зай':'Personal space','Холбоо ба тусламж':'Connections and support',
    'Username хайлт':'Username search','Username-аар найзаа олоод хүсэлт илгээ. Найз чинь зөвшөөрөхөд чат нээгдэнэ.':'Find your friend by username and send a request. Chat opens after they accept.',
    'Миний username':'My username','3–20 тэмдэгт. Англи үсэг, тоо, доогуур зураас. Username-аа нэг удаа сонгоно.':'Use 3–20 letters, numbers, or underscores. Choose your username once.',
    'Username хадгалах':'Save username','Найзыгаа username-аар хайх':'Find a friend by username','Хайх':'Search',
    'Интернетгүй байна. Холболт сэргээд чат үргэлжлүүлээрэй.':'You’re offline. Reconnect to continue chatting.',
    '🖼 Зураг':'🖼 Photo','🎙 Бичих':'🎙 Record','Хавсралт арилгах':'Remove attachment',
    'Чатын зураг':'Chat image','Илгээсэн зураг':'Shared image','↓ Зураг татах':'↓ Download image',
    'Username үүсгэвэл нэвтэрсэн хэрэглэгчид таны нэр, зураг, Pet-ийн ахицыг харж болно.':'When you create a username, signed-in users can see your name, photo, and pet progress.',
    'Урилга бэлэн':'Invite ready','Зөвшөөрөл хүлээж байна':'Pending approval','Чат нээлттэй':'Chat open','Хаасан':'Closed',
    'Хүсэлт ба урилга':'Requests and invites','Хаасан чат':'Closed chats','Холбоо хараахан алга.':'No connections yet.',
    'Зурвасуудыг ачаалж байна…':'Loading messages…','Одоогоор зурвас алга.':'No messages yet.',
    '＋ Ажил':'＋ Task','Ажил':'Task','Давталт':'Repeat','Ач холбогдол':'Priority','Дууссан':'Done','Дуусаагүй':'Open',
    'Шилдэг':'Best','Анхны амжилтаа тогтоогоорой':'Set your first record','оноо':'points','нүүдэл':'moves','алхам':'steps','секунд':'seconds','жимс':'fruit','шат':'levels',
    'Найзаа урьж, хувийн зурвас бичээрэй.':'Invite a friend and send private messages.','Урилгын код':'Invite code',
    'Урилгын кодоор холбогдоно. Урилгын эзэн зөвшөөрсний дараа хувийн чат нээгдэнэ.':'Connect using an invite code. Private chat opens after the invite owner accepts.',
    'Нэвтрэх тохиргоо':'Sign-in options','Миний холбоо':'My connections','Найзууд':'Friends',
    '＋ 4 оронтой код үүсгэх':'＋ Create a 4-digit code','Найзын урилгын код':'Friend’s invite code',
    'Найзын хүсэлт илгээх':'Send friend request','Найзын профайл':'Friend profile','Найздаа харагдах нэр':'Name shown to your friend','Миний тухай':'About me',
    'Энэ найзтай хуваалцах':'Share with this friend','Зөвшөөрөх':'Accept','Чат хаах':'Close chat','Код хуулах':'Copy code',
    '☎ Дуудах':'☎ Call','☎ Дуудлага ирлээ':'☎ Incoming call','Авах':'Answer','Таслах':'Hang up','Дуу сонсох':'Play audio',
    '🎙 Микрофон':'🎙 Microphone','🎙 Микрофон унтраах':'🎙 Mute microphone','🎙 Микрофон асаах':'🎙 Unmute microphone',
    '📷 Камер':'📷 Camera','📷 Камер асаах':'📷 Turn camera on','📷 Камер унтраах':'📷 Turn camera off','↻ Камер солих':'↻ Flip camera',
    'Зурвас':'Message','Илгээх':'Send','Нээх':'Open',
    'Хадгалах':'Save','Хаах':'Close','Болих':'Cancel','Цуцлах':'Cancel','Устгах':'Delete','Засах':'Edit','Буцах':'Back',
    'Нэр':'Name','Гарчиг':'Title','Тайлбар':'Description','Огноо':'Date','Цаг':'Time','Дүн':'Amount','Төрөл':'Type','Ангилал':'Category',
    '＋ Зорилго нэмэх':'＋ Add goal','＋ Habit нэмэх':'＋ Add habit','＋ Орлого':'＋ Income','＋ Зарлага':'＋ Expense',
    'Орлого':'Income','Зарлага':'Expense','Үлдэгдэл':'Balance','Гүйлгээ':'Transactions','Төсөв':'Budget','Сарын төсөв':'Monthly budget','Хадгаламж':'Savings',
    'Энэ сарын орлого':'Income this month','Энэ сарын зарлага':'Expenses this month','Бүх төрөл':'All types','Бүх ангилал':'All categories',
    'Хадгаламжийн зорилго':'Savings goal','Хадгалсан':'Saved','Хадгалагдсан':'Saved','Төсөв тохируулаагүй':'No budget set',
    '✍️ Өнөөдөр бичих':'✍️ Write today','Өнөөдөр ямар байв?':'How was today?','Миний тэмдэглэлүүд':'My entries',
    'Таны AI хамтрагч':'Your AI companion','Чат цэвэрлэх':'Clear chat','Дахин оролдох':'Try again',
    'БОДЛОО ЦЭГЦЭЛ · НЭГ АЛХАМ УРАГШ':'CLEAR YOUR MIND · TAKE A STEP',
    'Хичээлээ ойлгох, санаа олох, өдрөө төлөвлөх — хамт ярилцъя.':'Talk through schoolwork, ideas, or plans for your day.',
    '🎯 Өдрөө төлөвлөе':'🎯 Plan my day','📚 Хичээлээ ойлгоё':'📚 Understand a lesson','🌱 Дараагийн алхам':'🌱 Find the next step','✎ Санаагаа бичье':'✎ Write down an idea',
    'Хувийн мэдээллийн тохиргоо':'Privacy settings','Миний tracker-ийн товч мэдээллийг ашиглах':'Use my tracker summary',
    '✦ Хариулт бэлдэж байна…':'✦ Preparing a response…','Эхлэхэд бэлэн':'Ready to start','▶ Focus эхлүүлэх':'▶ Start focus','✓ Дуусгах':'✓ Finish',
    'Даваа':'Monday','Мягмар':'Tuesday','Лхагва':'Wednesday','Пүрэв':'Thursday','Баасан':'Friday','Бямба':'Saturday','Ням':'Sunday',
    'Да':'Mon','Мя':'Tue','Лх':'Wed','Пү':'Thu','Ба':'Fri','Бя':'Sat','Ня':'Sun'
  }));
  const tracked=[];
  const attributes=['aria-label','placeholder','title','alt'];
  const t=(mn,en)=>language==='en'?(en??english.get(mn)??mn):mn;

  function apply(){
    document.documentElement.lang=language;
    for(const entry of tracked){
      if(!entry.node.isConnected)continue;
      const value=entry.prefix+t(entry.mn)+entry.suffix;
      if(entry.attr)entry.node.setAttribute(entry.attr,value);
      else entry.node.nodeValue=value;
    }
    document.title=t('Тэмүүл — Personal Growth OS');
    for(const button of document.querySelectorAll('[data-language-toggle]')){
      button.textContent=language.toUpperCase();
      button.setAttribute('aria-label',t('Англи хэл рүү солих','Switch to Mongolian'));
      button.title=t('Англи хэл рүү солих','Switch to Mongolian');
    }
  }

  function init(){
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    for(let node=walker.nextNode();node;node=walker.nextNode()){
      if(node.parentElement?.closest('script,style,textarea,[data-language-toggle]'))continue;
      const mn=node.nodeValue.trim();
      if(english.has(mn))tracked.push({node,mn,prefix:node.nodeValue.match(/^\s*/)[0],suffix:node.nodeValue.match(/\s*$/)[0]});
    }
    for(const node of document.body.querySelectorAll('[aria-label],[placeholder],[title],[alt]')){
      for(const attr of attributes){
        const mn=node.getAttribute(attr);
        if(english.has(mn))tracked.push({node,attr,mn,prefix:'',suffix:''});
      }
    }
    for(const button of document.querySelectorAll('[data-language-toggle]')){
      button.addEventListener('click',()=>{
        language=language==='mn'?'en':'mn';
        try{localStorage.setItem(key,language);}catch{}
        apply();
        document.dispatchEvent(new Event('temuul:language'));
      });
    }
    apply();
  }
  return {init,t,get language(){return language;}};
})();

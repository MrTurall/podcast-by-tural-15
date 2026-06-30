const FEED_URL = 'https://feeds.acast.com/public/shows/648ad5d0f0f1d400111a9ec9';
const APPLE_COLLECTION_ID = '1692736134';
const SPOTIFY_SHOW_ID = '1JCxge7voyK9KvW0pWOJLv';
const LINKTREE_URL = 'https://linktr.ee/mr.turalll';
const savedClassifications = require('./episode-classifications.json');

const knownSpotifyLinks = new Map(Object.entries({

  'zelzele aninda heyatini qoruya bilecek duzgun addimlar ordan burdan': 'https://open.spotify.com/episode/2kdJvGh4ibChktiGsQ8O3q',
  'qehve ne zaman faydalidir ne zaman zerer verir ordan burdan': 'https://open.spotify.com/episode/638vraF3f4mmT7rtCyWTOF',
  'motivasiya bitende seni ne davam etdirir ordan burdan': 'https://open.spotify.com/episode/0lxVbvqvrW0Ad41IRbDaSi',
  'saglam qidalanmaq ucun dietik mehsullara ehtiyac varmi 1 fincan qehve': 'https://open.spotify.com/episode/5yafKC3LgfNXY8XqHPmvn7',
  'gun boyu daha enerjili olmaq ucun ne etmeli 1 fincan qehve': 'https://open.spotify.com/episode/1xmnlcn5KI4tDZR39GyWTx',
  'saglam qidalanmani nece davamli verdishe cevirmek olar 1 fincan qehve': 'https://open.spotify.com/episode/47qQsfuT9I8nGWhswTzCYH',
  'sevdiyin yemeklerden imtina etmeden ariqlamaq mumkundurmu 1 fincan qehve': 'https://open.spotify.com/episode/0jQBAqFq4jeaVM03yhllmy',
  'zelzele aninda ne etmeliyik': 'https://open.spotify.com/episode/2kdJvGh4ibChktiGsQ8O3q',
  'azerbaycanda enerji ickilerinin secimi niye mehduddur': 'https://open.spotify.com/episode/4UGcry9lFzP7oUSxbQituP',
  'qehve enerji fokus ve gundelik verdis': 'https://open.spotify.com/episode/638vraF3f4mmT7rtCyWTOF',
  'motivasiya basladir intizam davam etdirir': 'https://open.spotify.com/episode/0lxVbvqvrW0Ad41IRbDaSi',
  'saglam qidalanmaq ucun dietik mehsul lazimdirmi': 'https://open.spotify.com/episode/5yafKC3LgfNXY8XqHPmvn7',
  'gun boyu daha enerjili olmaq ucun ne etmeli': 'https://open.spotify.com/episode/1xmnlcn5KI4tDZR39GyWTx',
  'saglam qidalanmani heyat terzine nece cevirmek olar': 'https://open.spotify.com/episode/47qQsfuT9I8nGWhswTzCYH',
  'sekersiz ickiler ve qidalar saglamdir yoxsa zererlidir': 'https://open.spotify.com/episode/1ImRmfjH6SJ9Ta6xS95ZT1',
  'ariqlamaga haradan baslamaq lazimdir': 'https://open.spotify.com/episode/0jQBAqFq4jeaVM03yhllmy',
  'artiq ceki bedenimize nece tesir edir': 'https://open.spotify.com/episode/2KUi6q2grR1QSDpdpGgUyx',
  'sirniyyat ve fast food ne zaman probleme cevrilir': 'https://open.spotify.com/episode/2aBUFkkgyfC5py875fW7Jw'
}));

function decodeEntities(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function stripHtml(value = '') {
  return decodeEntities(value)
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTag(block, tag) {
  const escaped = tag.replace(':', '\\:');
  const match = block.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, 'i'));
  return match ? decodeEntities(match[1]).trim() : '';
}

function getAttribute(block, tag, attribute) {
  const escaped = tag.replace(':', '\\:');
  const tagMatch = block.match(new RegExp(`<${escaped}\\s+([^>]+)>`, 'i'));
  if (!tagMatch) return '';
  const attrMatch = tagMatch[1].match(new RegExp(`${attribute}=["']([^"']+)["']`, 'i'));
  return attrMatch ? decodeEntities(attrMatch[1]) : '';
}

function normalize(value = '') {
  return value
    .toLocaleLowerCase('az')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanDescription(value = '') {
  let text = stripHtml(value);
  const cutPoints = [
    'Söhbətimiz burada bitmir.',
    'Yeni epizodlar və digər paylaşımlar üçün',
    'Xoş dinləmələr!',
    'Hosted on Acast.'
  ];
  for (const marker of cutPoints) {
    const index = text.indexOf(marker);
    if (index > 80) text = text.slice(0, index).trim();
  }
  return text;
}

function classifySeries(title = '') {
  const key = normalize(title);
  if (key.endsWith('ordan burdan')) return 'ob';
  if (key.endsWith('1 fincan qehve')) return '1fq';
  return '1fq';
}

const ONE_FINCAN_CATEGORIES = new Set(savedClassifications.categories);
const ORDAN_BURDAN_CATEGORIES = new Set(savedClassifications.ordanBurdanCategories || []);
const CLASSIFICATION_CACHE = savedClassifications.episodes || {};
const GENERIC_TAG_KEYS = new Set([
  'saglamliq',
  'saglam heyat',
  'heyat',
  'meslehet',
  'beden',
  'saglam secim',
  'verdis',
  'davamli',
  'davamli liq'
]);
const AI_REVIEW_CONFIDENCE = 0.67;
const MAX_TAGS = 5;

function classificationKey(title = '') {
  return normalize(removeSeriesSuffix(title));
}

function isGenericTag(tag = '') {
  const key = normalize(tag);
  return GENERIC_TAG_KEYS.has(key) || /\bbeden\b/.test(key);
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function allowedCategoriesForSeries(series = '1fq') {
  return series === 'ob' ? ORDAN_BURDAN_CATEGORIES : ONE_FINCAN_CATEGORIES;
}

function fallbackCategoryForSeries(series = '1fq') {
  return series === 'ob' ? 'Gündəlik vərdişlər' : 'Qidalanma';
}

function sanitizeClassification(raw = {}, source = 'rules', series = '1fq') {
  const allowedCategories = allowedCategoriesForSeries(series);
  const hasAllowedCategory = allowedCategories.has(raw.category);
  const category = hasAllowedCategory ? raw.category : fallbackCategoryForSeries(series);
  const tags = unique(Array.isArray(raw.tags) ? raw.tags : [])
    .map(tag => String(tag).trim())
    .filter(tag => tag && !isGenericTag(tag))
    .slice(0, MAX_TAGS);
  const goals = unique(Array.isArray(raw.goals) ? raw.goals : []).slice(0, 3);
  const confidence = Number.isFinite(Number(raw.confidence)) ? Math.max(0, Math.min(1, Number(raw.confidence))) : 0;
  const needsReview = Boolean(raw.needsReview || !hasAllowedCategory || confidence < AI_REVIEW_CONFIDENCE);
  return {
    category,
    tags,
    goals,
    startHere: Boolean(raw.startHere && !needsReview),
    needsReview,
    confidence,
    classificationSource: source
  };
}

function profile(category, tags = [], goals = [], startHere = false, confidence = 0.75) {
  return { category, tags, goals, startHere, needsReview: confidence < AI_REVIEW_CONFIDENCE, confidence };
}

function needsReviewProfile(category = 'Qidalanma', tags = [], goals = []) {
  return { category, tags, goals, startHere: false, needsReview: true, confidence: 0.45 };
}

function ruleBasedClassification(title = '', summary = '', series = '1fq') {
  const titleKey = normalize(removeSeriesSuffix(title));
  const key = normalize(`${removeSeriesSuffix(title)} ${summary}`);

  if (series === 'ob') {
    if (/zelzele/.test(key)) return profile('Təhlükəsizlik', ['zəlzələ', 'hazırlıq', 'təhlükəsizlik', 'evdə davranış', 'soyuqqanlılıq'], [], false, 0.88);
    if (/motivasiya|intizam/.test(key)) return profile('İntizam və motivasiya', ['motivasiya', 'intizam', 'davamlılıq', 'sistem', 'kiçik addımlar'], [], false, 0.86);
    if (/enerji icki|coca cola/.test(key)) return profile('Gündəlik vərdişlər', ['enerji içkiləri', 'kofein', 'bazar seçimi', 'şəkər', 'qiymət'], [], false, 0.86);
    if (/qehve|kofein/.test(key)) return profile('Gündəlik vərdişlər', ['qəhvə', 'kofein', 'yuxu', 'fokus', 'vaxtlama'], [], true, 0.82);
    return needsReviewProfile('Gündəlik vərdişlər', []);
  }

  if (/terlemek/.test(titleKey)) return profile('İdman və hərəkət', ['tərləmə', 'su itkisi', 'kalori', 'məşq', 'arıqlamaq mifi'], ['sport', 'myths', 'weight']);
  if (/artiq ceki/.test(titleKey)) return profile('Çəki idarəetməsi', ['artıq çəki', 'enerji', 'yuxu', 'oynaq yükü', 'hərəkət'], ['weight', 'energy']);
  if (/protein|karbohidrat|yag/.test(titleKey)) return profile('Qidalanma', ['protein', 'yağ', 'karbohidrat', 'makrolar', 'enerji'], ['nutrition', 'energy'], true, 0.9);
  if (/sekersiz/.test(titleKey)) return profile('Sağlamlıq mifləri', ['şəkərsiz məhsullar', 'etiket oxuma', 'içkilər', 'süni dadlandırıcılar', 'şəkər'], ['myths', 'nutrition', 'drinks']);
  if (/seker/.test(titleKey)) return profile('Qidalanma', ['şəkər', 'iştaha', 'çəki', 'enerji düşməsi', 'insulin'], ['nutrition', 'weight']);
  if (/sokolad/.test(titleKey)) return profile('Qidalanma', ['şokolad', 'kakao', 'porsiya', 'şəkər', 'balans'], ['nutrition']);
  if (/suretli yemek|yavas yemek/.test(titleKey)) return profile('Qidalanma', ['yemək sürəti', 'toxluq', 'porsiya', 'həzm', 'diqqətli yemək'], ['nutrition', 'weight']);
  if (/seher yemeyi/.test(titleKey)) return profile('Qidalanma', ['səhər yeməyi', 'iştaha', 'enerji', 'rutin', 'fərdi ehtiyac'], ['nutrition', 'energy', 'myths'], true, 0.85);
  if (/dietik/.test(titleKey)) return profile('Qidalanma', ['dietik məhsullar', 'etiket oxuma', 'marketinq', 'kalori', 'tərkib'], ['nutrition', 'myths'], true, 0.88);
  if (/saglam qidalanmani/.test(titleKey)) return profile('Qidalanma', ['qidalanma planı', 'rutin', 'balans', 'alış-veriş', 'sadə seçimlər'], ['nutrition'], true, 0.82);
  if (/saglam (heyat|yasamaq)/.test(titleKey)) return needsReviewProfile('Qidalanma', ['balans', 'gündəlik seçimlər', 'davamlılıq', 'yuxu', 'qidalanma'], ['nutrition', 'energy']);
  if (/sirniyyat|fast food/.test(titleKey)) return profile('Qidalanma', ['şirniyyat', 'fast food', 'porsiya', 'şəkər', 'duz'], ['nutrition', 'weight']);
  if (/sud mehsullari/.test(titleKey)) return profile('Qidalanma', ['süd məhsulları', 'laktoza', 'protein', 'kalsium', 'dözümlülük'], ['nutrition']);
  if (/qacmaq|yerimek/.test(titleKey)) return profile('İdman və hərəkət', ['qaçış', 'gəzinti', 'oynaqlar', 'kardio', 'başlanğıc'], ['sport', 'weight'], true, 0.88);
  if (/yuxu/.test(titleKey)) return profile('Enerji və bərpa', ['yuxu', 'bərpa', 'performans', 'hormonlar', 'iştaha'], ['energy'], true, 0.86);
  if (/kofein/.test(titleKey)) return profile('Enerji və bərpa', ['kofein', 'yuxu', 'tolerantlıq', 'enerji', 'doza'], ['energy', 'drinks']);
  if (/soyuq dus|isti dus/.test(titleKey)) return profile('Enerji və bərpa', ['soyuq duş', 'isti duş', 'bərpa', 'rahatlama', 'yuxu'], ['energy']);
  if (/testosteron|hormon/.test(titleKey)) return profile('Enerji və bərpa', ['testosteron', 'hormon', 'məşq', 'yuxu', 'qidalanma'], ['energy', 'sport']);
  if (/qazli su|qazsiz su|adi su/.test(titleKey)) return profile('Su və gündəlik içkilər', ['qazlı su', 'qazsız su', 'hidratasiya', 'həzm', 'diş minası'], ['drinks']);
  if (/su icmeli|ne qeder su/.test(titleKey)) return profile('Su və gündəlik içkilər', ['su ehtiyacı', 'hidratasiya', 'aktivlik', 'hava', 'gündəlik norma'], ['drinks', 'energy'], true, 0.84);
  if (/enerji icki|coca cola/.test(titleKey)) return profile('Su və gündəlik içkilər', ['enerji içkisi', 'Coca-Cola', 'kofein', 'şəkər', 'porsiya'], ['drinks', 'myths']);
  if (/qehve/.test(titleKey)) return profile('Su və gündəlik içkilər', ['qəhvə', 'kofein', 'yuxu', 'fokus', 'vaxtlama'], ['drinks', 'energy'], true, 0.82);
  if (/boy (artir|uzat)/.test(titleKey)) return profile('Sağlamlıq mifləri', ['boy artımı', 'genetika', 'duruş', 'böyümə zonaları', 'yanlış vəd'], ['myths']);
  if (/detoks/.test(titleKey)) return profile('Sağlamlıq mifləri', ['detoks', 'qaraciyər', 'marketinq', 'toksin', 'mif'], ['myths'], true, 0.82);
  if (/limonlu su|sirkeli/.test(titleKey)) return profile('Sağlamlıq mifləri', ['sirkəli su', 'limonlu su', 'risk', 'mədə turşuluğu', 'səhər ritualı'], ['myths', 'drinks']);
  if (/cheat/.test(titleKey)) return profile('Çəki idarəetməsi', ['cheat meal', 'cheat day', 'kalori', 'pəhriz', 'planlı istisna'], ['weight']);
  if (/araliqli oruc/.test(titleKey)) return profile('Çəki idarəetməsi', ['aralıqlı oruc', 'pəhriz', 'iştaha', 'aclıq pəncərəsi', 'enerji'], ['weight', 'energy']);
  if (/ofis|qarin|kilo/.test(titleKey)) return profile('Çəki idarəetməsi', ['ofis qarını', 'az hərəkət', 'kalori', 'stress', 'oturaq iş'], ['weight']);
  if (/ariq|ceki/.test(titleKey)) return profile('Çəki idarəetməsi', ['arıqlamaq', 'kalori', 'porsiya', 'real hədəf', 'davamlılıq'], ['weight', 'nutrition'], true, 0.86);

  if (/detoks|boy artir|limonlu su|sirkeli|sekersiz|terlemek ariqlamaq/.test(key)) {
    if (/sekersiz/.test(key)) return profile('Sağlamlıq mifləri', ['şəkərsiz məhsullar', 'etiket oxuma', 'içkilər', 'süni dadlandırıcılar', 'şəkər'], ['myths', 'nutrition', 'drinks']);
    if (/limonlu|sirkeli/.test(key)) return profile('Sağlamlıq mifləri', ['sirkəli su', 'limonlu su', 'risk', 'mədə turşuluğu', 'səhər ritualı'], ['myths', 'drinks']);
    if (/terlemek/.test(key)) return profile('İdman və hərəkət', ['tərləmə', 'su itkisi', 'kalori', 'məşq', 'arıqlamaq mifi'], ['sport', 'myths', 'weight']);
    if (/boy artir/.test(key)) return profile('Sağlamlıq mifləri', ['boy artımı', 'genetika', 'duruş', 'böyümə zonaları', 'yanlış vəd'], ['myths']);
    return profile('Sağlamlıq mifləri', ['detoks', 'qaraciyər', 'marketinq', 'toksin', 'mif'], ['myths'], true, 0.82);
  }

  if (/qazli su|qazsiz su|su icmeli|enerji icki|coca cola|qehve/.test(key)) {
    if (/qehve/.test(key)) return profile('Su və gündəlik içkilər', ['qəhvə', 'kofein', 'yuxu', 'fokus', 'vaxtlama'], ['drinks', 'energy'], true, 0.82);
    if (/su icmeli/.test(key)) return profile('Su və gündəlik içkilər', ['su ehtiyacı', 'hidratasiya', 'aktivlik', 'hava', 'gündəlik norma'], ['drinks', 'energy'], true, 0.84);
    if (/qazli su|qazsiz su/.test(key)) return profile('Su və gündəlik içkilər', ['qazlı su', 'qazsız su', 'hidratasiya', 'həzm', 'diş minası'], ['drinks']);
    return profile('Su və gündəlik içkilər', ['enerji içkisi', 'Coca-Cola', 'kofein', 'şəkər', 'porsiya'], ['drinks', 'myths']);
  }

  if (/ariq|ceki|kilo|qarin|cheat|araliqli oruc/.test(key)) {
    if (/baslamaq/.test(key)) return profile('Çəki idarəetməsi', ['arıqlamaq', 'başlanğıc', 'real hədəf', 'kalori', 'pəhriz'], ['weight'], true, 0.9);
    if (/sevdiyin/.test(key)) return profile('Çəki idarəetməsi', ['arıqlamaq', 'kalori', 'porsiya', 'sevimli yeməklər', 'davamlılıq'], ['weight', 'nutrition'], true, 0.9);
    if (/cheat/.test(key)) return profile('Çəki idarəetməsi', ['cheat meal', 'cheat day', 'kalori', 'pəhriz', 'planlı istisna'], ['weight']);
    if (/araliqli/.test(key)) return profile('Çəki idarəetməsi', ['aralıqlı oruc', 'pəhriz', 'iştaha', 'aclıq pəncərəsi', 'enerji'], ['weight', 'energy']);
    if (/qarin/.test(key)) return profile('Çəki idarəetməsi', ['ofis qarını', 'az hərəkət', 'kalori', 'stress', 'oturaq iş'], ['weight']);
    return profile('Çəki idarəetməsi', ['artıq çəki', 'enerji', 'yuxu', 'oynaq yükü', 'hərəkət'], ['weight', 'energy']);
  }

  if (/qac|yerim|mesq|idman/.test(key)) return profile('İdman və hərəkət', ['qaçış', 'gəzinti', 'oynaqlar', 'kardio', 'başlanğıc'], ['sport', 'weight'], true, 0.88);

  if (/yuxu|kofein|testosteron|hormon|dus|enerjili/.test(key)) {
    if (/yuxu/.test(key)) return profile('Enerji və bərpa', ['yuxu', 'bərpa', 'performans', 'hormonlar', 'iştaha'], ['energy'], true, 0.86);
    if (/kofein/.test(key)) return profile('Enerji və bərpa', ['kofein', 'yuxu', 'tolerantlıq', 'enerji', 'doza'], ['energy', 'drinks']);
    if (/testosteron|hormon/.test(key)) return profile('Enerji və bərpa', ['testosteron', 'hormon', 'məşq', 'yuxu', 'qidalanma'], ['energy', 'sport']);
    if (/dus/.test(key)) return profile('Enerji və bərpa', ['soyuq duş', 'isti duş', 'bərpa', 'rahatlama', 'yuxu'], ['energy']);
    return profile('Enerji və bərpa', ['enerji səviyyəsi', 'yuxu', 'gündəlik ritm', 'qidalanma', 'hərəkət'], ['energy'], true, 0.78);
  }

  if (/seher yemeyi/.test(key)) return profile('Qidalanma', ['səhər yeməyi', 'iştaha', 'enerji', 'rutin', 'fərdi ehtiyac'], ['nutrition', 'energy', 'myths'], true, 0.85);
  if (/dietik/.test(key)) return profile('Qidalanma', ['dietik məhsullar', 'etiket oxuma', 'marketinq', 'kalori', 'tərkib'], ['nutrition', 'myths'], true, 0.88);
  if (/saglam qidalanmani/.test(key)) return profile('Qidalanma', ['qidalanma planı', 'rutin', 'balans', 'alış-veriş', 'sadə seçimlər'], ['nutrition'], true, 0.82);
  if (/saglam heyat/.test(key)) return needsReviewProfile('Qidalanma', ['balans', 'gündəlik seçimlər', 'davamlılıq', 'yuxu', 'qidalanma'], ['nutrition', 'energy']);
  if (/sirniyyat|fast food/.test(key)) return profile('Qidalanma', ['şirniyyat', 'fast food', 'porsiya', 'şəkər', 'duz'], ['nutrition', 'weight']);
  if (/seker/.test(key)) return profile('Qidalanma', ['şəkər', 'iştaha', 'çəki', 'enerji düşməsi', 'insulin'], ['nutrition', 'weight']);
  if (/sokolad/.test(key)) return profile('Qidalanma', ['şokolad', 'kakao', 'porsiya', 'şəkər', 'balans'], ['nutrition']);
  if (/sud mehsullari/.test(key)) return profile('Qidalanma', ['süd məhsulları', 'laktoza', 'protein', 'kalsium', 'dözümlülük'], ['nutrition']);
  if (/suretli yemek/.test(key)) return profile('Qidalanma', ['yemək sürəti', 'toxluq', 'porsiya', 'həzm', 'diqqətli yemək'], ['nutrition']);
  return needsReviewProfile('Qidalanma', ['qidalanma']);
}

function getSavedClassification(title = '') {
  return CLASSIFICATION_CACHE[classificationKey(title)] || CLASSIFICATION_CACHE[normalize(title)] || null;
}

function topicProfile(title = '', summary = '', series = '1fq') {
  const saved = getSavedClassification(title);
  if (saved) return sanitizeClassification(saved, 'saved-cache', series);
  return sanitizeClassification(ruleBasedClassification(title, summary, series), 'rules', series);
}

function parseRss(xml) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(match => match[1]);
  return items.map((block, index) => {
    const title = stripHtml(getTag(block, 'title'));
    const description = getTag(block, 'content:encoded') || getTag(block, 'description');
    const publishedRaw = getTag(block, 'pubDate');
    const publishedDate = publishedRaw ? new Date(publishedRaw) : null;
    const guid = stripHtml(getTag(block, 'guid')) || `episode-${index + 1}`;
    const summary = cleanDescription(description);
    const series = classifySeries(title);
    const topic = topicProfile(title, summary, series);
    return {
      id: guid,
      title,
      summary,
      published: publishedDate && !Number.isNaN(publishedDate.valueOf()) ? publishedDate.toISOString() : '',
      duration: stripHtml(getTag(block, 'itunes:duration')),
      season: stripHtml(getTag(block, 'itunes:season')) || null,
      episode: stripHtml(getTag(block, 'itunes:episode')) || null,
      audioUrl: getAttribute(block, 'enclosure', 'url'),
      webpageUrl: stripHtml(getTag(block, 'link')),
      imageUrl: getAttribute(block, 'itunes:image', 'href'),
      series,
      category: topic.category,
      tags: topic.tags,
      goals: topic.goals,
      startHere: topic.startHere,
      needsReview: topic.needsReview,
      classificationConfidence: topic.confidence,
      classificationSource: topic.classificationSource,
      featured: Boolean(topic.startHere && !topic.needsReview),
      linktreeUrl: LINKTREE_URL
    };
  });
}

function removeSeriesSuffix(value = '') {
  return String(value)
    .replace(/\s*[|—–-]\s*(1\s*Fincan\s*Qəhvə|1\s*Fincan\s*Qehve|Ordan\/Burdan)\s*$/i, '')
    .trim();
}

function titleSimilarity(a, b) {
  const left = new Set(normalize(removeSeriesSuffix(a)).split(' ').filter(Boolean));
  const right = new Set(normalize(removeSeriesSuffix(b)).split(' ').filter(Boolean));
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  left.forEach(token => { if (right.has(token)) intersection += 1; });
  return intersection / Math.max(left.size, right.size);
}

function bestPlatformMatch(episode, candidates, titleField, dateField) {
  const exact = candidates.find(item => normalize(item[titleField]) === normalize(episode.title));
  if (exact) return exact;
  let best = null;
  let bestScore = 0;
  for (const candidate of candidates) {
    let score = titleSimilarity(episode.title, candidate[titleField]);
    if (episode.published && candidate[dateField]) {
      const days = Math.abs(new Date(episode.published) - new Date(candidate[dateField])) / 86400000;
      if (days < 2) score += 0.28;
      else if (days < 8) score += 0.12;
    }
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return bestScore >= 0.58 ? best : null;
}

async function fetchAppleEpisodes() {
  try {
    const url = `https://itunes.apple.com/lookup?id=${APPLE_COLLECTION_ID}&entity=podcastEpisode&limit=200`;
    const response = await fetch(url, { headers: { 'User-Agent': 'PodcastByTuralWebsite/1.0' } });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.results || []).filter(item => item.wrapperType === 'podcastEpisode' || item.kind === 'podcast-episode');
  } catch {
    return [];
  }
}

async function fetchSpotifyEpisodes() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return [];
  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    if (!tokenResponse.ok) return [];
    const { access_token: accessToken } = await tokenResponse.json();
    const all = [];
    let next = `https://api.spotify.com/v1/shows/${SPOTIFY_SHOW_ID}/episodes?market=AZ&limit=50`;
    while (next && all.length < 250) {
      const response = await fetch(next, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!response.ok) break;
      const data = await response.json();
      all.push(...(data.items || []));
      next = data.next;
    }
    return all;
  } catch {
    return [];
  }
}

function extractResponseText(data = {}) {
  if (typeof data.output_text === 'string') return data.output_text;
  const chunks = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === 'string') chunks.push(content.text);
    }
  }
  return chunks.join('\n').trim();
}

async function classifyWithAi(episodes) {
  if (process.env.ENABLE_AI_CLASSIFICATION !== 'true' || !process.env.OPENAI_API_KEY) return new Map();
  const candidates = episodes
    .filter(episode => episode.series === '1fq' && episode.needsReview && episode.classificationSource !== 'saved-cache')
    .slice(0, 8);
  if (!candidates.length) return new Map();

  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      episodes: {
        type: 'array',
        maxItems: 8,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            id: { type: 'string' },
            category: {
              type: 'string',
              enum: [...ONE_FINCAN_CATEGORIES, '']
            },
            tags: {
              type: 'array',
              maxItems: MAX_TAGS,
              items: { type: 'string' }
            },
            goals: {
              type: 'array',
              maxItems: 3,
              items: {
                type: 'string',
                enum: ['weight', 'nutrition', 'energy', 'sport', 'drinks', 'myths']
              }
            },
            startHere: { type: 'boolean' },
            needsReview: { type: 'boolean' },
            confidence: { type: 'number', minimum: 0, maximum: 1 }
          },
          required: ['id', 'category', 'tags', 'goals', 'startHere', 'needsReview', 'confidence']
        }
      }
    },
    required: ['episodes']
  };

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CLASSIFIER_MODEL || 'gpt-4.1-mini',
        instructions: [
          'You classify Azerbaijani podcast episodes for the 1 Fincan Qəhvə archive.',
          'Use only these categories: Qidalanma, Çəki idarəetməsi, İdman və hərəkət, Enerji və bərpa, Su və gündəlik içkilər, Sağlamlıq mifləri.',
          'Return one category only. If the topic does not fit, use an empty category and needsReview true.',
          'Return at most five specific Azerbaijani tags. Avoid generic tags such as sağlamlıq, həyat, məsləhət, bədən.',
          'Do not invent facts beyond the title and summary.'
        ].join('\n'),
        input: JSON.stringify(candidates.map(episode => ({
          id: episode.id,
          title: removeSeriesSuffix(episode.title),
          summary: episode.summary,
          series: episode.series
        }))),
        text: {
          format: {
            type: 'json_schema',
            name: 'episode_classifications',
            strict: true,
            schema
          }
        },
        store: false
      })
    });
    if (!response.ok) return new Map();
    const text = extractResponseText(await response.json());
    const parsed = JSON.parse(text);
    const byId = new Map();
    for (const item of parsed.episodes || []) {
      const sanitized = sanitizeClassification({
        ...item,
        category: item.category || null
      }, 'server-ai', '1fq');
      byId.set(item.id, sanitized);
    }
    return byId;
  } catch {
    return new Map();
  }
}

async function applyServerAiClassifications(episodes) {
  const aiClassifications = await classifyWithAi(episodes);
  if (!aiClassifications.size) return episodes;
  return episodes.map(episode => {
    const ai = aiClassifications.get(episode.id);
    if (!ai) return episode;
    return {
      ...episode,
      category: ai.category,
      tags: ai.tags,
      goals: ai.goals,
      startHere: ai.startHere,
      featured: Boolean(ai.startHere && !ai.needsReview),
      needsReview: ai.needsReview,
      classificationConfidence: ai.confidence,
      classificationSource: ai.classificationSource
    };
  });
}

module.exports = async function handler(req, res) {
  try {
    const feedResponse = await fetch(FEED_URL, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml',
        'User-Agent': 'PodcastByTuralWebsite/1.0'
      }
    });
    if (!feedResponse.ok) throw new Error(`RSS request failed: ${feedResponse.status}`);
    const xml = await feedResponse.text();
    const episodes = await applyServerAiClassifications(parseRss(xml));

    const [appleEpisodes, spotifyEpisodes] = await Promise.all([
      fetchAppleEpisodes(),
      fetchSpotifyEpisodes()
    ]);

    const enriched = episodes.map(episode => {
      const apple = bestPlatformMatch(episode, appleEpisodes, 'trackName', 'releaseDate');
      const spotify = bestPlatformMatch(episode, spotifyEpisodes, 'name', 'release_date');
      const knownSpotify = knownSpotifyLinks.get(normalize(episode.title)) || knownSpotifyLinks.get(normalize(removeSeriesSuffix(episode.title)));
      const spotifyUrl = spotify?.external_urls?.spotify || knownSpotify || `https://open.spotify.com/search/${encodeURIComponent(removeSeriesSuffix(episode.title))}`;
      const appleUrl = apple?.trackViewUrl || `https://podcasts.apple.com/us/search?term=${encodeURIComponent(removeSeriesSuffix(episode.title))}`;
      return {
        ...episode,
        spotifyUrl,
        spotifyDirect: Boolean(spotify?.external_urls?.spotify || knownSpotify),
        appleUrl,
        appleDirect: Boolean(apple?.trackViewUrl)
      };
    });

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({
      updatedAt: new Date().toISOString(),
      count: enriched.length,
      source: 'Acast RSS',
      rssUrl: FEED_URL,
      spotifyAutomaticMatching: spotifyEpisodes.length > 0,
      classification: {
        oneFincanCategories: [...ONE_FINCAN_CATEGORIES],
        ordanBurdanCategories: [...ORDAN_BURDAN_CATEGORIES],
        cacheVersion: savedClassifications.version,
        cacheUpdatedAt: savedClassifications.updatedAt,
        serverAiEnabled: process.env.ENABLE_AI_CLASSIFICATION === 'true' && Boolean(process.env.OPENAI_API_KEY)
      },
      episodes: enriched
    });
  } catch (error) {
    res.status(502).json({
      error: 'Buraxılışlar hazırda yenilənə bilmədi.',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

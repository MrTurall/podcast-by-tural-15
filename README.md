# Podcast by Tural — Improved Launch Candidate

Bu paket Podcast by Tural saytının tam inteqrasiya olunmuş və istifadə rahatlığı artırılmış launch versiyasıdır.

## Daxildir

- Təmiz logo istifadəsi: cover/logo üzərində əlavə mətn, badge və izah yoxdur.
- Ana səhifədə Spotify, Apple Podcasts, Instagram və Linktree qısa keçidləri.
- RSS əsaslı buraxılış arxivi: `https://feeds.acast.com/public/shows/648ad5d0f0f1d400111a9ec9`
- 1 Fincan Qəhvə üçün kateqoriya, tag və məqsəd əsaslı filter sistemi.
- Yenilənmiş 1 Fincan Qəhvə copy-si: daha future-facing, daha praktik, “qorxu/qadağa” dili olmadan.
- Genişləndirilmiş Ordan/Burdan səhifəsi: gələcək mövzu xətti, interaktiv mövzu seçimi və başlanğıc epizodları.
- Haqqında səhifəsi: şəxsi bio yox, platformanın ideyası və yanaşması.
- Məxfilik səhifəsi: xarici platformalar, RSS, müəllif hüquqları və sağlamlıq məzmunu qeydi.
- 404 səhifəsi, manifest, sitemap, robots və Vercel konfiqurasiyası.
- Klaviatura ilə naviqasiya üçün aydın focus vəziyyətləri və daha səliqəli mobil menyu davranışı.
- Buraxılış arxivində axtarış/filter seçimləri URL-də saxlanır, paylaşmaq və geri qayıtmaq daha rahatdır.

## Fayl strukturu

- `index.html` — ana səhifə
- `episodes.html` — bütün buraxılışların süzülən arxivi
- `shows/1-fincan.html` — 1 Fincan Qəhvə səhifəsi
- `shows/ordan-burdan.html` — Ordan/Burdan səhifəsi
- `about.html` — Haqqında səhifəsi
- `privacy.html` — Məxfilik səhifəsi
- `404.html` — səhifə tapılmadı
- `assets/styles.css` — əsas dizayn sistemi
- `assets/script.js` — menyu, animasiya, filter, tag və render məntiqi
- `assets/episodes-fallback.js` — preview və API işləmədiyi halda ehtiyat arxiv
- `api/episodes.js` — Vercel serverless endpoint: Acast RSS + Apple/Spotify uyğunlaşdırma

## Vercel-də yerləşdirmə

1. Bu qovluğu GitHub repository-yə yüklə.
2. Vercel-də həmin repository-ni import et.
3. Build command boş qala bilər.
4. Output directory project root olaraq qalsın.
5. Deploy et.

Sayt Vercel-də işləyəndə `/api/episodes` endpoint-i RSS-dən canlı məlumatları oxuyacaq.

## Spotify avtomatik matching

Spotify buraxılışlarını tam avtomatik uyğunlaşdırmaq üçün Vercel environment variables bölməsinə bunları əlavə etmək lazımdır:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

Bu məlumatlar əlavə edilməsə də sayt işləyəcək. Sadəcə təsdiqlənməmiş buraxılışlarda Spotify düyməsi həmin başlıq üzrə Spotify axtarışını açacaq.

## Epizod kateqoriyalaşdırması

Buraxılış adı, təsviri, tarix, müddət, audio və cover məlumatı Acast RSS-dən oxunur. Kateqoriya və tag-lər isə server tərəfində yoxlanılır:

- Yalnız bir əsas kateqoriya qaytarılır.
- 1 Fincan Qəhvə üçün yalnız təsdiqlənmiş kateqoriyalar istifadə olunur: `Qidalanma`, `Çəki idarəetməsi`, `İdman və hərəkət`, `Enerji və bərpa`, `Su və gündəlik içkilər`, `Sağlamlıq mifləri`.
- Ordan/Burdan epizodları 1 Fincan kateqoriyalarına zorla salınmır; onlar `Təhlükəsizlik`, `Gündəlik vərdişlər` və `İntizam və motivasiya` kimi ayrı mövzu etiketləri ilə saxlanır.
- Hər epizod üçün maksimum beş konkret Azərbaycan dilində tag qaytarılır.
- Uyğun kateqoriya aydın deyilsə, epizod `needsReview: true` kimi işarələnir.
- Mövcud təsnifatlar `api/episode-classifications.json` faylında saxlanır ki, ziyarətçi saytı açanda AI hər dəfə çağırılmasın.

Server-side AI köməyi yalnız Vercel Environment Variables ilə aktivləşir:

- `OPENAI_API_KEY`
- `ENABLE_AI_CLASSIFICATION=true`
- `OPENAI_CLASSIFIER_MODEL` (istəyə bağlı, default: `gpt-4.1-mini`)

Bu açarlar brauzerə göndərilmir. AI yalnız `/api/episodes` Vercel API route-u daxilində, saxlanmış cache-də olmayan və review tələb edən yeni epizodlar üçün istifadə olunur.

## Əsas linklər

- Spotify: https://open.spotify.com/show/1JCxge7voyK9KvW0pWOJLv
- Apple Podcasts: https://podcasts.apple.com/us/podcast/podcast-by-mr-tural/id1692736134
- RSS: https://feeds.acast.com/public/shows/648ad5d0f0f1d400111a9ec9
- Linktree: https://linktr.ee/mr.turalll
- Instagram: https://www.instagram.com/podcastbytural

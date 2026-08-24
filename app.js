// SHOT Marketing Agency - Master JavaScript Engine (Updated with High-End Admin Table Rows)

import { initialData } from './data.js';
import confetti from 'canvas-confetti';
import { supabase } from './supabaseClient.js';
import logoImg from './logo.png';

// --- State Management ---
let appData = JSON.parse(JSON.stringify(initialData)); // بيانات مبدئية لحد ما تتحمل من Supabase
let lang = localStorage.getItem('shot_lang') || 'ar'; // Default Arabic
let theme = localStorage.getItem('shot_theme') || 'dark'; // Default Dark

// Page Router State
let currentView = getInitialView(); // 'home' | 'about' | 'works' | 'clients' | 'plans' | 'contacts' | 'admin'

let currentFilter = 'all';
let isMobileNavOpen = false;

// Admin Security & Dashboard State
let isAdminAuthenticated = false;
let activeAdminTab = 'overview';
let isAdminMobileNavOpen = false;
let logoClickCount = 0;
let logoClickTimer = null;

// --- Supabase: Works Data Layer ---
async function loadWorksFromSupabase() {
  const { data, error } = await supabase.from('works').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('❌ فشل تحميل الأعمال:', error.message);
    return [];
  }
  return data.map(w => ({
    id: w.id,
    category: w.category,
    titleAr: w.title_ar,
    titleEn: w.title_en,
    clientAr: w.client_ar,
    clientEn: w.client_en,
    image: w.image,
    videoUrl: w.video_url,
    summaryAr: w.summary_ar,
    summaryEn: w.summary_en,
    metricsAr: w.metrics_ar,
    metricsEn: w.metrics_en,
    detailsAr: w.details_ar,
    detailsEn: w.details_en,
  }));
}

function formatSupabaseTimestamp(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().replace('T', ' ').slice(0, 16);
}

async function loadTestimonialsFromSupabase() {
  const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('❌ فشل تحميل التقييمات:', error.message);
    return [];
  }
  return data.map(t => ({
    id: t.id,
    nameAr: t.name_ar,
    nameEn: t.name_en,
    roleAr: t.role_ar,
    roleEn: t.role_en,
    quoteAr: t.quote_ar,
    quoteEn: t.quote_en,
    rating: t.rating,
  }));
}

async function loadPlansFromSupabase() {
  const { data, error } = await supabase.from('plans').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('❌ فشل تحميل الباقات:', error.message);
    return [];
  }
  return data.map(p => ({
    id: p.id,
    nameAr: p.name_ar,
    nameEn: p.name_en,
    popular: p.popular,
    featuresAr: Array.isArray(p.features_ar) ? p.features_ar : [],
    featuresEn: Array.isArray(p.features_en) ? p.features_en : [],
  }));
}

async function loadServicesFromSupabase() {
  const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('❌ فشل تحميل خدمات About:', error.message);
    return [];
  }
  return data.map(s => ({
    id: s.id,
    icon: s.icon || '',
    titleAr: s.title_ar,
    titleEn: s.title_en,
    descAr: s.desc_ar ?? '',
    descEn: s.desc_en ?? '',
    featuresAr: Array.isArray(s.features_ar) ? s.features_ar : [],
    featuresEn: Array.isArray(s.features_en) ? s.features_en : [],
  }));
}

async function loadMessagesFromSupabase() {
  const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('❌ فشل تحميل الرسائل:', error.message);
    return [];
  }
  return data.map(m => ({
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone,
    service: m.service,
    budget: m.budget,
    message: m.message,
    date: formatSupabaseTimestamp(m.created_at),
    read: m.read || false,
  }));
}

async function loadSettingsFromSupabase() {
  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
  if (error && error.code !== 'PGRST116') {
    console.error('❌ فشل تحميل الإعدادات:', error.message);
    return null;
  }
  if (!data) {
    return { ...appData.settings };
  }
  return {
    contactEmail: data.contact_email ?? appData.settings.contactEmail,
    contactPhone: data.contact_phone ?? appData.settings.contactPhone,
    whatsapp: data.whatsapp ?? appData.settings.whatsapp,
    facebook: data.facebook ?? appData.settings.facebook,
    instagram: data.instagram ?? appData.settings.instagram,
    officeAddressAr: data.office_address_ar ?? appData.settings.officeAddressAr,
    officeAddressEn: data.office_address_en ?? appData.settings.officeAddressEn,
  };
}

async function isAdminSessionActive() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Admin session check failed:', error.message);
    return false;
  }
  return !!session;
}

async function requireAdminSession() {
  const sessionActive = await isAdminSessionActive();
  if (!sessionActive) {
    throw new Error('Admin authentication required for this action.');
  }
}

async function loadHeroContentFromSupabase() {
  const { data, error } = await supabase.from('hero_content').select('*').eq('id', 1).single();
  if (error && error.code !== 'PGRST116') {
    console.error('❌ فشل تحميل محتوى الواجهة الرئيسية:', error.message);
    return null;
  }
  if (!data) {
    return {
      titleAr: appData.hero.ar.title,
      subtitleAr: appData.hero.ar.subtitle,
      titleEn: appData.hero.en.title,
      subtitleEn: appData.hero.en.subtitle,
    };
  }
  return {
    titleAr: data.title_ar ?? appData.hero.ar.title,
    subtitleAr: data.subtitle_ar ?? appData.hero.ar.subtitle,
    titleEn: data.title_en ?? appData.hero.en.title,
    subtitleEn: data.subtitle_en ?? appData.hero.en.subtitle,
  };
}

async function loadAboutContentFromSupabase() {
  const { data, error } = await supabase.from('about_content').select('*').eq('id', 1).single();
  if (error && error.code !== 'PGRST116') {
    console.error('❌ فشل تحميل محتوى صفحة About:', error.message);
    return null;
  }
  if (!data) {
    return {
      tagAr: appData.about.ar.tag,
      titleAr: appData.about.ar.title,
      descriptionAr: appData.about.ar.description,
      tagEn: appData.about.en.tag,
      titleEn: appData.about.en.title,
      descriptionEn: appData.about.en.description,
    };
  }
  return {
    tagAr: data.tag_ar ?? appData.about.ar.tag,
    titleAr: data.title_ar ?? appData.about.ar.title,
    descriptionAr: data.description_ar ?? appData.about.ar.description,
    tagEn: data.tag_en ?? appData.about.en.tag,
    titleEn: data.title_en ?? appData.about.en.title,
    descriptionEn: data.description_en ?? appData.about.en.description,
  };
}

function triggerSaveEffect() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch (e) {
    console.log("Confetti effect unavailable", e);
  }
}

// --- IndexedDB Media Storage (for large video/image files) ---
const IDB_NAME = 'shot_media_db';
const IDB_STORE = 'media';
const mediaUrlCache = new Map();
let mediaCacheReady = false;

function openMediaDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(key, blob) {
  const db = await openMediaDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet(key) {
  const db = await openMediaDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

function isIdbRef(url) {
  return typeof url === 'string' && url.startsWith('idb:');
}

function idbKeyFromRef(ref) {
  return ref.replace(/^idb:/, '');
}

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',');
  const mime = (header.match(/:(.*?);/) || [])[1] || 'application/octet-stream';
  const binary = atob(base64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function storeMediaBlob(blobOrFile) {
  const key = `media-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  await idbPut(key, blobOrFile);
  const ref = `idb:${key}`;
  const blobUrl = URL.createObjectURL(blobOrFile instanceof Blob ? blobOrFile : blobOrFile);
  mediaUrlCache.set(ref, blobUrl);
  return ref;
}

async function cacheMediaRef(ref) {
  if (!isIdbRef(ref)) return ref;
  if (mediaUrlCache.has(ref)) return mediaUrlCache.get(ref);
  const blob = await idbGet(idbKeyFromRef(ref));
  if (blob) {
    const url = URL.createObjectURL(blob);
    mediaUrlCache.set(ref, url);
    return url;
  }
  return '';
}

function resolveMediaUrl(url) {
  if (!url) return url;
  if (isIdbRef(url)) return mediaUrlCache.get(url) || '';
  return url;
}

function getMediaSrc(url) {
  if (!url) return '';
  const resolved = resolveMediaUrl(url);
  if (resolved) return resolved;
  return isIdbRef(url) ? '' : url;
}

async function hydrateIdbMedia() {
  const elements = document.querySelectorAll('[data-media-ref]');
  await Promise.all([...elements].map(async (el) => {
    const ref = el.dataset.mediaRef;
    if (!ref || !isIdbRef(ref)) return;
    const blobUrl = await cacheMediaRef(ref);
    if (!blobUrl) return;
    if (el.tagName === 'IMG' || el.tagName === 'VIDEO') el.src = blobUrl;
  }));
}

function collectMediaRefs(data) {
  const refs = new Set();
  (data.works || []).forEach(w => {
    if (isIdbRef(w.videoUrl)) refs.add(w.videoUrl);
    if (isIdbRef(w.image)) refs.add(w.image);
  });
  return [...refs];
}

async function migrateDataUrlToIdb(url) {
  if (!url || !url.startsWith('data:')) return url;
  return storeMediaBlob(dataUrlToBlob(url));
}

async function migrateWorksMediaToIdb() {
  let changed = false;
  for (const work of appData.works) {
    if (work.videoUrl?.startsWith('data:')) {
      work.videoUrl = await migrateDataUrlToIdb(work.videoUrl);
      changed = true;
    }
    if (work.image?.startsWith('data:') && work.image.length > 100000) {
      work.image = await migrateDataUrlToIdb(work.image);
      changed = true;
    }
  }
  return changed;
}

async function initMediaCache() {
  try {
    await migrateWorksMediaToIdb();
    const refs = collectMediaRefs(appData);
    await Promise.all(refs.map(ref => cacheMediaRef(ref)));
    mediaCacheReady = true;
  } catch (e) {
    console.error('Media cache init failed', e);
    mediaCacheReady = true;
  }
}

function getYouTubeVideoId(url) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
}

function getYouTubeThumbnail(url) {
  const id = getYouTubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
}

async function getVimeoThumbnail(url) {
  const match = url.match(/vimeo\.com\/(\d+)/);
  if (!match) return null;
  try {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    return data.thumbnail_url || null;
  } catch {
    return null;
  }
}

function generateVideoThumbnail(srcOrBlob) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto'; // تغيير لضمان تحميل الفريمات
    video.crossOrigin = 'anonymous';
    
    let objUrl = null;
    if (srcOrBlob instanceof Blob || srcOrBlob instanceof File) {
      objUrl = URL.createObjectURL(srcOrBlob);
      video.src = objUrl;
    } else {
      video.src = srcOrBlob;
    }

    video.onloadedmetadata = () => {
      // بنحاول نروح للثانية 2 أو 3 عشان نتفادى السواد في أول الفيديو
      // لو الفيديو قصير جداً بناخد منتصف الفيديو
      let seekTo = 2.5; 
      if (video.duration < seekTo) seekTo = video.duration / 2;
      video.currentTime = seekTo;
    };

    video.onseeked = () => {
      // إضافة تأخير بسيط جداً للتأكد من رندر الفريم
      setTimeout(() => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // التأكد من أن الصورة مش سواد كامل (اختياري بس بيحسن النتائج)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        } finally {
          if (objUrl) URL.revokeObjectURL(objUrl);
        }
      }, 150); 
    };

    video.onerror = () => {
      if (objUrl) URL.revokeObjectURL(objUrl);
      reject(new Error('Video thumbnail failed'));
    };
  });
}

async function getAutoThumbnailForVideo(videoUrl) {
  if (!videoUrl) return null;
  const yt = getYouTubeThumbnail(videoUrl);
  if (yt) return yt;
  const vimeo = await getVimeoThumbnail(videoUrl);
  if (vimeo) return vimeo;
  
  if (isIdbRef(videoUrl)) {
    const blobUrl = resolveMediaUrl(videoUrl) || await cacheMediaRef(videoUrl);
    if (blobUrl) {
      try {
        const res = await fetch(blobUrl);
        const blob = await res.blob();
        return generateVideoThumbnail(blob);
      } catch { /* ignore */ }
    }
  }
  
  if (videoUrl.startsWith('data:video/')) {
    try {
      return generateVideoThumbnail(dataUrlToBlob(videoUrl));
    } catch { /* ignore */ }
  }

  // دعم روابط الفيديو المباشرة
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(videoUrl)) {
    try {
      return generateVideoThumbnail(videoUrl);
    } catch { /* ignore */ }
  }
  
  return null;
}

function updateAdminImagePreview(src) {
  const preview = document.getElementById('adm-w-img-preview');
  const imgInput = document.getElementById('adm-w-img');
  if (!preview || !src) return;
  const resolved = resolveMediaUrl(src) || src;
  const isAr = (localStorage.getItem('shot_lang') || 'ar') === 'ar';
  preview.innerHTML = `
    <div class="media-preview-box" style="margin-top:12px; position:relative; background:rgba(0,0,0,0.5); padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color);">
      <img src="${resolved}" alt="preview" style="width:100%; max-height:220px; object-fit:cover; border-radius:var(--radius-md); display:block;" />
      <div style="margin-top:8px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.8rem; color:var(--accent-green);">${isAr ? '✨ تم إنشاء الصورة تلقائياً من الفيديو' : '✨ Auto-generated from video'}</span>
        <button type="button" class="btn-delete-media" style="padding:6px 14px; background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.4); border-radius:var(--radius-md); font-size:0.85rem; font-weight:700; cursor:pointer;">
          ${isAr ? '🗑️ حذف الصورة فقط' : '🗑️ Remove Image Only'}
        </button>
      </div>
    </div>
  `;
  const delBtn = preview.querySelector('.btn-delete-media');
  if (delBtn) {
    delBtn.onclick = () => {
      if (imgInput) imgInput.value = '';
      preview.innerHTML = '';
    };
  }
}

async function autoFillThumbnailFromVideoUrl(videoUrl) {
  const imgInput = document.getElementById('adm-w-img');
  if (!imgInput || imgInput.value.trim()) return;
  const thumb = await getAutoThumbnailForVideo(videoUrl);
  if (!thumb) return;
  if (thumb.startsWith('data:') && thumb.length > 150000) {
    imgInput.value = await storeMediaBlob(dataUrlToBlob(thumb));
  } else {
    imgInput.value = thumb;
  }
  updateAdminImagePreview(imgInput.value);
}


function getWhatsAppUrl() {
  if (appData.settings.whatsapp) return appData.settings.whatsapp;
  const phone = (appData.settings.contactPhone || '').replace(/\D/g, '');
  return phone ? `https://wa.me/${phone}` : '#';
}

function updateWhatsAppButton() {
  const waBtn = document.querySelector('.whatsapp-float');
  if (waBtn) waBtn.href = getWhatsAppUrl();
}

function readFileAsDataURL(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };
    reader.onload = () => {
      if (onProgress) onProgress(100);
      resolve(reader.result);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function setupMediaInput({ urlInputId, fileInputId, previewId, currentValue, isVideoMode = false, onUpdate }) {
  const urlInput = document.getElementById(urlInputId);
  const fileInput = document.getElementById(fileInputId);
  const preview = document.getElementById(previewId);
  if (!preview) return;

  const updatePreview = (src, isVideo = false) => {
    if (!src) {
      preview.innerHTML = '';
      return;
    }
    const displaySrc = resolveMediaUrl(src) || src;
    const isAr = (localStorage.getItem('shot_lang') || 'ar') === 'ar';
    const deleteBtnText = isVideo 
      ? (isAr ? '🗑️ حذف الفيديو فقط' : '🗑️ Remove Video Only') 
      : (isAr ? '🗑️ حذف الصورة فقط' : '🗑️ Remove Image Only');

    if (isVideo) {
      preview.innerHTML = `
        <div class="media-preview-box" style="margin-top:12px; position:relative; background:rgba(0,0,0,0.5); padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <video src="${displaySrc}" controls style="width:100%; max-height:220px; border-radius:var(--radius-md); background:#000; display:block;"></video>
          <div style="margin-top:8px; display:flex; justify-content:flex-end;">
            <button type="button" class="btn-delete-media" style="padding:6px 14px; background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.4); border-radius:var(--radius-md); font-size:0.85rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px; transition:var(--transition);">
              ${deleteBtnText}
            </button>
          </div>
        </div>
      `;
    } else {
      preview.innerHTML = `
        <div class="media-preview-box" style="margin-top:12px; position:relative; background:rgba(0,0,0,0.5); padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <img src="${displaySrc}" alt="preview" style="width:100%; max-height:220px; object-fit:cover; border-radius:var(--radius-md); display:block;" />
          <div style="margin-top:8px; display:flex; justify-content:flex-end;">
            <button type="button" class="btn-delete-media" style="padding:6px 14px; background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.4); border-radius:var(--radius-md); font-size:0.85rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px; transition:var(--transition);">
              ${deleteBtnText}
            </button>
          </div>
        </div>
      `;
    }

    const delBtn = preview.querySelector('.btn-delete-media');
    if (delBtn) {
      delBtn.onclick = () => {
        if (urlInput) urlInput.value = '';
        if (fileInput) fileInput.value = '';
        preview.innerHTML = '';
        if (onUpdate) onUpdate('');
        const isAr = (localStorage.getItem('shot_lang') || 'ar') === 'ar';
        showToast(isVideo ? (isAr ? 'تم حذف الفيديو فقط (تم الاحتفاظ بباقي الخانات)' : 'Video removed (form preserved)') : (isAr ? 'تم حذف الصورة فقط (تم الاحتفاظ بباقي الخانات)' : 'Image removed (form preserved)'));
      };
    }
  };

  if (currentValue) {
    const isVideo = isVideoMode || currentValue.includes('video/') || isIdbRef(currentValue) || /\.(mp4|webm|ogg|mov)(\?|$)/i.test(currentValue);
    if (isIdbRef(currentValue)) {
      cacheMediaRef(currentValue).then(resolved => updatePreview(resolved || currentValue, isVideo));
    } else {
      updatePreview(currentValue, isVideo);
    }
  }

  if (urlInput) {
    urlInput.oninput = () => {
      const val = urlInput.value.trim();
      if (val) {
        const isVideo = isVideoMode || /\.(mp4|webm|ogg|mov)(\?|$)/i.test(val) || val.includes('youtube.com') || val.includes('youtu.be') || val.includes('vimeo.com') || val.includes('drive.google.com') || isIdbRef(val);
        if (isIdbRef(val)) {
          cacheMediaRef(val).then(resolved => updatePreview(resolved || val, isVideo));
        } else {
          updatePreview(val, isVideo);
        }
        if (isVideoMode) autoFillThumbnailFromVideoUrl(val);
      } else {
        updatePreview('', false);
      }
      if (onUpdate) onUpdate(val);
    };
  }

  if (fileInput) {
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const isVideo = isVideoMode || file.type.startsWith('video/');
      const isAr = (localStorage.getItem('shot_lang') || 'ar') === 'ar';

      preview.innerHTML = `
        <div class="upload-progress-box" style="background:rgba(18,32,24,0.9); border:1px solid var(--accent-green); border-radius:var(--radius-md); padding:16px; margin-top:10px; box-shadow:0 4px 20px rgba(53,151,12,0.2);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; font-size:0.9rem; font-weight:700;">
            <span style="color:var(--accent-green); display:flex; align-items:center; gap:8px;">
              ${isVideo ? '🎬' : '📁'} ${isVideo ? (isAr ? 'جاري رفع الفيديو...' : 'Uploading video file...') : (isAr ? 'جاري رفع الصورة...' : 'Uploading image file...')}
            </span>
            <span id="upload-pct-num" style="color:var(--text-primary); font-family:var(--font-en); font-size:1rem; font-weight:900;">0%</span>
          </div>
          <div style="width:100%; height:10px; background:rgba(255,255,255,0.1); border-radius:5px; overflow:hidden;">
            <div id="upload-pct-bar" style="width:0%; height:100%; background:linear-gradient(90deg, #22c55e, var(--accent-green)); transition:width 0.1s ease; border-radius:5px;"></div>
          </div>
        </div>
      `;

      const pctNum = preview.querySelector('#upload-pct-num');
      const pctBar = preview.querySelector('#upload-pct-bar');
      const setProgress = (percent) => {
        if (pctNum) pctNum.textContent = percent + '%';
        if (pctBar) pctBar.style.width = percent + '%';
      };

      try {
        if (isVideo) {
          setProgress(30);
          const idbRef = await storeMediaBlob(file);
          setProgress(70);
          if (urlInput) urlInput.value = idbRef;
          const blobUrl = resolveMediaUrl(idbRef);
          updatePreview(blobUrl, true);
          if (onUpdate) onUpdate(idbRef);

          const imgInput = document.getElementById('adm-w-img');
          if (imgInput && !imgInput.value.trim()) {
            try {
              const thumbDataUrl = await generateVideoThumbnail(file);
              if (thumbDataUrl.length > 150000) {
                imgInput.value = await storeMediaBlob(dataUrlToBlob(thumbDataUrl));
              } else {
                imgInput.value = thumbDataUrl;
              }
              updateAdminImagePreview(imgInput.value);
            } catch (thumbErr) {
              console.warn('Auto thumbnail failed', thumbErr);
            }
          }
          setProgress(100);
          showToast(isAr ? 'تم رفع الفيديو بنجاح! (الصورة التلقائية من الفيديو)' : 'Video uploaded! Thumbnail auto-generated.');
        } else {
          const dataUrl = await readFileAsDataURL(file, setProgress);
          if (dataUrl.length > 200000) {
            const idbRef = await storeMediaBlob(dataUrlToBlob(dataUrl));
            if (urlInput) urlInput.value = idbRef;
            updatePreview(resolveMediaUrl(idbRef), false);
            if (onUpdate) onUpdate(idbRef);
          } else {
            if (urlInput) urlInput.value = dataUrl;
            updatePreview(dataUrl, false);
            if (onUpdate) onUpdate(dataUrl);
          }
          showToast(isAr ? 'تم رفع الصورة بنجاح!' : 'Image uploaded successfully!');
        }
      } catch (err) {
        preview.innerHTML = '';
        showToast(isAr ? 'حدث خطأ أثناء رفع الملف' : 'Error uploading file', 'error');
      }
    };
  }
}

function setupStarRatingPicker(containerId, hiddenInputId, initialRating) {
  const container = document.getElementById(containerId);
  const hiddenInput = document.getElementById(hiddenInputId);
  if (!container || !hiddenInput) return;

  let rating = initialRating || 5;
  hiddenInput.value = rating;

  container.querySelectorAll('.star-pick').forEach(star => {
    star.onclick = () => {
      rating = Number(star.dataset.val);
      hiddenInput.value = rating;
      container.querySelectorAll('.star-pick').forEach(s => {
        s.classList.toggle('active', Number(s.dataset.val) <= rating);
      });
    };
  });
}

function getInitialView() {
  const hash = window.location.hash.replace('#', '').toLowerCase();
  const validViews = ['home', 'about', 'works', 'clients', 'plans', 'contacts', 'admin'];
  return validViews.includes(hash) ? hash : 'home';
}

function navigateTo(view) {
  currentView = view;
  window.location.hash = view;
  isMobileNavOpen = false;
  isAdminMobileNavOpen = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderApp();
}

window.addEventListener('hashchange', () => {
  const view = getInitialView();
  if (view !== currentView) {
    currentView = view;
    renderApp();
  }
});

// --- Secret Admin Access Shortcut Listeners ---
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
    e.preventDefault();
    navigateTo('admin');
  }
});

function handleLogoSecretClick() {
  logoClickCount++;
  clearTimeout(logoClickTimer);
  if (logoClickCount >= 3) {
    logoClickCount = 0;
    showToast(lang === 'ar' ? '🔑 تم تفعيل الدخول السري للوحة التحكم' : '🔑 Secret Admin Activated');
    navigateTo('admin');
  } else {
    logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 800);
  }
}

// --- Icons Helper (SVG Generator) ---
function getIconSvg(name, size = 20) {
  const icons = {
    Megaphone: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8 a3 3 0 1 1-5.8-1.6"/></svg>`,
    Video: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>`,
    Share2: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>`,
    Palette: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.75 1.7-1.67 0-.44-.18-.86-.47-1.16-.3-.3-.47-.72-.47-1.17 0-.92.75-1.67 1.67-1.67H16c3.3 0 6-2.7 6-6 0-4.6-4.5-8.5-10-8.5z"/></svg>`,
    Search: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
    TrendingUp: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
    Check: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    Sun: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
    Moon: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    Star: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    Trash: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
    Menu: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,
    X: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    LayoutDashboard: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
    FileText: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`,
    Briefcase: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    Users: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    CreditCard: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`,
    Inbox: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
    Sliders: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="1" x2="7" y1="14" y2="14"/><line x1="9" x2="15" y1="8" y2="8"/><line x1="17" x2="23" y1="16" y2="16"/></svg>`,
    LogOut: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`
  };
  return icons[name] || '';
}

// --- Interactive Canvas Background ---
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 140 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createParticles();
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2.5 + 1;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.alpha = Math.random() * 0.65 + 0.25;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      if (mouse.x != null && mouse.y != null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          let force = (mouse.radius - dist) / mouse.radius;
          let dirX = dx / dist;
          let dirY = dy / dist;
          this.x -= dirX * force * 3;
          this.y -= dirY * force * 3;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(53, 151, 12, ${this.alpha})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(53, 151, 12, 0.6)';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function createParticles() {
    particles = [];
    const count = Math.min(Math.floor((width * height) / 18000), 75);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 125) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          let alpha = (1 - dist / 125) * 0.18;
          ctx.strokeStyle = `rgba(53, 151, 12, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  resize();
  animate();
}

// --- Toast Notification System ---
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${type === 'success' ? '✅' : 'ℹ️'}</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// --- Initial Loading Screen (shown while Supabase data is fetching) ---
function showInitialLoadingScreen() {
  const appView = document.getElementById('app-view');
  if (!appView) return;
  const isAr = lang === 'ar';
  appView.innerHTML = `
    <div class="initial-loading-screen" style="min-height:80vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:18px;">
      <div style="width:46px; height:46px; border-radius:50%; border:4px solid rgba(53,151,12,0.2); border-top-color:var(--accent-green); animation:shot-spin 0.8s linear infinite;"></div>
      <p style="color:var(--text-muted); font-size:0.95rem;">${isAr ? 'جاري تحميل الموقع...' : 'Loading site...'}</p>
    </div>
    <style>@keyframes shot-spin { to { transform: rotate(360deg); } }</style>
  `;
}

// --- Theme & Language Toggles ---
function applyTheme(newTheme) {
  theme = newTheme;
  localStorage.setItem('shot_theme', theme);
  document.documentElement.setAttribute('data-theme', currentView === 'admin' ? 'dark' : theme);
  renderApp();
}

function applyLanguage(newLang) {
  lang = newLang;
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  localStorage.setItem('shot_lang', lang);
  renderApp();
}

// --- Master Multi-Page App Router & Renderer ---
function renderApp() {
  const isAr = lang === 'ar';
  document.documentElement.setAttribute('data-theme', currentView === 'admin' ? 'dark' : theme);
  renderNavbar();

  // Floating WhatsApp Button (hide on admin page)
  let waBtn = document.querySelector('.whatsapp-float');
  if (currentView === 'admin') {
    if (waBtn) waBtn.remove();
  } else {
    if (!waBtn) {
      waBtn = document.createElement('a');
      waBtn.className = 'whatsapp-float';
      waBtn.target = '_blank';
      waBtn.innerHTML = `<svg width="35" height="35" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
      document.body.appendChild(waBtn);
    }
    waBtn.href = getWhatsAppUrl();
  }

  const appView = document.getElementById('app-view');
  if (!appView) return;

  if (currentView === 'admin') {
    renderAdminView(appView);
    return;
  }

  // Render Public Dedicated Page Views
  let viewHTML = '<div class="page-wrapper">';

  if (currentView === 'home') {
    viewHTML += `
      <section class="hero-section">${getHeroHTML()}</section>
      <section class="section">${getAboutHTML()}</section>
      <section class="section">${getWorksHTML()}</section>
      <section class="section">${getClientsHTML()}</section>
      <section class="section">${getPlansHTML()}</section>
      <section class="section">${getContactHTML()}</section>
      ${getHomeCtaHTML()}
    `;
  } else if (currentView === 'about') {
    viewHTML += `
      <div class="page-header-banner">
        <span class="section-tag">${isAr ? 'عن شركة SHOT' : 'ABOUT SHOT AGENCY'}</span>
        <h1 class="gradient-text">${isAr ? 'روّاد التسويق الرقمي والإنتاج الإبداعي' : 'Leaders in Performance & Creative Media'}</h1>
      </div>
      <section class="section">${getAboutHTML()}</section>
    `;
  } else if (currentView === 'works') {
    viewHTML += `
      <div class="page-header-banner">
        <span class="section-tag">${isAr ? 'معرض الأعمال والنتائج' : 'PORTFOLIO & CASE STUDIES'}</span>
        <h1 class="gradient-text">${isAr ? 'قصص نجاح أطلقناها للعلامات التجارية' : 'Commercial Successes We Launched'}</h1>
      </div>
      <section class="section">${getWorksHTML()}</section>
    `;
  } else if (currentView === 'clients') {
    viewHTML += `
      <div class="page-header-banner">
        <span class="section-tag">${isAr ? 'عملاؤنا وشركاء النجاح' : 'OUR TRUSTED CLIENTS'}</span>
        <h1 class="gradient-text">${isAr ? 'علامات تجارية نعتز بالتوسع معها' : 'Brands We Scale Together'}</h1>
      </div>
      <section class="section">${getClientsHTML()}</section>
    `;
  } else if (currentView === 'plans') {
    viewHTML += `
      <div class="page-header-banner">
        <span class="section-tag">${isAr ? 'الباقات والخدمات' : 'PLANS & SERVICES'}</span>
        <h1 class="gradient-text">${isAr ? 'باقات نمو متكاملة لمشروعك' : 'Tailored Growth Packages'}</h1>
      </div>
      <section class="section">${getPlansHTML()}</section>
    `;
  } else if (currentView === 'contacts') {
    viewHTML += `
      <div class="page-header-banner">
        <span class="section-tag">${isAr ? 'تواصل معنا الآن' : 'GET IN TOUCH'}</span>
        <h1 class="gradient-text">${isAr ? 'دعنا نطلق علامتك التجارية للقمة' : 'Let’s Shoot Your Brand To The Moon'}</h1>
      </div>
      <section class="section">${getContactHTML()}</section>
    `;
  }

  viewHTML += '</div>';
  appView.innerHTML = viewHTML;

  // Attach interactive listeners for the rendered view
  attachViewEvents();
  renderFooter();
  hydrateIdbMedia();
}

// --- Navbar Renderer ---
function renderNavbar() {
  const isAr = lang === 'ar';
  const navContainer = document.getElementById('navbar');
  if (!navContainer) return;

  navContainer.innerHTML = `
    <div class="navbar-container">
      <!-- Secret Admin Trigger 1: Triple Click Logo -->
      <div class="brand-logo-container" id="secret-logo-btn">
        <img src="${logoImg}" alt="SHOT Logo" class="brand-logo-img" />
      </div>
      
      <ul class="nav-menu ${isMobileNavOpen ? 'open' : ''}">
        <li><a class="nav-link ${currentView === 'home' ? 'active' : ''}" data-view="home">${isAr ? 'الرئيسية' : 'Home'}</a></li>
        <li><a class="nav-link ${currentView === 'about' ? 'active' : ''}" data-view="about">${isAr ? 'عن الشركة' : 'About'}</a></li>
        <li><a class="nav-link ${currentView === 'works' ? 'active' : ''}" data-view="works">${isAr ? 'أعمالنا' : 'Works'}</a></li>
        <li><a class="nav-link ${currentView === 'clients' ? 'active' : ''}" data-view="clients">${isAr ? 'عملاؤنا' : 'Clients'}</a></li>
        <li><a class="nav-link ${currentView === 'plans' ? 'active' : ''}" data-view="plans">${isAr ? 'الباقات' : 'Plans'}</a></li>
        <li><a class="nav-link ${currentView === 'contacts' ? 'active' : ''}" data-view="contacts">${isAr ? 'تواصل معنا' : 'Contacts'}</a></li>
      </ul>

      <div class="nav-actions">
        ${currentView !== 'admin' ? `
          <!-- Language Switcher -->
          <button class="icon-btn" id="lang-toggle-btn" title="${isAr ? 'Switch to English' : 'التحويل للعربية'}">
            ${isAr ? 'EN' : 'عربى'}
          </button>

          <!-- Theme Toggle -->
          <button class="icon-btn" id="theme-toggle-btn" title="Toggle Theme">
            ${theme === 'dark' ? getIconSvg('Sun', 18) : getIconSvg('Moon', 18)}
          </button>
        ` : ''}

        <!-- Mobile Toggle Button -->
        <button class="mobile-toggle" id="mobile-nav-toggle" title="Menu">
          ${isMobileNavOpen ? getIconSvg('X', 22) : getIconSvg('Menu', 22)}
        </button>
      </div>
    </div>
  `;

  document.getElementById('secret-logo-btn').onclick = handleLogoSecretClick;
  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) {
    langBtn.onclick = () => applyLanguage(lang === 'ar' ? 'en' : 'ar');
  }
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.onclick = () => applyTheme(theme === 'dark' ? 'light' : 'dark');
  }
  
  const mobileBtn = document.getElementById('mobile-nav-toggle');
  if (mobileBtn) {
    mobileBtn.onclick = () => {
      isMobileNavOpen = !isMobileNavOpen;
      renderNavbar();
    };
  }

  // Multi-page navigation link click handlers
  navContainer.querySelectorAll('.nav-link').forEach(link => {
    link.onclick = () => navigateTo(link.dataset.view);
  });
}

// --- HTML Section Generators ---
function getHeroHTML() {
  const isAr = lang === 'ar';
  const heroData = appData.hero[lang];

  return `
    <div class="hero-container">
      <div class="hero-badge">${heroData.badge}</div>
      <h1 class="hero-title gradient-text">${heroData.title}</h1>
      <p class="hero-subtitle">${heroData.subtitle}</p>
      
      <div class="hero-cta">
        <button class="btn-primary" onclick="window.location.hash='works'; navigateTo('works');" style="padding: 16px 36px; font-size: 1.05rem;">
          ${heroData.primaryCta}
        </button>
        <button class="btn-secondary" onclick="window.location.hash='contacts'; navigateTo('contacts');" style="padding: 16px 36px; font-size: 1.05rem;">
          ${heroData.secondaryCta}
        </button>
      </div>

      <div class="hero-stats">
        ${appData.hero.stats.map(s => `
          <div class="stat-card">
            <div class="stat-number">${s.number}</div>
            <div class="stat-label">${isAr ? s.labelAr : s.labelEn}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function getAboutHTML() {
  const isAr = lang === 'ar';
  const aboutData = appData.about[lang];

  return `
    <div class="section-header">
      <span class="section-tag">${aboutData.tag}</span>
      <h2 class="section-title gradient-text">${aboutData.title}</h2>
      <p class="section-desc">${aboutData.description}</p>
    </div>

    <div class="about-grid">
      <div class="services-list" style="grid-column: span 2">
        ${appData.about.services.map(srv => `
          <div class="service-item">
            <div class="service-icon">${getIconSvg(srv.icon, 24)}</div>
            <h4 class="service-title">${isAr ? srv.titleAr : srv.titleEn}</h4>
            <p class="service-desc">${isAr ? srv.descAr : srv.descEn}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function getWorksHTML() {
  const isAr = lang === 'ar';
  const categories = [
    { id: 'all', labelEn: 'All Projects', labelAr: 'جميع الأعمال' },
    { id: 'video', labelEn: 'Video Commercials', labelAr: 'إعلانات الفيديو' },
    { id: 'ads', labelEn: 'Performance Ads', labelAr: 'حملات ممولة' },
    { id: 'branding', labelEn: 'Branding Identity', labelAr: 'هوية بصريّة' },
    { id: 'social', labelEn: 'Social Media', labelAr: 'مواقع التواصل' }
  ];

  const filtered = currentFilter === 'all' 
    ? appData.works 
    : appData.works.filter(w => w.category === currentFilter);

  return `
    <div class="section-header">
      <span class="section-tag">${isAr ? 'معرض الأعمال والنتائج' : 'OUR PORTFOLIO'}</span>
      <h2 class="section-title gradient-text">${isAr ? 'قصص نجاح أطلقناها إلى النجوم' : 'Commercial Successes We Launch'}</h2>
      <p class="section-desc">${isAr ? 'استعرض أبرز الحملات والفيديوهات التجارية التي حققت أعلى العوائد لعملائنا' : 'Browse our high-converting video, ads, and brand overhaul projects.'}</p>
    </div>

    <div class="portfolio-filters">
      ${categories.map(c => `
        <button class="filter-btn ${currentFilter === c.id ? 'active' : ''}" data-cat="${c.id}">
          ${isAr ? c.labelAr : c.labelEn}
        </button>
      `).join('')}
    </div>

    <div class="works-grid">
      ${filtered.map(w => `
        <div class="work-card" data-id="${w.id}">
          <div class="work-img-wrapper">
            <img data-media-ref="${w.image || ''}" src="${getMediaSrc(w.image)}" alt="${isAr ? w.titleAr : w.titleEn}" class="work-img" />
            ${w.videoUrl ? '<div class="work-play-overlay">▶</div>' : ''}
            <span class="work-category-badge">${w.category.toUpperCase()}</span>
          </div>
          <div class="work-info">
            <h3 class="work-title">${isAr ? w.titleAr : w.titleEn}</h3>
            <p class="work-summary">${isAr ? w.summaryAr : w.summaryEn}</p>
            <div class="work-metrics">
              <span class="metric-tag">🔥 ${isAr ? w.metricsAr : w.metricsEn}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function getHomeCtaHTML() {
  const isAr = lang === 'ar';
  return `
    <section class="section">
      <div class="home-cta-card">
        <div class="home-cta-text">
          <h2>${isAr ? 'إذا كنت جاهزاً، فلنطلق SHOT الخاص بك' : 'If you ready let\'s take your SHOT'}</h2>
          <p>${isAr ? 'أنت فقط على بعد خطوة واحدة من تحويل أفكارك إلى حملة قوية.' : 'You are just one step away from turning your ideas into a powerful campaign.'}</p>
        </div>
        <button class="btn-primary home-cta-btn" onclick="window.location.hash='contacts'; navigateTo('contacts');">
          ${isAr ? 'SHOT' : 'Shot'}
        </button>
      </div>
    </section>
  `;
}

function getClientsHTML() {
  const isAr = lang === 'ar';
  return `
    <div class="section-header">
      <span class="section-tag">${isAr ? 'شركاء النجاح' : 'OUR TRUSTED CLIENTS'}</span>
      <h2 class="section-title gradient-text">${isAr ? 'علامات تجارية نعتز بالتحليق معها' : 'Brands We Scale Together'}</h2>
    </div>

    <div class="clients-marquee">
      ${appData.clients.map(c => `<div class="client-logo-card">${c.name}</div>`).join('')}
    </div>

    <div class="section-header" style="margin-top: 60px; margin-bottom: 40px;">
      <h3 style="font-size:1.8rem;">${isAr ? 'ماذا يقول رؤساء الشركات عنا؟' : 'What Executive Leaders Say'}</h3>
    </div>

    <div class="testimonials-grid">
      ${appData.testimonials.map(t => `
        <div class="testimonial-card">
          <div class="stars">${Array(t.rating).fill(getIconSvg('Star', 18)).join('')}</div>
          <p class="testimonial-quote">"${isAr ? t.quoteAr : t.quoteEn}"</p>
          <div class="client-profile">
            <div class="client-avatar">${(isAr ? t.nameAr : t.nameEn).charAt(0)}</div>
            <div>
              <div class="client-name">${isAr ? t.nameAr : t.nameEn}</div>
              <div class="client-role">${isAr ? t.roleAr : t.roleEn}</div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function getPlansHTML() {
  const isAr = lang === 'ar';
  return `
    <div class="section-header">
      <span class="section-tag">${isAr ? 'الباقات والخدمات' : 'PLANS & SERVICES'}</span>
      <h2 class="section-title gradient-text">${isAr ? 'باقات مصممة لسرعة النمو' : 'Flexible Growth Plans'}</h2>
      <p class="section-desc">${isAr ? 'اختر الباقة المناسبة لمرحلة مشروعك الحالية' : 'Choose the plan tailored for your current scaling phase.'}</p>
    </div>

    <div class="plans-grid">
      ${appData.plans.map(p => {
        const features = isAr ? p.featuresAr : p.featuresEn;
        return `
          <div class="plan-card ${p.popular ? 'popular' : ''}">
            ${p.popular ? `<span class="popular-tag">${isAr ? 'الأكثر طلباً' : 'MOST POPULAR'}</span>` : ''}
            <h3 class="plan-name">${isAr ? p.nameAr : p.nameEn}</h3>
            <ul class="plan-features">
              ${features.map(f => `<li>${getIconSvg('Check', 18)} <span>${f}</span></li>`).join('')}
            </ul>
            <button class="btn-primary plan-order-btn" data-id="${p.id}" style="width:100%; justify-content:center;">
              ${isAr ? 'اطلب الباقة الآن' : 'Request Plan Now'}
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function getContactHTML() {
  const isAr = lang === 'ar';
  return `
    <div class="section-header">
      <span class="section-tag">${isAr ? 'تواصل معنا' : 'GET IN TOUCH'}</span>
      <h2 class="section-title gradient-text">${isAr ? 'دعنا نطلق مشروعك إلى القمة اليوم' : 'Let’s Shoot Your Brand To The Top'}</h2>
    </div>

    <div class="contact-container">
      <div class="contact-info-card">
        <h3 style="font-size:1.6rem; margin-bottom:24px;">${isAr ? 'معلومات الاتصال المباشرة' : 'Direct Contact Info'}</h3>
        <div class="info-item">
          <div class="info-icon">📧</div>
          <div class="info-details">
            <h4>${isAr ? 'البريد الإلكتروني' : 'Email'}</h4>
            <p>${appData.settings.contactEmail}</p>
          </div>
        </div>
        <div class="info-item">
          <div class="info-icon">📞</div>
          <div class="info-details">
            <h4>${isAr ? 'الهاتف / الواتساب' : 'Phone / WhatsApp'}</h4>
            <p>${appData.settings.contactPhone}</p>
          </div>
        </div>
        <div class="info-item">
          <div class="info-icon">📍</div>
          <div class="info-details">
            <h4>${isAr ? 'المقر الرئيسي' : 'Headquarters'}</h4>
            <p>${isAr ? appData.settings.officeAddressAr : appData.settings.officeAddressEn}</p>
          </div>
        </div>

        <div style="margin-top: 30px; display: flex; gap: 15px; flex-wrap: wrap;">
          ${appData.settings.facebook ? `
            <a href="${appData.settings.facebook}" target="_blank" class="btn-secondary" style="padding: 10px 20px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>
          ` : ''}
          ${appData.settings.instagram ? `
            <a href="${appData.settings.instagram}" target="_blank" class="btn-secondary" style="padding: 10px 20px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              Instagram
            </a>
          ` : ''}
        </div>
      </div>

      <div class="contact-form">
        <h3 style="font-size:1.6rem; margin-bottom:20px;">${isAr ? 'أرسل استفسارك التسويقي' : 'Send Marketing Inquiry'}</h3>
        <form id="public-contact-form">
          <div class="form-group">
            <label class="form-label">${isAr ? 'الاسم بالكامل' : 'Your Name'}</label>
            <input type="text" id="cf-name" class="form-input" required placeholder="${isAr ? 'مثال: عبد العزيز علي' : 'Alex Smith'}" />
          </div>
          <div class="form-group">
            <label class="form-label">${isAr ? 'البريد الإلكتروني' : 'Email Address'}</label>
            <input type="email" id="cf-email" class="form-input" required placeholder="alex@company.com" />
          </div>
          <div class="form-group">
            <label class="form-label">${isAr ? 'رقم الجوال' : 'Phone Number'}</label>
            <input type="tel" id="cf-phone" class="form-input" required placeholder="+966 50 123 4567" />
          </div>
          <div class="form-group">
            <label class="form-label">${isAr ? 'الخدمة المطلوبة' : 'Service Needed'}</label>
            <select id="cf-service" class="form-select">
              <option value="Performance Ads">${isAr ? 'الإعلانات الممولة' : 'Performance Ads'}</option>
              <option value="Media Production">${isAr ? 'إنتاج الفيديوهات' : 'Media & Video Production'}</option>
              <option value="Social Media">${isAr ? 'إدارة منصات التواصل' : 'Social Media Growth'}</option>
              <option value="Branding">${isAr ? 'تصميم الهوية البصرية' : 'Brand Identity'}</option>
              <option value="Full Package">${isAr ? 'باقة متكاملة' : 'Full Package Domination'}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">${isAr ? 'تفاصيل المشروع' : 'Project Details'}</label>
            <textarea id="cf-msg" class="form-textarea" rows="4" required placeholder="${isAr ? 'اكتب نبذة عن مشروعك وأهدافك...' : 'Tell us about your brand goals...'}" ></textarea>
          </div>
          <button type="submit" class="btn-primary" style="width:100%; justify-content:center; padding:15px;">
            🚀 ${isAr ? 'إرسال الرسالة إلى فريق التسويق' : 'Send Message To Agency'}
          </button>
        </form>
      </div>
    </div>
  `;
}

function attachViewEvents() {
  const isAr = lang === 'ar';

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
      currentFilter = btn.dataset.cat;
      const worksContainer = document.getElementById('app-view');
      if (worksContainer) renderApp();
    };
  });

  document.querySelectorAll('.work-card').forEach(card => {
    card.onclick = () => {
      const item = appData.works.find(w => w.id === card.dataset.id);
      if (item) openProjectModal(item);
    };
  });

  document.querySelectorAll('.plan-order-btn').forEach(btn => {
    btn.onclick = () => {
      const plan = appData.plans.find(p => p.id === btn.dataset.id);
      if (plan) openOrderModal(plan);
    };
  });

  const contactForm = document.getElementById('public-contact-form');
  if (contactForm) {
    contactForm.onsubmit = async (e) => {
      e.preventDefault();
      const messageRow = {
        name: document.getElementById('cf-name').value.trim(),
        email: document.getElementById('cf-email').value.trim(),
        phone: document.getElementById('cf-phone').value.trim(),
        service: document.getElementById('cf-service').value,
        budget: 'Standard',
        message: document.getElementById('cf-msg').value.trim(),
        read: false,
      };

      const { error } = await supabase.from('messages').insert(messageRow);
      if (error) {
        console.error(error);
        showToast(isAr ? 'فشل إرسال الرسالة. حاول مرة أخرى.' : 'Message delivery failed. Please try again.', 'error');
        return;
      }

      appData.messages = await loadMessagesFromSupabase();
      contactForm.reset();
      showToast(isAr ? 'شكراً لتواصلك! تم استلام رسالتك وسيتم الرد خلال ساعات.' : 'Thank you! Message sent to SHOT agency inbox.');
    };
  }
}

function getVideoEmbedHTML(url) {
  if (!url) return null;
  if (url.includes('...[local-video]')) {
    return `<div style="padding:40px; text-align:center; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:var(--radius-md); margin-bottom:20px; color:#f87171;">⚠️ ${lang === 'ar' ? 'الفيديو تالف — يرجى إعادة رفعه' : 'Video corrupted — please re-upload'}</div>`;
  }
  const resolved = resolveMediaUrl(url) || url;
  // YouTube
  const ytMatch = resolved.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/);
  if (ytMatch) {
    return `<iframe src="https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1" style="width:100%; height:400px; border:none; border-radius:var(--radius-md); margin-bottom:20px; background:#000;" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  }
  // Vimeo
  const vimeoMatch = resolved.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `<iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1" style="width:100%; height:400px; border:none; border-radius:var(--radius-md); margin-bottom:20px; background:#000;" allow="autoplay" allowfullscreen></iframe>`;
  }
  // Google Drive
  const driveMatch = resolved.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (driveMatch) {
    return `<iframe src="https://drive.google.com/file/d/${driveMatch[1]}/preview" style="width:100%; height:400px; border:none; border-radius:var(--radius-md); margin-bottom:20px; background:#000;" allow="autoplay" allowfullscreen></iframe>`;
  }
  // Direct video file, blob URL, or IndexedDB-resolved URL
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(resolved) || resolved.startsWith('data:video/') || resolved.startsWith('blob:')) {
    return `<video controls autoplay playsinline style="width:100%; max-height:420px; border-radius:var(--radius-md); margin-bottom:20px; background:#000;" src="${resolved}"></video>`;
  }
  if (isIdbRef(url)) {
    return `<div style="padding:40px; text-align:center; background:rgba(0,0,0,0.3); border-radius:var(--radius-md); margin-bottom:20px;">⏳ ${lang === 'ar' ? 'جاري تحميل الفيديو...' : 'Loading video...'}</div>`;
  }
  return `<video controls autoplay playsinline style="width:100%; max-height:420px; border-radius:var(--radius-md); margin-bottom:20px; background:#000;" src="${resolved}"></video>`;
}

function closeProjectModal() {
  const modal = document.getElementById('project-modal');
  if (modal) {
    // Stop any playing video/iframe
    const video = modal.querySelector('video');
    if (video) { video.pause(); video.src = ''; }
    const iframe = modal.querySelector('iframe');
    if (iframe) { iframe.src = ''; }
    modal.classList.remove('active');
  }
}

function openProjectModal(item) {
  const isAr = lang === 'ar';
  let modal = document.getElementById('project-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'project-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const hasVideo = !!item.videoUrl;
  const resolvedVideo = resolveMediaUrl(item.videoUrl);
  let mediaHTML;
  if (hasVideo) {
    if (isIdbRef(item.videoUrl) && !resolvedVideo) {
      mediaHTML = `<div style="padding:40px; text-align:center; background:rgba(0,0,0,0.3); border-radius:var(--radius-md); margin-bottom:20px;">⏳ ${isAr ? 'جاري تحميل الفيديو...' : 'Loading video...'}</div>`;
    } else {
      mediaHTML = getVideoEmbedHTML(resolvedVideo || item.videoUrl);
    }
  } else {
    mediaHTML = `<img data-media-ref="${item.image || ''}" src="${getMediaSrc(item.image)}" style="width:100%; height:280px; object-fit:cover; border-radius:var(--radius-md); margin-bottom:20px;" />`;
  }

  modal.innerHTML = `
    <div class="modal-card" style="max-width:750px;">
      <button class="modal-close" onclick="closeProjectModal()">&times;</button>
      ${mediaHTML}
      <span class="work-category-badge" style="position:static; display:inline-block; margin-bottom:12px;">${item.category.toUpperCase()}</span>
      <h2 style="font-size:1.8rem; margin-bottom:10px;">${isAr ? item.titleAr : item.titleEn}</h2>
      <p style="color:var(--accent-green); font-weight:700; margin-bottom:16px;">👤 ${isAr ? 'العميل:' : 'Client:'} ${isAr ? item.clientAr : item.clientEn}</p>
      <p style="color:var(--text-secondary); margin-bottom:20px; font-size:1.05rem; line-height:1.7;">${isAr ? item.detailsAr : item.detailsEn}</p>
      <div style="background:var(--bg-card); padding:16px; border-radius:var(--radius-md); border:1px solid var(--border-color); display:flex; gap:10px; align-items:center;">
        <span style="font-size:1.3rem;">📊</span>
        <span style="font-weight:800; color:var(--accent-green);">${isAr ? item.metricsAr : item.metricsEn}</span>
      </div>
    </div>
  `;
  modal.classList.add('active');

  if (hasVideo && isIdbRef(item.videoUrl) && !resolvedVideo) {
    cacheMediaRef(item.videoUrl).then(blobUrl => {
      if (blobUrl && modal.classList.contains('active')) {
        const videoContainer = modal.querySelector('.modal-card');
        if (videoContainer) {
          const loadingEl = videoContainer.querySelector('div');
          if (loadingEl) {
            loadingEl.outerHTML = getVideoEmbedHTML(blobUrl);
          }
        }
      }
    });
  } else if (!hasVideo && isIdbRef(item.image) && !resolveMediaUrl(item.image)) {
    cacheMediaRef(item.image).then(blobUrl => {
      const img = modal.querySelector('img[data-media-ref]');
      if (img && blobUrl) img.src = blobUrl;
    });
  }

  modal.onclick = (e) => {
    if (e.target === modal) closeProjectModal();
  };
}

function openOrderModal(plan) {
  const isAr = lang === 'ar';
  let modal = document.getElementById('order-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'order-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-card">
      <button class="modal-close" onclick="document.getElementById('order-modal').classList.remove('active')">&times;</button>
      <h2 style="font-size:1.6rem; margin-bottom:8px;">${isAr ? 'طلب الاشتراك في الباقة' : 'Complete Plan Order'}</h2>
      <p style="color:var(--accent-green); font-size:1.2rem; font-weight:800; margin-bottom:20px;">
        ${isAr ? plan.nameAr : plan.nameEn}
      </p>

      <form id="order-form">
        <div class="form-group">
          <label class="form-label">${isAr ? 'الاسم بالكامل' : 'Full Name'}</label>
          <input type="text" id="ord-name" class="form-input" required placeholder="${isAr ? 'مثال: محمد أحمد' : 'John Doe'}" />
        </div>
        <div class="form-group">
          <label class="form-label">${isAr ? 'البريد الإلكتروني' : 'Email Address'}</label>
          <input type="email" id="ord-email" class="form-input" required placeholder="name@company.com" />
        </div>
        <div class="form-group">
          <label class="form-label">${isAr ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'}</label>
          <input type="tel" id="ord-phone" class="form-input" required placeholder="+966 50 000 0000" />
        </div>
        <button type="submit" class="btn-primary" style="width:100%; justify-content:center; padding:14px; margin-top:10px;">
          ${isAr ? 'تأكيد إرسال الطلب' : 'Confirm Order'}
        </button>
      </form>
    </div>
  `;
  modal.classList.add('active');

  document.getElementById('order-form').onsubmit = async (e) => {
    e.preventDefault();
    const messageRow = {
      name: document.getElementById('ord-name').value.trim(),
      email: document.getElementById('ord-email').value.trim(),
      phone: document.getElementById('ord-phone').value.trim(),
      service: `Plan Order: ${isAr ? plan.nameAr : plan.nameEn}`,
      budget: '-',
      message: `Subscription requested for ${plan.nameEn}`,
      read: false,
    };

    const { error } = await supabase.from('messages').insert(messageRow);
    if (error) {
      console.error(error);
      showToast(isAr ? 'فشل إرسال الطلب. حاول مرة أخرى.' : 'Order failed. Please try again.', 'error');
      return;
    }

    appData.messages = await loadMessagesFromSupabase();
    modal.classList.remove('active');
    showToast(isAr ? 'تم استلام طلبك بنجاح! سيتواصل معك فريق التسويق فوراً' : 'Order received!');
  };
}

function renderFooter() {
  const isAr = lang === 'ar';
  const container = document.getElementById('footer');
  if (!container) return;

  container.innerHTML = `
    <div class="footer-container">
      <div class="footer-brand">
        <img src="${logoImg}" alt="SHOT Logo" style="height:48px;" />
        <p>${isAr ? 'وكالة SHOT للتسويق الرقمي وإنتاج الفيديوهات الإعلانية. نبتكر الاستراتيجيات ونحقق العوائد الاستثنائية.' : 'SHOT Agency - High Impact Digital Marketing & Commercial Media Studio.'}</p>
      </div>

      <div class="footer-col">
        <h4>${isAr ? 'صفحات الموقع' : 'Pages'}</h4>
        <ul class="footer-links">
          <li><a onclick="navigateTo('home')">${isAr ? 'الرئيسية' : 'Home'}</a></li>
          <li><a onclick="navigateTo('about')">${isAr ? 'عن الشركة' : 'About'}</a></li>
          <li><a onclick="navigateTo('works')">${isAr ? 'معرض الأعمال' : 'Works'}</a></li>
          <li><a onclick="navigateTo('plans')">${isAr ? 'الباقات' : 'Plans'}</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>${isAr ? 'خدماتنا' : 'Services'}</h4>
        <ul class="footer-links">
          <li><a onclick="navigateTo('about')">${isAr ? 'حملات الإعلانات' : 'Paid Ads'}</a></li>
          <li><a onclick="navigateTo('about')">${isAr ? 'إنتاج الفيديوهات' : 'Video Production'}</a></li>
          <li><a onclick="navigateTo('about')">${isAr ? 'السوشيال ميديا' : 'Social Media'}</a></li>
          <li><a onclick="navigateTo('about')">${isAr ? 'الهوية البصرية' : 'Branding'}</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>${isAr ? 'تواصل معنا' : 'Contact Us'}</h4>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:14px;">
          ${isAr ? 'جاهز للتوسع؟ تواصل معنا واطلب استشارة تسويقية مجانية.' : 'Ready to scale? Request your free consultation today.'}
        </p>
        <button class="btn-primary" onclick="navigateTo('contacts')" style="width:100%; justify-content:center;">
          🚀 ${isAr ? 'ارسل استفسارك' : 'Contact Us'}
        </button>
      </div>
    </div>

    <div class="footer-bottom">
      <div>© 2026 SHOT Marketing Agency. All Rights Reserved.</div>
      <div>Designed with High Precision & Innovation ⚡</div>
    </div>
  `;
}

// =========================================================
// PREMIUM FULLSCREEN ADMIN CONTROL CENTER & RESPONSIVE NAV
// =========================================================
function renderAdminView(container) {
  const isAr = lang === 'ar';

  if (!isAdminAuthenticated) {
    container.innerHTML = `
      <div style="min-height:80vh; display:flex; align-items:center; justify-content:center; padding:24px;">
        <div class="modal-card" style="max-width:440px; text-align:center;">
          <img src="${logoImg}" style="height:60px; margin:0 auto 20px;" />
          <h2 style="font-size:1.6rem; margin-bottom:8px;">${isAr ? 'دخول لوحة التحكم' : 'Admin Login'}</h2>
          <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:24px;">
            ${isAr ? 'استخدم بريدك الإلكتروني و كلمة المرور الخاصة بحسابك.' : 'Use the email and password for your account.'}
          </p>

          <form id="admin-login-form">
            <input type="email" id="admin-email-input" class="form-input" style="margin-bottom:12px;" placeholder="admin@yourdomain.com" required autofocus />
            <input type="password" id="admin-password-input" class="form-input" style="margin-bottom:20px;" placeholder="Password" required />
            <div style="display:flex; gap:12px;">
              <button type="button" class="btn-secondary" onclick="navigateTo('home')" style="flex:1; justify-content:center;">
                ${isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="submit" class="btn-primary" style="flex:1.5; justify-content:center;">
                🔓 ${isAr ? 'تسجيل الدخول' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('admin-login-form').onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-email-input').value.trim();
      const password = document.getElementById('admin-password-input').value;

      if (!email || !password) {
        showToast(isAr ? 'يرجى إدخال البريد وكلمة المرور.' : 'Please enter email and password.', 'error');
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Admin login error:', error);
        showToast(isAr ? 'بيانات الدخول غير صحيحة أو الحساب غير مسجل.' : 'Invalid login credentials or admin account is not available.', 'error');
        return;
      }

      if (data?.session) {
        isAdminAuthenticated = true;
        renderAdminView(container);
        showToast(isAr ? 'مرحباً بك في لوحة تحكم SHOT الإدارية' : 'Welcome to SHOT Admin Panel');
      }
    };
    return;
  }

  const unreadCount = appData.messages.filter(m => !m.read).length;

  container.innerHTML = `
    <div class="admin-fullscreen-overlay">
      <!-- Admin Sidebar / Mobile Drawer Menu -->
      <aside class="admin-sidebar ${isAdminMobileNavOpen ? 'open' : ''}">
        <div class="admin-sidebar-header">
          <div class="admin-brand-box">
            <img src="${logoImg}" />
            <span style="font-weight:900; font-size:1.15rem; color:var(--accent-green);">ADMIN</span>
          </div>
          <span class="admin-badge-live">LIVE</span>
        </div>

        <ul class="admin-nav-list">
          <li class="admin-nav-item">
            <button class="${activeAdminTab === 'overview' ? 'active' : ''}" data-tab="overview">
              <span>${getIconSvg('LayoutDashboard', 18)} ${isAr ? 'نظرة عامة والإحصائيات' : 'Overview'}</span>
            </button>
          </li>
          <li class="admin-nav-item">
            <button class="${activeAdminTab === 'content' ? 'active' : ''}" data-tab="content">
              <span>${getIconSvg('FileText', 18)} ${isAr ? 'محتوى الواجهة الرئيسية' : 'Hero Content'}</span>
            </button>
          </li>
          <li class="admin-nav-item">
            <button class="${activeAdminTab === 'about' ? 'active' : ''}" data-tab="about">
              <span>${getIconSvg('FileText', 18)} ${isAr ? 'محتوى صفحة من نحن' : 'About Page'}</span>
            </button>
          </li>
          <li class="admin-nav-item">
            <button class="${activeAdminTab === 'works' ? 'active' : ''}" data-tab="works">
              <span>${getIconSvg('Briefcase', 18)} ${isAr ? 'إدارة معرض الأعمال' : 'Portfolio Works'}</span>
            </button>
          </li>
          <li class="admin-nav-item">
            <button class="${activeAdminTab === 'clients' ? 'active' : ''}" data-tab="clients">
              <span>${getIconSvg('Users', 18)} ${isAr ? 'العملاء والآراء' : 'Clients & Reviews'}</span>
            </button>
          </li>
          <li class="admin-nav-item">
            <button class="${activeAdminTab === 'plans' ? 'active' : ''}" data-tab="plans">
              <span>${getIconSvg('CreditCard', 18)} ${isAr ? 'إدارة الباقات والخدمات' : 'Plans & Services'}</span>
            </button>
          </li>
          <li class="admin-nav-item">
            <button class="${activeAdminTab === 'services' ? 'active' : ''}" data-tab="services">
              <span>${getIconSvg('Layers', 18)} ${isAr ? 'إدارة خدمات الصفحة' : 'Services Section'}</span>
            </button>
          </li>
          <li class="admin-nav-item">
            <button class="${activeAdminTab === 'messages' ? 'active' : ''}" data-tab="messages">
              <span>${getIconSvg('Inbox', 18)} ${isAr ? 'صندوق الوارد والطلبات' : 'Messages Inbox'}</span>
              ${unreadCount > 0 ? `<span class="badge-status badge-red">${unreadCount}</span>` : ''}
            </button>
          </li>
          <li class="admin-nav-item">
            <button class="${activeAdminTab === 'settings' ? 'active' : ''}" data-tab="settings">
              <span>${getIconSvg('Sliders', 18)} ${isAr ? 'الإعدادات والنسخ' : 'Settings'}</span>
            </button>
          </li>
        </ul>

        <div class="admin-sidebar-footer">
          <div class="admin-user-info">
            <div class="admin-avatar">S</div>
            <div>
              <div style="font-weight:800; font-size:0.95rem;">SHOT Executive</div>
              <div style="color:var(--text-muted); font-size:0.78rem;">Super Admin</div>
            </div>
          </div>
          <button class="btn-secondary" id="admin-exit-btn" style="width:100%; justify-content:center; padding:10px; border-color:rgba(239,68,68,0.4); color:#f87171;">
            ${getIconSvg('LogOut', 18)} ${isAr ? 'تسجيل الخروج' : 'Sign Out'}
          </button>
        </div>
      </aside>

      <!-- Admin Main Viewport -->
      <main class="admin-main-viewport">
        <header class="admin-topbar">
          <div class="admin-topbar-title">
            ${getAdminTabHeader(activeAdminTab)}
          </div>
          
          <div class="admin-topbar-actions">
            <button class="btn-secondary admin-topbar-action-btn" onclick="navigateTo('home')">
              🌐 ${isAr ? 'معاينة الموقع' : 'View Site'}
            </button>
            <button class="admin-mobile-toggle" id="admin-mobile-toggle-btn" title="Admin Menu">
              ${isAdminMobileNavOpen ? getIconSvg('X', 22) : getIconSvg('Menu', 22)}
            </button>
          </div>
        </header>

        <div class="admin-content-area">
          ${renderAdminTabBody(activeAdminTab)}
        </div>
      </main>
    </div>
  `;

  // Attach mobile admin drawer toggle (class-based dropdown-from-top)
  const adminMobileToggle = document.getElementById('admin-mobile-toggle-btn');
  const sidebarEl = container.querySelector('.admin-sidebar');

  function ensureBackdropElement() {
    let b = document.getElementById('admin-mobile-backdrop');
    if (b) return b;
    b = document.createElement('div');
    b.id = 'admin-mobile-backdrop';
    b.className = 'admin-backdrop';
    b.addEventListener('click', () => closeMobileNav());
    document.body.appendChild(b);
    // small delay to allow CSS transitions
    requestAnimationFrame(() => { b.style.opacity = '1'; });
    return b;
  }

  function openMobileNav() {
    if (!sidebarEl) return;
    ensureBackdropElement();
    document.body.classList.add('admin-mobile-open');
    if (adminMobileToggle) adminMobileToggle.innerHTML = getIconSvg('X', 22);
    isAdminMobileNavOpen = true;
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    if (!sidebarEl) return;
    document.body.classList.remove('admin-mobile-open');
    const b = document.getElementById('admin-mobile-backdrop');
    if (b) b.remove();
    if (adminMobileToggle) adminMobileToggle.innerHTML = getIconSvg('Menu', 22);
    isAdminMobileNavOpen = false;
    document.body.style.overflow = '';
    // Keep current render to avoid losing event listeners; re-render only when necessary
  }

  if (adminMobileToggle) {
    adminMobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isAdminMobileNavOpen) closeMobileNav(); else openMobileNav();
    });
    adminMobileToggle.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); if (isAdminMobileNavOpen) closeMobileNav(); else openMobileNav(); });
  }

  // Sidebar Tab Switching
  container.querySelectorAll('.admin-nav-list button').forEach(btn => {
    btn.onclick = () => {
      activeAdminTab = btn.dataset.tab;
      if (isAdminMobileNavOpen) closeMobileNav();
      renderAdminView(container);
    };
  });

  document.getElementById('admin-exit-btn').onclick = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Admin sign-out error:', error);
      showToast(isAr ? 'فشل تسجيل الخروج.' : 'Sign out failed.', 'error');
      return;
    }

    isAdminAuthenticated = false;
    isAdminMobileNavOpen = false;
    navigateTo('home');
  };

  attachAdminTabBodyEvents(activeAdminTab, container);
}

function getAdminTabHeader(tab) {
  const isAr = lang === 'ar';
  const headers = {
    overview: isAr ? '📊 نظرة عامة وتحليلات الأداء الحية' : '📊 Realtime Performance Analytics',
    content: isAr ? '📝 محرر عناوين ونصوص الواجهة' : '📝 Main Hero & Text Editor',
    about: isAr ? 'ℹ️ تعديل محتوى صفحة عن الشركة' : 'ℹ️ About Page Editor',
    works: isAr ? '💼 إدارة مشاريع وقصص نجاح البورتفوليو' : '💼 Portfolio Projects Management',
    clients: isAr ? '👥 إدارة شركاء النجاح وتقييمات العملاء' : '👥 Clients & Reviews Management',
    plans: isAr ? '💳 تخصيص أسعار ومزايا باقات النمو' : '💳 Pricing Packages Manager',
    services: isAr ? '🛠️ إدارة قسم الخدمات' : '🛠️ Services Section Manager',
    messages: isAr ? '📬 صندوق رسائل اتصل بنا وطلبات الباقات' : '📬 Incoming Inquiries & Orders Inbox',
    settings: isAr ? '⚙️ إعدادات الحماية وتخزين البيانات' : '⚙️ Security & Data Backup Settings'
  };
  return headers[tab] || '';
}

function renderAdminTabBody(tab) {
  const isAr = lang === 'ar';

  if (tab === 'overview') {
    const unreadCount = appData.messages.filter(m => !m.read).length;
    const recentMessages = appData.messages.slice(0, 4);

    return `
      <!-- Welcome Header Banner -->
      <div style="background: linear-gradient(135deg, rgba(53, 151, 12, 0.15) 0%, rgba(13, 23, 17, 0.9) 100%); border: 1px solid var(--accent-green); border-radius: var(--radius-lg); padding: 24px 30px; margin-bottom: 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-size: 1.6rem; margin-bottom: 6px;" class="gradient-text">${isAr ? '🚀 مرحباً بك في لوحة تحكم SHOT الإدارية' : '🚀 Welcome to SHOT Executive Command Center'}</h2>
          <p style="color: var(--text-secondary); font-size: 0.95rem; margin: 0;">
            ${isAr ? 'إليك الملخص التكتيكي للأداء والطلبات والتحليلات الحية للموقع اليوم.' : 'Here is your live tactical overview of website metrics, portfolio, and leads.'}
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <span class="pill-badge pill-green">🟢 ${isAr ? 'النظام يعمل بكفاءة' : 'System Operational'}</span>
          ${unreadCount > 0 ? `<span class="pill-badge pill-red">📬 ${unreadCount} ${isAr ? 'طلبات غير مقروءة' : 'Unread'}</span>` : ''}
        </div>
      </div>

      <!-- Top KPI Metric Cards -->
      <div class="admin-metrics-row">
        <div class="admin-metric-box">
          <div class="metric-header">
            <div class="metric-icon-wrap">${getIconSvg('Inbox', 22)}</div>
            <span class="metric-trend pill-badge ${unreadCount > 0 ? 'pill-red' : 'pill-green'}">${unreadCount > 0 ? `${unreadCount} ${isAr ? 'جديد' : 'New'}` : (isAr ? 'مستقر' : 'Up to date')}</span>
          </div>
          <div class="metric-val">${appData.messages.length}</div>
          <div class="metric-lbl">${isAr ? 'إجمالي الطلبات والاستفسارات' : 'Total Inquiries'}</div>
        </div>

        <div class="admin-metric-box">
          <div class="metric-header">
            <div class="metric-icon-wrap">${getIconSvg('Briefcase', 22)}</div>
            <span class="metric-trend pill-badge pill-blue">🎬 ${appData.works.filter(w => w.category==='video').length} ${isAr ? 'فيديو' : 'Videos'}</span>
          </div>
          <div class="metric-val">${appData.works.length}</div>
          <div class="metric-lbl">${isAr ? 'مشاريع البورتفوليو النشطة' : 'Portfolio Projects'}</div>
        </div>

        <div class="admin-metric-box">
          <div class="metric-header">
            <div class="metric-icon-wrap">${getIconSvg('Users', 22)}</div>
            <span class="metric-trend pill-badge pill-green">⭐ 5.0 / 5.0</span>
          </div>
          <div class="metric-val">${appData.testimonials.length}</div>
          <div class="metric-lbl">${isAr ? 'تقييمات العملاء وشركاء النجاح' : 'Client Testimonials'}</div>
        </div>

        <div class="admin-metric-box">
          <div class="metric-header">
            <div class="metric-icon-wrap">${getIconSvg('CreditCard', 22)}</div>
            <span class="metric-trend pill-badge pill-purple">${isAr ? 'باقات النمو' : 'Growth Plans'}</span>
          </div>
          <div class="metric-val">${appData.plans.length}</div>
          <div class="metric-lbl">${isAr ? 'باقات الخدمات المتوفرة' : 'Active Service Plans'}</div>
        </div>
      </div>

      <!-- Main Overview Content Grid (Quick Actions & System Status) -->
      <div class="overview-grid-two-col">
        <!-- Quick Control Actions Card -->
        <div class="admin-card">
          <div class="admin-card-header">
            <h3 style="font-size: 1.25rem; display: flex; align-items: center; gap: 10px;">
              ⚡ <span>${isAr ? 'إجراءات الإدارة السريعة' : 'Quick Admin Actions'}</span>
            </h3>
            <span style="font-size: 0.82rem; color: var(--accent-green); font-weight: 700;">${isAr ? 'نقرة واحدة للتنفيذ' : '1-Click Execution'}</span>
          </div>

          <div class="overview-action-grid">
            <button class="action-tile-btn" onclick="openEditWorkModal()">
              <div class="action-tile-icon">➕</div>
              <div>
                <div>${isAr ? 'إضافة مشروع جديد' : 'Add New Work'}</div>
                <div style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">${isAr ? 'بورتفوليو، فيديو أو هوية' : 'Portfolio, Video, Ads'}</div>
              </div>
            </button>

            <button class="action-tile-btn" onclick="openEditTestimonialModal()">
              <div class="action-tile-icon">⭐</div>
              <div>
                <div>${isAr ? 'إضافة تقييم جديد' : 'Add Testimonial'}</div>
                <div style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">${isAr ? 'رأي عميل وتقييم بالنجوم' : 'Client Review & Rating'}</div>
              </div>
            </button>

            <button class="action-tile-btn" onclick="openEditPlanModal()">
              <div class="action-tile-icon">💳</div>
              <div>
                <div>${isAr ? 'إضافة باقة جديدة' : 'Add Service Plan'}</div>
                <div style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">${isAr ? 'باقة نمو ومزايا جديدة' : 'New Plan & Features'}</div>
              </div>
            </button>

            <button class="action-tile-btn" onclick="activeAdminTab='content'; renderApp();">
              <div class="action-tile-icon">📝</div>
              <div>
                <div>${isAr ? 'تعديل نصوص الواجهة' : 'Edit Hero Text'}</div>
                <div style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">${isAr ? 'العناوين والأوصاف الرئيسية' : 'Titles & Descriptions'}</div>
              </div>
            </button>

            <button class="action-tile-btn" onclick="activeAdminTab='messages'; renderApp();">
              <div class="action-tile-icon">📬</div>
              <div>
                <div>${isAr ? 'صندوق الوارد والطلبات' : 'View All Messages'}</div>
                <div style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">${isAr ? `إجمالي ${appData.messages.length} رسالة` : `${appData.messages.length} Inquiries`}</div>
              </div>
            </button>

            <button class="action-tile-btn" onclick="activeAdminTab='settings'; renderApp();">
              <div class="action-tile-icon">⚙️</div>
              <div>
                <div>${isAr ? 'إعدادات الواتساب والحماية' : 'Security & WhatsApp'}</div>
                <div style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">${isAr ? 'رقم الواتساب والرمز السري' : 'PIN & Contact Info'}</div>
              </div>
            </button>
          </div>
        </div>

        <!-- System & Security Health Status Card -->
        <div class="admin-card">
          <div class="admin-card-header">
            <h3 style="font-size: 1.25rem; display: flex; align-items: center; gap: 10px;">
              🖥️ <span>${isAr ? 'حالة السيرفر والتطبيق' : 'System Health & Security'}</span>
            </h3>
            <span class="pill-badge pill-green">🟢 Live</span>
          </div>

          <div class="sys-status-list">
            <div class="sys-status-item">
              <div class="sys-status-label">
                <span>⚡</span>
                <span>${isAr ? 'حالة خادم الويب (Vite Web Server)' : 'Web Server Status'}</span>
              </div>
              <span style="color: var(--accent-green); font-weight: 800; font-family: var(--font-en);">100% Online</span>
            </div>

            <div class="sys-status-item">
              <div class="sys-status-label">
                <span>💾</span>
                <span>${isAr ? 'الحفظ والتخزين التلقائي' : 'Auto Persistence'}</span>
              </div>
              <span class="pill-badge pill-blue">${isAr ? 'مفعل (Local Storage)' : 'Enabled'}</span>
            </div>

            <div class="sys-status-item">
              <div class="sys-status-label">
                <span>🔒</span>
                <span>${isAr ? 'حماية لوحة التحكم' : 'Admin Authorization PIN'}</span>
              </div>
              <span style="font-weight: 800; color: var(--accent-green); font-family: var(--font-en);">**** (Protected)</span>
            </div>

            <div class="sys-status-item">
              <div class="sys-status-label">
                <span>🌐</span>
                <span>${isAr ? 'اللغة الحالية والواجهة' : 'Current Language'}</span>
              </div>
              <span class="pill-badge pill-purple">${isAr ? 'العربية (RTL)' : 'English (LTR)'}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Inquiries Section -->
      <div class="admin-table-card">
        <div style="padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border);">
          <h3 style="font-size: 1.2rem; display: flex; align-items: center; gap: 10px;">
            📬 <span>${isAr ? 'أحدث طلبات الاتصال والاستفسارات' : 'Recent Incoming Inquiries'}</span>
          </h3>
          <button class="btn-secondary" onclick="activeAdminTab='messages'; renderApp();" style="padding: 6px 14px; font-size: 0.85rem;">
            ${isAr ? 'عرض كافة الرسائل (' + appData.messages.length + ')' : 'View All Inquiries'}
          </button>
        </div>

        ${recentMessages.length === 0 ? `<p style="padding:24px; color:var(--text-muted);">${isAr ? 'لا توجد رسائل حالياً' : 'No recent messages'}</p>` : `
          <table class="admin-table-styled">
            <thead>
              <tr>
                <th>${isAr ? 'الراسل' : 'Sender'}</th>
                <th>${isAr ? 'رقم التواصل' : 'Contact'}</th>
                <th>${isAr ? 'نوع الخدمة' : 'Service'}</th>
                <th>${isAr ? 'التاريخ' : 'Date'}</th>
                <th>${isAr ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              ${recentMessages.map(m => `
                <tr style="${!m.read ? 'background:rgba(53,151,12,0.1);' : ''}">
                  <td><strong style="color:var(--text-primary);">${m.name}</strong></td>
                  <td><span style="font-family:var(--font-en); font-size:0.9rem; color:var(--text-secondary);">📞 ${m.phone}</span></td>
                  <td><span class="pill-badge pill-purple">${m.service}</span></td>
                  <td><span class="pill-badge pill-blue">⏱️ ${m.date}</span></td>
                  <td>
                    ${!m.read 
                      ? `<span class="pill-badge pill-red">${isAr ? '🔴 غير مقروء' : 'Unread'}</span>` 
                      : `<span class="pill-badge pill-green">${isAr ? '🟢 مقروء' : 'Read'}</span>`}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    `;
  }

  if (tab === 'content') {
    return `
      <div class="admin-card">
        <form id="admin-content-form">
          <h3 style="color:var(--accent-green); margin-bottom:16px;">🇸🇦 ${isAr ? 'محتوى الواجهة باللغة العربية' : 'Arabic Interface Content'}</h3>
          <div class="form-group">
            <label class="form-label">${isAr ? 'العنوان الرئيسي (Hero Title)' : 'Arabic Title'}</label>
            <input type="text" id="adm-hero-title-ar" class="form-input" value="${appData.hero.ar.title}" />
          </div>
          <div class="form-group">
            <label class="form-label">${isAr ? 'الوصف الفرعي (Subtitle)' : 'Arabic Subtitle'}</label>
            <textarea id="adm-hero-sub-ar" class="form-textarea" rows="2">${appData.hero.ar.subtitle}</textarea>
          </div>

          <h3 style="color:var(--accent-green); margin-top:30px; margin-bottom:16px;">🇺🇸 ${isAr ? 'محتوى الواجهة باللغة الإنجليزية' : 'English Interface Content'}</h3>
          <div class="form-group">
            <label class="form-label">English Title</label>
            <input type="text" id="adm-hero-title-en" class="form-input" value="${appData.hero.en.title}" />
          </div>
          <div class="form-group">
            <label class="form-label">English Subtitle</label>
            <textarea id="adm-hero-sub-en" class="form-textarea" rows="2">${appData.hero.en.subtitle}</textarea>
          </div>

          <button type="submit" class="btn-primary" style="margin-top:16px;">💾 ${isAr ? 'حفظ التعديلات فوراً' : 'Save Changes'}</button>
        </form>
      </div>
    `;
  }

  if (tab === 'about') {
    return `
      <div class="admin-card">
        <form id="admin-about-form">
          <h3 style="color:var(--accent-green); margin-bottom:16px;">🇸🇦 ${isAr ? 'عن الشركة (عربي)' : 'About (Arabic)'}</h3>
          <div class="form-group">
            <label class="form-label">${isAr ? 'العنوان الفرعي (Tag)' : 'Tagline'}</label>
            <input type="text" id="adm-about-tag-ar" class="form-input" value="${appData.about.ar.tag}" />
          </div>
          <div class="form-group">
            <label class="form-label">${isAr ? 'العنوان الرئيسي' : 'Title'}</label>
            <input type="text" id="adm-about-title-ar" class="form-input" value="${appData.about.ar.title}" />
          </div>
          <div class="form-group">
            <label class="form-label">${isAr ? 'الوصف' : 'Description'}</label>
            <textarea id="adm-about-desc-ar" class="form-textarea" rows="4">${appData.about.ar.description}</textarea>
          </div>

          <h3 style="color:var(--accent-green); margin-top:30px; margin-bottom:16px;">🇺🇸 ${isAr ? 'عن الشركة (إنجليزي)' : 'About (English)'}</h3>
          <div class="form-group">
            <label class="form-label">Tagline</label>
            <input type="text" id="adm-about-tag-en" class="form-input" value="${appData.about.en.tag}" />
          </div>
          <div class="form-group">
            <label class="form-label">Title</label>
            <input type="text" id="adm-about-title-en" class="form-input" value="${appData.about.en.title}" />
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea id="adm-about-desc-en" class="form-textarea" rows="4">${appData.about.en.description}</textarea>
          </div>

          <button type="submit" class="btn-primary" style="margin-top:16px;">💾 ${isAr ? 'حفظ تعديلات صفحة About' : 'Save About Page'}</button>
        </form>
      </div>
    `;
  }

  if (tab === 'works') {
    return `
      <div class="admin-table-card">
        <div style="padding:24px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--glass-border);">
          <h3 style="font-size:1.3rem;">💼 ${isAr ? 'مشاريع وقصص نجاح البورتفوليو' : 'Portfolio Projects'}</h3>
          <button class="btn-primary" id="add-work-trigger">➕ ${isAr ? 'إضافة مشروع جديد' : 'Add Work'}</button>
        </div>

        <table class="admin-table-styled">
          <thead>
            <tr>
              <th>${isAr ? 'المشروع والصورة' : 'Project & Preview'}</th>
              <th>${isAr ? 'التصنيف' : 'Category'}</th>
              <th>${isAr ? 'العميل' : 'Client'}</th>
              <th>${isAr ? 'النتائج' : 'Metrics'}</th>
              <th>${isAr ? 'إجراء' : 'Action'}</th>
            </tr>
          </thead>
          <tbody>
            ${appData.works.map(w => `
              <tr>
                <td>
                  <div class="admin-row-item">
                    <img data-media-ref="${w.image || ''}" src="${getMediaSrc(w.image)}" alt="${w.titleAr}" class="admin-row-thumb" />
                    <div class="admin-row-info">
                      <div class="admin-row-title">${isAr ? w.titleAr : w.titleEn}</div>
                      <div class="admin-row-subtitle">${w.titleEn}</div>
                    </div>
                  </div>
                </td>
                <td><span class="pill-badge pill-green">🎬 ${w.category.toUpperCase()}</span></td>
                <td><span class="pill-badge pill-blue">👤 ${isAr ? w.clientAr : w.clientEn}</span></td>
                <td><span style="font-weight:800; color:var(--accent-green);">${isAr ? w.metricsAr : w.metricsEn}</span></td>
                <td>
                  <div style="display:flex; gap:8px;">
                    <button class="icon-btn edit-work-btn" data-id="${w.id}" style="width:38px; height:38px; color:var(--accent-green); border-color:var(--border-color);" title="${isAr ? 'تعديل' : 'Edit'}">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="icon-btn delete-work-btn" data-id="${w.id}" style="width:38px; height:38px; color:#f87171; border-color:rgba(239,68,68,0.4);" title="${isAr ? 'حذف' : 'Delete'}">
                      ${getIconSvg('Trash', 18)}
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (tab === 'clients') {
    return `
      <div class="admin-table-card">
        <div style="padding:24px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--glass-border);">
          <h3 style="font-size:1.3rem;">👥 ${isAr ? 'تقييمات وآراء العملاء' : 'Client Testimonials'}</h3>
          <button class="btn-primary" id="add-test-trigger">➕ ${isAr ? 'إضافة تقييم جديد' : 'Add Testimonial'}</button>
        </div>

        <table class="admin-table-styled">
          <thead>
            <tr>
              <th>${isAr ? 'اسم العميل' : 'Client Name'}</th>
              <th>${isAr ? 'المسمى الوظيفي والشركة' : 'Role & Company'}</th>
              <th>${isAr ? 'التقييم' : 'Rating'}</th>
              <th>${isAr ? 'الرأي' : 'Quote'}</th>
              <th>${isAr ? 'إجراء' : 'Action'}</th>
            </tr>
          </thead>
          <tbody>
            ${appData.testimonials.map(t => `
              <tr>
                <td>
                  <div class="admin-row-item">
                    <div class="admin-avatar" style="width:42px; height:42px; font-size:1.1rem; flex-shrink:0;">${(isAr ? t.nameAr : t.nameEn).charAt(0)}</div>
                    <div class="admin-row-info">
                      <div class="admin-row-title">${isAr ? t.nameAr : t.nameEn}</div>
                      <div class="admin-row-subtitle">${t.nameEn}</div>
                    </div>
                  </div>
                </td>
                <td><span class="pill-badge pill-purple">${isAr ? t.roleAr : t.roleEn}</span></td>
                <td><span class="pill-badge pill-green">⭐ ${t.rating}.0 / 5.0</span></td>
                <td style="max-width:320px; color:var(--text-secondary); font-style:italic;">
                  "${(isAr ? t.quoteAr : t.quoteEn).slice(0, 80)}..."
                </td>
                <td>
                  <div style="display:flex; gap:8px;">
                    <button class="icon-btn edit-test-btn" data-id="${t.id}" style="width:38px; height:38px; color:var(--accent-green); border-color:var(--border-color);" title="${isAr ? 'تعديل' : 'Edit'}">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="icon-btn delete-test-btn" data-id="${t.id}" style="width:38px; height:38px; color:#f87171; border-color:rgba(239,68,68,0.4);" title="${isAr ? 'حذف الرأي' : 'Delete Testimonial'}">
                      ${getIconSvg('Trash', 18)}
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (tab === 'plans') {
    return `
      <div class="admin-table-card">
        <div style="padding:24px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--glass-border);">
          <h3 style="font-size:1.3rem;">💳 ${isAr ? 'إدارة الباقات والخدمات' : 'Plans & Services Management'}</h3>
          <button class="btn-primary" id="add-plan-trigger">➕ ${isAr ? 'إضافة باقة جديدة' : 'Add Plan'}</button>
        </div>

        <table class="admin-table-styled">
          <thead>
            <tr>
              <th>${isAr ? 'اسم الباقة' : 'Plan Name'}</th>
              <th>${isAr ? 'المميزات' : 'Features'}</th>
              <th>${isAr ? 'الحالة' : 'Status'}</th>
              <th>${isAr ? 'إجراء' : 'Action'}</th>
            </tr>
          </thead>
          <tbody>
            ${appData.plans.map(p => `
              <tr>
                <td>
                  <div class="admin-row-info">
                    <div class="admin-row-title">${isAr ? p.nameAr : p.nameEn}</div>
                    <div class="admin-row-subtitle">${p.nameEn}</div>
                  </div>
                </td>
                <td style="max-width:300px; color:var(--text-muted); font-size:0.85rem;">
                  ${(isAr ? p.featuresAr : p.featuresEn).join(', ').slice(0, 80)}...
                </td>
                <td>
                  ${p.popular ? `<span class="pill-badge pill-green">${isAr ? 'الأكثر طلباً' : 'Popular'}</span>` : '-'}
                </td>
                <td>
                  <div style="display:flex; gap:8px;">
                    <button class="icon-btn edit-plan-btn" data-id="${p.id}" style="width:38px; height:38px; color:var(--accent-green); border-color:var(--border-color);" title="${isAr ? 'تعديل' : 'Edit'}">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="icon-btn delete-plan-btn" data-id="${p.id}" style="width:38px; height:38px; color:#f87171; border-color:rgba(239,68,68,0.4);" title="${isAr ? 'حذف' : 'Delete'}">
                      ${getIconSvg('Trash', 18)}
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (tab === 'services') {
    return `
      <div class="admin-table-card">
        <div style="padding:24px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--glass-border);">
          <h3 style="font-size:1.3rem;">🛠️ ${isAr ? 'إدارة خدمات صفحة About' : 'Manage About Services'}</h3>
          <button class="btn-primary" id="add-service-trigger">➕ ${isAr ? 'إضافة خدمة جديدة' : 'Add Service'}</button>
        </div>

        <table class="admin-table-styled">
          <thead>
            <tr>
              <th>${isAr ? 'أيقونة الخدمة' : 'Icon'}</th>
              <th>${isAr ? 'اسم الخدمة' : 'Service Name'}</th>
              <th>${isAr ? 'الوصف' : 'Description'}</th>
              <th>${isAr ? 'مزايا' : 'Benefits'}</th>
              <th>${isAr ? 'إجراء' : 'Action'}</th>
            </tr>
          </thead>
          <tbody>
            ${appData.about.services.map(s => `
              <tr>
                <td><span class="pill-badge pill-blue">${s.icon || '•'}</span></td>
                <td>
                  <div class="admin-row-info">
                    <div class="admin-row-title">${isAr ? s.titleAr : s.titleEn}</div>
                    <div class="admin-row-subtitle">${s.titleEn}</div>
                  </div>
                </td>
                <td style="max-width:320px; color:var(--text-muted); font-size:0.85rem;">${isAr ? s.descAr : s.descEn}</td>
                <td style="max-width:260px; color:var(--text-muted); font-size:0.85rem;">${(isAr ? s.featuresAr : s.featuresEn).slice(0, 3).join(', ') || '-'}</td>
                <td>
                  <div style="display:flex; gap:8px;">
                    <button class="icon-btn edit-service-btn" data-id="${s.id}" style="width:38px; height:38px; color:var(--accent-green); border-color:var(--border-color);" title="${isAr ? 'تعديل' : 'Edit'}">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="icon-btn delete-service-btn" data-id="${s.id}" style="width:38px; height:38px; color:#f87171; border-color:rgba(239,68,68,0.4);" title="${isAr ? 'حذف الخدمة' : 'Delete Service'}">
                      ${getIconSvg('Trash', 18)}
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (tab === 'messages') {
    return `
      <div class="admin-table-card">
        <div style="padding:24px; border-bottom:1px solid var(--glass-border);">
          <h3 style="font-size:1.3rem;">📬 ${isAr ? 'صندوق الرسائل والطلبات الواردة' : 'Inbox Inquiries'}</h3>
        </div>

        ${appData.messages.length === 0 ? `<p style="padding:30px; color:var(--text-muted);">${isAr ? 'لا توجد رسائل حالياً' : 'No messages yet.'}</p>` : `
          <table class="admin-table-styled">
            <thead>
              <tr>
                <th>${isAr ? 'التاريخ والوقت' : 'Date'}</th>
                <th>${isAr ? 'بيانات الراسل' : 'Contact Person'}</th>
                <th>${isAr ? 'نوع الخدمة' : 'Service'}</th>
                <th>${isAr ? 'الحالة' : 'Status'}</th>
                <th>${isAr ? 'إجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              ${appData.messages.map(m => `
                <tr style="${!m.read ? 'background:rgba(53,151,12,0.12);' : ''}">
                  <td><span class="pill-badge pill-blue">⏱️ ${m.date}</span></td>
                  <td>
                    <div class="admin-row-info">
                      <div class="admin-row-title">${m.name}</div>
                      <div class="admin-row-subtitle">📞 ${m.phone} | ✉️ ${m.email}</div>
                    </div>
                  </td>
                  <td><span class="pill-badge pill-purple">${m.service}</span></td>
                  <td>
                    ${!m.read 
                      ? `<button class="pill-badge pill-red mark-read-btn" data-id="${m.id}" style="cursor:pointer;">🔴 غير مقروء (اضغط للتعليم كقراءة)</button>`
                      : `<span class="pill-badge pill-green">🟢 تم الاطلاع</span>`}
                  </td>
                  <td>
                    <button class="icon-btn delete-msg-btn" data-id="${m.id}" style="width:38px; height:38px; color:#f87171; border-color:rgba(239,68,68,0.4);" title="${isAr ? 'حذف الرسالة' : 'Delete Message'}">
                      ${getIconSvg('Trash', 18)}
                    </button>
                  </td>
                </tr>
                <tr style="${!m.read ? 'background:rgba(53,151,12,0.06);' : ''}">
                  <td colspan="5" style="padding-top:0; padding-bottom:20px;">
                    <div style="background:rgba(18,30,24,0.7); padding:16px; border-radius:var(--radius-md); border:1px solid var(--border-color); color:var(--text-secondary); font-style:italic;">
                      💬 "${m.message}"
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    `;
  }

  if (tab === 'settings') {
    return `
      <div class="admin-card">
        <h3 style="font-size:1.3rem; margin-bottom:20px;">⚙️ ${isAr ? 'إعدادات الموقع' : 'Site Settings'}</h3>
        <p style="color:var(--text-muted); margin-bottom:20px; font-size:0.9rem;">
          ${isAr ? 'لوحة التحكم الآن تعتمد على حساب Supabase Auth للإدارة. لا يتم حفظ أي PIN أو كلمة مرور داخل قاعدة بيانات الموقع.' : 'Admin access is now handled by Supabase Auth. No admin PIN or password is stored in site settings.'}
        </p>
        <form id="admin-settings-form">
          <div class="form-group">
            <label class="form-label">${isAr ? 'البريد الإلكتروني الرسمي' : 'Contact Email'}</label>
            <input type="email" id="adm-email" class="form-input" value="${appData.settings.contactEmail}" required />
          </div>
          <div class="form-group">
            <label class="form-label">${isAr ? 'رقم الواتساب والاتصال' : 'WhatsApp Phone'}</label>
            <input type="text" id="adm-phone" class="form-input" value="${appData.settings.contactPhone}" required />
          </div>
          <div class="form-group">
            <label class="form-label">${isAr ? 'رابط زر الواتساب (اختياري)' : 'WhatsApp Button Link (optional)'}</label>
            <input type="text" id="admin-whatsapp-input" class="form-input" value="${appData.settings.whatsapp || ''}" placeholder="https://wa.me/966500000000" />
            <small style="color:var(--text-muted); font-size:0.8rem; margin-top:6px; display:block;">
              ${isAr ? 'اتركه فارغاً ليتم توليد الرابط تلقائياً من رقم الهاتف' : 'Leave empty to auto-generate from phone number'}
            </small>
          </div>
          <div class="form-group">
            <label class="form-label">${isAr ? 'رابط الفيسبوك' : 'Facebook URL'}</label>
            <input type="text" id="adm-fb" class="form-input" value="${appData.settings.facebook || ''}" />
          </div>
          <div class="form-group">
            <label class="form-label">${isAr ? 'رابط الانستجرام' : 'Instagram URL'}</label>
            <input type="text" id="adm-insta" class="form-input" value="${appData.settings.instagram || ''}" />
          </div>
          <button type="submit" class="btn-primary" style="margin-top:10px;">💾 ${isAr ? 'حفظ الإعدادات' : 'Save Settings'}</button>
        </form>

        <hr style="border:none; border-top:1px solid var(--glass-border); margin:30px 0;" />
        
        <h4 style="color:#f87171; margin-bottom:12px;">🚨 ${isAr ? 'إعادة ضبط تفضيلات الواجهة المحلية' : 'Reset Local Preferences'}</h4>
        <button class="btn-secondary" id="reset-data-btn" style="border-color:#f87171; color:#f87171;">
          🔄 ${isAr ? 'إعادة ضبط اللغة والثيم فقط' : 'Reset Language & Theme Only'}
        </button>
      </div>
    `;
  }

  return '';
}

function attachAdminTabBodyEvents(tab, container) {
  const isAr = lang === 'ar';

  if (tab === 'content') {
    const form = document.getElementById('admin-content-form');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        try {
          await requireAdminSession();
        } catch (err) {
          console.error('Admin hero save blocked:', err);
          showToast(isAr ? 'هذه العملية تتطلب تسجيل دخول إداري.' : 'This action requires an admin sign-in.', 'error');
          return;
        }
        const heroRow = {
          title_ar: document.getElementById('adm-hero-title-ar').value.trim(),
          subtitle_ar: document.getElementById('adm-hero-sub-ar').value.trim(),
          title_en: document.getElementById('adm-hero-title-en').value.trim(),
          subtitle_en: document.getElementById('adm-hero-sub-en').value.trim(),
        };

        const { error } = await supabase.from('hero_content').update(heroRow).eq('id', 1);
        if (error) {
          console.error(error);
          showToast(isAr ? 'فشل حفظ محتوى الواجهة. حاول مرة أخرى.' : 'Hero content save failed. Please try again.', 'error');
          return;
        }

        const updatedHero = await loadHeroContentFromSupabase();
        if (updatedHero) {
          appData.hero.ar.title = updatedHero.titleAr;
          appData.hero.ar.subtitle = updatedHero.subtitleAr;
          appData.hero.en.title = updatedHero.titleEn;
          appData.hero.en.subtitle = updatedHero.subtitleEn;
        }
        renderApp();
        renderAdminView(container);
        showToast(isAr ? 'تم تحديث المحتوى بنجاح' : 'Content updated');
      };
    }
  }

  if (tab === 'about') {
    const form = document.getElementById('admin-about-form');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        try {
          await requireAdminSession();
        } catch (err) {
          console.error('Admin about save blocked:', err);
          showToast(isAr ? 'هذه العملية تتطلب تسجيل دخول إداري.' : 'This action requires an admin sign-in.', 'error');
          return;
        }
        const aboutRow = {
          tag_ar: document.getElementById('adm-about-tag-ar').value.trim(),
          title_ar: document.getElementById('adm-about-title-ar').value.trim(),
          description_ar: document.getElementById('adm-about-desc-ar').value.trim(),
          tag_en: document.getElementById('adm-about-tag-en').value.trim(),
          title_en: document.getElementById('adm-about-title-en').value.trim(),
          description_en: document.getElementById('adm-about-desc-en').value.trim(),
        };

        const { error } = await supabase.from('about_content').update(aboutRow).eq('id', 1);
        if (error) {
          console.error(error);
          showToast(isAr ? 'فشل حفظ صفحة About. حاول مرة أخرى.' : 'About save failed. Please try again.', 'error');
          return;
        }

        const updatedAbout = await loadAboutContentFromSupabase();
        if (updatedAbout) {
          appData.about.ar.tag = updatedAbout.tagAr;
          appData.about.ar.title = updatedAbout.titleAr;
          appData.about.ar.description = updatedAbout.descriptionAr;
          appData.about.en.tag = updatedAbout.tagEn;
          appData.about.en.title = updatedAbout.titleEn;
          appData.about.en.description = updatedAbout.descriptionEn;
        }
        renderApp();
        renderAdminView(container);
        showToast(isAr ? 'تم تحديث صفحة About بنجاح' : 'About page updated');
      };
    }
  }

  if (tab === 'works') {
    container.querySelectorAll('.edit-work-btn').forEach(btn => {
      btn.onclick = () => {
        const item = appData.works.find(w => w.id === btn.dataset.id);
        if (item) openEditWorkModal(item);
      };
    });

    container.querySelectorAll('.delete-work-btn').forEach(btn => {
      btn.onclick = async () => {
        if (confirm(isAr ? 'هل أنت متأكد من حذف هذا المشروع؟' : 'Delete this project?')) {
          try {
            await requireAdminSession();
          } catch (err) {
            console.error('Admin work delete blocked:', err);
            showToast(isAr ? 'هذه العملية تتطلب تسجيل دخول إداري.' : 'This action requires an admin sign-in.', 'error');
            return;
          }
          const { error } = await supabase.from('works').delete().eq('id', btn.dataset.id);
          if (error) {
            console.error(error);
            showToast(isAr ? 'فشل حذف المشروع من قاعدة البيانات' : 'Failed to delete from database', 'error');
            return;
          }
          appData.works = await loadWorksFromSupabase();
          renderAdminView(container);
          showToast(isAr ? 'تم حذف المشروع' : 'Work deleted');
        }
      };
    });

    const addBtn = document.getElementById('add-work-trigger');
    if (addBtn) {
      addBtn.onclick = () => openEditWorkModal();
    }
  }

  if (tab === 'clients') {
    container.querySelectorAll('.edit-test-btn').forEach(btn => {
      btn.onclick = () => {
        const item = appData.testimonials.find(t => t.id === btn.dataset.id);
        if (item) openEditTestimonialModal(item);
      };
    });

    container.querySelectorAll('.delete-test-btn').forEach(btn => {
      btn.onclick = async () => {
        if (confirm(isAr ? 'هل أنت متأكد من حذف هذا التقييم؟' : 'Delete this testimonial?')) {
         try {
           await requireAdminSession();
         } catch (err) {
           console.error('Admin testimonial delete blocked:', err);
           showToast(isAr ? 'هذه العملية تتطلب تسجيل دخول إداري.' : 'This action requires an admin sign-in.', 'error');
           return;
         }
         const { error } = await supabase.from('testimonials').delete().eq('id', btn.dataset.id);
          if (error) {
            console.error(error);
            showToast(isAr ? 'فشل حذف التقييم من قاعدة البيانات' : 'Failed to delete testimonial', 'error');
            return;
          }
          appData.testimonials = await loadTestimonialsFromSupabase();
          renderAdminView(container);
          showToast(isAr ? 'تم حذف التقييم' : 'Testimonial deleted');
        }
      };
    });

    const addBtn = document.getElementById('add-test-trigger');
    if (addBtn) {
      addBtn.onclick = () => openEditTestimonialModal();
    }
  }

  if (tab === 'plans') {
    container.querySelectorAll('.edit-plan-btn').forEach(btn => {
      btn.onclick = () => {
        const item = appData.plans.find(p => p.id === btn.dataset.id);
        if (item) openEditPlanModal(item);
      };
    });

    container.querySelectorAll('.delete-plan-btn').forEach(btn => {
      btn.onclick = async () => {
        if (confirm(isAr ? 'حذف هذه الباقة؟' : 'Delete this plan?')) {
         try {
           await requireAdminSession();
         } catch (err) {
           console.error('Admin plan delete blocked:', err);
           showToast(isAr ? 'هذه العملية تتطلب تسجيل دخول إداري.' : 'This action requires an admin sign-in.', 'error');
           return;
         }
         const { error } = await supabase.from('plans').delete().eq('id', btn.dataset.id);
          if (error) {
            console.error(error);
            showToast(isAr ? 'فشل حذف الباقة من قاعدة البيانات' : 'Failed to delete plan', 'error');
            return;
          }
          appData.plans = await loadPlansFromSupabase();
          renderAdminView(container);
        }
      };
    });

    const addBtn = document.getElementById('add-plan-trigger');
    if (addBtn) {
      addBtn.onclick = () => openEditPlanModal();
    }
  }

  if (tab === 'services') {
    container.querySelectorAll('.edit-service-btn').forEach(btn => {
      btn.onclick = () => {
        const item = appData.about.services.find(s => s.id === btn.dataset.id);
        if (item) openEditServiceModal(item);
      };
    });

    container.querySelectorAll('.delete-service-btn').forEach(btn => {
      btn.onclick = async () => {
        if (confirm(isAr ? 'هل أنت متأكد من حذف هذه الخدمة؟' : 'Delete this service?')) {
         try {
           await requireAdminSession();
         } catch (err) {
           console.error('Admin service delete blocked:', err);
           showToast(isAr ? 'هذه العملية تتطلب تسجيل دخول إداري.' : 'This action requires an admin sign-in.', 'error');
           return;
         }
         const { error } = await supabase.from('services').delete().eq('id', btn.dataset.id);
          if (error) {
            console.error(error);
            showToast(isAr ? 'فشل حذف الخدمة من قاعدة البيانات' : 'Failed to delete service', 'error');
            return;
          }
          appData.about.services = await loadServicesFromSupabase();
          renderAdminView(container);
          showToast(isAr ? 'تم حذف الخدمة' : 'Service deleted');
        }
      };
    });

    const addBtn = document.getElementById('add-service-trigger');
    if (addBtn) {
      addBtn.onclick = () => openEditServiceModal();
    }
  }

  if (tab === 'messages') {
    container.querySelectorAll('.mark-read-btn').forEach(btn => {
      btn.onclick = async () => {
       try {
         await requireAdminSession();
       } catch (err) {
         console.error('Admin mark-as-read blocked:', err);
         showToast(isAr ? 'هذه العملية تتطلب تسجيل دخول إداري.' : 'This action requires an admin sign-in.', 'error');
         return;
       }
       const { error } = await supabase.from('messages').update({ read: true }).eq('id', btn.dataset.id);
        if (error) {
          console.error(error);
          showToast(isAr ? 'فشل تعليم الرسالة كمقروءة' : 'Failed to mark as read', 'error');
          return;
        }
        appData.messages = await loadMessagesFromSupabase();
        renderAdminView(container);
      };
    });

    container.querySelectorAll('.delete-msg-btn').forEach(btn => {
      btn.onclick = async () => {
       try {
         await requireAdminSession();
       } catch (err) {
         console.error('Admin message delete blocked:', err);
         showToast(isAr ? 'هذه العملية تتطلب تسجيل دخول إداري.' : 'This action requires an admin sign-in.', 'error');
         return;
       }
       const { error } = await supabase.from('messages').delete().eq('id', btn.dataset.id);
        if (error) {
          console.error(error);
          showToast(isAr ? 'فشل حذف الرسالة' : 'Failed to delete message', 'error');
          return;
        }
        appData.messages = await loadMessagesFromSupabase();
        renderAdminView(container);
        showToast(isAr ? 'تم حذف الرسالة' : 'Message deleted');
      };
    });
  }

  if (tab === 'settings') {
    const form = document.getElementById('admin-settings-form');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        try {
          await requireAdminSession();
        } catch (err) {
          console.error('Admin settings save blocked:', err);
          showToast(isAr ? 'هذه العملية تتطلب تسجيل دخول إداري.' : 'This action requires an admin sign-in.', 'error');
          return;
        }
        const settingsRow = {
          contact_email: document.getElementById('adm-email').value.trim(),
          contact_phone: document.getElementById('adm-phone').value.trim(),
          whatsapp: document.getElementById('admin-whatsapp-input').value.trim(),
          facebook: document.getElementById('adm-fb').value.trim(),
          instagram: document.getElementById('adm-insta').value.trim(),
        };

        const { error } = await supabase.from('settings').update(settingsRow).eq('id', 1);
        if (error) {
          console.error(error);
          showToast(isAr ? 'فشل حفظ الإعدادات. حاول مرة أخرى.' : 'Settings save failed. Please try again.', 'error');
          return;
        }

        const updatedSettings = await loadSettingsFromSupabase();
        if (updatedSettings) {
          appData.settings = {
            ...appData.settings,
            ...updatedSettings,
          };
        }
        updateWhatsAppButton();
        renderApp();
        renderAdminView(container);
        showToast(isAr ? 'تم حفظ الإعدادات' : 'Settings saved');
      };
    }

    const resetBtn = document.getElementById('reset-data-btn');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm(isAr ? 'سيتم إعادة ضبط اللغة والوضع فقط، ولن يتم تغيير بيانات Supabase.' : 'This will reset only your local language and theme preferences; Supabase data stays unchanged.')) {
          lang = 'ar';
          theme = 'dark';
          applyLanguage(lang);
          applyTheme(theme);
          showToast(isAr ? 'تم إعادة ضبط تفضيلات الواجهة المحلية' : 'Local preferences reset');
        }
      };
    }
  }
}

function openEditWorkModal(item = null) {
  const isAr = lang === 'ar';
  let modal = document.getElementById('edit-work-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'edit-work-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const isEdit = !!item;
  const data = item || {
    id: '', category: 'video', titleEn: '', titleAr: '', clientEn: '', clientAr: '',
    image: '', videoUrl: '', summaryEn: '', summaryAr: '', metricsEn: '', metricsAr: '', detailsEn: '', detailsAr: ''
  };

  modal.innerHTML = `
    <div class="modal-card" style="max-width: 800px;">
      <button class="modal-close" onclick="document.getElementById('edit-work-modal').classList.remove('active')">&times;</button>
      <h2 style="margin-bottom: 24px;">${isEdit ? (isAr ? 'تعديل مشروع' : 'Edit Project') : (isAr ? 'إضافة مشروع جديد' : 'Add New Project')}</h2>
      
      <form id="edit-work-form" class="admin-form-grid">
        <div class="form-group grid-col-full">
          <label class="form-label">${isAr ? 'تصنيف المشروع' : 'Category'}</label>
          <select id="adm-w-cat" class="form-select">
            <option value="video" ${data.category === 'video' ? 'selected' : ''}>Video</option>
            <option value="ads" ${data.category === 'ads' ? 'selected' : ''}>Ads</option>
            <option value="branding" ${data.category === 'branding' ? 'selected' : ''}>Branding</option>
            <option value="social" ${data.category === 'social' ? 'selected' : ''}>Social</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">${isAr ? 'اسم المشروع (عربي)' : 'Title (Ar)'}</label>
          <input type="text" id="adm-w-title-ar" class="form-input" value="${data.titleAr || ''}" placeholder="${isAr ? 'أدخل اسم المشروع...' : 'Project Title'}" />
        </div>
        <div class="form-group">
          <label class="form-label">Title (En)</label>
          <input type="text" id="adm-w-title-en" class="form-input" value="${data.titleEn || ''}" placeholder="Project Title (English)" />
        </div>

        <div class="form-group">
          <label class="form-label">${isAr ? 'اسم العميل (عربي)' : 'Client (Ar)'}</label>
          <input type="text" id="adm-w-client-ar" class="form-input" value="${data.clientAr || ''}" placeholder="${isAr ? 'اسم العميل أو الشركة...' : 'Client Name'}" />
        </div>
        <div class="form-group">
          <label class="form-label">Client (En)</label>
          <input type="text" id="adm-w-client-en" class="form-input" value="${data.clientEn || ''}" placeholder="Client Name (English)" />
        </div>

        <div class="form-group grid-col-full">
          <label class="form-label">${isAr ? 'صورة المعاينة (رابط أو رفع من الجهاز)' : 'Preview Image (URL or upload)'}</label>
          <div class="media-input-group">
            <input type="text" id="adm-w-img" class="form-input" value="${data.image || ''}" placeholder="https://..." />
            <label class="file-upload-btn">
              📁 ${isAr ? 'رفع صورة' : 'Upload Image'}
              <input type="file" id="adm-w-img-file" accept="image/*" hidden />
            </label>
          </div>
          <div id="adm-w-img-preview" class="media-preview"></div>
        </div>

        <div class="form-group grid-col-full" id="video-url-group">
          <label class="form-label">${isAr ? 'فيديو المشروع (رابط يوتيوب/فيميو أو رفع فيديو من الجهاز)' : 'Project Video (YouTube/Vimeo link or upload local video file)'}</label>
          <div class="media-input-group">
            <input type="text" id="adm-w-video" class="form-input" value="${data.videoUrl || ''}" placeholder="https://...mp4" />
            <label class="file-upload-btn">
              🎬 ${isAr ? 'رفع فيديو' : 'Upload Video'}
              <input type="file" id="adm-w-video-file" accept="video/*" hidden />
            </label>
          </div>
          <div id="adm-w-video-preview" class="media-preview"></div>
        </div>

        <div class="form-group">
          <label class="form-label">${isAr ? 'وصف مختصر (عربي)' : 'Summary (Ar)'}</label>
          <textarea id="adm-w-sum-ar" class="form-textarea" rows="2" placeholder="${isAr ? 'وصف مختصر...' : 'Summary'}">${data.summaryAr || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Summary (En)</label>
          <textarea id="adm-w-sum-en" class="form-textarea" rows="2" placeholder="Summary (English)">${data.summaryEn || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">${isAr ? 'النتائج/الأرقام (عربي)' : 'Metrics (Ar)'}</label>
          <input type="text" id="adm-w-met-ar" class="form-input" value="${data.metricsAr || ''}" placeholder="${isAr ? 'مثال: +300% مبيعات' : 'e.g. +300% ROI'}" />
        </div>
        <div class="form-group">
          <label class="form-label">Metrics (En)</label>
          <input type="text" id="adm-w-met-en" class="form-input" value="${data.metricsEn || ''}" placeholder="e.g. +300% ROI" />
        </div>

        <div class="form-group grid-col-full">
          <label class="form-label">${isAr ? 'تفاصيل المشروع (عربي)' : 'Full Details (Ar)'}</label>
          <textarea id="adm-w-det-ar" class="form-textarea" rows="3" placeholder="${isAr ? 'تفاصيل المشروع الكاملة...' : 'Full details'}">${data.detailsAr || ''}</textarea>
        </div>
        <div class="form-group grid-col-full">
          <label class="form-label">Full Details (En)</label>
          <textarea id="adm-w-det-en" class="form-textarea" rows="3" placeholder="Full details (English)">${data.detailsEn || ''}</textarea>
        </div>

        <div class="form-group grid-col-full" style="margin-top: 10px;">
          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 15px; font-size: 1.1rem;">
            💾 ${isAr ? 'حفظ المشروع والتغييرات' : 'Save Project Changes'}
          </button>
        </div>
      </form>
    </div>
  `;
  modal.classList.add('active');

  setupMediaInput({
    urlInputId: 'adm-w-img',
    fileInputId: 'adm-w-img-file',
    previewId: 'adm-w-img-preview',
    currentValue: data.image,
    isVideoMode: false
  });

  setupMediaInput({
    urlInputId: 'adm-w-video',
    fileInputId: 'adm-w-video-file',
    previewId: 'adm-w-video-preview',
    currentValue: data.videoUrl,
    isVideoMode: true
  });

  const form = document.getElementById('edit-work-form');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      try {
        await requireAdminSession();
      } catch (err) {
        console.error('Admin work save blocked:', err);
        showToast(isAr ? 'هذه العملية تتطلب تسجيل دخول إداري.' : 'This action requires an admin sign-in.', 'error');
        return;
      }
      
      const titleArVal = document.getElementById('adm-w-title-ar').value.trim();
      const titleEnVal = document.getElementById('adm-w-title-en').value.trim();
      const clientArVal = document.getElementById('adm-w-client-ar').value.trim();
      const clientEnVal = document.getElementById('adm-w-client-en').value.trim();

      if (!titleArVal && !titleEnVal) {
        showToast(isAr ? 'يرجى كتابة اسم المشروع على الأقل' : 'Please enter project title', 'error');
        return;
      }

      const category = document.getElementById('adm-w-cat').value;
      let imageVal = document.getElementById('adm-w-img').value.trim();
      const videoVal = document.getElementById('adm-w-video').value.trim();

      if (!imageVal && videoVal) {
        const thumb = await getAutoThumbnailForVideo(videoVal);
        if (thumb) {
          imageVal = thumb.startsWith('data:') && thumb.length > 150000
            ? await storeMediaBlob(dataUrlToBlob(thumb))
            : thumb;
          document.getElementById('adm-w-img').value = imageVal;
        }
      }

      if (!imageVal) {
        imageVal = 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80';
      }

      const finalData = {
        id: isEdit ? data.id : undefined, // Supabase يولد id تلقائياً للمشاريع الجديدة
        category,
        titleAr: titleArVal || titleEnVal,
        titleEn: titleEnVal || titleArVal,
        clientAr: clientArVal || (isAr ? 'عميل كتم السرية' : 'Confidential Client'),
        clientEn: clientEnVal || clientArVal || 'Confidential Client',
        image: imageVal,
        videoUrl: videoVal,
        summaryAr: document.getElementById('adm-w-sum-ar').value.trim() || titleArVal,
        summaryEn: document.getElementById('adm-w-sum-en').value.trim() || (titleEnVal || titleArVal),
        metricsAr: document.getElementById('adm-w-met-ar').value.trim() || (isAr ? 'مشروع متميز 🔥' : 'Featured Work 🔥'),
        metricsEn: document.getElementById('adm-w-met-en').value.trim() || 'Featured Work 🔥',
        detailsAr: document.getElementById('adm-w-det-ar').value.trim() || (isAr ? 'تم إطلاق هذا المشروع بنجاح بتحقيق نتائج استثنائية.' : 'Project launched successfully.'),
        detailsEn: document.getElementById('adm-w-det-en').value.trim() || 'Project launched successfully.',
      };

      // تحويل الأسماء من camelCase إلى snake_case عشان تتوافق مع أعمدة Supabase
      const workRow = {
        category: finalData.category,
        title_ar: finalData.titleAr,
        title_en: finalData.titleEn,
        client_ar: finalData.clientAr,
        client_en: finalData.clientEn,
        image: finalData.image,
        video_url: finalData.videoUrl,
        summary_ar: finalData.summaryAr,
        summary_en: finalData.summaryEn,
        metrics_ar: finalData.metricsAr,
        metrics_en: finalData.metricsEn,
        details_ar: finalData.detailsAr,
        details_en: finalData.detailsEn,
      };

      let saveError;
      if (isEdit) {
        ({ error: saveError } = await supabase.from('works').update(workRow).eq('id', data.id));
      } else {
        ({ error: saveError } = await supabase.from('works').insert(workRow));
      }

      if (saveError) {
        console.error(saveError);
        const errorMessage = saveError.message ? `${saveError.message}` : (isAr ? 'حدث خطأ أثناء الحفظ في قاعدة البيانات' : 'Database save failed');
        showToast(isAr ? `فشل الحفظ: ${errorMessage}` : `Save failed: ${errorMessage}`, 'error');
        return;
      }

      appData.works = await loadWorksFromSupabase();
      renderApp();
      modal.classList.remove('active');
      showToast(isAr ? 'تم حفظ التعديلات على المشروع بنجاح! 🚀' : 'Project saved successfully!');
    };
  }
}

function openEditPlanModal(item = null) {
  const isAr = lang === 'ar';
  let modal = document.getElementById('edit-plan-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'edit-plan-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const isEdit = !!item;
  const data = item || { id: '', nameAr: '', nameEn: '', featuresAr: [], featuresEn: [], popular: false };

  modal.innerHTML = `
    <div class="modal-card">
      <button class="modal-close" onclick="document.getElementById('edit-plan-modal').classList.remove('active')">&times;</button>
      <h2 style="margin-bottom: 24px;">${isEdit ? (isAr ? 'تعديل الباقة' : 'Edit Plan') : (isAr ? 'إضافة باقة جديدة' : 'Add New Plan')}</h2>
      
      <form id="edit-plan-form" class="admin-form-grid">
        <div class="form-group">
          <label class="form-label">${isAr ? 'اسم الباقة (عربي)' : 'Plan Name (Ar)'}</label>
          <input type="text" id="adm-p-name-ar" class="form-input" value="${data.nameAr || ''}" placeholder="${isAr ? 'أدخل اسم الباقة...' : 'Plan Name'}" />
        </div>
        <div class="form-group">
          <label class="form-label">Plan Name (En)</label>
          <input type="text" id="adm-p-name-en" class="form-input" value="${data.nameEn || ''}" placeholder="Plan Name (English)" />
        </div>

        <div class="form-group grid-col-full">
          <label class="form-label" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox" id="adm-p-popular" ${data.popular ? 'checked' : ''} style="width: 18px; height: 18px;" />
            ${isAr ? 'باقة مميزة (أكثر طلباً)' : 'Highlight as Popular'}
          </label>
        </div>

        <div class="form-group grid-col-full">
          <label class="form-label">${isAr ? 'المميزات (عربي) - كل ميزة في سطر' : 'Features (Ar) - One per line'}</label>
          <textarea id="adm-p-feats-ar" class="form-textarea" rows="4" placeholder="${isAr ? 'ميزة 1\nميزة 2' : 'Feature 1\nFeature 2'}">${(data.featuresAr || []).join('\n')}</textarea>
        </div>
        <div class="form-group grid-col-full">
          <label class="form-label">Features (En) - One per line</label>
          <textarea id="adm-p-feats-en" class="form-textarea" rows="4" placeholder="Feature 1\nFeature 2">${(data.featuresEn || []).join('\n')}</textarea>
        </div>

        <div class="form-group grid-col-full" style="margin-top: 10px;">
          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 14px; font-size: 1.05rem;">
            💾 ${isAr ? 'حفظ الباقة' : 'Save Plan'}
          </button>
        </div>
      </form>
    </div>
  `;
  modal.classList.add('active');

  const form = document.getElementById('edit-plan-form');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      try {
        await requireAdminSession();
      } catch (err) {
        console.error('Admin plan save blocked:', err);
        showToast(isAr ? 'هذه العملية تتطلب تسجيل دخول إداري.' : 'This action requires an admin sign-in.', 'error');
        return;
      }
      const nameArVal = document.getElementById('adm-p-name-ar').value.trim();
      const nameEnVal = document.getElementById('adm-p-name-en').value.trim();

      if (!nameArVal && !nameEnVal) {
        showToast(isAr ? 'يرجى كتابة اسم الباقة' : 'Please enter plan name', 'error');
        return;
      }

      const featsAr = document.getElementById('adm-p-feats-ar').value.split('\n').map(f => f.trim()).filter(Boolean);
      const featsEn = document.getElementById('adm-p-feats-en').value.split('\n').map(f => f.trim()).filter(Boolean);

      const planRow = {
        name_ar: nameArVal || nameEnVal,
        name_en: nameEnVal || nameArVal,
        popular: document.getElementById('adm-p-popular').checked,
        features_ar: featsAr.length ? featsAr : [isAr ? 'خدمة مخصصة' : 'Custom Service'],
        features_en: featsEn.length ? featsEn : (featsAr.length ? featsAr : ['Custom Service']),
      };

      let saveError;
      if (isEdit) {
        ({ error: saveError } = await supabase.from('plans').update(planRow).eq('id', data.id));
      } else {
        ({ error: saveError } = await supabase.from('plans').insert(planRow));
      }

      if (saveError) {
        console.error(saveError);
        showToast(isAr ? 'فشل حفظ الباقة. حاول مرة أخرى.' : 'Plan save failed. Please try again.', 'error');
        return;
      }

      appData.plans = await loadPlansFromSupabase();
      renderApp();
      modal.classList.remove('active');
      showToast(isAr ? 'تم حفظ الباقة بنجاح' : 'Plan saved successfully');
    };
  }
}

function openEditServiceModal(item = null) {
  const isAr = lang === 'ar';
  let modal = document.getElementById('edit-service-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'edit-service-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const isEdit = !!item;
  const data = item || {
    id: '',
    icon: '',
    titleAr: '',
    titleEn: '',
    descAr: '',
    descEn: '',
    featuresAr: [],
    featuresEn: [],
  };

  modal.innerHTML = `
    <div class="modal-card">
      <button class="modal-close" onclick="document.getElementById('edit-service-modal').classList.remove('active')">&times;</button>
      <h2 style="margin-bottom: 24px;">${isEdit ? (isAr ? 'تعديل الخدمة' : 'Edit Service') : (isAr ? 'إضافة خدمة جديدة' : 'Add New Service')}</h2>
      <form id="edit-service-form" class="admin-form-grid">
        <div class="form-group">
          <label class="form-label">${isAr ? 'أيقونة الخدمة' : 'Service Icon'}</label>
          <input type="text" id="adm-s-icon" class="form-input" value="${data.icon || ''}" placeholder="${isAr ? 'مثال: Megaphone' : 'e.g. Megaphone'}" />
        </div>

        <div class="form-group">
          <label class="form-label">${isAr ? 'اسم الخدمة (عربي)' : 'Service Name (Ar)'}</label>
          <input type="text" id="adm-s-name-ar" class="form-input" value="${data.titleAr || ''}" placeholder="${isAr ? 'أدخل اسم الخدمة...' : 'Service Name'}" />
        </div>
        <div class="form-group">
          <label class="form-label">Service Name (En)</label>
          <input type="text" id="adm-s-name-en" class="form-input" value="${data.titleEn || ''}" placeholder="Service Name (English)" />
        </div>

        <div class="form-group grid-col-full">
          <label class="form-label">${isAr ? 'وصف الخدمة (عربي)' : 'Service Description (Ar)'}</label>
          <textarea id="adm-s-desc-ar" class="form-textarea" rows="3" placeholder="${isAr ? 'اكتب وصفاً مختصراً للخدمة...' : 'Write a short description...'}">${data.descAr || ''}</textarea>
        </div>
        <div class="form-group grid-col-full">
          <label class="form-label">Service Description (En)</label>
          <textarea id="adm-s-desc-en" class="form-textarea" rows="3" placeholder="Write a short description...">${data.descEn || ''}</textarea>
        </div>

        <div class="form-group grid-col-full">
          <label class="form-label">${isAr ? 'المزايا (عربي) - كل ميزة في سطر' : 'Benefits (Ar) - One per line'}</label>
          <textarea id="adm-s-feats-ar" class="form-textarea" rows="4" placeholder="${isAr ? 'ميزة 1\nميزة 2' : 'Benefit 1\nBenefit 2'}">${(data.featuresAr || []).join('\n')}</textarea>
        </div>
        <div class="form-group grid-col-full">
          <label class="form-label">Benefits (En) - One per line</label>
          <textarea id="adm-s-feats-en" class="form-textarea" rows="4" placeholder="Benefit 1\nBenefit 2">${(data.featuresEn || []).join('\n')}</textarea>
        </div>

        <div class="form-group grid-col-full" style="margin-top: 10px;">
          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 14px; font-size: 1.05rem;">
            💾 ${isAr ? 'حفظ الخدمة' : 'Save Service'}
          </button>
        </div>
      </form>
    </div>
  `;
  modal.classList.add('active');

  const form = document.getElementById('edit-service-form');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      try {
        await requireAdminSession();
      } catch (err) {
        console.error('Admin service save blocked:', err);
        showToast(isAr ? 'هذه العملية تتطلب تسجيل دخول إداري.' : 'This action requires an admin sign-in.', 'error');
        return;
      }
      const nameArVal = document.getElementById('adm-s-name-ar').value.trim();
      const nameEnVal = document.getElementById('adm-s-name-en').value.trim();
      const descArVal = document.getElementById('adm-s-desc-ar').value.trim();
      const descEnVal = document.getElementById('adm-s-desc-en').value.trim();
      const iconVal = document.getElementById('adm-s-icon').value.trim();
      const featsAr = document.getElementById('adm-s-feats-ar').value.split('\n').map(f => f.trim()).filter(Boolean);
      const featsEn = document.getElementById('adm-s-feats-en').value.split('\n').map(f => f.trim()).filter(Boolean);

      if (!nameArVal && !nameEnVal) {
        showToast(isAr ? 'يرجى كتابة اسم الخدمة' : 'Please enter service name', 'error');
        return;
      }

      const serviceRow = {
        icon: iconVal || data.icon || 'Megaphone',
        title_ar: nameArVal || nameEnVal,
        title_en: nameEnVal || nameArVal,
        desc_ar: descArVal || (isAr ? 'خدمة جديدة مميزة' : 'New service offering'),
        desc_en: descEnVal || (isAr ? 'خدمة جديدة مميزة' : 'New service offering'),
        features_ar: featsAr,
        features_en: featsEn,
      };

      let saveError;
      if (isEdit) {
        ({ error: saveError } = await supabase.from('services').update(serviceRow).eq('id', data.id));
      } else {
        ({ error: saveError } = await supabase.from('services').insert(serviceRow));
      }

      if (saveError) {
        console.error(saveError);
        showToast(isAr ? 'فشل حفظ الخدمة. حاول مرة أخرى.' : 'Service save failed. Please try again.', 'error');
        return;
      }

      appData.about.services = await loadServicesFromSupabase();
      renderApp();
      modal.classList.remove('active');
      showToast(isAr ? 'تم حفظ الخدمة بنجاح' : 'Service saved successfully');
    };
  }
}

function openEditTestimonialModal(item = null) {
  const isAr = lang === 'ar';
  let modal = document.getElementById('edit-test-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'edit-test-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const isEdit = !!item;
  const data = item || { id: '', nameAr: '', nameEn: '', roleAr: '', roleEn: '', quoteAr: '', quoteEn: '', rating: 5 };

  modal.innerHTML = `
    <div class="modal-card">
      <button class="modal-close" onclick="document.getElementById('edit-test-modal').classList.remove('active')">&times;</button>
      <h2 style="margin-bottom: 24px;">${isEdit ? (isAr ? 'تعديل التقييم' : 'Edit Testimonial') : (isAr ? 'إضافة تقييم جديد' : 'Add New Testimonial')}</h2>
      
      <form id="edit-test-form" class="admin-form-grid">
        <div class="form-group">
          <label class="form-label">${isAr ? 'اسم العميل (عربي)' : 'Client Name (Ar)'}</label>
          <input type="text" id="adm-t-name-ar" class="form-input" value="${data.nameAr || ''}" placeholder="${isAr ? 'أدخل اسم العميل...' : 'Client Name'}" />
        </div>
        <div class="form-group">
          <label class="form-label">Client Name (En)</label>
          <input type="text" id="adm-t-name-en" class="form-input" value="${data.nameEn || ''}" placeholder="Client Name (English)" />
        </div>
        <div class="form-group">
          <label class="form-label">${isAr ? 'المسمى الوظيفي والشركة (عربي)' : 'Job Title & Company (Ar)'}</label>
          <input type="text" id="adm-t-role-ar" class="form-input" value="${data.roleAr || ''}" placeholder="${isAr ? 'مثال: مدير التسويق - شركة ABC' : 'e.g. CMO - ABC Corp'}" />
        </div>
        <div class="form-group">
          <label class="form-label">Job Title & Company (En)</label>
          <input type="text" id="adm-t-role-en" class="form-input" value="${data.roleEn || ''}" placeholder="e.g. Marketing Director - ABC Corp" />
        </div>

        <div class="form-group grid-col-full">
          <label class="form-label">${isAr ? 'التقييم بالنجوم' : 'Star Rating'}</label>
          <div class="star-rating-picker" id="star-picker">
            ${[1, 2, 3, 4, 5].map(n => `<span class="star-pick ${n <= data.rating ? 'active' : ''}" data-val="${n}">★</span>`).join('')}
          </div>
          <input type="hidden" id="adm-t-rating" value="${data.rating || 5}" />
        </div>

        <div class="form-group grid-col-full">
          <label class="form-label">${isAr ? 'رأي العميل (عربي)' : 'Client Review (Ar)'}</label>
          <textarea id="adm-t-quote-ar" class="form-textarea" rows="3" placeholder="${isAr ? 'اكتب رأي العميل هنا...' : 'Write review...'}">${data.quoteAr || ''}</textarea>
        </div>
        <div class="form-group grid-col-full">
          <label class="form-label">Client Review (En)</label>
          <textarea id="adm-t-quote-en" class="form-textarea" rows="3" placeholder="Write review (English)...">${data.quoteEn || ''}</textarea>
        </div>

        <div class="form-group grid-col-full" style="margin-top: 10px;">
          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 14px; font-size: 1.05rem;">
            💾 ${isAr ? 'حفظ التقييم' : 'Save Testimonial'}
          </button>
        </div>
      </form>
    </div>
  `;
  modal.classList.add('active');

  setupStarRatingPicker('star-picker', 'adm-t-rating', data.rating || 5);

  const form = document.getElementById('edit-test-form');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      try {
        await requireAdminSession();
      } catch (err) {
        console.error('Admin testimonial save blocked:', err);
        showToast(isAr ? 'هذه العملية تتطلب تسجيل دخول إداري.' : 'This action requires an admin sign-in.', 'error');
        return;
      }
      const nameArVal = document.getElementById('adm-t-name-ar').value.trim();
      const nameEnVal = document.getElementById('adm-t-name-en').value.trim();
      const quoteArVal = document.getElementById('adm-t-quote-ar').value.trim();
      const quoteEnVal = document.getElementById('adm-t-quote-en').value.trim();

      if (!nameArVal && !nameEnVal) {
        showToast(isAr ? 'يرجى إدخال اسم العميل' : 'Please enter client name', 'error');
        return;
      }

      const roleArVal = document.getElementById('adm-t-role-ar').value.trim();
      const roleEnVal = document.getElementById('adm-t-role-en').value.trim();

      const testimonialRow = {
        name_ar: nameArVal || nameEnVal,
        name_en: nameEnVal || nameArVal,
        role_ar: roleArVal || roleEnVal || (isAr ? 'عميل كتم السرية' : 'Client'),
        role_en: roleEnVal || roleArVal || 'Client',
        rating: Number(document.getElementById('adm-t-rating').value) || 5,
        quote_ar: quoteArVal || quoteEnVal || (isAr ? 'تجربة ممتازة وخدمة استثنائية.' : 'Great experience.'),
        quote_en: quoteEnVal || quoteArVal || 'Great experience.',
      };

      let saveError;
      if (isEdit) {
        ({ error: saveError } = await supabase.from('testimonials').update(testimonialRow).eq('id', data.id));
      } else {
        ({ error: saveError } = await supabase.from('testimonials').insert(testimonialRow));
      }

      if (saveError) {
        console.error(saveError);
        showToast(isAr ? 'فشل حفظ التقييم. حاول مرة أخرى.' : 'Testimonial save failed. Please try again.', 'error');
        return;
      }

      appData.testimonials = await loadTestimonialsFromSupabase();
      renderApp();
      modal.classList.remove('active');
      showToast(isAr ? 'تم حفظ التقييم بنجاح' : 'Testimonial saved successfully');
    };
  }
}

// --- Expose functions to window for inline onclick handlers (module scope) ---
window.navigateTo = navigateTo;
window.closeProjectModal = closeProjectModal;
window.renderApp = renderApp;
window.openEditWorkModal = openEditWorkModal;
window.openEditTestimonialModal = openEditTestimonialModal;
window.openEditPlanModal = openEditPlanModal;
window.openEditServiceModal = openEditServiceModal;
Object.defineProperty(window, 'activeAdminTab', {
  get() { return activeAdminTab; },
  set(val) { activeAdminTab = val; }
});

// --- Initialize App ---
// NOTE: The old demo-seed injection code (ensureSeedData/tableIsEmpty) has been
// removed entirely. It was already dead code (unused), and this also eliminates
// any risk of accidental duplicate rows in production.
//
// The perceived "dummy data flash" the user saw on load was NOT caused by seeds —
// it was caused by calling applyTheme(theme) (which triggers a full renderApp())
// before the real Supabase data had arrived, so the page briefly rendered using
// the local `initialData` defaults from data.js. Fixed below by setting the theme
// attribute directly (no render) and showing a lightweight loading screen until
// the real data finishes loading.
document.addEventListener('DOMContentLoaded', async () => {
  // Set the theme attribute without triggering a full render of dummy data.
  document.documentElement.setAttribute('data-theme', theme);
  renderNavbar();
  showInitialLoadingScreen();
  initBackgroundCanvas();

  const { data: { session } } = await supabase.auth.getSession();
  isAdminAuthenticated = !!session;

  const [works, testimonials, plans, messages, settings, heroContent, aboutContent, services] = await Promise.all([
    loadWorksFromSupabase(),
    loadTestimonialsFromSupabase(),
    loadPlansFromSupabase(),
    loadMessagesFromSupabase(),
    loadSettingsFromSupabase(),
    loadHeroContentFromSupabase(),
    loadAboutContentFromSupabase(),
    loadServicesFromSupabase(),
  ]);

  appData.works = works;
  appData.testimonials = testimonials;
  appData.plans = plans;
  appData.messages = messages;
  appData.about.services = services;

  if (settings) {
    appData.settings = {
      ...appData.settings,
      ...settings,
    };
  }

  if (heroContent) {
    appData.hero.ar.title = heroContent.titleAr;
    appData.hero.ar.subtitle = heroContent.subtitleAr;
    appData.hero.en.title = heroContent.titleEn;
    appData.hero.en.subtitle = heroContent.subtitleEn;
  }

  if (aboutContent) {
    appData.about.ar.tag = aboutContent.tagAr;
    appData.about.ar.title = aboutContent.titleAr;
    appData.about.ar.description = aboutContent.descriptionAr;
    appData.about.en.tag = aboutContent.tagEn;
    appData.about.en.title = aboutContent.titleEn;
    appData.about.en.description = aboutContent.descriptionEn;
  }

  await initMediaCache();
  applyLanguage(lang); // First real render, now backed by actual Supabase data.
});

// Security note for production launch:
// - Do not store admin PIN/password in public site settings tables.
// - Use Supabase Auth for all admin access and secure RLS policies.
// - Keep site contact data in settings, but never expose admin credentials, secret tokens,
//   or anything that grants write access to public anon clients.
//
// Supabase column mapping assumptions (verify against your actual DB schema):
// - testimonials: name_ar/name_en, role_ar/role_en, quote_ar/quote_en, rating
// - plans: name_ar/name_en, popular, features_ar (text[]), features_en (text[])
// - messages: name, email, phone, service, budget, message, read
// - settings: id=1, contact_email, contact_phone, whatsapp, facebook, instagram,
//   office_address_ar, office_address_en
// - hero_content: id=1, title_ar, subtitle_ar, title_en, subtitle_en
// - about_content: id=1, tag_ar, title_ar, description_ar, tag_en, title_en, description_en
// - services: id, icon, title_ar, title_en, desc_ar, desc_en, features_ar (text[]), features_en (text[])
// If any of these column names differ, update the load/save mappings accordingly.

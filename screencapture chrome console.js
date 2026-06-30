(async () => {
  // Пробуем MP4 (Chrome 126+), fallback на WebM
  const candidates = [
    'video/mp4;codecs=avc1.42E01E',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
  ];
  const mime = candidates.find(m => MediaRecorder.isTypeSupported(m));
  const ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm';

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: 30, width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false,
    preferCurrentTab: true   // подсветит текущую вкладку в picker
  });

  const chunks = [];
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_000_000 });
  rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  rec.onstop = () => {
    const blob = new Blob(chunks, { type: mime });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {
      href: url, download: `vaseblast.${ext}`
    });
    document.body.appendChild(a); a.click(); a.remove();
    stream.getTracks().forEach(t => t.stop());
    console.log(`✅ Файл скачан: vaseblast.${ext} — ${(blob.size/1024/1024).toFixed(2)} MB`);
  };

  console.log(`🎥 Запись (${mime}). 25 секунд. Играй!`);
  rec.start();

  let left = 25;
  const tick = setInterval(() => {
    left--;
    if (left > 0) console.log(`⏱ ${left}с`);
    else { clearInterval(tick); rec.stop(); }
  }, 1000);
})();

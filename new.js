(async function(){
  const newsEl = document.getElementById('news-text');
  if (!newsEl) return;

  // Fallback text
  const fallback = "📢 '*' চিন্হিত বিশ্ববিদ্যালয় সমূহের তথ্য বিগত ২০২৪-২০২৫ সেশনের ভর্তি বিজ্ঞপ্তি বা সার্কুলার হতে সংগ্রহীত। 📢 Information about the universities marked with '*' has been collected from the admission notices or circulars of the 2024-2025 session.";
  
  // Show fallback immediately
  newsEl.textContent = fallback;

  // Function to get news from JSON
  async function getNews() {
    try {
      const res = await fetch('./news.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      return Array.isArray(data.headlines) && data.headlines.length ? data.headlines.join('  ⎯⎯  ') : fallback;
    } catch (err) {
      console.error('Error loading news.json:', err);
      return fallback;
    }
  }

  // Function to scroll news
  async function scrollNews() {
    const text = await getNews();
    newsEl.textContent = text;

    // Measure widths
    const parentWidth = newsEl.parentElement.offsetWidth;
    const textWidth = newsEl.offsetWidth;

    // Animation duration proportional to text length
    const duration = Math.max(8, Math.min(60, Math.floor(text.length * 0.15 + 12)));

    // Reset position instantly
    newsEl.style.transition = 'none';
    newsEl.style.transform = `translateX(${parentWidth}px)`;

    // Start scroll on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        newsEl.style.transition = `transform ${duration}s linear`;
        newsEl.style.transform = `translateX(-${textWidth}px)`;
      });
    });

    // Wait for scroll + 1.5s, then restart
    setTimeout(scrollNews, (duration + 1.5) * 1000);
  }

  scrollNews();
})();

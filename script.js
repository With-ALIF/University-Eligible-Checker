
/* script.js
   University eligibility checker using JSON.
   - Only update universities.json; JS does not need changes except this for HSC total GPA
   - Displays eligible universities in a colorful table.
   - SSC/HSC GPA validation included.
   - Supports: total GPA requirement (SSC + HSC ≥ total_min_gpa)
   - Supports group_total (Physics+Chem+Math) and HSC total GPA requirement.
*/


(() => {
  // If you add more JSON files later, just add their paths to FILES_TO_LOAD


const FILES_TO_LOAD = [
  { path: './data/medi.json', category: 'Medical' },
  { path: './data/engineering.json', category: 'Engineering' },
  { path: './data/public.json', category: 'University' },
  { path: './data/ju.json', category: 'University' },
  { path: './data/cu.json', category: 'University' },
  { path: './data/jnu.json', category: 'University' },
  { path: './data/ku_Sust.json', category: 'University' },
  { path: './data/hstu.json', category: 'University' },
  { path: './data/gst.json', category: 'University' }
];




  const FETCH_OPTIONS = { cache: "no-cache" };

  // DOM references
  const sscEl = document.getElementById('ssc');
  const sscGpaEl = document.getElementById('ssc_gpa');
  const hscEl = document.getElementById('hsc');
  const hscGpaEl = document.getElementById('hsc_gpa');
  const marks = {
    physics: document.getElementById('marks_physics'),
    chemistry: document.getElementById('marks_chemistry'),
    math: document.getElementById('marks_math'),
    bio: document.getElementById('marks_bio'),
    eng: document.getElementById('marks_eng')
  };
  const checkBtn = document.getElementById('checkBtn');
  const resetBtn = document.getElementById('resetBtn');
  const circularsWrap = document.getElementById('circularsWrap');
  const circularsTbody = document.querySelector('#circulars tbody');
  const searchInput = document.getElementById('searchUni');

  let universities = [];

  // -- Load multiple JSON files and merge arrays.
 async function loadUniversities() {
  try {
    let all = [];

    for (const fileEntry of FILES_TO_LOAD) {
      // support both string entries and object entries
      const path = (typeof fileEntry === 'string') ? fileEntry : fileEntry.path;
      const category = (typeof fileEntry === 'object' && fileEntry.category) ? fileEntry.category : null;

      try {
        const res = await fetch(path, FETCH_OPTIONS);
        if (!res.ok) {
          console.warn(`Skipped loading ${path}: ${res.status} ${res.statusText}`);
          continue;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          // tag category if provided and not already present
          if (category) {
            data.forEach(item => {
              if (!item.category) item.category = category;
            });
          }
          all = all.concat(data);
          console.log(`Loaded ${data.length} items from ${path}`);
        } else {
          console.warn(`${path} did not contain an array; skipping.`);
        }
      } catch (err) {
        console.error(`Error loading ${path}:`, err);
      }
    }

    universities = all;
    console.log("All universities loaded (merged):", universities);
  } catch (err) {
    console.error('Failed to load universities:', err);
    universities = [];
  }
}


  // --- Utility helpers (unchanged logic) ---
  function toFloat(v) {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }

  function validateGPA(gpa) {
    return gpa >= 0.0 && gpa <= 5.0;
  }

  function readStudent() {
    const sscGpa = toFloat(sscGpaEl.value);
    const hscGpa = toFloat(hscGpaEl.value);

    if (!validateGPA(sscGpa)) {
      alert("SSC GPA must be between 0.0 and 5.0");
      sscGpaEl.focus();
      throw new Error("Invalid SSC GPA");
    }
    if (!validateGPA(hscGpa)) {
      alert("HSC GPA must be between 0.0 and 5.0");
      hscGpaEl.focus();
      throw new Error("Invalid HSC GPA");
    }

    return {
      ssc_year: toFloat(sscEl.value),
      ssc_gpa: sscGpa,
      hsc_year: toFloat(hscEl.value),
      hsc_gpa: hscGpa,
      physics: toFloat(marks.physics.value),
      chemistry: toFloat(marks.chemistry.value),
      math: toFloat(marks.math.value),
      bio: toFloat(marks.bio.value),
      eng: toFloat(marks.eng.value)
    };
  }

  function checkUniversity(uni, student) {
    const c = uni.criteria || {};

    // SSC & HSC GPA checks
    if (c.ssc_min_gpa && student.ssc_gpa < toFloat(c.ssc_min_gpa)) {
      console.log(`${uni.name}: SSC GPA too low`);
      return false;
    }
    if (c.hsc_min_gpa && student.hsc_gpa < toFloat(c.hsc_min_gpa)) {
      console.log(`${uni.name}: HSC GPA too low`);
      return false;
    }

    // Total GPA check (SSC + HSC)
    const total = student.ssc_gpa + student.hsc_gpa;
    if (c.total_min_gpa && total < toFloat(c.total_min_gpa)) {
      console.log(`${uni.name}: Total GPA too low`);
      return false;
    }

    // Year checks
    if (c.ssc_year_min && student.ssc_year < toFloat(c.ssc_year_min)) {
      console.log(`${uni.name}: SSC year too old`);
      return false;
    }
    if (c.ssc_year_max && student.ssc_year > toFloat(c.ssc_year_max)) {
      console.log(`${uni.name}: SSC year too recent`);
      return false;
    }
    if (c.hsc_year_min && student.hsc_year < toFloat(c.hsc_year_min)) {
      console.log(`${uni.name}: HSC year too old`);
      return false;
    }
    if (c.hsc_year_max && student.hsc_year > toFloat(c.hsc_year_max)) {
      console.log(`${uni.name}: HSC year too recent`);
      return false;
    }

    // Subject-wise checks
    const subMap = { physics: 'physics', chemistry: 'chemistry', math: 'math', english: 'eng', biology: 'bio' };
    if (c.subjects) {
      for (const sub in c.subjects) {
        if (sub === 'group_total') continue; // skip group_total
        const min = c.subjects[sub];
        if (min === null || min === undefined) continue;
        const val = toFloat(student[subMap[sub]]);
        if (val < toFloat(min)) {
          console.log(`${uni.name}: ${sub} too low`);
          return false;
        }
      }
    }

    // Group total check (Physics + Chemistry + Math)
    if (c.subjects && c.subjects.group_total) {
      const groupSum = student.physics + student.chemistry + student.math;
      if (groupSum < toFloat(c.subjects.group_total)) {
        console.log(`${uni.name}: Physics+Chem+Math sum too low`);
        return false;
      }
    }

    // HSC total GPA check (Physics + Chemistry + Math + English)
    if (c.hsc_total_gpa_required) {
      const hscTotal = student.physics + student.chemistry + student.math + student.eng;
      if (hscTotal < toFloat(c.hsc_total_gpa_required)) {
        console.log(`${uni.name}: HSC total GPA too low (Physics+Chem+Math+English)`);
        return false;
      }
    }

    return true;
  }

  // --- Render results (unchanged, keeps your highlight logic) ---
 function renderResults(matches) {
  circularsTbody.innerHTML = '';
  if (matches.length > 0) {
    circularsWrap.style.display = 'block';

    // Group by category (keep order: Engineering, Medical, Public, Other if you want)
    const orderedCategories = ['Engineering', 'Medical', 'Public'];
    const groups = {};

    matches.forEach(u => {
      const cat = u.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(u);
    });

    // ensure predictable order: first orderedCategories, then remaining keys
    const remaining = Object.keys(groups).filter(k => !orderedCategories.includes(k)).sort();
    const finalOrder = orderedCategories.filter(k => groups[k]).concat(remaining);

    let globalIndex = 0;
    for (const cat of finalOrder) {
      const items = groups[cat];
      if (!items || !items.length) continue;

      // add a section header row
      const headerTr = document.createElement('tr');
      headerTr.className = 'section-header';
      headerTr.innerHTML = `<td colspan="3">${cat}</td>`;
      circularsTbody.appendChild(headerTr);

      items.forEach((u) => {
        globalIndex++;
        const tr = document.createElement('tr');

        let displayName = u.name && typeof u.name === 'string' && u.name.startsWith('*')
          ? u.name.slice(1).trim()
          : (u.name || '');
        let nameClass = (u.name && typeof u.name === 'string' && u.name.startsWith('*')) ? 'highlight' : 'normal';

        tr.innerHTML = `
          <td>${globalIndex}</td>
          <td class="${nameClass}">${displayName} ${u.short ? `(${u.short})` : ''}</td>
          <td>${u.seat || '-'}</td>
        `;
        circularsTbody.appendChild(tr);
      });
    }

  } else {
    circularsWrap.style.display = 'none';
    alert("No eligible universities found.");
  }
}


  // --- Search within rendered rows ---
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      const rows = circularsTbody.querySelectorAll('tr');
      rows.forEach(row => {
        const uniName = row.children[1].textContent.toLowerCase();
        row.style.display = uniName.includes(query) ? '' : 'none';
      });
    });
  }

  // --- Main actions ---
  function runCheck() {
    if (!universities.length) {
      alert('University data not loaded yet.');
      return;
    }
    let student;
    try {
      student = readStudent();
    } catch {
      return;
    }

    const matches = universities.filter(u => checkUniversity(u, student));
    renderResults(matches);
  }

  function runReset() {
    const form = document.getElementById('studentForm');
    if (form) form.reset();
    circularsWrap.style.display = 'none';
    circularsTbody.innerHTML = '';
  }

  // --- Init ---
  (async function init() {
    await loadUniversities();
    if (checkBtn) checkBtn.addEventListener('click', runCheck);
    if (resetBtn) resetBtn.addEventListener('click', runReset);
  })();

})();

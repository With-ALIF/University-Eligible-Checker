/* script.js
   University eligibility checker using JSON.
   - Only update universities.json; JS does not need changes.
   - Displays eligible universities in a colorful table.
   - SSC/HSC GPA validation included.
*/

(() => {
  const JSON_PATH = './universities.json'; // path to your JSON

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

  let universities = [];

  async function loadUniversities() {
    try {
      const res = await fetch(JSON_PATH, { cache: "no-cache" });
      if (!res.ok) throw new Error(`Failed to load ${JSON_PATH}: ${res.status}`);
      universities = await res.json();
      if (!Array.isArray(universities)) universities = [];
      console.log("Universities loaded:", universities);
    } catch (err) {
      console.error(err);
      universities = [];
    }
  }

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

    // Validate GPA
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
      name: document.getElementById('name')?.value || '',
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

    // SSC checks
    if (c.ssc_min_gpa && student.ssc_gpa < toFloat(c.ssc_min_gpa)) return false;
    if (c.ssc_year_min && student.ssc_year < toFloat(c.ssc_year_min)) return false;

    // HSC checks
    if (c.hsc_min_gpa && student.hsc_gpa < toFloat(c.hsc_min_gpa)) return false;
    if (c.hsc_year_min && student.hsc_year < toFloat(c.hsc_year_min)) return false;

    // Subject checks
    const subMap = { physics: 'physics', chemistry: 'chemistry', math: 'math', english: 'eng', biology: 'bio' };
    if (c.subjects) {
      for (const sub in c.subjects) {
        const min = c.subjects[sub];
        if (min === null || min === undefined) continue;
        const val = toFloat(student[subMap[sub]]);
        if (val < toFloat(min)) return false;
      }
    }

    return true;
  }

  function renderResults(matches) {
    circularsTbody.innerHTML = '';

    if (matches.length > 0) {
      circularsWrap.style.display = 'block';
      matches.forEach((u, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${u.name} ${u.short ? `(${u.short})` : ''}</td>
          <td>${u.seat || '-'}</td>
        `;
        circularsTbody.appendChild(tr);
      });
    } else {
      circularsWrap.style.display = 'none';
      alert("No eligible universities found.");
    }
  }

  function runCheck() {
    if (!universities.length) {
      alert('University data not loaded yet.');
      return;
    }
    let student;
    try {
      student = readStudent();
    } catch (e) {
      return; // invalid input, stop execution
    }

    const matches = universities.filter(u => checkUniversity(u, student));
    renderResults(matches);
  }

  function runReset() {
    document.getElementById('studentForm').reset();
    circularsWrap.style.display = 'none';
    circularsTbody.innerHTML = '';
  }

  (async function init() {
    await loadUniversities();
    checkBtn.addEventListener('click', runCheck);
    resetBtn.addEventListener('click', runReset);
  })();

})();
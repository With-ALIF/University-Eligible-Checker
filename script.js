/* script.js
   University eligibility checker using JSON.
   - Only update universities.json; JS does not need changes except this for HSC total GPA
   - Displays eligible universities in a colorful table.
   - SSC/HSC GPA validation included.
   - Supports: total GPA requirement (SSC + HSC ≥ total_min_gpa)
   - Supports group_total (Physics+Chem+Math) and HSC total GPA requirement.
*/

/* script.js
   University eligibility checker using JSON.
   Left color bar visible; click toggles year info (2024/2025)
*/

(() => {
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

  async function loadUniversities() {
    let all = [];
    for (const file of FILES_TO_LOAD) {
      try {
        const res = await fetch(file.path, FETCH_OPTIONS);
        if (!res.ok) continue;
        const data = await res.json();
        if (!Array.isArray(data)) continue;
        data.forEach(d => d.category = d.category || file.category);
        all = all.concat(data);
      } catch(e) { console.error(e); }
    }
    universities = all;
  }

  function toFloat(v){ const n=parseFloat(v); return isNaN(n)?0:n; }
  function validateGPA(g){ return g>=0 && g<=5; }

  function readStudent() {
    const sscG = toFloat(sscGpaEl.value);
    const hscG = toFloat(hscGpaEl.value);
    if(!validateGPA(sscG)) { alert('Invalid SSC GPA'); throw 0; }
    if(!validateGPA(hscG)) { alert('Invalid HSC GPA'); throw 0; }
    return {
      ssc_gpa:sscG, hsc_gpa:hscG,
      ssc_year:toFloat(sscEl.value), hsc_year:toFloat(hscEl.value),
      physics:toFloat(marks.physics.value),
      chemistry:toFloat(marks.chemistry.value),
      math:toFloat(marks.math.value),
      bio:toFloat(marks.bio.value),
      eng:toFloat(marks.eng.value)
    };
  }

  function checkUniversity(uni, st) {
    const c = uni.criteria || {};
    if(c.ssc_min_gpa && st.ssc_gpa < c.ssc_min_gpa) return false;
    if(c.hsc_min_gpa && st.hsc_gpa < c.hsc_min_gpa) return false;
    const total = st.ssc_gpa + st.hsc_gpa;
    if(c.total_min_gpa && total < c.total_min_gpa) return false;
    if(c.subjects && c.subjects.group_total){
      const g = st.physics + st.chemistry + st.math;
      if(g < c.subjects.group_total) return false;
    }
    return true;
  }

  function parseSeatCount(s){
    if(!s) return 0;
    const n = parseInt(String(s).replace(/\D/g,''),10);
    return isNaN(n)?0:n;
  }

  function renderResults(list){
    circularsTbody.innerHTML = '';
    if(!list.length){
      circularsWrap.style.display='block';
      const tr = document.createElement('tr');
      tr.innerHTML=`<td colspan="3" style="text-align:center;padding:12px;">No eligible universities found.</td>`;
      circularsTbody.appendChild(tr);
      return;
    }
    circularsWrap.style.display='block';

    const groups = {};
    list.forEach(u => {
      const c = u.category || 'Other';
      if(!groups[c]) groups[c]=[];
      groups[c].push(u);
    });

    Object.entries(groups).forEach(([cat, arr])=>{
      const totalSeats = arr.reduce((t,u)=>t+parseSeatCount(u.seat),0);
      const head = document.createElement('tr');
      head.className='section-header';
      head.innerHTML=`<td colspan="3">${cat} (Total seats: ${totalSeats || '-'})</td>`;
      circularsTbody.appendChild(head);

      arr.forEach((u,idx)=>{
        const star = typeof u.name==='string' && u.name.startsWith('*');
        const year = star?2024:2025;
        const colorClass=`year-${year}`;
        const infoText=star?'According to HSC 2024':'According to HSC 2025';
        const cleanName = typeof u.name==='string'? (star?u.name.slice(1).trim():u.name):'Unnamed';

        const tr = document.createElement('tr');
        tr.innerHTML=`
          <td>${idx+1}</td>
          <td style="display:flex;align-items:center;">
            <span class="left-bar ${colorClass}" title="Click to reveal"></span>
            <span class="uni-name ${star?'highlight':''}">${cleanName}</span>
            <span class="year-info">${infoText}</span>
          </td>
          <td>${u.seat||'-'}</td>
        `;
        circularsTbody.appendChild(tr);

        const bar = tr.querySelector('.left-bar');
        if(bar){
          bar.addEventListener('click',()=>{
            tr.classList.toggle('show-year');
          });
        }
      });
    });
  }

  if(searchInput){
    searchInput.addEventListener('input',()=>{
      const q=searchInput.value.toLowerCase();
      circularsTbody.querySelectorAll('tr').forEach(r=>{
        if(r.classList.contains('section-header')) return;
        const name = r.innerText.toLowerCase();
        r.style.display = name.includes(q)?'':'none';
      });
    });
  }

  async function runCheck(){
    if(!universities.length) return alert('University data not loaded yet.');
    let st;
    try{ st = readStudent(); } catch{return;}
    const matches = universities.filter(u=>checkUniversity(u, st));
    renderResults(matches);
  }

  function runReset(){
    const f = document.getElementById('studentForm');
    if(f) f.reset();
    circularsWrap.style.display='none';
    circularsTbody.innerHTML='';
  }

  (async function init(){
    await loadUniversities();
    if(checkBtn) checkBtn.addEventListener('click',runCheck);
    if(resetBtn) resetBtn.addEventListener('click',runReset);
  })();
})();

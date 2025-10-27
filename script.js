// Department circular samples (change URLs to real ones if available)
    const CIRCULARS = {
      medical: [
        {title:'Medical Circular 2025 - A',desc:'Admission circular for Medical (sample).'},
        {title:'Medical Notice - Scholarships',desc:'Medical scholarship notice.'}
      ],
      engineering:[
        {title:'Engineering Circular 2025',desc:'Admission circular for Engineering.'},
        {title:'Engineering Eligibility FAQ',desc:'Important FAQ and schedule.'}
      ],
      university:[
        {title:'University General Circular',desc:'General admission circular.'},
        {title:'Merit & Waiting List Info',desc:'Merit list schedule and rules.'}
      ]
    };

    // Configurable thresholds (percentage) per department
    const THRESHOLDS = {
      medical: 85,      // require 85%
      engineering: 80,  // require 80%
      university: 60    // require 60%
    };

    function computeDeductions(dept, hsc_gpa, isSecond){
      const deductions = [];
      if(hsc_gpa < 5){
        deductions.push({label:'HSC GPA < 5.00 → Deduct 2 marks',value:2});
      }
      if(isSecond){
        deductions.push({label:'Second-timer → Deduct 5 marks',value:5});
      }
      return deductions;
    }

    function showCirculars(dept){
      const wrap = document.getElementById('circulars');
      wrap.innerHTML='';
      (CIRCULARS[dept]||[]).forEach(c=>{
        const el = document.createElement('div'); el.className='citem';
        el.innerHTML = `<h4>${c.title}</h4><div class="small">${c.desc}</div><div style="margin-top:8px"><button class="btn edge" onclick="alert('Open circular: ${c.title}')">View</button></div>`;
        wrap.appendChild(el);
      });
    }

    document.getElementById('checkBtn').addEventListener('click', ()=>{
      const ssc = Number(document.getElementById('ssc').value);
      const hsc = Number(document.getElementById('hsc').value);
      const hsc_gpa = Number(document.getElementById('hsc_gpa').value) || 0;
      const dept = document.getElementById('dept').value;
      const second = document.getElementById('second_timer').checked;
      const name = document.getElementById('name').value || 'আপনি';

      // Subject marks
      const mPhy = Number(document.getElementById('marks_physics').value) || 0;
      const mChem = Number(document.getElementById('marks_chemistry').value) || 0;
      const mMath = Number(document.getElementById('marks_math').value) || 0;
      const mBio = Number(document.getElementById('marks_bio').value) || 0;
      const mEng = Number(document.getElementById('marks_eng').value) || 0;

      const out = document.getElementById('output');
      const gap = hsc - ssc;
      const eligibleByGap = (!isNaN(ssc) && !isNaN(hsc) && gap <= 2 && gap >= 0);

      // Reset circulars area
      document.getElementById('circularsWrap').style.display='none';
      document.getElementById('deductions').style.display='none';

      let html = '';
      if(!Number.isFinite(ssc) || !Number.isFinite(hsc)){
        html = `<div class='no'>অনুগ্রহ করে সঠিক বছর লিখুন।</div>`;
        out.innerHTML = html; return;
      }

      if(!eligibleByGap){
        html += `<div class='no'>দুঃখিত ${name}, আপনি এলিজিবল নন। SSC ও HSC সালের মধ্যে ব্যবধান (gap) দুই বছরের বেশি — SSC: ${ssc}, HSC: ${hsc} (gap = ${gap}).</div>`;
        html += `<div class='hint'>শর্ত পূরণ করতে হবে: HSC year - SSC year ≤ 2</div>`;
        out.innerHTML = html; return;
      }

      // Calculate totals
      const subjectTotal = mPhy + mChem + mMath + mBio + mEng; // out of 500
      const maxTotal = 500;

      // Apply deductions (deductions are in marks, subtracted from subjectTotal)
      const deductions = computeDeductions(dept, hsc_gpa, second);
      const totalDeduct = deductions.reduce((s,d)=>s+d.value,0);
      const adjustedTotal = Math.max(0, subjectTotal - totalDeduct);
      const percentage = (adjustedTotal / maxTotal) * 100;

      // Threshold check
      const required = THRESHOLDS[dept] || 60;
      const eligibleByMarks = percentage >= required;

      // Compose result
      html += `<div class='ok'>শিক্ষার্থী: <strong>${name}</strong></div>`;
      html += `<div class='small' style='margin-top:8px'>Raw Total: <strong>${subjectTotal} / ${maxTotal}</strong>. After deductions: <strong>${adjustedTotal} / ${maxTotal}</strong>. শতাংশ: <strong>${percentage.toFixed(2)}%</strong>.</div>`;
      html += `<div style='margin-top:8px'>Department Required: <strong>${required}%</strong>.</div>`;

      if(eligibleByMarks){
        html += `<div class='ok' style='margin-top:10px'>অভিনন্দন — আপনি আমার সিস্টেম অনুযায়ী এলিজিবল।</div>`;
        // show circulars
        showCirculars(dept);
        document.getElementById('circularsWrap').style.display='block';
      } else {
        html += `<div class='no' style='margin-top:10px'>দুঃখিত — আপনার শতাংশ ${percentage.toFixed(02)}%। কর্তিত মান প্রয়োজনীয়তার নিচে: ${required}%।</div>`;
      }

      out.innerHTML = html;

      // Show deduction breakdown
      const dlist = document.getElementById('deductions');
      dlist.style.display = 'flex';
      dlist.innerHTML = '';
      if(deductions.length === 0){
        const e = document.createElement('div'); e.className='ditem'; e.innerHTML = `<div>No deductions applied</div><div>0</div>`; dlist.appendChild(e);
      } else {
        deductions.forEach(d=>{
          const e = document.createElement('div'); e.className='ditem'; e.innerHTML = `<div>${d.label}</div><div>-${d.value}</div>`; dlist.appendChild(e);
        });
        const tot = document.createElement('div'); tot.className='ditem'; tot.innerHTML = `<div style='font-weight:700'>Total Deduction</div><div style='font-weight:700'>-${totalDeduct}</div>`; dlist.appendChild(tot);
      }

      const noteArea = document.createElement('div'); noteArea.className='note';
      noteArea.innerHTML = `<strong>Policy note for ${dept.charAt(0).toUpperCase()+dept.slice(1)}:</strong> Percentage thresholds are configurable in the code (THRESHOLDS). HSC GPA & second-timer deductions are applied as marks subtractions before percentage calculation.`;
      dlist.appendChild(noteArea);

    });

    document.getElementById('resetBtn').addEventListener('click', ()=>{
      document.getElementById('name').value='';
      document.getElementById('ssc').value=2019;
      document.getElementById('ssc_gpa').value=5;
      document.getElementById('hsc').value=2021;
      document.getElementById('hsc_gpa').value=5;
      document.getElementById('dept').value='medical';
      document.getElementById('second_timer').checked=false;
      document.getElementById('marks_physics').value=80;
      document.getElementById('marks_chemistry').value=80;
      document.getElementById('marks_math').value=80;
      document.getElementById('marks_bio').value=80;
      document.getElementById('marks_eng').value=80;
      document.getElementById('output').innerHTML = 'ফর্ম পূরণ করে "Check Eligibility" ক্লিক করুন।';
      document.getElementById('circularsWrap').style.display='none';
      document.getElementById('deductions').style.display='none';
    });

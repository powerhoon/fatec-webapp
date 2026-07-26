// Engineering Calculator: Torque, Force, Power
(function() {
  const tabs = document.querySelectorAll('.calc-tab');
  const panels = document.querySelectorAll('.calc-panel');
  if (!tabs.length) return;

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      panels.forEach(p => p.classList.remove('active'));
      const target = document.getElementById(tab.dataset.target);
      if (target) target.classList.add('active');
    });
  });

  // Tab 1: Torque → Force
  const calcTF = document.getElementById('calc-torque-force');
  if (calcTF) {
    const inputs = calcTF.querySelectorAll('input');
    const result = calcTF.querySelector('.calc-result');
    inputs.forEach(inp => inp.addEventListener('input', computeTF));
    function computeTF() {
      const torque = parseFloat(document.getElementById('tf-torque')?.value) || 0;
      const radius = parseFloat(document.getElementById('tf-radius')?.value) || 0;
      const unit = document.querySelector('input[name="tf-unit"]:checked')?.value || 'mm';
      const r_m = unit === 'mm' ? radius / 1000 : unit === 'cm' ? radius / 100 : radius;
      if (r_m > 0) {
        const force = torque / r_m;
        result.innerHTML = `F = ${torque.toFixed(2)} N·m / ${radius} ${unit} = <strong>${force.toFixed(2)} N</strong> (${(force/9.80665).toFixed(2)} kgf)`;
      } else {
        result.innerHTML = '반경을 입력하세요';
      }
    }
  }

  // Tab 2: Force → Torque
  const calcFT = document.getElementById('calc-force-torque');
  if (calcFT) {
    const inputs = calcFT.querySelectorAll('input');
    const result = calcFT.querySelector('.calc-result');
    inputs.forEach(inp => inp.addEventListener('input', computeFT));
    function computeFT() {
      const force = parseFloat(document.getElementById('ft-force')?.value) || 0;
      const radius = parseFloat(document.getElementById('ft-radius')?.value) || 0;
      const unit = document.querySelector('input[name="ft-unit"]:checked')?.value || 'mm';
      const r_m = unit === 'mm' ? radius / 1000 : unit === 'cm' ? radius / 100 : radius;
      const torque = force * r_m;
      result.innerHTML = `T = ${force.toFixed(2)} N × ${radius} ${unit} = <strong>${torque.toFixed(2)} N·m</strong> (${(torque*8.85075).toFixed(2)} in·lbf)`;
    }
  }

  // Tab 3: Power & Speed
  const calcPS = document.getElementById('calc-power-speed');
  if (calcPS) {
    const inputs = calcPS.querySelectorAll('input');
    const result = calcPS.querySelector('.calc-result');
    inputs.forEach(inp => inp.addEventListener('input', computePS));
    function computePS() {
      const torque = parseFloat(document.getElementById('ps-torque')?.value) || 0;
      const rpm = parseFloat(document.getElementById('ps-rpm')?.value) || 0;
      const power = torque * rpm * 2 * Math.PI / 60000;
      result.innerHTML = `P = ${torque.toFixed(2)} N·m × ${rpm.toFixed(0)} rpm × 2π / 60000 = <strong>${power.toFixed(2)} kW</strong> (${(power*1.34102).toFixed(2)} hp)`;
    }
  }
})();
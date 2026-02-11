async function loadCalculatorData() {
  const params = new URLSearchParams(window.location.search);
  const calculatorType = params.get('type') || 'Calcul';
  document.querySelector('h1').textContent = `🧮 Calculateur - ${calculatorType}`;
  const content = document.getElementById('calculator-content');

  if (calculatorType.toLowerCase().includes('marée')) {
    content.innerHTML = `
      <div class="calculator-form">
        <h4 class="mb-4">Calcul de Marée</h4>
        <div class="mb-3">
          <label>Port de référence</label>
          <select class="form-select" id="tide-port">
            <option>Roscoff</option>
            <option>Brest</option>
            <option>Saint-Malo</option>
          </select>
        </div>
        <div class="mb-3">
          <label>Heure locale</label>
          <input type="time" class="form-control" id="tide-time" />
        </div>
        <button class="btn btn-primary w-100" onclick="calculateTide()">Calculer</button>
        <div id="tide-result" class="mt-3"></div>
      </div>
    `;
    window.calculateTide = function() {
      const result = document.getElementById('tide-result');
      result.innerHTML = '<p class="alert alert-info">Résultat du calcul de marée</p>';
    };
  } else if (calculatorType.toLowerCase().includes('cap')) {
    content.innerHTML = `
      <div class="calculator-form">
        <h4 class="mb-4">Calcul de Cap</h4>
        <div class="mb-3">
          <label>Cap vrai (°)</label>
          <input type="number" class="form-control" id="true-heading" />
        </div>
        <div class="mb-3">
          <label>Déclinaison magnétique (°)</label>
          <input type="number" class="form-control" id="declination" />
        </div>
        <div class="mb-3">
          <label>Déviation (°)</label>
          <input type="number" class="form-control" id="deviation" />
        </div>
        <button class="btn btn-primary w-100" onclick="calculateHeading()">Calculer</button>
        <div id="heading-result" class="mt-3"></div>
      </div>
    `;
    window.calculateHeading = function() {
      const trueHeading = parseFloat(document.getElementById('true-heading').value);
      const declination = parseFloat(document.getElementById('declination').value);
      const deviation = parseFloat(document.getElementById('deviation').value);
      
      if (!isNaN(trueHeading) && !isNaN(declination) && !isNaN(deviation)) {
        const compassHeading = (trueHeading + declination + deviation) % 360;
        document.getElementById('heading-result').innerHTML = 
          `<p class="alert alert-success">Cap compas: ${compassHeading.toFixed(1)}°</p>`;
      }
    };
  }
}

document.addEventListener('DOMContentLoaded', loadCalculatorData);

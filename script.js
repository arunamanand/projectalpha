// CKD-EPI 2021 creatinine equation (race-free)
// eGFR = 142 * min(Scr/kappa, 1)^alpha * max(Scr/kappa, 1)^-1.200 * 0.9938^Age * (1.012 if female)
function calculateEgfr({ ageYears, sex, creatinineMgDl }) {
  const isFemale = sex === "female";
  const kappa = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;

  const ratio = creatinineMgDl / kappa;
  const minTerm = Math.pow(Math.min(ratio, 1), alpha);
  const maxTerm = Math.pow(Math.max(ratio, 1), -1.2);
  const ageTerm = Math.pow(0.9938, ageYears);
  const sexTerm = isFemale ? 1.012 : 1;

  return 142 * minTerm * maxTerm * ageTerm * sexTerm;
}

function getStage(egfr) {
  if (egfr >= 90) {
    return { code: "G1", cssClass: "g1", description: "Normal or high kidney function." };
  }
  if (egfr >= 60) {
    return { code: "G2", cssClass: "g2", description: "Mildly decreased kidney function." };
  }
  if (egfr >= 45) {
    return { code: "G3a", cssClass: "g3a", description: "Mildly to moderately decreased kidney function." };
  }
  if (egfr >= 30) {
    return { code: "G3b", cssClass: "g3b", description: "Moderately to severely decreased kidney function." };
  }
  if (egfr >= 15) {
    return { code: "G4", cssClass: "g4", description: "Severely decreased kidney function." };
  }
  return { code: "G5", cssClass: "g5", description: "Kidney failure." };
}

function umolLToMgDl(umolL) {
  return umolL / 88.4;
}

function clearErrors() {
  document.getElementById("age-error").textContent = "";
  document.getElementById("creatinine-error").textContent = "";
}

function validate({ age, creatinine }) {
  let valid = true;

  if (!Number.isFinite(age) || age < 18 || age > 120) {
    document.getElementById("age-error").textContent = "Enter an age between 18 and 120.";
    valid = false;
  }

  if (!Number.isFinite(creatinine) || creatinine <= 0) {
    document.getElementById("creatinine-error").textContent = "Enter a creatinine value greater than 0.";
    valid = false;
  }

  return valid;
}

function displayResult(egfr) {
  const stage = getStage(egfr);
  const resultSection = document.getElementById("result");
  const badge = document.getElementById("stage-badge");

  document.getElementById("egfr-number").textContent = egfr >= 60 ? Math.round(egfr) : egfr.toFixed(1);
  badge.textContent = stage.code;
  badge.className = "badge " + stage.cssClass;
  document.getElementById("stage-description").textContent = stage.description;

  resultSection.hidden = false;
}

document.getElementById("egfr-form").addEventListener("submit", function (event) {
  event.preventDefault();
  clearErrors();

  const age = parseFloat(document.getElementById("age").value);
  const creatinineRaw = parseFloat(document.getElementById("creatinine").value);
  const unit = document.getElementById("unit").value;
  const sex = document.querySelector('input[name="sex"]:checked').value;

  if (!validate({ age, creatinine: creatinineRaw })) {
    document.getElementById("result").hidden = true;
    return;
  }

  const creatinineMgDl = unit === "umoll" ? umolLToMgDl(creatinineRaw) : creatinineRaw;
  const egfr = calculateEgfr({ ageYears: age, sex, creatinineMgDl });

  displayResult(egfr);
});

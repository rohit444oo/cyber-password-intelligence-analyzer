const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const strengthFill = document.getElementById("strengthFill");
const strengthText = document.getElementById("strengthText");
const entropyText = document.getElementById("entropy");
const crackTimeText = document.getElementById("crackTime");
const recommendationList = document.getElementById("recommendationList");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");

const checks = {
    length: document.getElementById("lengthCheck"),
    upper: document.getElementById("upperCheck"),
    lower: document.getElementById("lowerCheck"),
    number: document.getElementById("numberCheck"),
    special: document.getElementById("specialCheck"),
    repeat: document.getElementById("repeatCheck")
};

passwordInput.addEventListener("input", analyzePassword);

togglePassword.addEventListener("click", () => {
    passwordInput.type =
        passwordInput.type === "password"
            ? "text"
            : "password";
});

generateBtn.addEventListener("click", generatePassword);

copyBtn.addEventListener("click", copyPassword);

function analyzePassword() {

    const password = passwordInput.value;

    let score = 0;
    let recommendations = [];

    const hasLength = password.length >= 12;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const noRepeat = !/(.)\1{2,}/.test(password);

    updateCheck(checks.length, hasLength);
    updateCheck(checks.upper, hasUpper);
    updateCheck(checks.lower, hasLower);
    updateCheck(checks.number, hasNumber);
    updateCheck(checks.special, hasSpecial);
    updateCheck(checks.repeat, noRepeat);

    if (hasLength) score++;
    else recommendations.push("Use at least 12 characters");

    if (hasUpper) score++;
    else recommendations.push("Add uppercase letters");

    if (hasLower) score++;
    else recommendations.push("Add lowercase letters");

    if (hasNumber) score++;
    else recommendations.push("Add numbers");

    if (hasSpecial) score++;
    else recommendations.push("Add special characters");

    if (noRepeat) score++;
    else recommendations.push("Avoid repeated characters");

    if (
        typeof commonPasswords !== "undefined" &&
        commonPasswords.includes(password.toLowerCase())
    ) {
        score = 0;
        recommendations.push("This is a commonly used password");
    }

    updateStrength(score);

    const entropy = calculateEntropy(password);

    entropyText.innerText =
        `${entropy.toFixed(2)} bits`;

    crackTimeText.innerText =
        estimateCrackTime(entropy);

    recommendationList.innerHTML = "";

    recommendations.forEach(item => {
        const li = document.createElement("li");
        li.innerText = item;
        recommendationList.appendChild(li);
    });
}

function updateCheck(element, passed) {

    const text = element.innerText.substring(2);

    element.innerText =
        (passed ? "✅ " : "❌ ") + text;
}

function updateStrength(score) {

    const widths = [
        "0%",
        "20%",
        "40%",
        "60%",
        "80%",
        "100%",
        "100%"
    ];

    const labels = [
        "Very Weak",
        "Weak",
        "Fair",
        "Medium",
        "Strong",
        "Very Strong",
        "Elite"
    ];

    const colors = [
        "#ff0000",
        "#ff4500",
        "#ff9800",
        "#ffc107",
        "#8bc34a",
        "#00e676",
        "#00e5ff"
    ];

    strengthFill.style.width = widths[score];
    strengthFill.style.background = colors[score];

    strengthText.innerText =
        `Password Strength: ${labels[score]}`;
}

function calculateEntropy(password) {

    let pool = 0;

    if (/[a-z]/.test(password)) pool += 26;
    if (/[A-Z]/.test(password)) pool += 26;
    if (/[0-9]/.test(password)) pool += 10;
    if (/[^A-Za-z0-9]/.test(password)) pool += 32;

    if (pool === 0) return 0;

    return password.length * Math.log2(pool);
}

function estimateCrackTime(entropy) {

    if (entropy < 28) return "Instantly";
    if (entropy < 36) return "Few Hours";
    if (entropy < 60) return "Few Months";
    if (entropy < 80) return "Several Years";
    if (entropy < 100) return "Centuries";

    return "Practically Impossible";
}

function generatePassword() {

    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    const allChars =
        upper + lower + numbers + special;

    let password = "";

    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    for(let i = 4; i < 16; i++){
        password += allChars[
            Math.floor(Math.random() * allChars.length)
        ];
    }

    password = password
        .split("")
        .sort(() => Math.random() - 0.5)
        .join("");

    passwordInput.value = password;

    analyzePassword();
}

function copyPassword() {

    if(passwordInput.value === ""){
        alert("Generate or enter a password first!");
        return;
    }

    navigator.clipboard.writeText(
        passwordInput.value
    );

    const oldText = copyBtn.innerHTML;

    copyBtn.innerHTML = "✅ Copied!";

    setTimeout(() => {
        copyBtn.innerHTML = oldText;
    }, 2000);
}
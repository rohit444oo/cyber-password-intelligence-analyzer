// DOM Element References
const gpuTime =document.getElementById("gpuTime");
const hashOutput =document.getElementById("hashOutput");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const strengthFill = document.getElementById("strengthFill");
const strengthText = document.getElementById("strengthText");
const entropyText = document.getElementById("entropy");
const crackTimeText = document.getElementById("crackTime");
const recommendationList = document.getElementById("recommendationList");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const exportBtn = document.getElementById("exportBtn");
const lengthSlider = document.getElementById("lengthSlider");
const lengthValue = document.getElementById("lengthValue");
const includeUpper = document.getElementById("includeUpper");
const includeLower = document.getElementById("includeLower");
const includeNumbers = document.getElementById("includeNumbers");
const includeSymbols = document.getElementById("includeSymbols");
const securityScore = document.getElementById("securityScore");
const securityLevel = document.getElementById("securityLevel");
const breachStatus = document.getElementById("breachStatus");
const nistResult = document.getElementById("nistResult");
const policySelect = document.getElementById("policySelect");

async function generateHash(text){

    const encoder =
        new TextEncoder();

    const data =
        encoder.encode(text);

    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );

    const hashArray =
        Array.from(
            new Uint8Array(
                hashBuffer
            )
        );

    return hashArray
        .map(
            b =>
            b.toString(16)
            .padStart(2,"0")
        )
        .join("");
}

const checks = {
    length: document.getElementById("lengthCheck"),
    upper: document.getElementById("upperCheck"),
    lower: document.getElementById("lowerCheck"),
    number: document.getElementById("numberCheck"),
    special: document.getElementById("specialCheck"),
    repeat: document.getElementById("repeatCheck")
};

// Breached passwords database (fallback if common-passwords.js not loaded)
const breachedPasswords = typeof commonPasswords !== "undefined" ? commonPasswords : [
    "password", "password123", "123456", "12345678", "qwerty", "admin123",
    "letmein", "welcome", "monkey", "dragon", "master", "sunshine",
    "princess", "football", "baseball", "iloveyou", "trustno1", "abc123",
    "admin", "login", "welcome123", "password1", "123456789", "1234567"
];

const keyboardPatterns = [
    "qwerty", "asdf", "zxcv", "123456", "abcd", "qazwsx", "wasd"
];

const personalWords = [
    "rohit", "singh", "gla", "mathura", "india", "rahul", "priya",
    "amit", "kumar", "sharma", "verma", "gupta", "delhi", "mumbai"
];

// Event Listeners
passwordInput.addEventListener("input", analyzePassword);

togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.innerHTML = isPassword
        ? '<i class="fa-solid fa-eye-slash" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-eye" aria-hidden="true"></i>';
    togglePassword.setAttribute("aria-label",
        isPassword ? "Hide password" : "Show password"
    );
});

generateBtn.addEventListener("click", generatePassword);
copyBtn.addEventListener("click", copyPassword);
exportBtn.addEventListener("click", exportReport);

lengthSlider.addEventListener("input", () => {
    lengthValue.innerText = lengthSlider.value;
});

policySelect.addEventListener("change", analyzePassword);

// Main Analysis Function
function analyzePassword() {
    const password = passwordInput.value;
    const policy = policySelect.value;

     //hash generator
     generateHash(password)
.then(hash=>{
    hashOutput.innerText =
        hash.substring(
            0,
            32
        ) + "...";
});

    

    // Get minimum length based on policy
    let minimumLength = 12;
    switch (policy) {
        case "enterprise": minimumLength = 14; break;
        case "banking": minimumLength = 16; break;
        case "government": minimumLength = 18; break;
        case "military": minimumLength = 20; break;
        default: minimumLength = 12;
    }

    // Character checks
    const hasLength = password.length >= minimumLength;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const noRepeat = !/(.)(?=.*.*)/.test(password);

    // Pattern checks
    const hasKeyboardPattern = keyboardPatterns.some(pattern =>
        password.toLowerCase().includes(pattern)
    );

    const hasPersonalInfo = personalWords.some(word =>
        password.toLowerCase().includes(word)
    );

    const isBreached = password.length > 0 && breachedPasswords.includes(password.toLowerCase());

    // NIST Compliance Check
    const isNistCompliant = hasLength && !hasKeyboardPattern && !hasPersonalInfo && !isBreached;

    // Update UI checks
    updateCheck(checks.length, hasLength);
    updateCheck(checks.upper, hasUpper);
    updateCheck(checks.lower, hasLower);
    updateCheck(checks.number, hasNumber);
    updateCheck(checks.special, hasSpecial);
    updateCheck(checks.repeat, noRepeat);

    // Calculate score (0-100)
    let score100 = 0;
    let recommendations = [];

    if (hasLength) score100 += 25;
    else recommendations.push("Use at least " + minimumLength + " characters");

    if (hasUpper) score100 += 10;
    else recommendations.push("Add uppercase letters");

    if (hasLower) score100 += 10;
    else recommendations.push("Add lowercase letters");

    if (hasNumber) score100 += 10;
    else recommendations.push("Add numbers");

    if (hasSpecial) score100 += 10;
    else recommendations.push("Add special characters");

    if (noRepeat) score100 += 10;
    else recommendations.push("Avoid repeated characters (3+ same chars)");

    if (hasKeyboardPattern) {
        score100 -= 10;
        recommendations.push("Avoid keyboard patterns such as qwerty or 123456");
    }

    if (hasPersonalInfo) {
        score100 -= 10;
        recommendations.push("Avoid using personal information in passwords");
    }

    // Entropy bonus
    const entropy = calculateEntropy(password);
    
    //gpu crack
    if(entropy < 40)
    gpuTime.innerText = "Seconds";
else if(entropy < 60)
    gpuTime.innerText = "Hours";
else if(entropy < 80)
    gpuTime.innerText = "Months";
else if(entropy < 100)
    gpuTime.innerText = "Years";
else
    gpuTime.innerText =
        "Practically Impossible";

    if (entropy > 80) score100 += 15;

    document.getElementById(
    "dictionaryAttack"
).innerText =
entropy > 60
? "✅ Dictionary Attack Resistant"
: "❌ Dictionary Attack Vulnerable";

document.getElementById(
    "bruteAttack"
).innerText =
entropy > 80
? "✅ Brute Force Resistant"
: "❌ Brute Force Vulnerable";

document.getElementById(
    "rainbowAttack"
).innerText =
hasSpecial
? "✅ Rainbow Table Resistant"
: "❌ Rainbow Table Vulnerable";

    // Breach penalty
    if (isBreached) {
        score100 -= 30;
        recommendations.push("⚠ This password has been found in known data breaches!");
    }

    // Common password penalty
    if (isBreached) {
        score100 = Math.max(0, score100);
        recommendations.push("This is a commonly used password — extremely insecure!");
    }

    score100 = Math.max(0, Math.min(100, score100));

    // Update Security Level
    let level = "Critical";
    if (score100 >= 90) level = "Enterprise Grade";
    else if (score100 >= 70) level = "Secure";
    else if (score100 >= 50) level = "Moderate";
    else if (score100 >= 30) level = "Risky";
    else if (score100 > 0) level = "Very Weak";

    securityLevel.innerText = level;
    securityScore.innerText = score100 + "/100";

    // Update NIST & Breach
    nistResult.innerText = isNistCompliant ? "PASS ✅" : "FAIL ❌";
    breachStatus.innerText = isBreached ? "⚠ Found in known breaches" : "✅ No breach detected";

    // Update strength bar
    updateStrength(score100);

    // Update entropy & crack time
    entropyText.innerText = password.length > 0 ? entropy.toFixed(2) + " bits" : "0 bits";
    crackTimeText.innerText = password.length > 0 ? estimateCrackTime(entropy) : "-";

    // Update recommendations
    recommendationList.innerHTML = "";
    if (recommendations.length === 0 && password.length > 0) {
        const li = document.createElement("li");
        li.innerText = "✅ Your password meets all security criteria!";
        recommendationList.appendChild(li);
    } else {
        recommendations.forEach(item => {
            const li = document.createElement("li");
            li.innerText = item;
            recommendationList.appendChild(li);
        });
    }
}

function updateCheck(element, passed) {
    const text = element.innerText.substring(2);
    element.innerText = (passed ? "✅ " : "❌ ") + text;
}

function updateStrength(score100) {
    let width, label, color;

    if (score100 >= 90) {
        width = "100%"; label = "Elite"; color = "#00e5ff";
    } else if (score100 >= 70) {
        width = "85%"; label = "Very Strong"; color = "#00e676";
    } else if (score100 >= 50) {
        width = "65%"; label = "Strong"; color = "#8bc34a";
    } else if (score100 >= 30) {
        width = "45%"; label = "Medium"; color = "#ffc107";
    } else if (score100 >= 10) {
        width = "25%"; label = "Weak"; color = "#ff9800";
    } else {
        width = "5%"; label = "Very Weak"; color = "#ff0000";
    }

    strengthFill.style.width = width;
    strengthFill.style.background = color;
    strengthText.innerText = "Password Strength: " + label;
}

function calculateEntropy(password) {
    if (password.length === 0) return 0;

    let pool = 0;
    if (/[a-z]/.test(password)) pool += 26;
    if (/[A-Z]/.test(password)) pool += 26;
    if (/[0-9]/.test(password)) pool += 10;
    if (/[^A-Za-z0-9]/.test(password)) pool += 32;

    if (pool === 0) return 0;

    return password.length * Math.log2(pool);
}

function estimateCrackTime(entropy) {
    if (entropy === 0) return "-";
    if (entropy < 28) return "Instantly";
    if (entropy < 36) return "Few Seconds";
    if (entropy < 50) return "Few Hours";
    if (entropy < 60) return "Few Days";
    if (entropy < 70) return "Few Months";
    if (entropy < 80) return "Few Years";
    if (entropy < 90) return "Several Decades";
    if (entropy < 100) return "Centuries";
    return "Practically Impossible";
}

function generatePassword() {
    let chars = "";

    if (includeUpper.checked) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLower.checked) chars += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers.checked) chars += "0123456789";
    if (includeSymbols.checked) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (chars.length === 0) {
        alert("Select at least one character type!");
        return;
    }

    // Ensure at least one of each selected type
    let password = "";
    const types = [];
    if (includeUpper.checked) types.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    if (includeLower.checked) types.push("abcdefghijklmnopqrstuvwxyz");
    if (includeNumbers.checked) types.push("0123456789");
    if (includeSymbols.checked) types.push("!@#$%^&*()_+-=[]{}|;:,.<>?");

    // Add one char from each selected type first
    types.forEach(type => {
        password += type[Math.floor(Math.random() * type.length)];
    });

    // Fill remaining length
    const remaining = parseInt(lengthSlider.value) - password.length;
    for (let i = 0; i < remaining; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
    }

    // Shuffle the password
    password = password.split("").sort(() => Math.random() - 0.5).join("");

    passwordInput.value = password;
    analyzePassword();
}

function copyPassword() {
    if (passwordInput.value === "") {
        alert("Generate or enter a password first!");
        return;
    }

    navigator.clipboard.writeText(passwordInput.value).then(() => {
        const oldText = copyBtn.innerHTML;
        copyBtn.innerHTML = "✅ Copied!";
        setTimeout(() => {
            copyBtn.innerHTML = oldText;
        }, 2000);
    }).catch(() => {
        alert("Failed to copy password.");
    });
}

function exportReport() {
    const report = {
        timestamp: new Date().toISOString(),
        passwordLength: passwordInput.value.length,
        score: securityScore.innerText,
        level: securityLevel.innerText,
        strength: strengthText.innerText,
        entropy: entropyText.innerText,
        crackTime: crackTimeText.innerText,
        nistCompliance: nistResult.innerText,
        breachStatus: breachStatus.innerText,
        policy: policySelect.value
    };

    const blob = new Blob(
        [JSON.stringify(report, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "security-report-" + Date.now() + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize on load
lengthValue.innerText = lengthSlider.value;
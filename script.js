// 1. GESTION DU MODE (ACCUEIL)
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');

    if (mode === 'calc') {
        const btnCisco = document.getElementById('configBtn');
        if(btnCisco) btnCisco.style.display = 'none';
    }
});

let lastCalc = { ip: "", mask: "", version: "v4" };

// 2. GESTION V4 / V6
document.getElementById('ipVersion').addEventListener('change', function() {
    const isV6 = this.value === 'v6';
    document.getElementById('v4Inputs').style.display = isV6 ? 'none' : 'block';
    document.getElementById('v6Inputs').style.display = isV6 ? 'block' : 'none';
    document.getElementById('resultSection').style.display = 'none';
});

// 3. LOGIQUE DE CALCUL (BOUTON CALCULER)
document.getElementById('calculateBtn').addEventListener('click', function() {
    const version = document.getElementById('ipVersion').value;
    
    if (version === 'v4') {
        const ipInput = document.getElementById('ipInput').value;
        const cidr = parseInt(document.getElementById('cidrInput').value);

        if (!ipInput || isNaN(cidr)) { 
            alert("Veuillez remplir les champs IPv4."); 
            return; 
        }

        // Calcul du Masque
        let maskOctets = []; 
        let temp = cidr;
        for (let i = 0; i < 4; i++) {
            let bits = Math.min(temp, 8);
            maskOctets.push(256 - Math.pow(2, 8 - bits));
            temp -= bits;
        }
        const maskStr = maskOctets.join('.');

        // Calcul Réseau et Broadcast
        const octets = ipInput.split('.').map(Number);
        const net = octets.map((o, i) => o & maskOctets[i]);
        const broad = net.map((o, i) => o | (255 - maskOctets[i]));
        const hosts = Math.pow(2, 32 - cidr) - 2;

        // --- CALCUL PREMIERE ET DERNIERE IP (Correction resFirst / resLast) ---
        let first = [...net]; first[3]++;
        let last = [...broad]; last[3]--;

        // --- INJECTION DANS LE HTML ---
      // --- CALCULS LOGIQUES (Gardés tels quels) ---
    let first = [...net]; first[3]++;
    let last = [...broad]; last[3]--;

    // --- NOUVELLE INJECTION SÉCURISÉE ---
    const inject = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    };

    inject('resNetwork', net.join('.'));
    inject('resMask', maskStr);
    inject('resBroadcast', broad.join('.'));
    inject('resHosts', hosts > 0 ? hosts.toLocaleString() : "0");

    if (hosts > 0) {
        inject('resFirst', first.join('.'));
        inject('resLast', last.join('.'));
        lastCalc.ip = first.join('.');
    } else {
        inject('resFirst', "N/A");
        inject('resLast', "N/A");
        lastCalc.ip = net.join('.');
    }

    // --- MISE À JOUR DES DONNÉES GLOBALES ---
    lastCalc.mask = maskStr;
    lastCalc.version = "v4";

    // Afficher la zone de résultat si elle était cachée
    const resultSection = document.getElementById('resultSection');
    if (resultSection) resultSection.style.display = 'block';

    } else {
        // Logique IPv6 simplifiée
        const ip6 = document.getElementById('ip6Input').value;
        const pref = document.getElementById('cidr6Input').value;
        document.getElementById('resNetwork').innerText = ip6;
        document.getElementById('resFirst').innerText = ip6 + "1"; 
        document.getElementById('resLast').innerText = "Calcul complexe";
        lastCalc = { ip: ip6, mask: pref, version: "v6" };
    }

    // Affichage des résultats
    document.getElementById('resultSection').style.display = 'block';
});

// 4. GENERATION CISCO
document.getElementById('configBtn').addEventListener('click', function() {
    const cmd = lastCalc.version === "v4" ? "ip address" : "ipv6 address";
    const msk = lastCalc.version === "v4" ? lastCalc.mask : "/" + lastCalc.mask;

    document.getElementById('ciscoCode').innerText = 
`! Config via NetAdmin Toolkit
interface GigabitEthernet0/0
 ${cmd} ${lastCalc.ip} ${msk}
 no shutdown
 exit`;
    document.getElementById('configArea').style.display = 'block';
});

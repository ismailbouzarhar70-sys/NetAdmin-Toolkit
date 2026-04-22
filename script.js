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

// 2. GESTION V4 / V6 (SÉCURISÉE)
const ipVersionSelect = document.getElementById('ipVersion');
if (ipVersionSelect) {
    ipVersionSelect.addEventListener('change', function() {
        const isV6 = this.value === 'v6';
        const v4Div = document.getElementById('v4Inputs');
        const v6Div = document.getElementById('v6Inputs');
        const resSec = document.getElementById('resultSection');
        
        if(v4Div) v4Div.style.display = isV6 ? 'none' : 'block';
        if(v6Div) v6Div.style.display = isV6 ? 'block' : 'none';
        if(resSec) resSec.style.display = 'none';
    });
}

// 3. LOGIQUE DE CALCUL (SÉCURISÉE)
const calcBtn = document.getElementById('calculateBtn');
if (calcBtn) {
    calcBtn.addEventListener('click', function() {
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

            let first = [...net]; first[3]++;
            let last = [...broad]; last[3]--;

            // Injection avec vérification d'existence
            const setRes = (id, val) => {
                const el = document.getElementById(id);
                if(el) el.innerText = val;
            };

            setRes('resNetwork', net.join('.'));
            setRes('resMask', maskStr);
            setRes('resBroadcast', broad.join('.'));
            setRes('resHosts', hosts > 0 ? hosts.toLocaleString() : 0);
            
            if (hosts > 0) {
                setRes('resFirst', first.join('.'));
                setRes('resLast', last.join('.'));
                lastCalc.ip = first.join('.'); 
            } else {
                setRes('resFirst', "N/A");
                setRes('resLast', "N/A");
                lastCalc.ip = net.join('.');
            }

            lastCalc.mask = maskStr;
            lastCalc.version = "v4";

        } else {
            const ip6 = document.getElementById('ip6Input').value;
            const pref = document.getElementById('cidr6Input').value;
            document.getElementById('resNetwork').innerText = ip6;
            lastCalc = { ip: ip6, mask: pref, version: "v6" };
        }

        const resSec = document.getElementById('resultSection');
        if(resSec) resSec.style.display = 'block';
    });
}

// 4. GENERATION CISCO (SÉCURISÉE)
const configBtn = document.getElementById('configBtn');
if (configBtn) {
    configBtn.addEventListener('click', function() {
        const cmd = lastCalc.version === "v4" ? "ip address" : "ipv6 address";
        const msk = lastCalc.version === "v4" ? lastCalc.mask : "/" + lastCalc.mask;

        const codeArea = document.getElementById('ciscoCode');
        if(codeArea) {
            codeArea.innerText = `! Config via NetAdmin Toolkit
interface GigabitEthernet0/0
 ${cmd} ${lastCalc.ip} ${msk}
 no shutdown
 exit`;
        }
        const configArea = document.getElementById('configArea');
        if(configArea) configArea.style.display = 'block';
    });
}
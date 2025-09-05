am4core.ready(function() {

am4core.useTheme(am4themes_animated);

var chart = am4core.create("cyber-map", am4maps.MapChart);
chart.geodata = am4geodata_worldLow;
chart.projection = new am4maps.projections.Miller();

var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
polygonSeries.useGeodata = true;
polygonSeries.exclude = ["AQ"];
var polygonTemplate = polygonSeries.mapPolygons.template;
polygonTemplate.tooltipText = "{name}";
polygonTemplate.fill = am4core.color("#4a4a4a");
var hs = polygonTemplate.states.create("hover");
hs.properties.fill = am4core.color("#3a3a3a");

var lineSeries = chart.series.push(new am4maps.MapLineSeries());
var imageSeries = chart.series.push(new am4maps.MapImageSeries());

var barChart = am4core.create("barchartdiv", am4charts.XYChart);
barChart.padding(0, 0, 0, 0);
barChart.data = [];

var categoryAxis = barChart.yAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "country";
categoryAxis.renderer.grid.template.disabled = true;
categoryAxis.renderer.labels.template.fill = am4core.color("#c9d1d9"); // Text color from theme
categoryAxis.renderer.minGridDistance = 1;

var valueAxis = barChart.xAxes.push(new am4charts.ValueAxis());
valueAxis.renderer.grid.template.disabled = true;
valueAxis.renderer.labels.template.disabled = true;
valueAxis.min = 0;

var series = barChart.series.push(new am4charts.ColumnSeries());
series.dataFields.valueX = "attacks";
series.dataFields.categoryY = "country";
series.columns.template.tooltipText = "{categoryY}: {valueX} attacks";
series.columns.template.fill = am4core.color("#58a6ff"); // Blue color from theme
series.columns.template.strokeWidth = 0;
series.columns.template.column.cornerRadiusBottomRight = 5;
series.columns.template.column.cornerRadiusTopRight = 5;

const attackColors = {
    "DDoS": am4core.color("#d12b2b"),      // Darker Red for DDoS
    "Malware": am4core.color("#c48b0c"),   // Darker Orange for Malware
    "Phishing": am4core.color("#2196f3")   // Professional Blue for Phishing
};

let allAttacks = [];

function generateAttack() {
    const locations = [
        { name: "USA", latitude: 38.0, longitude: -97.0 }, { name: "China", latitude: 35.0, longitude: 105.0 },
        { name: "Russia", latitude: 60.0, longitude: 100.0 }, { name: "Germany", latitude: 51.0, longitude: 9.0 },
        { name: "India", latitude: 20.0, longitude: 77.0 }, { name: "Brazil", latitude: -10.0, longitude: -55.0 },
        { name: "Australia", latitude: -25.0, longitude: 135.0 }
    ];
    const attackTypes = ["DDoS", "Malware", "Phishing"];

    let from = locations[Math.floor(Math.random() * locations.length)];
    let to = locations[Math.floor(Math.random() * locations.length)];
    if (from.name === to.name) {
        to = locations[(locations.indexOf(from) + 1) % locations.length];
    }
    
    const attack = {
        type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
        source: from.name, target: to.name, fromLat: from.latitude, fromLon: from.longitude,
        toLat: to.latitude, toLon: to.longitude,
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    };

    allAttacks.push(attack);
    if (allAttacks.length > 50) { allAttacks.shift(); }
    
    drawAttacks();
    updateStats();
    updateBarChart();
}

function drawAttacks(filter = 'all') {
    lineSeries.mapLines.clear();
    imageSeries.mapImages.clear();
    const filteredAttacks = (filter === 'all') ? allAttacks : allAttacks.filter(a => a.type === filter);

    filteredAttacks.forEach(attack => {
        var line = lineSeries.mapLines.create();
        line.multiGeoLine = [[
            { latitude: attack.fromLat, longitude: attack.fromLon },
            { latitude: attack.toLat, longitude: attack.toLon }
        ]];
        line.stroke = attackColors[attack.type];
        line.strokeWidth = 2;
        line.attackData = attack;

        var bullet = line.lineObjects.create();
        bullet.position = 0;
        var circle = bullet.createChild(am4core.Circle);
        circle.radius = 4;
        circle.fill = line.stroke;
        circle.strokeWidth = 1;
        circle.stroke = am4core.color("#fff");
        bullet.animate({ from: 0, to: 1 }, 2000, am4core.ease.linear).events.on("animationended", (ev) => ev.target.dispose());

        let fromCircle = imageSeries.mapImages.create();
        fromCircle.latitude = attack.fromLat;
        fromCircle.longitude = attack.fromLon;
        fromCircle.attackData = attack;

        let toCircle = imageSeries.mapImages.create();
        toCircle.latitude = attack.toLat;
        toCircle.longitude = attack.toLon;
        toCircle.attackData = attack;
    });
}

const detailsBox = document.getElementById('details-box');
const attackInfo = document.getElementById('attack-info');

function showDetails(data) {
    attackInfo.innerHTML = `<strong>Type:</strong> ${data.type}<br><strong>From:</strong> ${data.source}<br><strong>To:</strong> ${data.target}<br><strong>Source IP:</strong> ${data.ip}`;
    detailsBox.classList.remove('hidden');
}
lineSeries.mapLines.template.events.on("hit", (ev) => showDetails(ev.target.attackData));
imageSeries.mapImages.template.events.on("hit", (ev) => showDetails(ev.target.attackData));
document.getElementById('close-details').addEventListener('click', () => detailsBox.classList.add('hidden'));

document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelector('.filter-btn.active').classList.remove('active');
        this.classList.add('active');
        const filter = this.getAttribute('data-filter');
        drawAttacks(filter);
    });
});

function updateStats() {
    document.getElementById('total-attacks').innerText = allAttacks.length;
    const targetCounts = {};
    allAttacks.forEach(attack => {
        targetCounts[attack.target] = (targetCounts[attack.target] || 0) + 1;
    });
    let topTarget = "N/A";
    let maxCount = 0;
    for (const country in targetCounts) {
        if (targetCounts[country] > maxCount) {
            maxCount = targetCounts[country];
            topTarget = country;
        }
    }
    document.getElementById('top-target').innerText = topTarget;
}
function updateBarChart() {
    const targetCounts = {};
    allAttacks.forEach(attack => {
        targetCounts[attack.target] = (targetCounts[attack.target] || 0) + 1;
    });

    let chartData = [];
    for (const country in targetCounts) {
        chartData.push({ "country": country, "attacks": targetCounts[country] });
    }

    // Attacks ke hisaab se sort karein
    chartData.sort((a, b) => b.attacks - a.attacks);

    // Sirf Top 5 countries lein
    barChart.data = chartData.slice(0, 5);
}

const attackDetails = {
    "DDoS": {
        title: "What is a DDoS Attack?",
        what_is_it: "<h3>What is it?</h3><p>DDoS stands for 'Distributed Denial of Service'. It is a type of cyber attack where a hacker overwhelms a website or server with so much fake traffic that it gets overloaded, crashes, and stops working for legitimate users.</p>",
        how_it_works: "<h3>How does it work?</h3><p>The attacker uses thousands or millions of compromised computers (called a 'botnet') to send requests to the target server all at once. The server cannot handle this massive volume of requests and eventually shuts down.</p>"
    },
    "Malware": {
        title: "What is Malware?",
        what_is_it: "<h3>What is it?</h3><p>Malware is short for 'Malicious Software'. It is a type of software designed to harm your computer, steal your data, or spy on your activities. Its types include Viruses, Worms, Trojans, and Ransomware.</p>",
        how_it_works: "<h3>How does it work?</h3><p>Malware often spreads through malicious email attachments, fake software downloads, or infected websites. Once installed, it works silently in the background to steal passwords, encrypt your files for a ransom, or use your computer for other attacks.</p>"
    },
    "Phishing": {
        title: "What is a Phishing Attack?",
        what_is_it: "<h3>What is it?</h3><p>Phishing is a type of social engineering attack where an attacker tries to trick you into revealing your sensitive information, such as usernames, passwords, or credit card details, by pretending to be a trustworthy entity.</p>",
        how_it_works: "<h3>How does it work?</h3><p>You receive an email or a message that looks legitimate, often from a bank or a social media site. It contains a link that takes you to a fake website. When you enter your details on this fake site, the information is sent directly to the hacker.</p>"
    }
};
// 'attackDetails' object ke neeche isko add karein

const caseStudies = {
    "case1": {
        title: "Pune Online Banking Fraud Case",
        details: `<h3>Case Summary</h3>
                  <p>The Cyber Crime Cell of Pune City Police busted a gang that created a counterfeit website of a renowned bank and sent phishing emails to its customers. When users entered their login credentials on this fake website, their details were stolen to siphon money from their accounts.</p>
                  <h3>Action Under the IT Act</h3>
                  <p>In this matter, the accused were prosecuted under several sections of the Information Technology Act, 2000:</p>
                  <ul>
                    <li><strong>Section 66C (Identity Theft):</strong> For fraudulently using the identity information (username/password) of another person.</li>
                    <li><strong>Section 66D (Cheating by Personation):</strong> For cheating by impersonating the bank using a computer resource.</li>
                    <li><strong>Section 43 (Damage to computer, computer system):</strong> For gaining unauthorized access to the users' computers and the bank's server.</li>
                  </ul>
                  <h3>Findings</h3>
                  <p>Based on digital evidence like server logs, IP addresses, and bank transaction records, the accused were found guilty and sentenced to imprisonment and a fine. This case highlighted the critical importance of online banking security and user awareness.</p>`
    },
    "case2": {
        title: "Corporate Data Theft Case",
        details: `<h3>Case Summary</h3>
                  <p>A former employee of a Bengaluru-based IT company, after his termination, stole the source code of a new, unreleased software along with confidential client data from the company's servers. He then attempted to sell this stolen intellectual property to a rival company.</p>
                  <h3>Action Under the IT Act</h3>
                  <p>Following a complaint by the company, the police registered a case under the Information Technology Act, 2000:</p>
                  <ul>
                    <li><strong>Section 66 (Computer Related Offences):</strong> For dishonestly stealing electronic data, which constitutes a criminal application of Section 43.</li>
                    <li><strong>Section 65 (Tampering with Computer Source Documents):</strong> For knowingly or intentionally concealing or altering the computer source code.</li>
                  </ul>
                  <h3>Findings</h3>
                  <p>A forensic investigation recovered the stolen data from the accused's personal laptop. The court considered it a serious case of corporate espionage and handed a strict sentence to the accused under the IT Act. This case served as a wake-up call for companies to strengthen their internal data security policies and employee exit protocols.</p>`
    }
};

const modal = document.getElementById('info-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalCloseBtn = document.getElementById('modal-close-btn');

function showInfoModal(attackType) {
    const details = attackDetails[attackType];
    if (details) {
        modalTitle.innerText = details.title;
        modalBody.innerHTML = details.what_is_it + details.how_it_works;
        modal.classList.remove('hidden');
    }
}

// 'showInfoModal()' function ke neeche isko add karein

function showCaseStudyModal(caseId) {
    const caseData = caseStudies[caseId];
    if (caseData) {
        modalTitle.innerText = caseData.title;
        modalBody.innerHTML = caseData.details;
        modal.classList.remove('hidden');
    }
}


function hideInfoModal() { modal.classList.add('hidden'); }

document.querySelectorAll('.info-btn').forEach(button => {
    button.addEventListener('click', function() {
        const attackType = this.getAttribute('data-attack');
        showInfoModal(attackType);
    });
});
modalCloseBtn.addEventListener('click', hideInfoModal);
modal.addEventListener('click', (event) => { if (event.target === modal) { hideInfoModal(); } });


// Script ke aakhir mein isko add karein

document.querySelectorAll('.read-more-btn').forEach(button => {
    button.addEventListener('click', function() {
        const caseId = this.getAttribute('data-caseid');
        showCaseStudyModal(caseId);
    });
});

setInterval(generateAttack, 2000);


});
// FIREBASE

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyBL7l-SkL6ha9FQsnnsQmGpqHg72szd8tQ",
authDomain: "smart-tna-bd.firebaseapp.com",
projectId: "smart-tna-bd",
storageBucket: "smart-tna-bd.firebasestorage.app",
messagingSenderId: "372049573207",
appId: "1:372049573207:web:571beae951f9aa4b47fa12"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tnaBody = document.getElementById("tnaBody");

// ======================================
// LOAD ORDERS
// ======================================

async function loadTNA() {

tnaBody.innerHTML = "";

const snapshot = await getDocs(
collection(db, "orders")
);

let sl = 1;

snapshot.forEach((docSnap) => {

const data = docSnap.data();

// -----------------------------
// DATE
// -----------------------------

const orderDate =
data.orderDate || "";

const shipmentDate =
data.shipdate ||
data.shipmentDate ||
"";

let leadTime = 0;

if(orderDate && shipmentDate){

const od = new Date(orderDate);
const sd = new Date(shipmentDate);

leadTime =
Math.ceil(
(sd - od) /
(1000*60*60*24)
);

}

// -----------------------------
// PROGRESS
// -----------------------------

const stages = [

data.fabricBooking,
data.yarnInhouse,
data.colorSwatch,
data.labDipSubmit,
data.labDipApproval,
data.g2Receive,
data.strikeOffSend,
data.strikeOffApproval,
data.knittingStart,
data.knittingComplete,
data.dyeingStart,
data.dyeingComplete,
data.sampleFabric,
data.ppSampleSubmit,
data.sewingTrims,
data.fabricTestStart,
data.fabricTestComplete,
data.ppApproval,
data.sizeSet,
data.ppMeeting,
data.cuttingStart,
data.printStart,
data.printComplete,
data.sewingInput,
data.sewingStart,
data.inlineInspection,
data.packingTrims,
data.sewingComplete,
data.finishingStart,
data.packingStart,
data.packingComplete,
data.finalInspection,
data.shipmentApproval

];

let completed = 0;

stages.forEach(item => {

if(item){
completed++;
}

});

const progress =
Math.round(
(completed / stages.length) * 100
);

// -----------------------------
// STATUS
// -----------------------------

let finalStatus = "Pending";

if(progress === 100){
finalStatus = "Completed";
}
else if(progress > 0){
finalStatus = "Running";
}

// -----------------------------
// ROW
// -----------------------------

tnaBody.innerHTML += `

<tr>

<td>${sl++}</td>

<td>${data.buyer || ""}</td>

<td>${data.ikl || ""}</td>

<td>${data.style || ""}</td>

<td>${data.totalQty || ""}</td>

<td>${orderDate}</td>

<td>${shipmentDate}</td>

<td>${leadTime} Days</td>

<td>${data.merchandiser || ""}</td>

<td>${progress}%</td>

<td>${data.fabricBooking || ""}</td>
<td>${statusBadge(data.fabricBooking)}</td>

<td>${data.yarnInhouse || ""}</td>
<td>${statusBadge(data.yarnInhouse)}</td>

<td>${data.colorSwatch || ""}</td>
<td>${statusBadge(data.colorSwatch)}</td>

<td>${data.labDipSubmit || ""}</td>
<td>${statusBadge(data.labDipSubmit)}</td>

<td>${data.labDipApproval || ""}</td>
<td>${statusBadge(data.labDipApproval)}</td>

<td>${data.g2Receive || ""}</td>
<td>${statusBadge(data.g2Receive)}</td>

<td>${data.strikeOffSend || ""}</td>
<td>${statusBadge(data.strikeOffSend)}</td>

<td>${data.strikeOffApproval || ""}</td>
<td>${statusBadge(data.strikeOffApproval)}</td>

<td colspan="44">
More Stages...
</td>

<td>
<span class="
${finalStatus==="Completed"
? "status-completed"
: "status-running"}
">
${finalStatus}
</span>
</td>

<td>

<button class="btn-edit">
Edit
</button>

<button class="btn-delete">
Delete
</button>

</td>

</tr>

`;

});

}

// ======================================
// STATUS BADGE
// ======================================

function statusBadge(value){

if(value){

return `
<span class="status-completed">
Completed
</span>
`;

}

return `
<span class="status-pending">
Pending
</span>
`;

}

// ======================================
// SEARCH
// ======================================

document
.getElementById("searchInput")
.addEventListener("keyup", function(){

const value =
this.value.toLowerCase();

const rows =
document.querySelectorAll("#tnaBody tr");

rows.forEach(row=>{

row.style.display =
row.innerText
.toLowerCase()
.includes(value)
? ""
: "none";

});

});

// ======================================

loadTNA();

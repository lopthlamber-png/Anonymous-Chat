let data;
let questions = [];
let username = localStorage.getItem("username");
let current = parseInt(localStorage.getItem("current")) || 0;
let answers = JSON.parse(localStorage.getItem("answers")) || [];

fetch("questions.json")
.then(r=>r.json())
.then(d=>{
    data = d;
    questions = data.NewPart[0].Questions;
    start();
});

function save(){
    localStorage.setItem("username", username);
    localStorage.setItem("current", current);
    localStorage.setItem("answers", JSON.stringify(answers));
}

function start(){
    if(location.hash === "#admin"){
        showAdmin();
        return;
    }
    if(!username){
        showLogin();
    }else{
        showQuestion();
    }
}

function showLogin(){
    app.innerHTML = `
    <h2>Quiz Login</h2>
    <input id="name" placeholder="Enter name">
    <br>
    <button onclick="login()">Start</button>
    <br><br>
    <button onclick="location.hash='#admin'; start()">Admin Panel</button>
    `;
}

function login(){
    username = document.getElementById("name").value;
    if(username){
        current = 0;
        answers = [];
        save();
        showQuestion();
    }
}

function showQuestion(){
    if(current >= questions.length){
        finish();
        return;
    }

    let q = questions[current];
    let html = `<h3>${q.Question}</h3><form id="f">`;

    q.Options.forEach(o=>{
        let checked = answers[current]===o.Id?"checked":"";
        html += `<label><input type="radio" name="a" value="${o.Id}" ${checked}> ${o.Choice}</label>`;
    });

    html += `<button type="submit">Next</button></form>`;

    app.innerHTML = html;

    f.onsubmit = e=>{
        e.preventDefault();
        let s=document.querySelector('input[name="a"]:checked');
        if(s){
            answers[current]=s.value;
            current++;
            save();
            showQuestion();
        }
    };
}

function finish(){
    let score=0;
    questions.forEach((q,i)=>{
        if(answers[i]===q.Answer) score++;
    });

    app.innerHTML = `
    <h2>Score: ${score}/${questions.length}</h2>
    <button onclick="restart()">Restart</button>
    `;
    localStorage.clear();
}

function restart(){location.reload();}

// ADMIN
function showAdmin(){
    let html = `<h2>Admin Panel</h2>
    <textarea id="q" placeholder="Question"></textarea><br>
    <input id="opt1" placeholder="Option A">
    <input id="opt2" placeholder="Option B"><br>
    <input id="ans" placeholder="Correct (A/B)">
    <br>
    <button onclick="addQ()">Add Question</button>
    <hr>
    <h3>All Questions</h3>`;

    questions.forEach((q,i)=>{
        html += `<div class="admin-box">
        ${q.Question}
        <br><button onclick="delQ(${i})">Delete</button>
        </div>`;
    });

    html += `<br><button onclick="download()">Download JSON</button>
    <br><button onclick="location.hash=''; start()">Back</button>`;

    app.innerHTML = html;
}

function addQ(){
    let nq = {
        Question: q.value,
        Answer: ans.value,
        Options:[
            {Id:"A", Choice:opt1.value},
            {Id:"B", Choice:opt2.value}
        ]
    };
    questions.push(nq);
    alert("Added!");
    showAdmin();
}

function delQ(i){
    questions.splice(i,1);
    showAdmin();
}

function download(){
    let blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "questions.json";
    a.click();
}

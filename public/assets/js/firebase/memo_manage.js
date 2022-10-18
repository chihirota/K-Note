function SaveMEMO(){
    let title = document.getElementById("memo_title");
    let memo = document.getElementsByClassName("memo_content")[0];
    let chars = memo.id.split("_");
    let memo_id = chars[1];

    if (title.value == ""){
        reutrn;
    }

    else if (memo.value == ""){
        return;
    }
    
    firebase
    .auth()
    .onAuthStateChanged((user) => {
        let messagesRef = firebase.database().ref(`${user.uid}/${memo_id}`);

        messagesRef.set({
            title: title.value,
            content: memo.value
        });
    });
};

function AddMEMO(){
    let title = document.getElementById("memo_title");
    let content = document.getElementsByClassName("memo_content")[0];

    if (title.value != "") {
        if(!window.confirm('このまま新規作成すると、現在記入中の内容が消えます。本当によろしいですか？')){
            return
        }
       
    }

    let num_data=1;
    let user = firebase.auth().currentUser;
    let user_db = firebase.database().ref(`${user.uid}`);
    user_db.once('value', (datas) => {
        num_data = datas.numChildren();
    });

    title.value = "";

    content.setAttribute("id", `main_${num_data+1}`);
    content.value ="";
}


function DeleteMEMO(){
    let user = firebase.auth().currentUser;
    
    let title = document.getElementById("memo_title");
    let memo = document.getElementsByClassName("memo_content")[0];

    let chars = memo.id.split("_");
    let memo_id = chars[1];

    let side_memo = document.getElementById(memo_id);
    side_memo.remove();
    let messagesRef = firebase.database().ref(`${user.uid}/${memo_id}`);

    messagesRef.set({
        title: null,
        content: null
    });

    title.value = "";
    memo.value = "";


}


function dispMemo(target){
    
    let user = firebase.auth().currentUser;
        
    let title = document.getElementById("memo_title");
    let content = document.getElementsByClassName("memo_content")[0];
    console.log(content);
    let db = firebase.database().ref(`${user.uid}/${target.id}`);

    db.once("value").then((data) => {
        if (!data.val().title){
            title.value = "ごめんなさい。データが破損しました；；";
        }
        else {
            title.value = data.val().title;
        }

        content.className="memo_content";
        
        content.setAttribute("id", `main_${target.id}`);
        if (!data.val().content){
            content.value = "ごめんなさい。データが破損しました；；";
        }
        else {
            content.value = data.val().content;
        }
        
    });
};

function AddMemo(){
    let num_data=1;
    let user = firebase.auth().currentUser;
    let user_db = firebase.database().ref(`${user.uid}`);
    user_db.once('value', (datas) => {
        num_data = datas.numChildren();
    });
    let title = document.getElementById("memo_title");
    let content = document.getElementsByClassName("memo_content")[0];

    title.value = "";

    content.id = `main_${num_data+1}`;
    content.value ="";
}

function AddSideContent(data){
    let title = data.val().title;
    let memoid = data.key;
    
    let ali = document.getElementById("side_memo");
    let a = document.createElement('a');
    a.setAttribute("id", memoid);
    a.setAttribute("href", "#");
    a.setAttribute("class", "txt-white bg-green round-cornered nav-link");
    a.setAttribute("onclick", "dispMemo(this)");
    a.innerHTML = title
    ali.appendChild(a);
};

function PutSideContent(data){
    let memoid = data.key;
    let title = data.val().title;

    let ali = document.getElementById("side_memo");
    let a = document.createElement('a');
    a.setAttribute("id", memoid);
    a.setAttribute("href", "#");
    a.setAttribute("class", "txt-white bg-green round-cornered nav-link");
    a.setAttribute("onclick", "dispMemo(this)");
    a.innerHTML = title
    ali.appendChild(a);
}

function Signout(){
    if (firebase.auth().currentUser){
        firebase.auth().signOut();
        location.href = "./logout.html";
    }
}


firebase.auth().onAuthStateChanged((user) => {
    let db = firebase.database().ref(`${user.uid}`)

    //メイン画面ロード時とボタンが押された時にメモを表示
    //メイン画面ロード時はリストになってるデータをfirebaseが一つずつ送ってくれる
    db.on('child_added', (data) => {
        AddSideContent(data);


    });
    //編集された時に編集後の内容に変更
    db.on("child_changed", (data) => {
        PutSideContent(data);
    });
});
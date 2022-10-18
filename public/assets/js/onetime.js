const buttonOpen = document.getElementById('modalOpen');
const modal = document.getElementById('easyModal');
const buttonClose = document.getElementsByClassName('modalClose')[0];
const onetime =  document.getElementById('onetimepass');

//ボタンがクリックされた時
buttonOpen.addEventListener('click', modalOpen);
function modalOpen() {
    var l = 8;
    // 生成する文字列に含める文字セット
    var c = "abcdefghijklmnopqrstuvwxyz0123456789";
    var cl = c.length;
    var r = "";
    for(var i=0; i<l; i++){
        r += c[Math.floor(Math.random()*cl)];
    }
    let user = firebase.auth().currentUser;
    onetime.innerHTML = `下のQRからラインアカウントを友達追加し<br>トークで<br> /ログイン ${user.email.split("@")[0]} ${r}<br>と入力してください。`

    let accountRef = firebase.database().ref(`logindata/${user.email.split("@")[0]}`);

    accountRef.set({
        code: r,
        google: user.uid
    });

    modal.style.display = 'block';
};

//バツ印がクリックされた時
buttonClose.addEventListener('click', modalClose);
function modalClose() {
    modal.style.display = 'none';
};

//モーダルコンテンツ以外がクリックされた時
addEventListener('click', outsideClose);
function outsideClose(e) {
    if (e.target == modal) {
        modal.style.display = 'none';
    };
};
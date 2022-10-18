firebase
    .auth()
    .onAuthStateChanged((user) => {
        let username_tag = document.querySelector('.username');

        if (user) {
            username_tag.innerHTML = `${user.displayName}さん、ようこそ。K-Noteの世界へ`;
        }
        else {
            /*window.location.href = 'index.html';*/
            username_tag.innerHTML = `テストユーザー、ようこそ。K-Noteの世界へ`;
        }
    });
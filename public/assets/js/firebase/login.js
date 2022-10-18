var uiConfig = {
    // ログイン完了時のリダイレクト先
    signInSuccessUrl: './main.html',

    // 利用する認証機能
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ]
};

var ui = new firebaseui.auth.AuthUI(firebase.auth());

ui.start('#firebaseui-auth', uiConfig);

function signout() {
    firebase.auth().signOut().then(function() {
      }, function(error) {
        console.error('サインアウトしようとしましたが、エラーが発生しました。', error);
      });
};
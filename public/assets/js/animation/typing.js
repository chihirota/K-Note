ityped.init(document.querySelector("#ityped"), {
    strings: ['K-Noteへようこそ.', 'Googleアカウントでログインできます。'],

    typeSpeed: 100,

    backSpeed: 50,

    startDelay: 100,

    backDelay:  800,

    /*アニメーションをループさせないか。trueの場合ループさせる*/
    loop: true,

    cursorChar: "|",
    onFinished: function(){}
})
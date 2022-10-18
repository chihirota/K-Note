from flask import Flask, request, abort

from linebot import (
    LineBotApi, WebhookHandler
)
from linebot.exceptions import (
    InvalidSignatureError
)
from linebot.models import (
    MessageEvent, TextMessage, TextSendMessage,
)
import os

import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

cred = credentials.Certificate('./kcanote-96359-firebase-adminsdk-2e6md-15281db53a.json')

firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://kcanote-96359-default-rtdb.firebaseio.com',
})

app = Flask(__name__)

acounts = {}

#環境変数取得
YOUR_CHANNEL_ACCESS_TOKEN = ""
YOUR_CHANNEL_SECRET = ""

line_bot_api = LineBotApi(YOUR_CHANNEL_ACCESS_TOKEN)
handler = WebhookHandler(YOUR_CHANNEL_SECRET)

@app.route("/callback", methods=['POST'])
def callback():
    # get X-Line-Signature header value
    signature = request.headers['X-Line-Signature']

    # get request body as text
    body = request.get_data(as_text=True)
    app.logger.info("Request body: " + body)

    # handle webhook body
    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        abort(400)

    return 'OK'

def response(event, text):
    line_bot_api.reply_message(
        event.reply_token,
        TextSendMessage(text=text))


def get_google_id(line_id):
    
    if (google_id := acounts.get(line_id)) is None:
        w = db.reference(f"accs").child(line_id).get()

        if w is None:
            return None

        google_id = w["google"]
        acounts[line_id] = google_id

    return google_id


def save(event):
    mes = event.message.text
    line_id = event.source.user_id
    mail = mes.split(" ")[1]
    code = mes.split(" ")[2]

    login_data = db.reference(f"logindata").child(mail).get()

    if login_data is None:
        return response(event, "WEBでLINE連携をクリックしてから実行してください")

    for k, v in login_data.items():
        if k == "code" and v != code:
            return response(event, "ワンタイムコードとメールアドレスが一致しませんでした。。。")

        elif k == "google":
            accs = db.reference(f"accs")
            table = accs.child(line_id)
            table.set({"google": v})

            if acounts.get(line_id) is None:
                acounts[line_id] = v


def get_memos(event):
    google_id = get_google_id(event.source.user_id)

    if google_id is None:
        response(event, "WEBでLINE連携してから実行してください")
        return None
        
    memos = db.reference(google_id).get()

    if memos is None:
        response(event, "メモがありません")
        return None

    return memos



@handler.add(MessageEvent, message=TextMessage)
def handle_message(event):
    mes = event.message.text
    line_id = event.source.user_id

    if mes in ["/ヘルプ", "/help", "/使い方"]:
        txt = ""
        txt += "このbotは、LINEでメモを管理するためのbotです。\n"
        txt += "使い方は以下の通りです。\n"
        txt += "1./ログイン メールアドレス(@kca.ac.jpの前までつまり、B210000) ワンタイムコード　を入力\n"
        txt += "2./確認　と入力して、保存しているメモの一覧と番号を取得。下記のコマンドではこの番号を使います\n"
        txt += "3./保存 番号\nタイトル(変更なしでも入力)\n本文\nと入力して、メモを保存\n新規に作成する場合は、存在しないメモの番号に\n" 
        txt += "4./削除 番号\nと入力して、メモを削除\n"
        response(event, txt)


    if mes.startswith('/ログイン'):
        save(event)

        return response(event, "ログインに成功しました。\n「/確認」でメモの番号と内容を確認してから、/保存 or /削除を実行してください。\n\n/ヘルプで各コマンドの使い方を確認出来ます。")


    elif mes.startswith("/確認"):
        memos = get_memos(event)
        if memos is None:
            return

        txt = ""

        cnt = 0

        for memo in memos:
            if memo is None: 
                cnt += 1
                continue

            if isinstance(memo, str):
                cnt += 1
                continue

            print(line_id, memo)
            
            for k,v in reversed(memo.items()):
                key = k.replace("title", "タイトル").replace("content", "本文")
               
                txt += f"{cnt} {key}: {v}\n"
        
            txt += "ーーーーーーーー\n"

            cnt += 1

        response(event, txt)

    elif mes.startswith("/保存"):
        google_id = get_google_id(event.source.user_id)

        if google_id is None:
            response(event, "WEBでLINE連携してから実行してください")
            return None

        if (len(mes.splitlines())) <= 2:
            return response(event, "/保存 メモ番号\nタイトル\n本文\n\nそれぞれ行を分けて入力してください")

        number = (mes.split(" ")[1])[0]

        lines = mes.splitlines()
        title = lines[1]

        content = ""
        for line in lines[2:]:
            content += line + "\n"

        db.reference(f"{google_id}/{number}").set({"title": lines[1], "content": content})

        response(event, "保存しました。")


    elif mes.startswith("/削除"):
        google_id = get_google_id(event.source.user_id)

        if google_id is None:
            response(event, "WEBでLINE連携してから実行してください")
            return None

        if (len(mes.splitlines())) != 1:
            return response(event, "/削除 メモ番号\n\nパラメーターに削除するメモの番号を入力してください")

        number = (mes.split(" ")[1])[0]

        db.reference(google_id).child(number).set({"title": None, "content": None})

        response(event, "削除しました。")


if __name__ == "__main__":
#    app.run()
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
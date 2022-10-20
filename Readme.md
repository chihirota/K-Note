# 説明

学校の授業の一環で課題研究というグループ学習があり、そこで作成したものです。

Webでメモを作成・編集・確認ができ、LINEとも連携しています。

VPSは使用せず、全てfirebase内で完結しています。

ホスティング -> Firebase Hosting

データーベース -> Firebase RealtimeDatabase

私がコーディングを担当した箇所は
`public/assets/js/firebase`内のファイルです。

押されたボタンに応じて、RealtimeDatabaseに保存、上書き、削除をできるようにしました。

他には各ツールの選定、最終的な微調整を行いました。

又、LINEでも保存、編集、削除をしたいと考え、LINEBOTも環境構築、コーディングを全て担当しました。


[サイト](https://kcanote.web.app/)
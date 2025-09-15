//  https://w-kiwamu.github.io/kintone_random_string/rand32.js

//カスタマイズのポイント
//ランダム文字列の長さ: generateSecureRandomString(323)の32を変更すれば、生成するランダム文字列の長さを調整可能。
//対象フィールド: rand以外のフィールドコードを使う場合、record.rand.valueの部分を対応するフィールドコードに変更。
//ボタンの位置: ヘッダーメニュー以外に配置したい場合、kintone.app.getHeaderSpaceElement()（ヘッダー上部）などを使用。

(function() {
    "use strict";

    // 暗号学的に安全なランダム文字列生成関数     %と^は使用しない
    function generateSecureRandomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$&*';
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters[array[i] % characters.length];
        }
        return result;
    }

    // 一覧画面表示イベント
    kintone.events.on('app.record.index.show', function(event) {
        // 既にボタンが存在する場合は追加しない
        if (document.getElementById('generate_rand_button')) {
            return;
        }

        // ボタンを作成
        const button = document.createElement('button');
        button.id = 'generate_rand_button';
        button.textContent = 'ランダム文字列生成';
        button.style.marginLeft = '10px';

        // ボタンクリック時の処理
        button.onclick = function() {
            // 確認ダイアログ
            if (!confirm('未入力のランダム文字列フィールドにランダムランダム文字列を生成して登録します。よろしいですか？')) {
                return;
            }

            // 一覧からレコードを取得
            const records = event.records;
            const updates = [];

            // 未入力のrandフィールドを持つレコードを特定
            records.forEach(function(record) {
                if (!record.rand.value) { // randが未入力の場合
                    const newPassword = generateSecureRandomString(32); // 32文字のランダム文字列生成
                    updates.push({
                        id: record.$id.value,
                        record: {
                            rand: { value: newPassword }
                        }
                    });
                }
            });

            // 更新対象がない場合
            if (updates.length === 0) {
                alert('未入力のランダム文字列フィールドが見つかりませんでした。');
                return;
            }

            // REST APIで一括更新
            kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', {
                app: kintone.app.getId(),
                records: updates
            }).then(function(resp) {
                alert('ランダム文字列を生成・登録しました。一覧を更新します。');
                location.reload(); // 一覧画面をリロード
            }).catch(function(err) {
                alert('エラーが発生しました: ' + err.message);
            });
        };

        // ボタンをヘッダーメニューに追加
        const headerMenu = kintone.app.getHeaderMenuSpaceElement();
        headerMenu.appendChild(button);

        return event;
    });
})();

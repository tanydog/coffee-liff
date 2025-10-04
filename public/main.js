const LIFF_ID = "2007510292-pErJbeAR";

window.onload = () => {
  liff.init({ liffId: LIFF_ID })
    .then(() => {
      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }

      liff.getProfile().then(profile => {
        const displayName = profile.displayName;
        const userId = profile.userId;

        const form = document.getElementById("coffeeForm");
        const resultContainer = document.getElementById("result");
        const logsContainer = document.getElementById("logsList");

        // 初回ログ一覧取得
        fetchLogs(userId);

        form.addEventListener("submit", function (e) {
          e.preventDefault();

          const beanType = document.getElementById("beanType").value;
          const taste = document.getElementById("taste").value;
          const amount = document.getElementById("amount").value;
          const submitBtn = form.querySelector("button[type='submit']");

          // スピナーと送信中表示
          submitBtn.disabled = true;
          const originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = `<span class="loading"></span> 送信中...`;

          fetch("https://asia-northeast1-tanycoffee.cloudfunctions.net/app/webhook-log", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              userId,
              displayName,
              beanType,
              taste,
              amount
            })
          })
          .then(res => res.json())
          .then(data => {
            form.reset();
            resultContainer.innerHTML = `
              <div class="alert alert-success">
                <span>✅</span>
                <span>コーヒーログを保存しました！</span>
              </div>
            `;
            fetchLogs(userId); // 記録後に一覧を再取得
          })
          .catch(err => {
            console.error("送信エラー:", err);
            resultContainer.innerHTML = `
              <div class="alert alert-error">
                <span>❌</span>
                <span>エラーが発生しました。もう一度お試しください。</span>
              </div>
            `;
          })
          .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          });
        });

        // ログ一覧取得関数
        function fetchLogs(userId) {
          if (!logsContainer) return;
          logsContainer.innerHTML = '<div class="body-sm">読み込み中...</div>';
          fetch(`https://asia-northeast1-tanycoffee.cloudfunctions.net/app/logs?userId=${encodeURIComponent(userId)}`)
            .then(res => res.json())
            .then(logs => {
              console.log('取得ログ', logs); 
              if (!Array.isArray(logs) || logs.length === 0) {
                logsContainer.innerHTML = '<div class="body-sm">まだ記録がありません</div>';
                return;
              }
              logsContainer.innerHTML = logs.map(log => `
                <div class="card" style="margin-top:1rem;">
                  <div style="display:flex; align-items:center; gap:1rem;">
                    <img src="${log.pictureUrl || 'https://placehold.co/48x48'}" style="width:48px; height:48px; border-radius:50%;">
                    <div>
                      <div class="body-lg" style="font-weight:600;">${log.beanType}</div>
                      <div class="body-sm">${log.createdAt && log.createdAt._seconds ? new Date(log.createdAt._seconds*1000).toLocaleString('ja-JP') : ''}</div>
                    </div>
                  </div>
                  <div class="body" style="margin:0.5em 0;">${log.taste}</div>
                  <div style="display:flex; gap:0.5rem;">
                    <span class="tag">量 ${log.amount}ml</span>
                  </div>
                </div>
              `).join('');
            })
            .catch(err => {
            console.error("ログ取得エラー:", err);
            logsContainer.innerHTML = '<div class="alert alert-error">記録の取得に失敗しました</div>';
          });
        }
      });
    })
    .catch(err => {
      console.error("LIFF初期化エラー:", err);
      alert("LIFFの初期化に失敗しました。LIFF IDを確認してください。");
    });
};

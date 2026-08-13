(function () {
  window.FOOD_RESEARCH_UI_PATCH = String.raw`
(function () {
  document.documentElement.classList.add('fr-ui-v2');

  const style = document.createElement('style');
  style.id = 'fr-ui-v2-style';
  style.textContent = (function () {/*
    :root {
      --fr-ink: #11151c;
      --fr-panel: #191d24;
      --fr-panel-soft: #232831;
      --fr-gold: #c78b36;
      --fr-gold-light: #f1ca79;
      --fr-cream: #fff4d8;
      --fr-muted: #c9bda7;
      --fr-mint: #55d6a5;
      --fr-red: #e45d61;
      --fr-blue: #62b9df;
    }

    html.fr-ui-v2 body { background: var(--fr-ink); }
    html.fr-ui-v2 #gc {
      background: #171b22;
      box-shadow: 0 0 0 1px rgba(241,202,121,.22), 0 18px 60px rgba(0,0,0,.46);
    }

    html.fr-ui-v2 .modal {
      background: rgba(9,12,16,.76);
      backdrop-filter: blur(8px) saturate(.8);
      padding: 12px;
    }
    html.fr-ui-v2 .mbox {
      position: relative;
      width: 92%;
      max-width: 352px;
      max-height: 94vh;
      padding: 20px 18px 18px;
      overflow-x: hidden;
      color: var(--fr-cream);
      background: var(--fr-panel);
      border: 2px solid var(--fr-gold);
      border-radius: 12px;
      box-shadow: 0 0 0 4px rgba(17,21,28,.9), 0 0 0 5px rgba(241,202,121,.3), 0 18px 42px rgba(0,0,0,.48);
    }
    html.fr-ui-v2 .mbox::before,
    html.fr-ui-v2 .mbox::after {
      content: '';
      position: absolute;
      top: 8px;
      width: 16px;
      height: 16px;
      border-top: 3px solid var(--fr-gold-light);
      pointer-events: none;
    }
    html.fr-ui-v2 .mbox::before { left: 8px; border-left: 3px solid var(--fr-gold-light); }
    html.fr-ui-v2 .mbox::after { right: 8px; border-right: 3px solid var(--fr-gold-light); }
    html.fr-ui-v2 .mbox h2 {
      color: var(--fr-cream);
      font-size: 24px;
      line-height: 1.25;
      letter-spacing: 0;
      margin: 2px 0 12px;
      text-shadow: 0 2px 0 rgba(0,0,0,.5);
    }
    html.fr-ui-v2 #startEmoji {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 62px;
      height: 62px;
      margin-bottom: 6px !important;
      border: 2px solid var(--fr-gold);
      border-radius: 50%;
      background: #272018;
      box-shadow: inset 0 0 0 4px #15191f, 0 4px 12px rgba(0,0,0,.32);
      font-size: 34px !important;
    }
    html.fr-ui-v2 .fr-start-copy {
      display: grid;
      gap: 0;
      margin: 0 0 12px;
      border-top: 1px solid rgba(241,202,121,.32);
      border-bottom: 1px solid rgba(241,202,121,.32);
      color: var(--fr-muted);
    }
    html.fr-ui-v2 .fr-rule {
      display: grid;
      grid-template-columns: 34px 1fr;
      gap: 9px;
      align-items: center;
      padding: 8px 2px;
      text-align: left;
      border-bottom: 1px solid rgba(255,244,216,.09);
    }
    html.fr-ui-v2 .fr-rule:last-child { border-bottom: 0; }
    html.fr-ui-v2 .fr-rule-icon {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      border: 1px solid rgba(241,202,121,.48);
      border-radius: 8px;
      background: var(--fr-panel-soft);
      font-size: 18px;
    }
    html.fr-ui-v2 .fr-rule-title {
      color: var(--fr-cream);
      font-size: 13px;
      font-weight: 900;
      line-height: 1.25;
    }
    html.fr-ui-v2 .fr-rule-note {
      margin-top: 2px;
      color: var(--fr-muted);
      font-size: 11px;
      font-weight: 700;
      line-height: 1.35;
    }
    html.fr-ui-v2 .fr-start-warning {
      display: block;
      padding: 9px 10px;
      margin: 2px 0 10px;
      color: #f6d797;
      background: #2a2119;
      border-left: 3px solid var(--fr-gold);
      font-size: 11px;
      font-weight: 800;
      line-height: 1.45;
      text-align: left;
    }
    html.fr-ui-v2 #partnerPreview {
      display: inline-flex;
      max-width: 100%;
      padding: 5px 9px;
      margin-bottom: 10px !important;
      overflow: hidden;
      color: var(--fr-mint) !important;
      background: rgba(85,214,165,.08);
      border: 1px solid rgba(85,214,165,.34);
      border-radius: 999px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    html.fr-ui-v2 #partnerPreview:empty { display: none; }
    html.fr-ui-v2 .mbtn {
      min-height: 52px;
      padding: 13px 14px;
      border-radius: 8px;
      letter-spacing: 0;
      transition: transform .08s, filter .12s, box-shadow .08s;
    }
    html.fr-ui-v2 .mbtn.blue {
      color: #25180b;
      background: #dba03d;
      border-color: var(--fr-gold-light);
      box-shadow: 0 4px 0 #81521c, 0 8px 16px rgba(0,0,0,.28);
    }
    html.fr-ui-v2 .mbtn.blue:active {
      transform: translateY(3px);
      box-shadow: 0 1px 0 #81521c;
    }

    html.fr-ui-v2 #hud {
      top: 8px;
      left: 8px;
      right: 8px;
      padding: 0;
      background: none;
    }
    html.fr-ui-v2 #hud > div:first-child {
      min-width: 132px;
      padding: 6px 8px;
      background: rgba(20,24,30,.9);
      border: 1px solid rgba(241,202,121,.68);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,.3);
      backdrop-filter: blur(5px);
    }
    html.fr-ui-v2 .charBarName { color: var(--fr-cream); font-size: 8px; }
    html.fr-ui-v2 .charBarTrack {
      width: 92px;
      height: 8px;
      background: #3a2528;
      border-color: #8d4b4f;
    }
    html.fr-ui-v2 .charBarNum { color: #ffaaa6; }
    html.fr-ui-v2 #stamTrack {
      width: 92px;
      height: 6px;
      background: #18372f;
      border-color: #397d65;
    }
    html.fr-ui-v2 .hR {
      top: 8px;
      right: 8px;
      gap: 3px;
      padding: 5px;
      background: rgba(20,24,30,.9);
      border: 1px solid rgba(241,202,121,.68);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,.3);
    }
    html.fr-ui-v2 .hR > div {
      min-width: 62px;
      padding: 2px 6px !important;
      background: transparent !important;
      font-size: 9px !important;
    }
    html.fr-ui-v2 #bossHud {
      top: 66px;
      width: 64%;
      padding: 5px 7px 6px;
      background: rgba(20,24,30,.92);
      border: 1px solid rgba(228,93,97,.72);
      border-radius: 8px;
      box-shadow: 0 5px 14px rgba(0,0,0,.34);
    }
    html.fr-ui-v2 #bossName { color: #ffd6cf; font-size: 11px; margin-bottom: 3px; }
    html.fr-ui-v2 #bossTrack { height: 9px; border-width: 1px; border-radius: 3px; background: #3c2227; }
    html.fr-ui-v2 #bossFill { border-radius: 2px; }

    html.fr-ui-v2 #joystickWrap {
      left: 12px;
      bottom: 14px;
      width: 106px;
      height: 106px;
    }
    html.fr-ui-v2 #joystickBase {
      background: rgba(19,23,29,.55);
      border: 2px solid rgba(241,202,121,.52);
      box-shadow: inset 0 0 0 8px rgba(255,244,216,.025), 0 5px 18px rgba(0,0,0,.25);
      backdrop-filter: blur(3px);
    }
    html.fr-ui-v2 #joystickBase::before {
      content: '';
      position: absolute;
      inset: 21px;
      border: 1px solid rgba(255,244,216,.13);
      border-radius: 50%;
    }
    html.fr-ui-v2 #joystickThumb {
      width: 42px;
      height: 42px;
      background: #2c3139;
      border-color: var(--fr-gold-light);
      box-shadow: inset 0 0 0 5px #191d24, 0 4px 11px rgba(0,0,0,.34);
    }
    html.fr-ui-v2 #rightCtrl {
      right: 10px;
      bottom: 12px;
      gap: 7px;
    }
    html.fr-ui-v2 .rBtn,
    html.fr-ui-v2 .skBadge {
      color: var(--fr-cream);
      background-color: rgba(23,27,34,.92);
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;
      border: 2px solid var(--fr-gold);
      border-radius: 50%;
      box-shadow: inset 0 0 0 3px rgba(255,244,216,.06), 0 4px 12px rgba(0,0,0,.3);
      backdrop-filter: blur(4px);
    }
    html.fr-ui-v2 .rBtn { width: 50px; height: 50px; font-size: 23px; }
    html.fr-ui-v2 .skBadge { width: 62px; height: 62px; font-size: 27px; }
    html.fr-ui-v2 #wpnToggle { border-color: var(--fr-gold); background-color: rgba(42,33,25,.92); }
    html.fr-ui-v2 #dodgeBtn { border-color: var(--fr-blue); background-color: rgba(24,43,53,.92); }
    html.fr-ui-v2 #sk1,
    html.fr-ui-v2 #sk2 { border-color: var(--fr-gold-light); }
    html.fr-ui-v2 .skRow { gap: 8px; }
    html.fr-ui-v2 #charSwitchBar { right: 8px; gap: 6px; transform: translateY(-62%); }
    html.fr-ui-v2 .cSwBtn {
      width: 54px;
      padding: 5px 3px;
      background: rgba(23,27,34,.9);
      border-color: rgba(241,202,121,.42);
      border-radius: 8px;
      box-shadow: 0 3px 10px rgba(0,0,0,.28);
    }
    html.fr-ui-v2 .cSwBtn.active-char { background: #30271e; border-color: var(--fr-gold-light); }
    html.fr-ui-v2 .cSwName { max-width: 48px; color: var(--fr-cream); font-size: 8px; }
    html.fr-ui-v2 .cSwHpTrack { width: 44px; height: 5px; background: #353b45; }
    html.fr-ui-v2 #toast,
    html.fr-ui-v2 #dlgBanner {
      color: var(--fr-cream) !important;
      background: rgba(23,27,34,.94) !important;
      border-color: var(--fr-gold) !important;
      border-radius: 8px !important;
      box-shadow: 0 8px 24px rgba(0,0,0,.36) !important;
    }

    html.fr-ui-v2 .fr-revive-panel { max-width: 370px; padding: 16px 16px 14px; }
    html.fr-ui-v2 .fr-revive-emblem {
      display: inline-grid;
      place-items: center;
      width: 52px;
      height: 52px;
      margin-bottom: 2px;
      border: 2px solid var(--fr-gold);
      border-radius: 50%;
      background: #2a2119;
      font-size: 28px;
    }
    html.fr-ui-v2 .fr-revive-intro {
      display: grid;
      gap: 5px;
      padding: 9px 11px;
      margin: 0 0 10px !important;
      color: var(--fr-muted) !important;
      background: #20252d;
      border: 1px solid rgba(241,202,121,.28);
      border-radius: 7px;
      font-size: 12px !important;
      line-height: 1.4 !important;
      text-align: left;
    }
    html.fr-ui-v2 .fr-revive-success { color: #8ce5bf; font-weight: 900; }
    html.fr-ui-v2 .fr-revive-danger { color: #ff9b9e; font-weight: 900; }
    html.fr-ui-v2 #charStatusRow { margin-bottom: 8px !important; }
    html.fr-ui-v2 .fr-revive-status {
      display: grid;
      grid-template-columns: 1.45fr 1fr;
      gap: 8px;
      margin-bottom: 9px;
    }
    html.fr-ui-v2 .fr-status-block {
      min-width: 0;
      padding: 7px 8px;
      margin: 0 !important;
      background: #20252d;
      border: 1px solid rgba(255,244,216,.12);
      border-radius: 7px;
    }
    html.fr-ui-v2 .fr-status-block > div:first-child {
      color: var(--fr-muted) !important;
      margin-bottom: 6px !important;
    }
    html.fr-ui-v2 #revProg,
    html.fr-ui-v2 #revWrongDisp { gap: 5px; margin: 0; }
    html.fr-ui-v2 #revQ {
      min-height: 72px;
      display: flex;
      align-items: center;
      padding: 12px 13px;
      margin: 7px 0 4px !important;
      color: var(--fr-cream) !important;
      background: #2a2119;
      border: 1px solid rgba(241,202,121,.48);
      border-radius: 7px;
      font-size: 15px !important;
      line-height: 1.45 !important;
      text-align: left;
    }
    html.fr-ui-v2 #revNum { color: var(--fr-muted) !important; }
    html.fr-ui-v2 .quizOpts { gap: 8px; margin-top: 9px; }
    html.fr-ui-v2 .qopt {
      min-height: 62px;
      padding: 10px 11px;
      color: var(--fr-cream);
      background: #232831;
      border-color: #6d583d;
      border-radius: 8px;
      font-size: 14px;
      box-shadow: 0 3px 0 #101318;
    }
    html.fr-ui-v2 .qopt:active { background: #3a3024; transform: translateY(2px); box-shadow: 0 1px 0 #101318; }

    @media (max-height: 650px) {
      html.fr-ui-v2 .mbox { padding: 14px 14px 12px; }
      html.fr-ui-v2 #startEmoji { width: 48px; height: 48px; font-size: 27px !important; }
      html.fr-ui-v2 .mbox h2 { font-size: 21px; margin-bottom: 8px; }
      html.fr-ui-v2 .fr-rule { padding: 6px 2px; }
      html.fr-ui-v2 .fr-rule-icon { width: 28px; height: 28px; }
      html.fr-ui-v2 .fr-start-warning { padding: 6px 8px; margin-bottom: 7px; }
      html.fr-ui-v2 .mbtn { min-height: 46px; padding: 10px; }
      html.fr-ui-v2 .fr-revive-intro { padding: 6px 8px; }
      html.fr-ui-v2 #revQ { min-height: 60px; padding: 9px 11px; }
      html.fr-ui-v2 .qopt { min-height: 52px; padding: 8px 9px; }
    }
  */}).toString().split('/*')[1].split('*/')[0];
  document.head.appendChild(style);

  const startBox = document.querySelector('#startModal .mbox');
  const startCopy = startBox && startBox.querySelector('p');
  if (startBox) startBox.classList.add('fr-start-panel');
  if (startCopy) {
    startCopy.classList.add('fr-start-copy');
    startCopy.innerHTML =
      '<span class="fr-rule"><span class="fr-rule-icon">&#x1F579;&#xFE0F;</span><span><span class="fr-rule-title">' +
      '\u6416\u687F\u79FB\u52D5</span><span class="fr-rule-note">\u9748\u6D3B\u8D70\u4F4D\uFF0C\u9583\u907F\u653B\u64CA</span></span></span>' +
      '<span class="fr-rule"><span class="fr-rule-icon">&#x1F47F;</span><span><span class="fr-rule-title">' +
      '\u64CA\u6557\u9B54\u738B</span><span class="fr-rule-note">\u91D1\u5E63\u8207\u5206\u6578\u6703\u96A8\u95DC\u5361\u63D0\u5347</span></span></span>' +
      '<span class="fr-rule"><span class="fr-rule-icon">&#x2694;&#xFE0F;</span><span><span class="fr-rule-title">' +
      '\u8FF4\u907F\u8207\u6B66\u5668</span><span class="fr-rule-note">\u5FEB\u901F\u5207\u63DB\u8FD1\u6230\u3001\u9060\u7A0B</span></span></span>' +
      '<span class="fr-rule"><span class="fr-rule-icon">&#x1F451;</span><span><span class="fr-rule-title">' +
      '\u9B54\u738B\u5927\u7D55</span><span class="fr-rule-note">\u79FB\u52D5\u81F3\u6B63\u78BA\u7B54\u6848\u5340</span></span></span>';
    const warning = document.createElement('span');
    warning.className = 'fr-start-warning';
    warning.textContent = '\u5168\u54E1\u9663\u4EA1\u5F8C\u7B54\u5C0D 5 \u984C\uFF0C\u624D\u80FD\u5E36\u6230\u5229\u54C1\u56DE\u71DF\u5730\u3002';
    startCopy.insertAdjacentElement('afterend', warning);
  }

  const reviveBox = document.querySelector('#revModal .mbox');
  if (reviveBox) {
    reviveBox.classList.add('fr-revive-panel');
    const emblem = reviveBox.firstElementChild;
    if (emblem) emblem.classList.add('fr-revive-emblem');
    const intro = reviveBox.querySelector('p');
    if (intro) {
      intro.classList.add('fr-revive-intro');
      intro.innerHTML =
        '<span class="fr-revive-success">&#x2714; \u7B54\u5C0D 5 \u984C\uFF0C\u5E36\u8457\u6230\u5229\u54C1\u56DE\u5230\u71DF\u5730</span>' +
        '<span class="fr-revive-danger">&#x26A0; \u7B54\u932F 3 \u984C\uFF0C\u91D1\u5E63\u8207\u88DD\u5099\u5168\u6578\u907A\u5931</span>';
    }
    const progress = document.getElementById('revProg');
    const wrong = document.getElementById('revWrongDisp');
    const progressBlock = progress && progress.parentElement;
    const wrongBlock = wrong && wrong.parentElement;
    if (progressBlock && wrongBlock) {
      progressBlock.classList.add('fr-status-block');
      wrongBlock.classList.add('fr-status-block');
      const status = document.createElement('div');
      status.className = 'fr-revive-status';
      progressBlock.parentElement.insertBefore(status, progressBlock);
      status.appendChild(progressBlock);
      status.appendChild(wrongBlock);
    }
  }

  const controls = {
    wpnToggle: '\u5207\u63DB\u8FD1\u6230\u8207\u9060\u7A0B',
    dodgeBtn: '\u8FF4\u907F',
    sk1: '\u4E3B\u52D5\u6280\u80FD\u4E00',
    sk2: '\u4E3B\u52D5\u6280\u80FD\u4E8C'
  };
  Object.keys(controls).forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute('aria-label', controls[id]);
    el.setAttribute('title', controls[id]);
  });
})();
`;
})();

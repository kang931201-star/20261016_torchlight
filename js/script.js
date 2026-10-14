// 참여방법 탭 (PC방 / 개인 PC)
document.querySelectorAll('.tabs__btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var tab = btn.dataset.tab;
    document.querySelectorAll('.tabs__btn').forEach(function (b) {
      b.classList.toggle('is-active', b === btn);
    });
    document.querySelectorAll('.steps').forEach(function (panel) {
      panel.classList.toggle('is-active', panel.dataset.panel === tab);
      panel.classList.add('is-switched');   // 탭 전환 페이드
    });
  });
});

// 유의사항 열기/닫기
var noticeBtn = document.querySelector('.notice__toggle');
var noticeList = document.querySelector('.notice__list');
noticeBtn.addEventListener('click', function () {
  var closed = noticeList.classList.toggle('is-closed');
  noticeBtn.setAttribute('aria-expanded', String(!closed));
  noticeBtn.querySelector('.notice__icon').textContent = closed ? '+' : '−';
});

// ---------- 인터랙션 ----------
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { return; }

  // 메인 떠오르는 불씨
  var hero = document.querySelector('.hero');
  if (hero) {
    var sparks = document.createElement('div');
    sparks.className = 'hero__sparks';
    sparks.setAttribute('aria-hidden', 'true');
    var count = window.innerWidth <= 768 ? 12 : 22;
    for (var i = 0; i < count; i++) {
      var s = document.createElement('span');
      s.style.left = (Math.random() * 100) + '%';
      s.style.setProperty('--s', (2 + Math.random() * 4).toFixed(1) + 'px');
      s.style.setProperty('--d', (7 + Math.random() * 7).toFixed(1) + 's');
      s.style.setProperty('--delay', (-Math.random() * 12).toFixed(1) + 's');
      s.style.setProperty('--x', (Math.random() * 80 - 40).toFixed(0) + 'px');
      sparks.appendChild(s);
    }
    hero.insertBefore(sparks, hero.querySelector('.hero__inner'));
  }

  // 스크롤 등장 (같은 묶음 안 형제는 순서대로 살짝씩 늦게)
  if (!('IntersectionObserver' in window)) { return; }
  var groups = [
    '.reward .sec-head', '.mileage-card', '.reward__note',
    '.howto .sec-head', '.steps .step',
    '.mileage .sec-head', '.use-card', '.mileage__foot',
    '.notice .inner'
  ];
  var targets = [];
  groups.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el, idx) {
      el.classList.add('reveal');
      el.style.setProperty('--rd', ((idx % 3) * 0.12) + 's');
      targets.push(el);
    });
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(function (el) { io.observe(el); });

  // 마일리지 카드 마우스 기울기 (PC)
  var card = document.querySelector('.mileage-card');
  if (card && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', (px * 10).toFixed(2) + 'deg');
      card.style.setProperty('--rx', (-py * 10).toFixed(2) + 'deg');
    });
    card.addEventListener('pointerleave', function () {
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--rx', '0deg');
    });
  }
})();

// 헤더 PC방 토글 + 공유하기 + 플로팅(공유 / TOP)
function setPcRoomToggleState(isPcRoom) {
  var toggleBtn = document.getElementById('pcRoomToggle');
  if (!toggleBtn) { return; }
  var toggleImg = toggleBtn.querySelector('.toggle-btn__img');
  if (!toggleImg) { return; }
  var isOn = Boolean(isPcRoom);
  toggleBtn.dataset.state = isOn ? 'on' : 'off';
  toggleImg.src = isOn ? 'assets/off=on.webp' : 'assets/off=off.webp';
  toggleImg.alt = isOn ? 'PC방 모드 ON' : 'PC방 모드 OFF';
}
setPcRoomToggleState(false);

var SHARE_CONFIG = {
  title: '토치라이트: 인피니트 x 피카플레이 미션 이벤트',
  description: 'PC방, 집 어디에서든 즐기고 보상까지 챙겨라! 매일 1시간 플레이하고 1,000M 받아가세요.',
  kakaoKey: 'd1c0c39f4dbac0062bf36527a3021357',
  ogImage:  'https://ics.mediaweb.co.kr/_event/20261016_torchlight/assets/Thumbnail_1200x630.jpg'
};

var copyToast = document.getElementById('copyToast');
var copyToastTimer = null;
var DEFAULT_TOAST_MSG = '클립보드에 복사되었습니다.';
function showCopyToast(msg) {
  if (!copyToast) { return; }
  copyToast.textContent = msg || DEFAULT_TOAST_MSG;
  copyToast.classList.add('is-visible');
  if (copyToastTimer) { clearTimeout(copyToastTimer); }
  copyToastTimer = setTimeout(function() {
    copyToast.classList.remove('is-visible');
  }, 2200);
}
function fallbackCopyText(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  var copied = false;
  try {
    copied = document.execCommand('copy');
  } catch (e) {}
  document.body.removeChild(textarea);
  return copied;
}
function copyUrlWithToast(url, toastMsg) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url).then(function() {
      showCopyToast(toastMsg);
    }).catch(function() {
      if (fallbackCopyText(url)) { showCopyToast(toastMsg); }
    });
  } else if (fallbackCopyText(url)) {
    showCopyToast(toastMsg);
  }
}

(function initKakao() {
  if (!window.Kakao || !SHARE_CONFIG.kakaoKey) { return; }
  if (Kakao.isInitialized && Kakao.isInitialized()) { return; }
  try { Kakao.init(SHARE_CONFIG.kakaoKey); } catch (e) {}
})();

var shareModal = document.getElementById('shareModal');
var shareModalClose = document.getElementById('shareModalClose');
var lastShareTrigger = null;
function openShareModal(trigger) {
  if (!shareModal) { return; }
  lastShareTrigger = trigger || null;
  shareModal.classList.add('is-open');
  shareModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (shareModalClose) { shareModalClose.focus(); }
}
function closeShareModal() {
  if (!shareModal) { return; }
  shareModal.classList.remove('is-open');
  shareModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastShareTrigger && lastShareTrigger.focus) { lastShareTrigger.focus(); }
}
if (shareModal) {
  shareModal.addEventListener('click', function(e) {
    if (e.target === shareModal) { closeShareModal(); }
  });
}
if (shareModalClose) {
  shareModalClose.addEventListener('click', closeShareModal);
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && shareModal && shareModal.classList.contains('is-open')) {
    closeShareModal();
  }
});

function openPopup(url) {
  var w = 600, h = 600;
  var left = (window.screen.width  - w) / 2;
  var top  = (window.screen.height - h) / 2;
  window.open(url, '_blank', 'width=' + w + ',height=' + h + ',left=' + left + ',top=' + top + ',noopener');
}
function shareFacebook() {
  var u = encodeURIComponent(window.location.href);
  openPopup('https://www.facebook.com/sharer/sharer.php?u=' + u);
}
function shareTwitter() {
  var u = encodeURIComponent(window.location.href);
  var t = encodeURIComponent(SHARE_CONFIG.title);
  openPopup('https://twitter.com/intent/tweet?url=' + u + '&text=' + t);
}
function shareNaver() {
  var u = encodeURIComponent(window.location.href);
  var t = encodeURIComponent(SHARE_CONFIG.title);
  openPopup('https://share.naver.com/web/shareView?url=' + u + '&title=' + t);
}
function shareKakao() {
  if (!window.Kakao || !Kakao.Share) { return; }
  if (!Kakao.isInitialized || !Kakao.isInitialized()) { return; }
  try {
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: SHARE_CONFIG.title,
        description: SHARE_CONFIG.description,
        imageUrl: SHARE_CONFIG.ogImage,
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href
        }
      },
      buttons: [{
        title: '자세히 보기',
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href
        }
      }]
    });
  } catch (e) {}
}
function shareInstagram() {
  copyUrlWithToast(window.location.href, 'URL이 복사되었습니다. 인스타그램에 붙여넣어 주세요.');
}
function shareCopy() {
  copyUrlWithToast(window.location.href, '클립보드에 복사되었습니다.');
}
var SHARE_HANDLERS = {
  kakao:     shareKakao,
  facebook:  shareFacebook,
  twitter:   shareTwitter,
  naver:     shareNaver,
  instagram: shareInstagram,
  copy:      shareCopy
};
if (shareModal) {
  shareModal.addEventListener('click', function(e) {
    var target = e.target.closest ? e.target.closest('[data-share]') : null;
    if (!target) { return; }
    var type = target.getAttribute('data-share');
    var handler = SHARE_HANDLERS[type];
    if (typeof handler === 'function') {
      handler();
      closeShareModal();
    }
  });
}

var btnShare = document.getElementById('btnShare');
if (btnShare) {
  btnShare.addEventListener('click', function() { openShareModal(btnShare); });
}
var btnShareFloating = document.getElementById('btnShareFloating');
if (btnShareFloating) {
  btnShareFloating.addEventListener('click', function() { openShareModal(btnShareFloating); });
}
var btnScrollTop = document.getElementById('btnScrollTop');
if (btnScrollTop) {
  btnScrollTop.addEventListener('click', function (e) {
    e.preventDefault();
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var behavior = reduce ? 'auto' : 'smooth';
    try {
      window.scrollTo({ top: 0, left: 0, behavior: behavior });
    } catch (err) {
      (document.scrollingElement || document.documentElement).scrollTop = 0;
      document.body.scrollTop = 0;
    }
  });
}

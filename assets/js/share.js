/* ============================================================
   공유하기 헤더 키트 — 헤더_공유하기_이식가이드 5단계 (원본 그대로, SHARE_CONFIG만 교체)
   (PC방 ON/OFF 백엔드 연동은 서버 배포 후 개발에서 붙임)
   ============================================================ */
    function setPcRoomToggleState(isPcRoom) {
      var toggleBtn = document.getElementById('pcRoomToggle');
      if (!toggleBtn) { return; }
      var toggleImg = toggleBtn.querySelector('.toggle-btn__img');
      if (!toggleImg) { return; }
      var isOn = Boolean(isPcRoom);
      toggleBtn.dataset.state = isOn ? 'on' : 'off';
      toggleImg.src = isOn ? 'assets/images/off=on.png' : 'assets/images/off=off.png';
      toggleImg.alt = isOn ? 'PC방 모드 ON' : 'PC방 모드 OFF';
    }
    setPcRoomToggleState(false);

    var SHARE_CONFIG = {
      title: '타임 테이커즈 PC방 이벤트',
      description: '피카 PC방에서 타임 테이커즈를 하루 30분씩 플레이하고 최대 10,000 마일리지를 쟁탈하라!',
      kakaoKey: 'd1c0c39f4dbac0062bf36527a3021357',
      ogImage:  'https://ics.mediaweb.co.kr/_event/20261113_timetakers/assets/Thumbnail_800x400.jpg' // ⚠️ assets/Thumbnail_800x400.jpg 필요
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

(function () {
  'use strict';

  const feedbackBtn = document.getElementById('feedbackBtn');
  const feedbackModal = document.getElementById('feedbackModal');
  const closeFeedbackModalBtn = document.getElementById('closeFeedbackModal');

  if (!feedbackBtn || !feedbackModal) return;

  const modalPanel = feedbackModal.querySelector('.max-w-2xl');

  function openFeedbackModal() {
    feedbackModal.classList.remove('opacity-0', 'invisible');
    if (modalPanel) modalPanel.classList.remove('translate-y-8');
    document.body.style.overflow = 'hidden';
  }

  function closeFeedbackModal() {
    feedbackModal.classList.add('opacity-0', 'invisible');
    if (modalPanel) modalPanel.classList.add('translate-y-8');
    document.body.style.overflow = '';
  }

  feedbackBtn.addEventListener('click', openFeedbackModal);
  if (closeFeedbackModalBtn) {
    closeFeedbackModalBtn.addEventListener('click', closeFeedbackModal);
  }

  // 点击背景关闭
  feedbackModal.addEventListener('click', function (event) {
    if (event.target === feedbackModal) closeFeedbackModal();
  });

  // ESC 关闭
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !feedbackModal.classList.contains('invisible')) {
      closeFeedbackModal();
    }
  });
})();

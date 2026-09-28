(() => {
  "use strict";
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;
  let context;
  let lastTyping = 0;

  async function play(kind) {
    if (document.hidden) return;
    try {
      context ||= new AudioEngine();
      if (context.state === "suspended") await context.resume();
      if (context.state !== "running") return;
      const now = context.currentTime;
      const typing = kind === "type";
      // Keitai discreto: the same tones and envelopes as preview option 8.
      function tone(frequency, length, volume, delay = 0) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, now + delay);
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(volume, now + delay + 0.001);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + length);
        oscillator.connect(gain).connect(context.destination);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
        oscillator.start(now + delay);
        oscillator.stop(now + delay + length);
      }
      tone(typing ? 1050 : 1250, 0.026, 0.015);
      if (!typing) tone(940, 0.023, 0.009, 0.022);
    } catch { /* Sound must never interrupt navigation or form submission. */ }
  }
  document.addEventListener("click", (event) => {
    const control = event.target instanceof Element && event.target.closest("a[href], button, summary, input[type=checkbox], input[type=radio]");
    if (control && !control.disabled && !control.closest("[data-silent]") && control.getAttribute("aria-disabled") !== "true") void play("click");
  }, true);
  document.addEventListener("beforeinput", (event) => {
    if (event.isComposing || !event.isTrusted) return;
    const field = event.target;
    if (!(field instanceof Element) || !field.matches("textarea, input[type=text], input[type=search], input:not([type])")) return;
    if (field.disabled || field.readOnly || !["insertText", "deleteContentBackward", "deleteContentForward"].includes(event.inputType)) return;
    const now = performance.now();
    if (now - lastTyping < 40) return;
    lastTyping = now;
    void play("type");
  });
})();

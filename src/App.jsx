import React, { useState, useEffect, useRef, useCallback } from 'react';
import { storyBeats } from './data/storyBeats.js';
import { diagnosticReport } from './data/diagnosticReport.js';
import { introTexts as INTRO_TEXTS, introLabels as INTRO_LABELS } from './data/intro.js';
import {
  terminalLog as INITIAL_TERMINAL_LOG,
  waitingMessages as WAITING_MESSAGES,
  systemWordsFailed as TERMINAL_SYSTEM_WORDS_FAILED,
  placeholderMessage as TERMINAL_PLACEHOLDER,
  transmitMessage as TERMINAL_TRANSMIT,
} from './data/terminal.js';
import { LYNN_SYSTEM_PROMPT } from './llm/lynnPrompt.js';
import {
  useLocale,
  getLocalizedStoryBeats,
  getLocalizedDiagnosticReport,
  getIntroText,
  getIntroLabel,
  getSpamMessageText,
  getWaitingMessage,
  t,
} from './i18n/index.jsx';
import { zh } from './locales/zh.js';
import './App.css';

/** 将文本中的 [xxx] 段渲染为荧光绿，用于终端赛博感 */
function highlightBrackets(text) {
  if (!text) return null;
  const parts = text.split(/(\[[^\]]*\])/g);
  return parts.map((part, i) =>
    /^\[.*\]$/.test(part) ? (
      <span key={i} className="terminal-bracket">{part}</span>
    ) : (
      part
    )
  );
}

/** 终端诊断风格：自动高亮 [系统标签] 和 (ASD 术语) */
function highlightTerminalText(text) {
  if (!text) return null;
  const parts = text.split(/(\[[^\]]*\]|\([^)]*\))/g);
  return parts.map((part, i) => {
    if (/^\[.*\]$/.test(part)) {
      return (
        <span
          key={i}
          className="terminal-warning-tag inline-block bg-red-900/50 text-red-400 px-1.5 py-0.5 rounded-sm font-bold tracking-widest border border-red-700/50 align-baseline"
        >
          {part}
        </span>
      );
    }
    if (/^\(.*\)$/.test(part)) {
      return (
        <span key={i} className="terminal-inline-note text-[#a8d6ea] font-bold bg-[#1a3344]/35 px-1 align-baseline">
          {part}
        </span>
      );
    }
    return part;
  });
}

/** 弹窗在打字机打到以下关键词时依次触发（按顺序） */
const KEYWORD_TRIGGERS = [
  { keyword: 'Sammie', id: 'msg1' },
  { keyword: 'Performance Improvement Plan (PIP):', id: 'msg2' },
  { keyword: 'REQ: Written ', id: 'msg3' },
  { keyword: 'PIP LOG: "Rigid,', id: 'msg4' },
  { keyword: 'REQ: Noise-', id: 'msg5' },
  { keyword: 'PIP LOG: "Hostile', id: 'msg6' },
  { keyword: 'transparency.', id: 'msg7' },
  { keyword: '10 years', id: 'msg8' },
  { keyword: 'Surviving ', id: 'immigration' },
  { keyword: 'Battery.', id: 'fatal' },
];

const SPAM_MESSAGES = [
  { id: 'msg1', sender: 'Sammie', text: "Quick sync?" },
  { id: 'msg2', sender: 'Sammie', text: "Can you take this ad-hoc ticket?" },
  { id: 'msg3', sender: 'Sammie', text: "Lynn? Your dot has been yellow for 4 minutes." },
  { id: 'msg4', sender: 'Sammie', text: "I noticed yesterday you blocked your calendar from 2 to 3. Where do you need to be?" },
  { id: 'msg5', sender: 'Sammie', text: "Lynn, asking me to verify your daily checklist is not a 'reasonable accommodation.' Hand-holding you is unfair to the team." },
  { id: 'msg6', sender: 'Sammie', text: "I'm not writing down our conversation. You need to learn to 'read between the lines.' This rigidity is why you're on the PIP." },
  { id: 'msg7', sender: 'Sammie', text: "David said he helped you debug. I told you to 'be more collaborative', not to have others do your job. Are we evaluating him or you?" },
  { id: 'msg8', sender: 'Sammie', text: "Also, wearing those giant headphones at your desk sends a very hostile message to the floor." },
  { id: 'immigration', sender: 'IMMIGRATION_SYS_DO_NOT_REPLY', text: "OFFICIAL NOTICE: Upon cessation of sponsored employment, your work visa will be invalidated. 60-day grace period activated. Unlawful presence will result in forced removal.", isAlert: true },
  { id: 'fatal', sender: 'SYSTEM_FATAL', text: "Subject vitals flatlining. Neural link collapsing.", isFatal: true },
];
/** 致命弹窗出现后，延迟多久显示最后一句任务线 */
const FINAL_LINE_DELAY_MS = 500;

const TYPEWRITER_MS_PER_CHAR = 52;

function StartScreen({ onStart, locale, canQuickSkip }) {
  const [hasEnteredIntro] = useState(true);
  /** 0..8: current segment. 7 = typewriter stops; 8 = shown by popup-phase timer. */
  const [segmentIndex, setSegmentIndex] = useState(0);
  /** How many chars visible in current segment. */
  const [charIndex, setCharIndex] = useState(1);
  /** Set true when final-line timer fires; shows segment 8. */
  const [showFinalLine, setShowFinalLine] = useState(false);
  const [visibleOrder, setVisibleOrder] = useState(() => []);
  const poppedIdsRef = useRef(new Set());
  const finalLineTimerRef = useRef(null);

  const introTexts = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => getIntroText(i, locale) ?? INTRO_TEXTS[i]);
  const introLabels = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => getIntroLabel(i, locale) ?? INTRO_LABELS[i]);
  const lastTypewriterSegment = Math.min(7, introTexts.length - 1);

  const handleSkipIntro = useCallback(() => {
    if (!canQuickSkip) return;
    if (lastTypewriterSegment < 0) return;
    const allTriggerIds = KEYWORD_TRIGGERS.map(({ id }) => id);
    if (finalLineTimerRef.current) {
      clearTimeout(finalLineTimerRef.current);
      finalLineTimerRef.current = null;
    }
    poppedIdsRef.current = new Set(allTriggerIds);
    setVisibleOrder([...allTriggerIds].reverse());
    setSegmentIndex(lastTypewriterSegment);
    setCharIndex((introTexts[lastTypewriterSegment] ?? '').length);
    setShowFinalLine(true);
  }, [canQuickSkip, introTexts, lastTypewriterSegment]);

  // Typewriter: one character every TYPEWRITER_MS_PER_CHAR; advance segment when current text done; stop at end of segment 7
  useEffect(() => {
    if (!hasEnteredIntro || segmentIndex >= 8) return;
    const text = introTexts[segmentIndex];
    if (charIndex >= text.length) {
      if (segmentIndex >= 7) return;
      setSegmentIndex((s) => s + 1);
      setCharIndex(0);
      return;
    }
    const tm = setTimeout(() => setCharIndex((c) => c + 1), TYPEWRITER_MS_PER_CHAR);
    return () => clearTimeout(tm);
  }, [hasEnteredIntro, segmentIndex, charIndex, introTexts]);

  // 根据当前已打出的全文检查关键词，按顺序触发弹窗（仅英文）
  const getFullVisibleIntroText = () => {
    let s = '';
    for (let i = 0; i <= segmentIndex; i++) {
      if (i < segmentIndex) s += introTexts[i];
      else s += introTexts[i].slice(0, charIndex);
      if (i < segmentIndex) s += '\n';
    }
    return s;
  };

  useEffect(() => {
    if (!hasEnteredIntro) return;
    const fullText = getFullVisibleIntroText();
    for (const { keyword, id } of KEYWORD_TRIGGERS) {
      if (poppedIdsRef.current.has(id)) continue;
      if (fullText.includes(keyword)) {
        poppedIdsRef.current.add(id);
        setVisibleOrder((prev) => [id, ...prev]);
        if (id === 'fatal') {
          if (finalLineTimerRef.current) clearTimeout(finalLineTimerRef.current);
          finalLineTimerRef.current = setTimeout(() => setShowFinalLine(true), FINAL_LINE_DELAY_MS);
        }
        break;
      }
    }
  }, [hasEnteredIntro, segmentIndex, charIndex]);

  useEffect(() => {
    return () => {
      if (finalLineTimerRef.current) clearTimeout(finalLineTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!canQuickSkip) return;
    const onMouseDown = () => handleSkipIntro();
    const onKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Enter') handleSkipIntro();
    };
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [canQuickSkip, handleSkipIntro]);

  const dismiss = (id, e) => {
    e.stopPropagation();
    setVisibleOrder((prev) => prev.filter((x) => x !== id));
  };

  const visibleText = (segIdx) => {
    const text = introTexts[segIdx];
    if (text == null) return '';
    if (segIdx > segmentIndex) return null;
    if (segIdx < segmentIndex) return text;
    return text.slice(0, charIndex);
  };
  const showSegment8 = showFinalLine;

  // 第二屏：打字机逐字打出，NEURAL_CAPACITY 后不规则弹窗，最后一句在最后一条弹窗之后
  const isTyping = (idx) => segmentIndex === idx && charIndex < introTexts[idx].length;
  const cursor = <span className="typewriter-cursor">|</span>;
  const renderSegment = (idx, asBlock = false, className = '') => {
    const txt = visibleText(idx);
    if (txt == null) return null;
    const label = introLabels[idx];
    const showCursor = isTyping(idx);
    if (asBlock && label) {
      return (
        <div className="data-block">
          <span className="block-label">{label}</span>
          <p>{txt}{showCursor && cursor}</p>
        </div>
      );
    }
    if (asBlock) return <p className={className}>{txt}{showCursor && cursor}</p>;
    return <span className={className}>{txt}{showCursor && cursor}</span>;
  };

  return (
    <div className="diagnostic-report relative-container" onMouseDown={handleSkipIntro}>
      <div className="title-hero">
        <h1 className="glitch-title">{t('title', locale, '24 Hours of Sodom')}</h1>
        <h2 className="glitch-subtitle">{t('subtitle', locale, 'Too Loud a Solitude')}</h2>
      </div>
      <div className="report-header">
        {segmentIndex >= 0 && (segmentIndex > 0 ? <span className="critical-warning">{introTexts[0]}</span> : renderSegment(0, false, 'critical-warning'))}
        {segmentIndex >= 1 && (segmentIndex > 1 ? <span className="critical-warning">{introTexts[1]}</span> : renderSegment(1, false, 'critical-warning'))}
      </div>

      <div className="report-body">
        {[2, 3, 4].map((idx) => {
          if (segmentIndex < idx) return null;
          if (segmentIndex > idx) return <div key={idx} className="data-block"><span className="block-label">{introLabels[idx]}</span><p>{introTexts[idx]}</p></div>;
          return <React.Fragment key={idx}>{renderSegment(idx, true)}</React.Fragment>;
        })}
        {segmentIndex > 5 && <p className="report-standalone">{introTexts[5]}</p>}
        {segmentIndex === 5 && renderSegment(5, true, 'report-standalone')}
        {segmentIndex > 6 && <p className="report-standalone">{introTexts[6]}</p>}
        {segmentIndex === 6 && renderSegment(6, true, 'report-standalone')}
      </div>

      <div className="report-footer">
        {segmentIndex > 7 && <p className="mission-objective">{introTexts[7]}</p>}
        {segmentIndex === 7 && <p className="mission-objective">{visibleText(7)}{isTyping(7) && cursor}</p>}
        {showSegment8 && <p className="mission-objective">{introTexts[8]}</p>}
        {canQuickSkip && segmentIndex < lastTypewriterSegment && (
          <p
            className="mission-objective"
            style={{ marginTop: '1.25rem', textAlign: 'center' }}
          >
            {locale === 'zh'
              ? '[FAST FORWARD ENABLED] 点击屏幕加载全部日志。'
              : '[FAST FORWARD ENABLED] Click screen to reveal all logs.'}
          </p>
        )}
        <button className="start-btn" onClick={onStart}>
          &gt; {t('initiateLink', locale, 'INITIATE_LINK')}<span className="start-cursor">_</span>
        </button>
      </div>

      <div className="notification-center">
        {visibleOrder.map((id) => {
          const m = SPAM_MESSAGES.find((msg) => msg.id === id);
          if (!m) return null;
          const header = m.isFatal ? '🔴 SYSTEM_FATAL' : m.isAlert ? '⚠️ IMMIGRATION_AUTO_ALERT' : '💬 SLACK_MESSAGE';
          return (
            <div
              key={m.id}
              className={`popup-msg slide-in ${m.isFatal ? 'fatal-popup' : ''} ${m.isAlert ? 'alert-popup' : ''}`}
            >
              <div className="popup-top">
                <span className="popup-header">{header}</span>
                <button
                  className="popup-dismiss"
                  onClick={(e) => dismiss(m.id, e)}
                  aria-label="Dismiss"
                >
                  [×]
                </button>
              </div>
              <div className={`popup-body ${m.isFatal ? 'blinking-text' : ''}`}>
                {m.sender.includes('Sammie') ? <><strong>{m.sender}:</strong> &quot;{getSpamMessageText(m, locale)}&quot;</> : getSpamMessageText(m, locale)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function GameUI() {
  const { locale, setLocale } = useLocale();
  const [canQuickSkipIntro, setCanQuickSkipIntro] = useState(() => {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem('cyber-hell-has-played') === '1';
    } catch {
      return false;
    }
  });
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";
  const localizedStoryBeats = getLocalizedStoryBeats(storyBeats, locale);
  // --- 核心游戏状态 ---
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [stats, setStats] = useState({ energy: 100, sensory: 0, pressure: 0 });
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [lastConsequence, setLastConsequence] = useState("");
  const [resolutionPendingAdvance, setResolutionPendingAdvance] = useState(null); // { nextBeat, terminalDelay } | null
  const [isSystemFailed, setIsSystemFailed] = useState(false);
  const [narrativeCharIndex, setNarrativeCharIndex] = useState(0);
  const [conditionalNarrativeCharIndex, setConditionalNarrativeCharIndex] = useState(0);
  const [bridgeNarrativeCharIndex, setBridgeNarrativeCharIndex] = useState(0);
  const narrativeTypewriterRef = useRef(null);
  const conditionalTypewriterRef = useRef(null);
  const bridgeTypewriterRef = useRef(null);
  const [choiceHistory, setChoiceHistory] = useState({}); // { [beatId]: choiceId }
  // Terminal Override (Beat 7 结局)
  const [playerMessage, setPlayerMessage] = useState("");
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [terminalLog, setTerminalLog] = useState(() => {
    try {
      if (typeof localStorage !== 'undefined' && localStorage.getItem('cyber-hell-locale') === 'zh' && zh?.ui?.terminalLog) {
        return [...zh.ui.terminalLog];
      }
    } catch {}
    return [...INITIAL_TERMINAL_LOG];
  });
  const [llmResponse, setLlmResponse] = useState("");
  const [finalOutcome, setFinalOutcome] = useState(null); // null | 'survived' | 'deceased'
  const [transmitError, setTransmitError] = useState("");
  // 分步展示：LLM 返回的完整结果；展示阶段；打字机可见长度
  const [llmResult, setLlmResult] = useState(null); // { empathy_analysis, terminal_output, final_status } | null
  const [displayPhase, setDisplayPhase] = useState('idle'); // 'idle' | 'typing_analysis' | 'pause' | 'typing_verdict' | 'done'
  const [analysisVisibleLength, setAnalysisVisibleLength] = useState(0);
  const [verdictVisibleLength, setVerdictVisibleLength] = useState(0);
  const [waitingMessageIndex, setWaitingMessageIndex] = useState(0);
  const [showReportButton, setShowReportButton] = useState(false);
  const [showStatsScreen, setShowStatsScreen] = useState(false);
  const [hoveredChoiceId, setHoveredChoiceId] = useState(null); // 底部选项卡片 hover/active 高亮
  const [isInlineInterventionInput, setIsInlineInterventionInput] = useState(false);
  const pauseTimeoutRef = useRef(null);
  const typewriterIntervalRef = useRef(null);
  const waitingIntervalRef = useRef(null);
  const outcomeDelayRef = useRef(null);
  const reportButtonDelayRef = useRef(null);
  const interventionOutcomeDelayRef = useRef(null);
  const TYPEWRITER_MS = 28;
  const PAUSE_AFTER_ANALYSIS_MS = 3000;
  const VERDICT_TO_OUTCOME_DELAY_MS = 3000;
  const WAITING_MESSAGE_INTERVAL_MS = 2800;

  const NARRATIVE_TYPEWRITER_MS = 20;

  const getConditionalNarrativeText = (beat) => {
    if (!beat?.conditionalNarrative) return "";
    if (beat.id === "beat_4_hr_ambush") {
      const firstBeatChoiceId = choiceHistory["beat_1_the_delay"];
      if (firstBeatChoiceId === "1A") return beat.conditionalNarrative.if_1A ?? "";
      if (firstBeatChoiceId === "1B") return beat.conditionalNarrative.if_1B ?? "";
      if (firstBeatChoiceId === "1C") return beat.conditionalNarrative.if_1C ?? "";
      return "";
    }
    if (beat.id === "beat_7_final_echo") {
      const beat5ChoiceId = choiceHistory["beat_5_impossible_deadline"];
      if (beat5ChoiceId === "5A") return beat.conditionalNarrative.if_5A ?? "";
      if (beat5ChoiceId === "5B" || beat5ChoiceId === "5C") return beat.conditionalNarrative.if_5B_or_5C ?? "";
      return "";
    }
    return "";
  };

  // 进入新 beat 时重置 narrative 打字机；有 consequence 时不打字（已展示过）
  useEffect(() => {
    if (!lastConsequence) setNarrativeCharIndex(0);
  }, [currentBeatIndex, lastConsequence]);

  useEffect(() => {
    setConditionalNarrativeCharIndex(0);
    setBridgeNarrativeCharIndex(0);
    setIsInlineInterventionInput(false);
  }, [currentBeatIndex, locale]);

  // Narrative 打字机（有 consequence 时不运行）
  useEffect(() => {
    if (lastConsequence) return;
    const beat = localizedStoryBeats[currentBeatIndex];
    const fullText = beat?.narrativeText ?? "";
    if (narrativeCharIndex >= fullText.length) return;
    narrativeTypewriterRef.current = setTimeout(
      () => setNarrativeCharIndex((c) => c + 1),
      NARRATIVE_TYPEWRITER_MS
    );
    return () => {
      if (narrativeTypewriterRef.current) clearTimeout(narrativeTypewriterRef.current);
    };
  }, [currentBeatIndex, narrativeCharIndex, lastConsequence, localizedStoryBeats]);

  useEffect(() => {
    if (lastConsequence) return;
    const beat = localizedStoryBeats[currentBeatIndex];
    const fullNarrative = beat?.narrativeText ?? "";
    const conditionalText = getConditionalNarrativeText(beat);
    if (!conditionalText) return;
    if (narrativeCharIndex < fullNarrative.length) return;
    if (conditionalNarrativeCharIndex >= conditionalText.length) return;
    conditionalTypewriterRef.current = setTimeout(
      () => setConditionalNarrativeCharIndex((c) => c + 1),
      NARRATIVE_TYPEWRITER_MS
    );
    return () => {
      if (conditionalTypewriterRef.current) clearTimeout(conditionalTypewriterRef.current);
    };
  }, [currentBeatIndex, narrativeCharIndex, conditionalNarrativeCharIndex, lastConsequence, localizedStoryBeats, choiceHistory]);

  useEffect(() => {
    if (lastConsequence) return;
    const beat = localizedStoryBeats[currentBeatIndex];
    const fullNarrative = beat?.narrativeText ?? "";
    const conditionalText = getConditionalNarrativeText(beat);
    const bridgeText = beat?.bridgeText ?? "";
    if (!bridgeText) return;
    if (narrativeCharIndex < fullNarrative.length) return;
    if (conditionalText && conditionalNarrativeCharIndex < conditionalText.length) return;
    if (bridgeNarrativeCharIndex >= bridgeText.length) return;
    bridgeTypewriterRef.current = setTimeout(
      () => setBridgeNarrativeCharIndex((c) => c + 1),
      NARRATIVE_TYPEWRITER_MS
    );
    return () => {
      if (bridgeTypewriterRef.current) clearTimeout(bridgeTypewriterRef.current);
    };
  }, [
    currentBeatIndex,
    narrativeCharIndex,
    conditionalNarrativeCharIndex,
    bridgeNarrativeCharIndex,
    lastConsequence,
    localizedStoryBeats,
    choiceHistory,
  ]);

  const narrativeSkipRef = useRef(null);
  narrativeSkipRef.current = () => {
    const beat = localizedStoryBeats[currentBeatIndex];
    const fullText = beat?.narrativeText ?? "";
    if (narrativeCharIndex < fullText.length) {
      setNarrativeCharIndex(fullText.length);
      return;
    }
    const conditionalText = getConditionalNarrativeText(beat);
    if (conditionalText && conditionalNarrativeCharIndex < conditionalText.length) {
      setConditionalNarrativeCharIndex(conditionalText.length);
      return;
    }
    const bridgeText = beat?.bridgeText ?? "";
    if (bridgeText && bridgeNarrativeCharIndex < bridgeText.length) {
      setBridgeNarrativeCharIndex(bridgeText.length);
    }
  };

  useEffect(() => {
    if (lastConsequence || !isGameStarted || !hasSeenIntro || isSystemFailed) return;
    const onKeyDown = (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        narrativeSkipRef.current?.();
      }
    };
    const onMouseDown = () => narrativeSkipRef.current?.();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [lastConsequence, isGameStarted, hasSeenIntro, isSystemFailed]);

  // 进入终端界面时，若仍是初始三条日志，按当前语言显示
  useEffect(() => {
    if (!isSystemFailed || terminalLog.length !== 3) return;
    const isInitialEn = terminalLog[0] === INITIAL_TERMINAL_LOG[0];
    const wantZh = locale === 'zh' && zh?.ui?.terminalLog;
    if (wantZh && isInitialEn) setTerminalLog([...zh.ui.terminalLog]);
    else if (!wantZh && !isInitialEn) setTerminalLog([...INITIAL_TERMINAL_LOG]);
  }, [isSystemFailed, locale]);

  // 分步打字机与阶段推进
  useEffect(() => {
    if (!llmResult) return;

    if (displayPhase === 'typing_analysis') {
      const full = llmResult.empathy_analysis ?? '';
      if (analysisVisibleLength >= full.length) {
        setDisplayPhase('pause');
        return;
      }
      typewriterIntervalRef.current = setInterval(() => {
        setAnalysisVisibleLength((n) => {
          const next = n + 1;
          if (next >= full.length) {
            if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
            setDisplayPhase('pause');
            return full.length;
          }
          return next;
        });
      }, TYPEWRITER_MS);
      return () => {
        if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
      };
    }

    if (displayPhase === 'pause') {
      pauseTimeoutRef.current = setTimeout(() => {
        setDisplayPhase('typing_verdict');
        setVerdictVisibleLength(0);
      }, PAUSE_AFTER_ANALYSIS_MS);
      return () => {
        if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      };
    }

    if (displayPhase === 'typing_verdict') {
      const full = llmResult.terminal_output ?? '';
      const status = llmResult.final_status === 'survived' ? 'survived' : 'deceased';
      typewriterIntervalRef.current = setInterval(() => {
        setVerdictVisibleLength((n) => {
          const next = n + 1;
          if (next >= full.length) {
            if (typewriterIntervalRef.current) {
              clearInterval(typewriterIntervalRef.current);
              typewriterIntervalRef.current = null;
            }
            setDisplayPhase('done');
            setTerminalLog((prev) => [...prev, full]);
            return full.length;
          }
          return next;
        });
      }, TYPEWRITER_MS);
      return () => {
        if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
      };
    }
  }, [llmResult, displayPhase]);

  // verdict 打完后延迟 3s 再切全屏结局
  useEffect(() => {
    if (displayPhase !== 'done' || !llmResult) return;
    outcomeDelayRef.current = setTimeout(() => {
      setFinalOutcome(llmResult.final_status === 'survived' ? 'survived' : 'deceased');
    }, VERDICT_TO_OUTCOME_DELAY_MS);
    return () => {
      if (outcomeDelayRef.current) {
        clearTimeout(outcomeDelayRef.current);
        outcomeDelayRef.current = null;
      }
    };
  }, [displayPhase, llmResult]);

  // 存活/死亡结局显示 3 秒后显示「查看报告」按钮
  useEffect(() => {
    if (finalOutcome !== 'deceased' && finalOutcome !== 'survived') return;
    setShowReportButton(false);
    reportButtonDelayRef.current = setTimeout(() => setShowReportButton(true), 3000);
    return () => {
      if (reportButtonDelayRef.current) {
        clearTimeout(reportButtonDelayRef.current);
        reportButtonDelayRef.current = null;
      }
    };
  }, [finalOutcome]);

  useEffect(() => {
    if (finalOutcome === 'deceased' || finalOutcome === 'survived') {
      setIsSystemFailed(true);
    }
  }, [finalOutcome]);

  useEffect(() => {
    return () => {
      if (interventionOutcomeDelayRef.current) {
        clearTimeout(interventionOutcomeDelayRef.current);
        interventionOutcomeDelayRef.current = null;
      }
    };
  }, []);

  // 等待 API 时轮播提示语
  useEffect(() => {
    if (!isTransmitting) {
      setWaitingMessageIndex(0);
      if (waitingIntervalRef.current) {
        clearInterval(waitingIntervalRef.current);
        waitingIntervalRef.current = null;
      }
      return;
    }
    setWaitingMessageIndex(0);
    waitingIntervalRef.current = setInterval(() => {
      setWaitingMessageIndex((i) => (i + 1) % WAITING_MESSAGES.length);
    }, WAITING_MESSAGE_INTERVAL_MS);
    return () => {
      if (waitingIntervalRef.current) clearInterval(waitingIntervalRef.current);
    };
  }, [isTransmitting]);

  // --- Start Screen：内心感官诊断 + 外部夺命通知，纯黑白终端 ---
  if (!isGameStarted) {
    return (
      <StartScreen
        onStart={() => {
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('cyber-hell-has-played', '1');
            }
          } catch {}
          setCanQuickSkipIntro(true);
          setIsGameStarted(true);
          setHasSeenIntro(true);
        }}
        locale={locale}
        canQuickSkip={canQuickSkipIntro}
      />
    );
  }

  // --- 渲染开场简介 ---
  if (!hasSeenIntro) {
    return (
      <div className="intro-screen">
        <div className="intro-content">
          <h1 className="intro-project">24 Hours of Sodom: Too Loud a Solitude</h1>
          <p className="intro-subject">Subject: Lynn | Status: Deceased (Suicide confirmed)</p>
          <p className="intro-body">
            You are accessing the final 24 hours of a trapped soul. For most, a toxic job is a
            reason to quit. For Lynn, it's a legal cage.
          </p>
          <p className="intro-body">
            As an ASD (Autistic) professional on an H1B Visa, Lynn's right to exist in this
            country is tied directly to her employment. The law grants a 60-day grace period to
            find a new sponsor—an impossible feat for an autistic person already in the throes
            of a sensory burnout. If she loses this job, ten years of her life will be packed
            into two suitcases and deported.
          </p>
          <p className="intro-body">
            Her manager, Sammie, knows this. She treats Lynn's ASD as a "liberal hoax" and her
            need for accommodations as "laziness." She weaponizes the PIP (Performance
            Improvement Plan) not to improve her, but to break her, knowing she cannot walk away.
          </p>
          <p className="intro-clock">
            The clock is ticking. You have 24 hours to manage Lynn's crumbling Energy and
            skyrocketing Sensory Overload.
          </p>
          <p className="intro-question">
            Can you navigate the bias, survive the noise, and find a way to stay alive when the
            system wants you gone?
          </p>
          <button className="choice-btn start-action" onClick={() => setHasSeenIntro(true)}>
            RESTART HER DAY
          </button>
        </div>
      </div>
    );
  }

  // 数值钳制辅助函数
  const clamp = (val) => Math.max(0, Math.min(100, val));

  // 检查选项是否可用
  const checkIsDisabled = (requirements) => {
    if (!requirements) return { disabled: false, reason: "" };
    if (requirements.minEnergy !== undefined && stats.energy < requirements.minEnergy) return { disabled: true, reason: t('lowEnergy', locale, 'Insufficient Energy') };
    if (requirements.maxSensory !== undefined && stats.sensory > requirements.maxSensory) return { disabled: true, reason: t('sensoryOverload', locale, 'Sensory Overload') };
    if (requirements.maxPressure !== undefined && stats.pressure > requirements.maxPressure) return { disabled: true, reason: t('highPressure', locale, 'Pressure too high') };
    return { disabled: false, reason: "" };
  };

  const handleResolutionContinue = () => {
    if (!resolutionPendingAdvance) return;
    const { nextBeat, terminalDelay } = resolutionPendingAdvance;
    setLastConsequence("");
    setResolutionPendingAdvance(null);
    if (nextBeat) {
      setCurrentBeatIndex(nextBeat);
    } else {
      setTimeout(() => setIsSystemFailed(true), terminalDelay ?? 1500);
    }
  };

  // 处理选项点击
  const handleChoiceClick = (choice) => {
    const currentBeatId = storyBeats[currentBeatIndex]?.id || "";

    // 1. 更新数值
    const impact = choice.statsImpact;
    setStats(prev => ({
      energy: clamp(prev.energy + (impact?.energy ?? 0)),
      sensory: clamp(prev.sensory + (impact?.sensoryOverload ?? 0)),
      pressure: clamp(prev.pressure + (impact?.managerPressure ?? 0))
    }));

    // 2. 显示后果（在底部替代选项）
    setLastConsequence(choice.consequenceText || "");

    // 2.5 记录选择
    if (currentBeatId) {
      setChoiceHistory(prev => ({
        ...prev,
        [currentBeatId]: choice.id
      }));
    }

    if (currentBeatId === "beat_8_intervention") {
      if (choice.id === "8A" || choice.id === "8B") {
        // 先展示 Lynn 的回应，再自动进入结局，避免直接切屏打断情绪。
        setResolutionPendingAdvance(null);
        setIsInlineInterventionInput(false);
        if (interventionOutcomeDelayRef.current) clearTimeout(interventionOutcomeDelayRef.current);
        interventionOutcomeDelayRef.current = setTimeout(() => {
          setLastConsequence("");
          setFinalOutcome("deceased");
          setIsSystemFailed(true);
        }, 2200);
        return;
      }
      if (choice.id === "8C") {
        // 第三个选项回到原始全屏手动输入界面，给足输入空间。
        setLastConsequence("");
        setResolutionPendingAdvance(null);
        setIsInlineInterventionInput(false);
        setFinalOutcome(null);
        setIsSystemFailed(true);
        setPlayerMessage("");
        setTransmitError("");
        setLlmResult(null);
        setDisplayPhase("idle");
        setAnalysisVisibleLength(0);
        setVerdictVisibleLength(0);
        return;
      }
    }

    // 3. 暂不推进，等用户点击 Force reboot and proceed 后再执行
    const isOnBeat7 = currentBeatId === "beat_7_final_echo";
    const isSystemFailureChoice = choice.id === "7C" || (choice.actionText && choice.actionText.includes("System Failure"));
    const isOnBeat8 = currentBeatIndex === storyBeats.length - 1;
    const isInterventionBeat = isOnBeat8 && currentBeatId === "beat_8_intervention";

    if (isOnBeat7) {
      setResolutionPendingAdvance({ nextBeat: currentBeatIndex + 1 });
    } else if (isSystemFailureChoice || isInterventionBeat) {
      setResolutionPendingAdvance({ terminalDelay: 2000 });
    } else if (currentBeatIndex < storyBeats.length - 1) {
      setResolutionPendingAdvance({ nextBeat: currentBeatIndex + 1 });
    } else {
      setResolutionPendingAdvance({ terminalDelay: 1500 });
    }
  };

  // 解析 LLM 返回的 JSON（兼容 ```json ... ``` 包裹）
  const parseLynnJson = (raw) => {
    let s = (raw || "").trim();
    const codeBlock = s.match(/^```(?:json)?\s*([\s\S]*?)```$/);
    if (codeBlock) s = codeBlock[1].trim();
    return JSON.parse(s);
  };

  const resetGame = () => {
    if (interventionOutcomeDelayRef.current) {
      clearTimeout(interventionOutcomeDelayRef.current);
      interventionOutcomeDelayRef.current = null;
    }
    setIsGameStarted(false);
    setHasSeenIntro(false);
    setStats({ energy: 100, sensory: 0, pressure: 0 });
    setCurrentBeatIndex(0);
    setLastConsequence("");
    setConditionalNarrativeCharIndex(0);
    setBridgeNarrativeCharIndex(0);
    setResolutionPendingAdvance(null);
    setIsSystemFailed(false);
    setChoiceHistory({});
    setPlayerMessage("");
    setTerminalLog(locale === 'zh' && zh?.ui?.terminalLog ? [...zh.ui.terminalLog] : [...INITIAL_TERMINAL_LOG]);
    setLlmResponse("");
    setFinalOutcome(null);
    setTransmitError("");
    setLlmResult(null);
    setDisplayPhase('idle');
    setAnalysisVisibleLength(0);
    setVerdictVisibleLength(0);
    setShowReportButton(false);
    setShowStatsScreen(false);
    setIsInlineInterventionInput(false);
  };

  const handleTransmit = async () => {
    if (!playerMessage.trim() || isTransmitting) return;
    setIsTransmitting(true);
    setTransmitError("");
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const userInput = playerMessage.trim();
      console.log("User Input:", userInput);
      const languageInstruction = locale === 'zh'
        ? "\n\n[CRITICAL: You MUST respond entirely in Simplified Chinese. Both \"empathy_analysis\" and \"terminal_output\" in your JSON must be written in Chinese.]"
        : "\n\n[CRITICAL: You MUST respond entirely in English. Both \"empathy_analysis\" and \"terminal_output\" in your JSON must be written in English.]";
      const userPrompt = LYNN_SYSTEM_PROMPT + languageInstruction + "\n\nUser Message: " + userInput;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
      });
      const rawText = response?.text ?? "";
      if (!rawText) {
        setTransmitError("[SYSTEM] No response from model. Please check API key and try again.");
        return;
      }
      const json = parseLynnJson(rawText);
      const status = (json.final_status || "").toLowerCase();
      if (status !== "survived" && status !== "deceased") {
        setTransmitError("[WARN: final_status not recognized — " + (json.final_status ?? "missing") + "]");
      }
      setLlmResult({
        empathy_analysis: json.empathy_analysis ?? "[No analysis returned.]",
        terminal_output: json.terminal_output ?? "[SYSTEM: NO TERMINAL OUTPUT]",
        final_status: status === "survived" ? "survived" : "deceased",
      });
      setDisplayPhase("typing_analysis");
      setAnalysisVisibleLength(0);
      setVerdictVisibleLength(0);
    } catch (err) {
      const msg = err?.message ?? String(err);
      setTransmitError("[SYSTEM ERROR] " + msg);
      setLlmResponse("[CONNECTION FAILED. CHECK API KEY AND NETWORK.]");
    } finally {
      setIsTransmitting(false);
    }
  };

  // --- 渲染大结局：终端机系统接管 (Terminal Override) ---
  if (isSystemFailed) {
    // 系统事故诊断报告（科普数据）界面，内容来自 diagnosticReport.js
    if (showStatsScreen) {
      const { header, body, references } = diagnosticReport;
      return (
        <div className="stats-screen">
          <div className="stats-screen-scroll">
            <h3 className="stats-screen-title">[SYSTEM DIAGNOSTIC LOG: FATAL ERRORS IDENTIFIED]</h3>
            <p className="stats-screen-subtitle">{header.title}</p>
            {header.subtitle && <p className="stats-screen-abstract">{header.subtitle}</p>}
            {header.abstract && <p className="stats-screen-abstract">{header.abstract}</p>}
            {body.map((section, i) => (
              <div key={section.sectionId || i} className="stat-block">
                <h4>{section.heading}</h4>
                {section.intro && <p className="stat-intro">{section.intro}</p>}
                {section.contentList?.map((item, j) => (
                  <div key={j} className="stat-item">
                    {item.label && <strong className="stat-label">{item.label}</strong>}
                    <p>{item.text}</p>
                  </div>
                ))}
                {section.subsections?.map((sub, j) => (
                  <div key={j} className="stat-subsection">
                    <strong className="stat-subheading">{sub.subHeading}</strong>
                    <p>{sub.text}</p>
                    {sub.points?.length > 0 && (
                      <ul className="stat-points">
                        {sub.points.map((point, k) => (
                          <li key={k}>{point}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                {section.quote && (
                  <blockquote className="stat-quote">"{section.quote}"</blockquote>
                )}
                {section.quoteExplanation && <p className="stat-quote-explanation">{section.quoteExplanation}</p>}
              </div>
            ))}
            {references?.length > 0 && (
              <div className="stats-references">
                <h4 className="stats-references-title">References</h4>
                <ol className="stats-references-list">
                  {references.map((ref, i) => (
                    <li key={i}>{ref}</li>
                  ))}
                </ol>
              </div>
            )}
            {finalOutcome === 'deceased' && (
              <div className="stats-bonus">
                <h4 className="stats-bonus-title">BONUS: WHAT COULD'VE WORKED WITH LYNN?</h4>
                <blockquote className="stats-bonus-quote">"I see how much energy it takes for you just to survive Sammie's gaslighting. The sensory overload is a real torture, not an excuse. This world wasn't built for neurodivergent minds, but your mind is not broken. The cage is broken. You don't have to fight it tonight, just rest your mind."</blockquote>
              </div>
            )}
            <p className="system-conclusion">&gt; THE SYSTEM WORKED AS DESIGNED. LYNN WAS JUST NOT DESIGNED FOR THE SYSTEM.</p>
          </div>
          <button className="reboot-btn" onClick={resetGame}>[REBOOT SIMULATION]</button>
        </div>
      );
    }
    // 存活结局：绿色特效；3 秒后显示查看报告按钮
    if (finalOutcome === "survived") {
      return (
        <div className="terminal-outcome terminal-outcome-survived">
          <div className="terminal-outcome-glow" />
          <h1 className="terminal-outcome-title">LINK SECURED</h1>
          <p className="terminal-outcome-subtitle">Subject: Lynn — Retreating from edge.</p>
          <p className="terminal-outcome-message">Your words reached her. She stepped back.</p>
          {showReportButton && (
            <button className="diagnostic-btn diagnostic-btn--survived fade-in" onClick={() => setShowStatsScreen(true)}>
              [VIEW INCIDENT DIAGNOSTICS]
            </button>
          )}
        </div>
      );
    }
    // 死亡结局：红色警报、全屏变黑；3 秒后显示查看报告按钮
    if (finalOutcome === "deceased") {
      return (
        <div className="terminal-outcome terminal-outcome-deceased">
          <div className="terminal-outcome-alert" />
          <h1 className="terminal-outcome-title terminal-outcome-title-deceased">CONNECTION LOST</h1>
          <p className="terminal-outcome-subtitle">Subject: Lynn — Terminated. Signal dropped.</p>
          <p className="terminal-outcome-message">The link closed. She was not able to hear you in time.</p>
          {showReportButton && (
            <button className="diagnostic-btn fade-in" onClick={() => setShowStatsScreen(true)}>
              [DOWNLOAD INCIDENT DIAGNOSTICS]
            </button>
          )}
        </div>
      );
    }
    // 默认：终端输入与日志（手动直连界面，一屏内无滚动）
    return (
      <div className="terminal-override manual-input-screen">
        <div className="terminal-override-errors">
          {terminalLog.map((line, i) => (
            <div key={i} className="terminal-error-line">{highlightBrackets(line)}</div>
          ))}
        </div>
        {lastConsequence && (
          <div className="terminal-override-consequence">
            &gt; {lastConsequence}
          </div>
        )}
        <p className="terminal-override-prompt">
          {t('systemWordsFailed', locale, TERMINAL_SYSTEM_WORDS_FAILED)}
        </p>
        <textarea
          className="terminal-override-input"
          placeholder={t('placeholderMessage', locale, TERMINAL_PLACEHOLDER)}
          value={playerMessage}
          onChange={(e) => setPlayerMessage(e.target.value)}
          disabled={isTransmitting}
          rows={3}
        />
        {/* LLM 的分析与判决：紧贴在输入框下面呈现 */}
        {llmResult && (
          <div className="terminal-verdict-block">
            {(displayPhase === 'typing_analysis' || displayPhase === 'pause' || displayPhase === 'typing_verdict' || displayPhase === 'done') && (
              <div className="analysis-log">
                {highlightBrackets((llmResult.empathy_analysis ?? '').slice(0, analysisVisibleLength))}
                {(displayPhase === 'typing_analysis' && analysisVisibleLength < (llmResult.empathy_analysis ?? '').length) && <span className="typewriter-cursor">|</span>}
              </div>
            )}
            {(displayPhase === 'typing_verdict' || displayPhase === 'done') && (
              <div
                className={`verdict-log verdict-log--${llmResult.final_status === 'deceased' ? 'deceased' : 'survived'}`}
              >
                {highlightBrackets((llmResult.terminal_output ?? '').slice(0, verdictVisibleLength))}
                {(displayPhase === 'typing_verdict' && verdictVisibleLength < (llmResult.terminal_output ?? '').length) && <span className="typewriter-cursor">|</span>}
              </div>
            )}
          </div>
        )}
        {!llmResult && (
          <div className="terminal-override-btn-wrap">
            <button
              className="terminal-override-btn"
              onClick={handleTransmit}
              disabled={isTransmitting || !playerMessage.trim()}
            >
              {isTransmitting ? (getWaitingMessage(waitingMessageIndex, locale) ?? WAITING_MESSAGES[waitingMessageIndex]) : t('transmitMessage', locale, TERMINAL_TRANSMIT)}
            </button>
          </div>
        )}
        {transmitError && (
          <div className="terminal-override-error-msg">{transmitError}</div>
        )}
      </div>
    );
  }

  const currentBeat = localizedStoryBeats[currentBeatIndex];
  const choices = currentBeat?.choices ?? [];
  const isInterventionBeat = currentBeat?.id === "beat_8_intervention";
  const interventionPresetChoices = isInterventionBeat
    ? choices.filter((choice) => choice.id === "8A" || choice.id === "8B")
    : [];
  const currentConditionalNarrativeText = getConditionalNarrativeText(currentBeat);
  const hasConditionalNarrative = Boolean(currentConditionalNarrativeText);
  const isPrimaryNarrativeDone = narrativeCharIndex >= (currentBeat?.narrativeText?.length ?? 0);
  const showConditionalNarrative = hasConditionalNarrative && isPrimaryNarrativeDone;
  const displayedConditionalNarrative = showConditionalNarrative
    ? currentConditionalNarrativeText.slice(
        0,
        lastConsequence ? currentConditionalNarrativeText.length : conditionalNarrativeCharIndex
      )
    : "";
  const isConditionalNarrativeTyping = showConditionalNarrative
    && !lastConsequence
    && conditionalNarrativeCharIndex < currentConditionalNarrativeText.length;
  const isAnyNarrativeTyping = !isPrimaryNarrativeDone || isConditionalNarrativeTyping;
  const hasBridgeNarrative = Boolean(currentBeat?.bridgeText);
  const isBridgeNarrativeReady = !hasConditionalNarrative || conditionalNarrativeCharIndex >= currentConditionalNarrativeText.length;
  const showBridgeNarrative = hasBridgeNarrative && isPrimaryNarrativeDone && isBridgeNarrativeReady;
  const displayedBridgeNarrative = showBridgeNarrative
    ? (currentBeat.bridgeText ?? '').slice(0, lastConsequence ? (currentBeat.bridgeText ?? '').length : bridgeNarrativeCharIndex)
    : "";
  const isBridgeNarrativeTyping = showBridgeNarrative
    && !lastConsequence
    && bridgeNarrativeCharIndex < (currentBeat.bridgeText?.length ?? 0);
  const isAnyNarrativeStillTyping = isAnyNarrativeTyping || isBridgeNarrativeTyping;

  const renderChoiceCard = (choice) => {
    const { disabled, reason } = checkIsDisabled(choice.requirements);
    const isActive = hoveredChoiceId === choice.id;
    const hasImpact = Boolean(choice.impactHint);
    const isLogicAnchoring = ['1B', '2B', '4B', '5B', '6B', '7A', '8B'].includes(choice.id);
    return (
      <button
        key={choice.id}
        className={`cyber-choice-card rounded border py-4 text-left font-mono text-sm transition-all duration-300 ease-out overflow-visible ${
          disabled
            ? 'opacity-60 cursor-not-allowed border-[#334433] bg-white/[0.03] text-[#889988]/60'
            : isActive && isLogicAnchoring
              ? 'cyber-choice-card--active border-[#7f1d1d] bg-[#7f1d1d]/30 text-[#f9fafb]'
              : isActive
                ? 'cyber-choice-card--hover border-[#39ff14]/70 bg-green-900/20 text-[#c8ffb4]'
                : 'border-[#334433] bg-white/[0.04] text-[#889988]'
        }`}
        disabled={disabled}
        onClick={() => !disabled && handleChoiceClick(choice)}
        onMouseEnter={() => setHoveredChoiceId(choice.id)}
        onMouseLeave={() => setHoveredChoiceId(null)}
      >
        <div className="flex h-full flex-col justify-between">
          <div className="text-left">
            <div
              className={`leading-relaxed ${
                disabled ? 'line-through' : ''
              } ${
                isActive && isLogicAnchoring ? 'text-base font-semibold text-[#f9fafb]' :
                isActive ? 'text-base font-semibold text-[#c8ffb4]' : 'text-sm text-[#889988]'
              }`}
            >
              {choice.actionText}
            </div>
          </div>

          {hasImpact && (
            <div
              className={`mt-4 transition-opacity duration-200 ease-out ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="h-px bg-red-900/30 mb-2" />
              <div className="text-[10px] sm:text-xs text-[#b91c1c] uppercase tracking-[0.25em] text-left">
                {choice.impactHint.split(/\s*\|\s*/).map((part, i) => (
                  <span key={i} className="block">{part.trim()}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {disabled && (
          <div className="mt-2 text-xs text-red-300/90 text-left leading-relaxed whitespace-normal">⚠️ {choice.disabledReason || reason}</div>
        )}
      </button>
    );
  };

  // --- 渲染常规游戏界面（赛博风：深黑 + 暗红强调 + 交互式选择卡片）---
  if (!currentBeat) {
    return (
      <div className="game-wrapper min-h-screen flex items-center justify-center bg-[#080b08] text-[#889988] font-mono">
        <p>[BEAT_INDEX_OUT_OF_RANGE]</p>
      </div>
    );
  }

  return (
    <div className="game-wrapper min-h-screen h-screen w-full mx-auto flex flex-col bg-[#080b08] font-mono text-[#889988] overflow-hidden">
      {/* 顶部状态栏：时间、电量、Sensory、Pressure、Pending Revocation；琥珀色点缀关键指标 */}
      <header className="cyber-status-bar flex-shrink-0 flex flex-row flex-nowrap items-center justify-start gap-4 px-3 py-2 border-b border-[#334433] overflow-x-auto">
        <div className="flex items-center gap-1.5 whitespace-nowrap text-sm">
          <span aria-hidden className="text-[#889988]">⏰</span>
          <span className="text-amber-500">{currentBeat.timeLabel}</span>
        </div>
        <div className={`flex items-center gap-1.5 whitespace-nowrap text-sm ${stats.energy <= 20 ? 'text-red-500 font-semibold' : ''}`}>
          <span aria-hidden className="text-[#889988]">🔋</span>
          <span className={stats.energy <= 20 ? '' : 'text-amber-500'}>{stats.energy}%</span>
        </div>
        <div
          className={`flex items-center gap-1.5 whitespace-nowrap text-sm ${stats.sensory >= 80 ? 'text-red-500 font-semibold' : 'text-[#889988]'}`}
          title="Stop overreacting (别反应过度) · It's all in your head (都是你脑补的)"
        >
          <span aria-hidden>🔊</span>
          <span>Sensory {stats.sensory}%</span>
        </div>
        <div className={`flex items-center gap-1.5 whitespace-nowrap text-sm ${stats.pressure >= 80 ? 'text-red-500 font-semibold' : 'text-[#889988]'}`}>
          <span aria-hidden>👤</span>
          <span>Pressure {stats.pressure}%</span>
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap text-sm ml-auto text-amber-700/90">
          <span>Work Visa: </span>
          <span>Pending Revocation</span>
        </div>
      </header>

      {/* 中段黑色区域：填满屏幕剩余高度，延伸至底部 */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#080b08]">
        {/* 中间剧情区：占满剩余空间并在内部滚动 */}
        <div className="cyber-story-area flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-3 border-l border-[#334433] mx-2 my-2 bg-[#080b08]/60">
        <h2 className="story-title border-b border-[#334433] pb-1 mb-2 text-base font-semibold text-[#e2e8f0]">[{currentBeat.timeLabel}] {currentBeat.title}</h2>
        <p className="cyber-narrative text-sm leading-loose text-[#e2e8f0] mb-4 relative">
          &quot;{highlightTerminalText(currentBeat.narrativeText.slice(0, lastConsequence ? currentBeat.narrativeText.length : narrativeCharIndex))}&quot;
          {!lastConsequence && narrativeCharIndex < (currentBeat.narrativeText?.length ?? 0) && (
            <>
              <span>|</span>
              <span className="absolute bottom-0 right-0 text-[10px] text-[#5b7892]">
                {locale === "zh" ? "按 Space 跳过 ▼" : "Press Space to skip ▼"}
              </span>
            </>
          )}
        </p>
        {showConditionalNarrative && (
          <p className="cyber-narrative text-sm leading-loose text-[#e2e8f0] mb-4 relative">
            &quot;{highlightTerminalText(displayedConditionalNarrative)}&quot;
            {isConditionalNarrativeTyping && <span>|</span>}
          </p>
        )}
        {showBridgeNarrative && (
          <p className="cyber-narrative text-sm leading-loose text-[#e2e8f0] mb-4 relative">
            &quot;{highlightTerminalText(displayedBridgeNarrative)}&quot;
            {isBridgeNarrativeTyping && <span>|</span>}
          </p>
        )}
        </div>

        {/* 底部：有 consequence 时 SYS.LOG 替代选项；narrative 未打完时隐藏选项；否则显示选项卡片 */}
        <div className={`cyber-choices flex-shrink-0 min-h-64 p-4 border-t border-[#334433] bg-[#080b08] overflow-x-auto overflow-y-visible ${lastConsequence ? 'flex flex-col gap-4' : 'flex flex-row items-start gap-4'}`}>
        {lastConsequence ? (
          <>
            <div className="border-l-4 border-green-500 bg-gradient-to-r from-green-950/40 to-transparent p-4 pl-5 rounded-r">
              <div className="text-green-600 text-xs mb-2 font-bold tracking-widest uppercase">
                &gt;&gt; SYS.LOG // NEURAL_FEEDBACK_ANALYSIS
              </div>
              <div className="text-green-400/95 text-sm leading-loose">
                {highlightTerminalText(lastConsequence)}
              </div>
            </div>
            <button
              type="button"
              className="self-start mt-2 text-gray-500 text-sm hover:text-gray-400 font-mono focus:outline-none bg-transparent border-none cursor-pointer"
              onClick={handleResolutionContinue}
            >
              &gt; <span className="text-gray-500">{locale === "zh" ? "强制重启并继续" : "Force reboot and proceed"}</span>{' '}
              <span className="text-green-500 animate-pulse">_</span>
            </button>
          </>
        ) : isAnyNarrativeStillTyping ? null : isInterventionBeat ? (
          <>
            {interventionPresetChoices.map((choice) => renderChoiceCard(choice))}
            {!isInlineInterventionInput ? (
              <button
                type="button"
                className="cyber-choice-card rounded border py-4 text-left font-mono text-sm transition-all duration-300 ease-out overflow-visible border-[#334433] bg-white/[0.04] text-[#889988]"
                onClick={() => handleChoiceClick({ id: "8C", statsImpact: null })}
                onMouseEnter={() => setHoveredChoiceId("8C")}
                onMouseLeave={() => setHoveredChoiceId(null)}
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="text-left">
                    <div
                      className={`leading-relaxed ${
                        hoveredChoiceId === "8C" ? 'text-base font-semibold text-[#c8ffb4]' : 'text-sm text-[#889988]'
                      }`}
                    >
                      [Manual Direct Link] Write your own words to Lynn.
                    </div>
                  </div>
                </div>
              </button>
            ) : (
              <div className="cyber-choice-card rounded border py-4 text-left font-mono text-sm border-[#334433] bg-white/[0.04] text-[#889988]">
                <p className="terminal-override-prompt">
                  {t('systemWordsFailed', locale, TERMINAL_SYSTEM_WORDS_FAILED)}
                </p>
                <textarea
                  className="terminal-override-input"
                  placeholder={t('placeholderMessage', locale, TERMINAL_PLACEHOLDER)}
                  value={playerMessage}
                  onChange={(e) => setPlayerMessage(e.target.value)}
                  disabled={isTransmitting}
                  rows={3}
                />
                {llmResult && (
                  <div className="terminal-verdict-block">
                    {(displayPhase === 'typing_analysis' || displayPhase === 'pause' || displayPhase === 'typing_verdict' || displayPhase === 'done') && (
                      <div className="analysis-log">
                        {highlightBrackets((llmResult.empathy_analysis ?? '').slice(0, analysisVisibleLength))}
                        {(displayPhase === 'typing_analysis' && analysisVisibleLength < (llmResult.empathy_analysis ?? '').length) && <span className="typewriter-cursor">|</span>}
                      </div>
                    )}
                    {(displayPhase === 'typing_verdict' || displayPhase === 'done') && (
                      <div
                        className={`verdict-log verdict-log--${llmResult.final_status === 'deceased' ? 'deceased' : 'survived'}`}
                      >
                        {highlightBrackets((llmResult.terminal_output ?? '').slice(0, verdictVisibleLength))}
                        {(displayPhase === 'typing_verdict' && verdictVisibleLength < (llmResult.terminal_output ?? '').length) && <span className="typewriter-cursor">|</span>}
                      </div>
                    )}
                  </div>
                )}
                {!llmResult && (
                  <div className="terminal-override-btn-wrap">
                    <button
                      className="terminal-override-btn"
                      onClick={handleTransmit}
                      disabled={isTransmitting || !playerMessage.trim()}
                    >
                      {isTransmitting ? (getWaitingMessage(waitingMessageIndex, locale) ?? WAITING_MESSAGES[waitingMessageIndex]) : t('transmitMessage', locale, TERMINAL_TRANSMIT)}
                    </button>
                  </div>
                )}
                {transmitError && (
                  <div className="terminal-override-error-msg">{transmitError}</div>
                )}
              </div>
            )}
          </>
        ) : choices.map((choice) => renderChoiceCard(choice))}
        </div>
      </div>
    </div>
  );
}

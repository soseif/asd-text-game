import React, { useState, useEffect, useRef } from 'react';
import { storyBeats } from './data/storyBeats.js';
import { diagnosticReport } from './data/diagnosticReport.js';
import { LYNN_SYSTEM_PROMPT } from './llm/lynnPrompt.js';
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

const SPAM_MESSAGES = [
  { id: 'msg1', sender: 'Sammie (Manager)', text: "quick sync? ping me when you see this.", delay: 800 },
  { id: 'msg2', sender: 'Sammie (Manager)', text: "Can you take this ad-hoc ticket real quick? Client is waiting.", delay: 1500 },
  { id: 'msg3', sender: 'Sammie (Manager)', text: "Lynn? Your dot has been yellow for 4 minutes.", delay: 2200 },
  { id: 'msg4', sender: 'Sammie (Manager)', text: "I noticed yesterday you blocked your calendar from 2 to 3. Where do you need to be?", delay: 3000 },
  { id: 'msg5', sender: 'Sammie (Manager)', text: "Lynn, asking me to review your daily checklist is not a 'reasonable accommodation.' I expect self-sufficiency. Hand-holding you is unfair to the rest of the team.", delay: 3800 },
  { id: 'msg6', sender: 'Sammie (Manager)', text: "I am not going to write down everything we just discussed. You need to learn to 'read between the lines', Lynn. This rigidity is exactly why you are on a PIP.", delay: 4700 },
  { id: 'msg7', sender: 'Sammie (Manager)', text: "David mentioned he 'helped' you write that script yesterday. Are we evaluating your performance or his? You need to be self-sufficient.", delay: 5600 },
  { id: 'msg8', sender: 'Sammie (Manager)', text: "Also, wearing those giant headphones at your desk sends a very hostile message to the floor.", delay: 6500 },
  { id: 'uscis', sender: 'USCIS_AUTO_ALERT', text: "WARNING: Upon termination, your H1B status will be revoked. 60 days to deportation.", delay: 7800, isAlert: true },
  { id: 'fatal', sender: 'SYSTEM_FATAL', text: "Subject vitals flatlining. Neural link collapsing.", delay: 9000, isFatal: true }
];

function StartScreen({ onStart }) {
  const [hasEnteredIntro, setHasEnteredIntro] = useState(false);
  /** 出现顺序：新来的在数组头 */
  const [visibleOrder, setVisibleOrder] = useState(() => []);

  useEffect(() => {
    if (!hasEnteredIntro) return;
    const timers = SPAM_MESSAGES.map((m) =>
      setTimeout(() => {
        setVisibleOrder((prev) => [m.id, ...prev]);
      }, m.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [hasEnteredIntro]);

  const dismiss = (id, e) => {
    e.stopPropagation();
    setVisibleOrder((prev) => prev.filter((x) => x !== id));
  };

  // 第一屏：只有标题 + Enter game
  if (!hasEnteredIntro) {
    return (
      <div className="intro-minimal">
        <div className="title-hero title-hero--center">
          <h1 className="glitch-title">24 Hours of Sodom</h1>
          <h2 className="glitch-subtitle">Too Loud a Solitude</h2>
        </div>
        <button className="enter-game-btn" onClick={() => setHasEnteredIntro(true)}>
          Enter game
        </button>
      </div>
    );
  }

  // 第二屏：大段文字 + 弹窗 + INITIATE_LINK
  return (
    <div className="diagnostic-report relative-container">
      {/* 赛博感主标题 */}
      <div className="title-hero">
        <h1 className="glitch-title">24 Hours of Sodom</h1>
        <h2 className="glitch-subtitle">Too Loud a Solitude</h2>
      </div>
      {/* 底层：静态的剧情梗概 */}
      <div className="report-header">
        <span className="critical-warning">&gt;&gt; SYSTEM_ALERT: 24 hours until complete unravelling.</span>
      </div>

      <div className="report-body">
        <div className="data-block">
          <span className="block-label">[ NEURAL_STATUS ]</span>
          <p>As someone on the Autism Spectrum (ASD), your world is a relentless storm of information. For three weeks, you've survived on just 3 hours of sleep a night, trapped in a "logical loop" trying to decode every subtext in your micromanager Sammie's emails.</p>
        </div>

        <div className="data-block">
          <span className="block-label">[ SENSORY_OVERLOAD ]</span>
          <p>Your sensory filters are shattered: the screech of subway brakes feels like a blade against your eardrums; a colleague's perfume lingers like thick, toxic gas. To Sammie, your "awkwardness" is a lack of professionalism. To you, simply maintaining the "Mask" of a 'normal' human has drained every ounce of your life force.</p>
        </div>

        <div className="data-block">
          <span className="block-label">[ SYSTEMIC_THREAT ]</span>
          <p>Your H1B visa is tethered to a failing Performance Improvement Plan. If the system ejects you, the only structured, safe world you've built over 10 years will vanish.</p>
        </div>
      </div>

      <div className="report-footer">
        <p className="mission-objective">Can you help Lynn find a single breath of air amidst the noise and shadows?</p>
        <button className="start-btn" onClick={onStart}>
          &gt; INITIATE_LINK<span className="start-cursor">_</span>
        </button>
      </div>

      {/* 表层：通知列表不重叠，区域可上下滚动 */}
      <div className="notification-center">
        {visibleOrder.map((id) => {
          const m = SPAM_MESSAGES.find((msg) => msg.id === id);
          if (!m) return null;
          const header = m.isFatal ? '🔴 SYSTEM_FATAL' : m.isAlert ? '⚠️ USCIS_AUTO_ALERT' : '💬 SLACK_MESSAGE';
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
                {m.sender.includes('Sammie') ? <><strong>{m.sender}:</strong> "{m.text}"</> : m.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function GameUI() {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";
  // --- 核心游戏状态 ---
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [stats, setStats] = useState({ energy: 100, sensory: 0, pressure: 0 });
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [lastConsequence, setLastConsequence] = useState("");
  const [isSystemFailed, setIsSystemFailed] = useState(false);
  const [choiceHistory, setChoiceHistory] = useState({}); // { [beatId]: choiceId }
  // Terminal Override (Beat 7 结局)
  const [playerMessage, setPlayerMessage] = useState("");
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [terminalLog, setTerminalLog] = useState([
    "[ERROR: PRE-DEFINED EMPATHY PROTOCOLS FAILED]",
    "[SUBJECT REJECTED NEUROTYPICAL RESPONSES]",
    "[INITIATING MANUAL DIRECT LINK...]"
  ]);
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
  const pauseTimeoutRef = useRef(null);
  const typewriterIntervalRef = useRef(null);
  const waitingIntervalRef = useRef(null);
  const outcomeDelayRef = useRef(null);
  const reportButtonDelayRef = useRef(null);

  const TYPEWRITER_MS = 28;
  const PAUSE_AFTER_ANALYSIS_MS = 3000;
  const VERDICT_TO_OUTCOME_DELAY_MS = 3000;
  const WAITING_MESSAGE_INTERVAL_MS = 2800;

  const WAITING_MESSAGES = [
    "Decrypting emotional syntax...",
    "Bypassing neural firewalls...",
    "Parsing subtext. Stand by.",
    "Signal strength: fluctuating.",
    "Translating intent into frequency...",
    "Lynn's receiver is online. Routing...",
    "Empathy protocol handshake in progress...",
    "Noise floor dropping. Channel clearing.",
  ];

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
          setIsGameStarted(true);
          setHasSeenIntro(true);
        }}
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
    if (requirements.minEnergy !== undefined && stats.energy < requirements.minEnergy) return { disabled: true, reason: "电量不足" };
    if (requirements.maxSensory !== undefined && stats.sensory > requirements.maxSensory) return { disabled: true, reason: "感官过载" };
    if (requirements.maxPressure !== undefined && stats.pressure > requirements.maxPressure) return { disabled: true, reason: "压力过大" };
    return { disabled: false, reason: "" };
  };

  // 处理选项点击
  const handleChoiceClick = (choice) => {
    const currentBeatId = storyBeats[currentBeatIndex]?.id || "";

    // 1. 更新数值
    setStats(prev => ({
      energy: clamp(prev.energy + (choice.statsImpact.energy || 0)),
      sensory: clamp(prev.sensory + (choice.statsImpact.sensoryOverload || 0)),
      pressure: clamp(prev.pressure + (choice.statsImpact.managerPressure || 0))
    }));

    // 2. 显示后果
    setLastConsequence(choice.consequenceText || "");

    // 2.5 记录当前剧情节点的选择，用于后续 conditionalNarrative
    if (currentBeatId) {
      setChoiceHistory(prev => ({
        ...prev,
        [currentBeatId]: choice.id
      }));
    }

    // 3. 检查是否触发大结局 (System Failure / 终局干预)
    const isSystemFailureChoice = choice.actionText.includes("System Failure"); // 7C 直接坠入系统故障
    const isInterventionBeat = currentBeatId === "beat_8_intervention";        // 阳台干预后进入终端接管

    if (isSystemFailureChoice || isInterventionBeat) {
      // 给出一点时间显示 consequence，再切到终端接管
      setTimeout(() => setIsSystemFailed(true), 2000);
    } else if (currentBeatIndex < storyBeats.length - 1) {
      // 还有后续剧情，就推进到下一 BEAT（包括 7A / 7B -> 8 阳台）
      setCurrentBeatIndex(prev => prev + 1);
    } else {
      // 理论上的最后一个 BEAT 兜底：稍微停顿后进入终端接管
      setTimeout(() => setIsSystemFailed(true), 1500);
    }
  };

  // 解析 LLM 返回的 JSON（兼容 ```json ... ``` 包裹）
  const parseLynnJson = (raw) => {
    let s = (raw || "").trim();
    const codeBlock = s.match(/^```(?:json)?\s*([\s\S]*?)```$/);
    if (codeBlock) s = codeBlock[1].trim();
    return JSON.parse(s);
  };

  const INITIAL_TERMINAL_LOG = [
    "[ERROR: PRE-DEFINED EMPATHY PROTOCOLS FAILED]",
    "[SUBJECT REJECTED NEUROTYPICAL RESPONSES]",
    "[INITIATING MANUAL DIRECT LINK...]"
  ];

  const resetGame = () => {
    setHasSeenIntro(false);
    setStats({ energy: 100, sensory: 0, pressure: 0 });
    setCurrentBeatIndex(0);
    setLastConsequence("");
    setIsSystemFailed(false);
    setChoiceHistory({});
    setPlayerMessage("");
    setTerminalLog([...INITIAL_TERMINAL_LOG]);
    setLlmResponse("");
    setFinalOutcome(null);
    setTransmitError("");
    setLlmResult(null);
    setDisplayPhase('idle');
    setAnalysisVisibleLength(0);
    setVerdictVisibleLength(0);
    setShowReportButton(false);
    setShowStatsScreen(false);
  };

  const handleTransmit = async () => {
    if (!playerMessage.trim() || isTransmitting) return;
    setIsTransmitting(true);
    setTransmitError("");
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const userPrompt = LYNN_SYSTEM_PROMPT + "\n\nUser Message: " + playerMessage.trim();
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
          The system's words couldn't reach her. Now, use your own.
        </p>
        <textarea
          className="terminal-override-input"
          placeholder="Type your message to Lynn..."
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
              {isTransmitting ? WAITING_MESSAGES[waitingMessageIndex] : "> TRANSMIT_MESSAGE_"}
            </button>
          </div>
        )}
        {transmitError && (
          <div className="terminal-override-error-msg">{transmitError}</div>
        )}
      </div>
    );
  }

  const currentBeat = storyBeats[currentBeatIndex];

  // --- 渲染常规游戏界面（赛博风：深黑 + 暗红强调 + 交互式选择卡片）---
  return (
    <div className="game-wrapper h-screen min-h-0 w-full max-w-4xl mx-auto flex flex-col bg-[#000000] font-mono text-[#d1d5db] overflow-hidden">
      {/* 顶部状态栏：时间、电量、Sensory、Pressure、Pending Revocation */}
      <header className="cyber-status-bar flex-shrink-0 flex flex-row flex-nowrap items-center justify-start gap-4 px-3 py-2 border-b border-white/10 overflow-x-auto">
        <div className="flex items-center gap-1.5 whitespace-nowrap text-sm text-[#d1d5db]">
          <span aria-hidden>⏰</span>
          <span>{currentBeat.timeLabel}</span>
        </div>
        <div className={`flex items-center gap-1.5 whitespace-nowrap text-sm ${stats.energy <= 20 ? 'text-red-500 font-semibold' : 'text-[#d1d5db]'}`}>
          <span aria-hidden>🔋</span>
          <span>{stats.energy}%</span>
        </div>
        <div
          className={`flex items-center gap-1.5 whitespace-nowrap text-sm ${stats.sensory >= 80 ? 'text-red-500 font-semibold' : 'text-[#d1d5db]'}`}
          title="Stop overreacting (别反应过度) · It's all in your head (都是你脑补的)"
        >
          <span aria-hidden>🔊</span>
          <span>Sensory {stats.sensory}%</span>
        </div>
        <div className={`flex items-center gap-1.5 whitespace-nowrap text-sm ${stats.pressure >= 80 ? 'text-red-500 font-semibold' : 'text-[#d1d5db]'}`}>
          <span aria-hidden>👤</span>
          <span>Pressure {stats.pressure}%</span>
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap text-sm text-[#d1d5db] ml-auto">
          <span>Work Visa: </span>
          <span>Pending Revocation</span>
        </div>
      </header>

      {/* 中间剧情区：引用式叙述 + 可选警告前缀 */}
      <div className="cyber-story-area flex-[0_0_45%] min-h-0 overflow-y-auto overflow-x-hidden px-4 py-3 border-l border-white/10 mx-2 my-2 bg-black/40">
        {lastConsequence && (
          <div className="consequence-box mb-3 px-2 py-1.5 border-l-2 border-green-500/40 bg-green-500/15 text-[#a0a0a0] italic text-sm">
            &gt; {lastConsequence}
          </div>
        )}
        <h2 className="story-title border-b border-white/10 pb-1 mb-2 text-base font-semibold text-[#d1d5db]">[{currentBeat.timeLabel}] {currentBeat.title}</h2>
        <p className="cyber-narrative text-sm leading-relaxed text-[#d1d5db]">
          &quot;{currentBeat.narrativeText}&quot;
        </p>
        {currentBeat.id === "beat_4_hr_ambush" && currentBeat.conditionalNarrative && (() => {
          const firstBeatChoiceId = choiceHistory["beat_1_the_delay"];
          let conditionalText = "";
          if (firstBeatChoiceId === "1A") conditionalText = currentBeat.conditionalNarrative.if_1A;
          else if (firstBeatChoiceId === "1B") conditionalText = currentBeat.conditionalNarrative.if_1B;
          else if (firstBeatChoiceId === "1C") conditionalText = currentBeat.conditionalNarrative.if_1C;
          return conditionalText ? <p className="cyber-narrative text-sm leading-relaxed text-[#d1d5db] mt-2">&quot;{conditionalText}&quot;</p> : null;
        })()}
      </div>

      {/* 底部：玻璃拟态选择卡片，三列等宽；高度取该行中最大值 */}
      <div className="cyber-choices flex-[0_0_45%] min-h-0 grid grid-cols-3 items-stretch gap-4 p-4 border-t border-white/10 bg-[#000000] overflow-y-auto">
        {currentBeat.choices.map((choice) => {
          const { disabled, reason } = checkIsDisabled(choice.requirements);
          const isActive = hoveredChoiceId === choice.id;
          return (
            <button
              key={choice.id}
              className={`cyber-choice-card w-full h-full rounded border bg-white/5 py-2 px-3 text-left font-mono text-sm transition-all duration-300 ease-out ${
                disabled
                  ? 'opacity-60 cursor-not-allowed border-white/10 text-white/50'
                  : isActive
                    ? 'cyber-choice-card--active border-[#7f1d1d] bg-[#7f1d1d]/30 text-[#7f1d1d]'
                    : 'border-white/20 text-white/80 hover:border-[#7f1d1d]/60 hover:bg-[#7f1d1d]/10'
              }`}
              disabled={disabled}
              onClick={() => !disabled && handleChoiceClick(choice)}
              onMouseEnter={() => setHoveredChoiceId(choice.id)}
              onMouseLeave={() => setHoveredChoiceId(null)}
            >
              <div className={isActive ? 'text-left' : 'text-center'}>
                <div className={`font-mono ${disabled ? 'line-through' : ''} ${isActive ? 'text-base font-semibold text-[#7f1d1d]' : 'text-sm text-white/80'}`}>
                  {choice.actionText}
                </div>
              </div>
              {disabled && (
                <div className="mt-2 text-xs text-red-300/90">⚠️ {choice.disabledReason || reason}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

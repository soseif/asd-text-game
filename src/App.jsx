import React, { useState, useEffect, useRef } from 'react';
import { storyBeats } from './data/storyBeats.js';
import { diagnosticReport } from './data/diagnosticReport.js';
import { LYNN_SYSTEM_PROMPT } from './llm/lynnPrompt.js';
import './App.css';

export default function GameUI() {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";
  // --- 核心游戏状态 ---
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [stats, setStats] = useState({ energy: 100, sensory: 0, pressure: 0 });
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [lastConsequence, setLastConsequence] = useState("");
  const [isSystemFailed, setIsSystemFailed] = useState(false);
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

  // --- 渲染开场简介 ---
  if (!hasSeenIntro) {
    return (
      <div className="intro-screen">
        <div className="intro-content">
          <h1 className="intro-project">PROJECT: ECHO-RECOVERY</h1>
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
    // 1. 更新数值
    setStats(prev => ({
      energy: clamp(prev.energy + (choice.statsImpact.energy || 0)),
      sensory: clamp(prev.sensory + (choice.statsImpact.sensoryOverload || 0)),
      pressure: clamp(prev.pressure + (choice.statsImpact.managerPressure || 0))
    }));

    // 2. 显示后果
    setLastConsequence(choice.consequenceText || "");

    // 3. 检查是否触发大结局 (System Failure / Beat 7)
    const isBeat7 = /^7[ABC]$/.test(choice.id) || (storyBeats[currentBeatIndex]?.id || "").includes("beat_7");
    if (choice.actionText.includes("System Failure") || isBeat7) {
      // Beat 7: 先显示 2 秒 consequenceText，再进入终端接管
      setTimeout(() => setIsSystemFailed(true), 2000);
    } else if (currentBeatIndex >= storyBeats.length - 1) {
      setTimeout(() => setIsSystemFailed(true), 1500);
    } else {
      setCurrentBeatIndex(prev => prev + 1);
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
    // 默认：终端输入与日志
    return (
      <div className="terminal-override">
        <div className="terminal-override-errors">
          {terminalLog.map((line, i) => (
            <div key={i} className="terminal-error-line">{line}</div>
          ))}
        </div>
        <p className="terminal-override-prompt">
          The system's words couldn't reach her. Now, use your own.
        </p>
        <textarea
          className="terminal-override-input"
          placeholder="Type your message to Lynn..."
          value={playerMessage}
          onChange={(e) => setPlayerMessage(e.target.value)}
          disabled={isTransmitting}
          rows={4}
        />
        <button
          className="terminal-override-btn"
          onClick={handleTransmit}
          disabled={isTransmitting || !playerMessage.trim()}
        >
          {isTransmitting ? WAITING_MESSAGES[waitingMessageIndex] : "TRANSMIT MESSAGE"}
        </button>
        {transmitError && (
          <div className="terminal-override-error-msg">{transmitError}</div>
        )}
        {llmResult && (
          <div className="terminal-verdict-block">
            {(displayPhase === 'typing_analysis' || displayPhase === 'pause' || displayPhase === 'typing_verdict' || displayPhase === 'done') && (
              <div className="analysis-log">
                {(llmResult.empathy_analysis ?? '').slice(0, analysisVisibleLength)}
                {(displayPhase === 'typing_analysis' && analysisVisibleLength < (llmResult.empathy_analysis ?? '').length) && <span className="typewriter-cursor">|</span>}
              </div>
            )}
            {(displayPhase === 'typing_verdict' || displayPhase === 'done') && (
              <div
                className={`verdict-log verdict-log--${llmResult.final_status === 'deceased' ? 'deceased' : 'survived'}`}
              >
                {(llmResult.terminal_output ?? '').slice(0, verdictVisibleLength)}
                {(displayPhase === 'typing_verdict' && verdictVisibleLength < (llmResult.terminal_output ?? '').length) && <span className="typewriter-cursor">|</span>}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const currentBeat = storyBeats[currentBeatIndex];

  // --- 渲染常规游戏界面 ---
  return (
    <div className="game-wrapper">
      {/* 顶部状态条 */}
      <div className="stats-header">
        <div className={`stat-box ${stats.energy <= 20 ? 'danger-pulse' : ''}`}>
          <span>🔋 Energy</span>
          <span className="stat-value">{stats.energy}%</span>
        </div>
        <div
          className={`stat-box stat-box-gaslight ${stats.sensory >= 80 ? 'danger-pulse' : ''}`}
          title="Stop overreacting (别反应过度) · It's all in your head (都是你脑补的)"
        >
          <span>🔊 Sensory</span>
          <span className="stat-value">{stats.sensory}%</span>
        </div>
        <div className={`stat-box ${stats.pressure >= 80 ? 'danger-pulse' : ''}`}>
          <span>👤 Pressure</span>
          <span className="stat-value">{stats.pressure}%</span>
        </div>
      </div>

      {/* 剧情区域：上一轮结果在上，本 beat 内容在下 */}
      <div className="story-area">
        {lastConsequence && (
          <div className="consequence-box">
            {'>'} {lastConsequence}
          </div>
        )}
        <div className="story-meta">[{currentBeat.timeLabel}]</div>
        <h2 className="story-title">{currentBeat.title}</h2>
        <p className="story-text">{currentBeat.narrativeText}</p>
      </div>

      {/* 选项区域 */}
      <div className="choices-container">
        {currentBeat.choices.map((choice) => {
          const { disabled, reason } = checkIsDisabled(choice.requirements);
          return (
            <button 
              key={choice.id}
              className={`choice-btn ${disabled ? 'disabled-btn' : ''}`}
              disabled={disabled}
              onClick={() => handleChoiceClick(choice)}
            >
              <div className="choice-content">
                <span className="action-text">{choice.actionText}</span>
                {choice.impactHint && <span className="impact-hint">{choice.impactHint}</span>}
              </div>
              {disabled && (
                <div className="disabled-reason">⚠️ {choice.disabledReason || reason}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

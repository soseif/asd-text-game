/**
 * Chinese translations. English remains source of truth in data files.
 * 剧情 / intro / 终端 中文在 data/*.zh.js，此处仅汇总 spam、报告、通用 UI。
 */
import { storyBeatsZh } from '../data/storyBeats.zh.js';
import { introZh } from '../data/intro.zh.js';
import { terminalZh } from '../data/terminal.zh.js';

export const zh = {
  storyBeats: storyBeatsZh,
  intro: introZh,

  spamMessages: [
    { id: 'msg1', text: '快速 sync？' },
    { id: 'msg2', text: '能接这个临时 ticket 吗？' },
    { id: 'msg3', text: 'Lynn？你的绿点已经黄了 4 分钟了。' },
    { id: 'msg4', text: '我注意到昨天 2 点到 3 点你屏蔽了日历。你去哪了？' },
    { id: 'msg5', text: 'Lynn，让我核实你的每日清单不算「合理便利」。手把手带你对我们组不公平。' },
    { id: 'msg6', text: '我不会把我们的对话写下来。你得学会「听话听音」。这种 rigidity 就是你上 PIP 的原因。' },
    { id: 'msg7', text: 'David 说他帮你 debug 了。我让你「多协作」，不是让别人替你干活。我们是在评估他还是你？' },
    { id: 'msg8', text: '还有，在工位戴那种大耳机对整层楼都是很 hostile 的信号。' },
    { id: 'immigration', text: '官方通知：赞助就业终止后，您的工作签证将失效。60 天宽限期已激活。非法滞留将导致强制驱逐。' },
    { id: 'fatal', text: '受试者生命体征平线。神经链接崩塌。' },
  ],

  waitingMessages: terminalZh.waitingMessages,

  diagnosticReport: {
    header: {
      title: '隐形外壳下的破碎',
      subtitle: '职场困境与自闭女性的自杀干预',
      abstract:
        '自闭症谱系障碍（ASD）常被误认为「男性专属」的神经差异，使大量自闭女性在主叙事中「隐形」。然而，这种隐形的代价是致命的。',
    },
    body: [
      {
        sectionId: 'fatal_invisibility',
        heading: '1. 致命的隐形：折叠的寿命与「伪装」的代价',
        intro: '在讨论任何职场困境之前，我们必须面对残酷的生存现实。',
        contentList: [
          {
            label: ' drastically shortened lifespan',
            text: '根据瑞典卡罗林斯卡学院一项覆盖 27,000 名 ASD 个体的里程碑式公共卫生研究（Hirvikoski 等，2016）及后续数据：ASD 人群平均预期寿命仅为 54 岁，比美国普通人群（约 78 岁）短 20 年以上。',
          },
          {
            label: '头号杀手',
            text: '对无智力障碍的 ASD 个体（往往认知正常甚至高智商，尤其长期未确诊的女性），由严重抑郁驱动的自杀是过早死亡的首要原因。研究表明，该群体自杀死亡风险是普通人群的 7 至 9 倍（Cassidy 等，2014；2024）。',
          },
          {
            label: '女性不成比例的危机',
            text: '更令人心碎的是，虽然普通人群中男性绝对自杀率通常更高，但相对风险揭示了自闭女性的隐性危机。研究显示，自闭女性自杀死亡风险是普通女性的 13 倍，与自闭男性的 6 倍风险形成鲜明对比（Hirvikoski 等，2016）。',
          },
          {
            label: '诊断中的性别差距',
            text: '现行诊断标准几乎完全基于男性受试者，男女诊断比长期停留在 3:1 至 4:1。许多自闭女性「飞越雷达」是因为她们不具备标准的男性中心表型（如冷漠、缺乏共情、痴迷机械）。',
          },
          {
            label: '危险的「面具」',
            text: '很少女性符合「怪才」刻板印象。相反，为了生存，她们耗费巨大的认知能量来「伪装」成神经典型。这种慢性伪装导致严重的「自闭倦怠」。当能量耗尽或进入未掌握的社会情境，导致「面具」意外滑落时，她们会陷入巨大的心理危险。',
          },
        ],
      },
      {
        sectionId: 'workplace_maze',
        heading: '2. 职场迷宫：为何被 marginalize 却不自知？',
        intro:
          '当我们审视职场，数据同样令人震惊。根据 A.J. Drexel 自闭症研究所的《国家自闭症指标报告》，自闭症大学毕业生成年人的失业或未充分就业率高达 85%。这与美国全国失业率仅约 3.5%–4% 形成 stark 对比。阻碍他们的 seldom 是技术能力，而是 systemic  stigma。',
        subsections: [
          {
            subHeading: 'EEOC 案件中的「生存者偏差」',
            text: '根据美国平等就业机会委员会（EEOC）2024–2025 最新执法数据，残疾歧视指控占所有案件的 38%（逾 33,000 起）。尽管涉及自闭症和神经多样性的 advocacy 案件近年激增 650%，但这仅是冰山一角。',
            points: [
              '缺乏认知与恐惧：Return on Disability 数据显示，不到 20% 的神经多样化员工请求职场便利。大多数自闭女性将其视为「隐形残疾」，担心披露后会遭报复或危及职业生涯。',
              '便利的二元陷阱：即使提供了便利，也多流于表面。然而由于 ASD 个体的字面思维，这被二元地视为「已 accommodation」。只要公司有所行动，她们就 silently 忍受着未能实质改善的高压环境。',
            ],
          },
          {
            subHeading: '难以察觉的职场霸凌与 PIP 陷阱',
            text: '在一个需要披露残疾才能获得「 structured 沟通」或「除非绝对 unforeseeable 否则减少 ad-hoc 会议」等基本便利的环境中，她们一开始就不被尊重。',
            points: [
              '被针对而不自知：被放入 PIP 时，她们很少质疑结果。对她们的逻辑而言，为无法完全控制的事负责并不奇怪——「发生了就是事实，比意识到自己被区别对待更真实」。她们难以察觉他人犯同样错却不被追责的 hidden 双重标准。',
              '静默崩溃：与临床测试中触发源明确不同，在复杂的职场现实中，多数自闭个体并不 actively 或 immediately 意识到感官过载何时、如何被触发。因此，她们的 meltdown 往往 silent、无明显预警。许多人直到完全崩溃，才意识到自己早已处于严重倦怠边缘。',
              '刻板印象的反噬：一旦披露，她们很少被视为天才。反而被读作另一极端刻板：volatile、无法控制情绪、面临「雨人」假设。这招致霸凌并最终 forced exodus。',
            ],
          },
        ],
      },
      {
        sectionId: 'reshaping_perception',
        heading: '3. 结语：重塑认知与语言',
        quote: '"你看起来不像自闭啊。"',
        quoteExplanation: '这不是 compliment；这是诅咒。它鼓励 ASD 社群继续伪装，强化大多数自闭女性并不认同的 hostile、 defective 形象。',
        contentList: [
          {
            label: '思维转变',
            text: '神经多样性是一种认知差异。它不会让任何人低人一等。在 approaching 自闭女性时，请停止使用 evaluative 语言。',
          },
          {
            label: '不要说',
            text: '「你太敏感了」，或「大家都有压力，别想太多。」',
          },
          {
            label: '可以这样说',
            text: '「什么样的沟通方式能让你更清楚？」或「如果你觉得信息过载，可以随时暂停会议。我怎样能支持你？」',
          },
        ],
      },
    ],
    references: [
      'Hirvikoski, T., et al. (2016). Premature mortality in autism spectrum disorder. British Journal of Psychiatry, 208(3), 232-238.',
      'Cassidy, S., et al. (2014 & 2024). Suicidality and self-harm in autism spectrum conditions / Self-harm and suicidality experiences of autistic and non-autistic adults.',
      'Roux, A. M., et al. (2015/2021). National Autism Indicators Report. A.J. Drexel Autism Institute.',
      'U.S. EEOC (2024-2025). FY 2024-2025 EEOC Enforcement Statistics.',
      'Return on Disability Group Research. Accommodations and Productivity: The case against disclosure.',
    ],
  },

  ui: {
    enterGame: '进入游戏',
    initiateLink: '建立链接',
    title: '索多玛24小时',
    subtitle: '过于喧嚣的孤独',
    restartDay: '重启她的一天',
    viewDiagnostics: '查看事故诊断',
    downloadDiagnostics: '下载事故诊断',
    rebootSimulation: '[重启模拟]',
    linkSecured: '链接已建立',
    subjectRetreating: '受试者：Lynn — 正在退离边缘。',
    yourWordsReached: '你的话传到了。她退了回来。',
    connectionLost: '连接丢失',
    subjectTerminated: '受试者：Lynn — 终止。信号中断。',
    linkClosed: '链接关闭。她没能及时听到你。',
    systemWordsFailed: terminalZh.systemWordsFailed,
    placeholderMessage: terminalZh.placeholderMessage,
    transmitMessage: terminalZh.transmitMessage,
    energy: '电量',
    sensory: '感官',
    pressure: '压力',
    workVisa: '工作签证',
    pendingRevocation: '待撤销',
    lowEnergy: '电量不足',
    sensoryOverload: '感官过载',
    highPressure: '压力过大',
    statsTitle: '[系统诊断日志：致命错误已识别]',
    statsConclusion: '> 系统按设计运行。LYNN 只是未被设计进系统。',
    bonusTitle: '附录：什么话能帮到 LYNN？',
    bonusQuote: '"我明白光是在 Sammie 的 gaslighting 下生存就耗尽了你的能量。感官过载是真实的折磨，不是借口。这个世界不是为神经多样化的大脑建造的，但你的大脑没有坏。坏掉的是牢笼。今晚你不需要战斗，休息吧。"',
    terminalLog: terminalZh.terminalLog,
  },
};

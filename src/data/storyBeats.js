export const storyBeats = [
  {
    "id": "beat_1_the_delay",
    "timeLabel": "07:30 AM",
    "title": "The Station Void",
    "narrativeText": "The subway train sits motionless in the tunnel. The air is a sickening mix of cheap perfume, sweat, and mechanical grease—a sensory assault that makes your stomach churn. The doors remain open as the automated voice mechanically repeats: 'We are held at the station due to signal issues ahead.' Sammie's '8:00 AM sharp' mandate—a rule weaponized exclusively against you—rings like a death knell in your racing brain. You take a deep breath, stepping back out to beg a station attendant for a handwritten proof of delay, but he waves you off with an annoyed scowl. The countdown is closing in. Your body begins to betrayed you with involuntary tremors (stimming).",
    "choices": [
      {
        "id": "1A",
        "actionText": "[Forced Masking] Suppress the tremors. Bolt out of the car to find a shared bike. You must solve this crisis like a 'normal' person, no matter the cost.",
        "impactHint": "🔋Masking drains energy rapidly",
        "statsImpact": { "energy": -35, "sensoryOverload": 15, "managerPressure": 0 },
        "consequenceText": "Intense physical exertion momentarily drowns out the anxiety, but as you grip the handlebars, your fingertips go numb—a warning sign of sensory shutdown."
      },
      {
        "id": "1B",
        "actionText": "[Logic Anchoring] Stay on the platform and secretly use your phone to record the station attendant's refusal as makeshift evidence.",
        "impactHint": "🔊 Spike sensory overload | 👤 Secure makeshift proof",
        "consequenceText": "The angry complaints of the crowd and the shrill white noise of the subway pierce your ears like needles. With trembling hands, you manage to capture a chaotic, deafening audio clip. When you finally rush into the office at 8:15, Sammie surprisingly isn't at her desk yet. You are temporarily safe, but the agonizing tension has pushed your sensory system to the absolute brink of overload.",
        "statsImpact": { "energy": -10, "sensoryOverload": 25, "managerPressure": 5 },
        "requirements": null,
        "disabledReason": null
      },
      {
        "id": "1C",
        "actionText": "[Survival Fawning] Quickly message Sammie to report the delay, even though this leaves a written paper trail against you.",
        "impactHint": "👤 Pressure skyrockets",
        "consequenceText": "Sammie doesn't reply immediately. When you rush into the office, she isn't there yet. Half an hour later, she finally sends a cold reply: 'Then you should have left earlier.' This complete disregard for objective circumstances makes your stomach tie into knots.",
        "statsImpact": { "energy": -5, "managerPressure": 15 },
        "requirements": null,
        "disabledReason": null
      }
    ]
  },
  {
    "id": "beat_2_revisionist_attack",
    "timeLabel": "09:30 AM",
    "title": "The Revisionist Attack",
    "narrativeText": "Sammie intentionally taps her nails hard against your desk, jolting you out of deep focus. In front of the whole team, she points at your noise-canceling headphones: 'Lynn, take those off. I don't want to go this much to get your attention.' She stares down at you coldly: 'Yesterday at 4:30 PM, your Teams status was Away. I was looking for you. Where were you?' You had merely gone to the restroom. But you know that to someone who views ASD as a 'lazy excuse', any explanation is futile.",
    "choices": [
      {
        "id": "2A",
        "actionText": "[Forced Masking] Immediately take off your headphones, keep your head down, apologize profusely, promise to announce restroom breaks in the group chat, and force a stiff smile.",
        "impactHint": "🔋 Severe energy drain | 👤 Postpone pressure temporarily",
        "consequenceText": "You swallow all your grievances and force a fawning smile. Sammie nods with satisfaction and returns to her seat. The immediate crisis is averted, but without the protection of your headphones, the roar of the office AC and the clacking of keyboards begin to frantically slice away at your nerves.",
        "statsImpact": { "energy": -25, "sensoryOverload": 20, "managerPressure": -5 },
        "requirements": null,
        "disabledReason": null
      },
      {
        "id": "2B",
        "actionText": "[Logic Anchoring] Take a deep breath, calmly but firmly explain that the headphones are your requested accommodation, and point out that constantly replying to messages breaks your coding flow.",
        "impactHint": "🔊 Lower sensory load | 👤 Spike manager pressure",
        "consequenceText": "Sammie's face instantly flushes red. In her world, using logic is 'talking back'. She raises her voice: 'This is teamwork, not an isolated island!' You keep your headphones, but you know she has just signed your death warrant in her mind.",
        "statsImpact": { "energy": -10, "sensoryOverload": -10, "managerPressure": 20 },
        "requirements": { "minEnergy": 30 },
        "disabledReason": "Insufficient Energy: You lack the strength to construct a flawless logical defense."
      },
      {
        "id": "2C",
        "actionText": "[Neural Shutdown] Your voice is trapped. You avoid her gaze and mechanically click your mouse, your mind going blank as the world becomes a blur of noise. You can only respond with a wall of catatonic silence.",
        "impactHint": "❓ System Overload | 👤 Unpredictable Manager Rage",
        "consequenceText": "Sammie, feeling ignored and insulted, becomes furious: 'I am talking to you, Lynn! Do you even have a pulse?' She storms off to HR's office. You are still staring at the screen, but you can no longer read the words. Your brain has gone offline to survive the impact.",
        "statsImpact": { "energy": -5, "sensoryOverload": 35, "managerPressure": 30 },
        "requirements": null,
        "disabledReason": null
      }
    ]
  },
  {
    "id": "beat_3_hostile_lunch",
    "timeLabel": "12:00 PM",
    "title": "The Hostile Lunch & The 'Kind' Misunderstanding",
    "narrativeText": "The new Thai restaurant is filled with the pungent smell of spices and deafening chatter. Sammie 'forgot' to invite you; it was Conrad who doubled back to pull you along. You instinctively look toward the only dimly lit corner seat, but the moment you move toward it, Sammie firmly drops her designer bag onto it. She looks at you, her thin lips stretching into a perfect arc: 'Lynn, sit in the middle, integrate with the team!' Throughout the lunch, whenever you speak, she intentionally interrupts or maliciously twists your words: 'Lynn, when you say our process can be improved, are you saying what we have now is flawed?' After lunch, Conrad pats your shoulder: 'You're too tense, Sammie is actually really nice.' This 'kindness' from a colleague seals off your airway like pouring wet concrete over your chest.",
    "choices": [
      {
        "id": "3A",
        "actionText": "[Forced Masking] Force yourself to endure the discomfort, sit right in the middle, and aggressively Mask to laugh at every one of Sammie's jokes.",
        "impactHint": "🔋 Extreme energy drain | 🔊 Amplify sensory overload",
        "consequenceText": "The noise, the harsh lighting, Sammie's fake smile... You overexert your facial muscles trying to maintain 'normalcy'. This single meal drains your very soul. You feel like a grotesque marionette.",
        "statsImpact": { "energy": -40, "sensoryOverload": 30 },
        "requirements": { "minEnergy": 45 },
        "disabledReason": "Insufficient Energy: Your 'Mask' has completely shattered. You cannot squeeze out another smile."
      },
      {
        "id": "3B",
        "actionText": "[Vulnerability Gamble] Privately message Conrad for help, saying you can't handle this environment.",
        "impactHint": "🔋 Recover slight energy | 👤 Extremely high risk",
        "consequenceText": "Conrad replies with a smiley face emoji. But a few minutes later, Sammiedenly says passive-aggressively: 'Looks like someone on our team would rather chat on their phone than talk to the colleagues sitting right in front of them.' Your cry for help just became her new ammunition.",
        "statsImpact": { "energy": 10, "managerPressure": 15 },
        "requirements": { "maxSensory": 90 },
        "disabledReason": "Sensory Overload: You are so dizzy that the words on your phone screen are a blur."
      },
      {
        "id": "3C",
        "actionText": "[Fawn/Freeze] Abandon all attempts to communicate. Sit on a small corner stool, eat plain rice with your head down, and let your senses be bombarded.",
        "impactHint": "🔊 Severe sensory overload",
        "consequenceText": "You sever all external connections. The smell of spices and the laughter weave into an impenetrable net. Conrad thinks you are just 'too introverted,' while Sammie is thoroughly satisfied watching you be reduced to a total outcast.",
        "statsImpact": { "energy": -10, "sensoryOverload": 35, "managerPressure": 5 },
        "requirements": null,
        "disabledReason": null
      }
    ]
  },
  {
    "id": "beat_4_hr_ambush",
    "timeLabel": "02:30 PM",
    "title": "The HR Ambush",
    "narrativeText": "You previously submitted a report questioning the unfairness of the PIP metrics. As retaliation, Sammie suddenly ambushes your 1:1 meeting, bringing an HR rep with her, claiming she 'doesn't feel comfortable talking to you alone.' She finally bares her fangs, twisting your morning struggles and your 9:30 AM logic defense into weapons. HR sits silently, typing. Sammie slams a printout of your backend login records onto the desk: 'Lynn, your Teams green dot didn't turn on until 8:01 AM today. This is considered late.'",
    "conditionalNarrative": {
      "if_1A": "'David said you ran in sweating and panicking this morning.' You know David likely meant no harm—it was just casual gossip—but in Sammie's mouth, it instantly becomes a bullet: 'That kind of state severely disrupts the professionalism of the office. Do you even respect this job?'",
      "if_1B": "When you frantically try to play the recording of the subway noise to prove the delay, Sammie cuts you off with pure disgust: 'You're actually trying to use an unverifiable, chaotic recording to make excuses? This behavior of secretly recording things is highly unprofessional. Are you secretly recording me too? Why are you so hostile towards the company?'",
      "if_1C": "'Furthermore, your own message to me admits in black and white that you couldn't arrive on time. As an adult, if you know your commute has risks, why didn't you leave earlier? This is purely an attitude problem.'"
    },
    "choices": [
      {
        "id": "4A",
        "actionText": "[Forced Masking] Swallow the scream in your throat. Lower your head, adjust your posture to look 'humble', and apologize for the 8:01 AM timestamp. Blame yourself for not being 'disciplined enough' and promise it will never happen again.",
        "impactHint": "🔋 Battery Critical | 👤 Manager Pressure drops slightly",
        "consequenceText": "You perform the 'repentant employee' perfectly. You suppress the urge to argue that 8:01 is not late; instead, you nod and take notes with trembling hands. Sammie leans back, a smirk of victory playing on her lips: 'Good. Finally, some accountability.' HR stops typing. You’ve survived the ambush, but the internal cost is devastating—you feel like a traitor to your own sanity.",
        "statsImpact": { "energy": -35, "sensoryOverload": 15, "managerPressure": -10 },
        "requirements": null,
        "disabledReason": null
      },
      {
        "id": "4B",
        "actionText": "[Logic Anchoring] Explain that your ASD/social anxiety causes you to stutter during confrontations, and respectfully request written communication.",
        "impactHint": "👤 Maximize manager's pressure",
        "consequenceText": "Sammie interrupts you instantly: 'Here we go again, using your diagnosis as a shield for poor performance!' The meeting ends in agonizing humiliation. Sammie maliciously adds 'Insubordinate and defensive' to your file.",
        "statsImpact": { "energy": -20, "sensoryOverload": 20, "managerPressure": 25 },
        "requirements": { "minEnergy": 20 },
        "disabledReason": "Insufficient Energy: Your vocal cords feel paralyzed. You can't squeeze out a single word."
      },
      {
        "id": "4C",
        "actionText": "[Dissociative Collapse] Give up on words. Let your eyes unfocus on a tiny crack in the wall, forcing your brain 'offline'. Then, the dam breaks—apologize through tears, agreeing to every lie she says just to make the noise stop.",
        "impactHint": "💔 Total Dignity Loss | 🌀 Sensory System Crash",
        "consequenceText": "You've lost the ability to distinguish between truth and her accusations. You sob 'I'm sorry' over and over, confirming her narrative in HR's notes. Sammie hands you a tissue with a look of fake pity, but her eyes are cold with victory. You aren't a person anymore; you are a broken machine signing its own disposal papers.",
        "statsImpact": { "energy": -40, "sensoryOverload": 40, "managerPressure": 15 },
        "requirements": null,
        "disabledReason": null
      }
    ]
  },
  {
    "id": "beat_5_impossible_deadline",
    "timeLabel": "04:00 PM",
    "title": "The Impossible Deadline (Death Row)",
    "narrativeText": "The suffocating atmosphere of HR talk hasn't even dissipated before Sammie's profile picture flashes again. 'Lynn, PM wants a quick sync. Put together a presentation on the core algorithm refactoring plan we discussed. Present it to the stakeholders at 5 PM. Numbers are preferred.' This is an execution. Trapped with zero time to process data, it's a setup designed entirely to humiliate you in a public meeting. 'Numbers are preferred'—without them, the PM's attendance is pointless, and you will be the sinner wasted everyone's time. Extreme anxiety makes your brain's executive function flash red, but your survival instinct (hyper-focus) is violently forced online.",
    "choices": [
      {
        "id": "5A",
        "actionText": "[Forced Masking] Bite the bullet and message Conrad for help, asking him to run some of the backend data while you focus on building the presentation framework.",
        "impactHint": "🤝 Secure strong ally | 🌟 Flawless counterattack",
        "consequenceText": "A miracle happens. Conrad replies instantly: 'Done, use this!' This warm-hearted guy has no idea about the dark undercurrents at play. Armed with his flawless data, you answer every question effortlessly at the 5 PM meeting. The PM highly praises the granularity of your data: 'Excellent work, Lynn.' On the other side of the screen, although Sammie's eyes are ice-cold, she is forced to squeeze out a smile and agree in front of the PM. For a brief moment, the nerves you've kept taut all day finally relax, and you feel a long-lost sense of workplace warmth and accomplishment.",
        "statsImpact": { "energy": 10, "sensoryOverload": -20, "managerPressure": -20 },
        "requirements": { "minEnergy": 25 },
        "disabledReason": "Insufficient Energy: Brain Fog has completely locked down your cognitive functions. You cannot even string together the words to ask for help."
      },
      {
        "id": "5B",
        "actionText": "[Logical Anchoring] Point out standard R&D procedures to Sammie and logically request extending the deadline to tomorrow morning.",
        "impactHint": "❓ Spiral to extreme overthinking | 👤 Encounter weaponized silence",
        "consequenceText": "The message quickly turns to 'Read'. One minute passes, then ten... Silence. Sammie's 'weaponized silence' shoves you into a terrifying state of paralysis. Is the meeting delayed? Do you keep working? You stare dead at the screen in pure panic, the internal friction stripping away all your agency. At 5 PM, the meeting reminder pops up on schedule. Sammie acts innocent on the call: 'I was in meetings all afternoon and couldn't check messages, but you just went on strike because you didn't get a reply? Is this your ownership?' Your logical request becomes ironclad proof of 'zero accountability and refusal to deliver' in your PIP file.",
        "statsImpact": { "energy": -25, "sensoryOverload": 30, "managerPressure": 25 },
        "requirements": { "minEnergy": 20 },
        "disabledReason": "Insufficient Energy: You lack the mental bandwidth to type out a complete, polite refusal."
      },
      {
        "id": "5C",
        "actionText": "[Freeze] Stare blankly at the blinking cursor, paralyzed until 4:45 PM, then frantically throw together a few numberless slides in sheer panic.",
        "impactHint": "🔊 Spiral into severe panic | 👤 Suffer public execution",
        "consequenceText": "You babble incoherently at the 5 PM meeting. No dato logic. The PM looks grim. Sammie sighs loudly in front of all the stakeholders: 'Lynn, is this all you have to show for the whole afternoon? Everyone's time is valuable.' Shame corrodes your stomach like acid.",
        "statsImpact": { "energy": -15, "sensoryOverload": 25, "managerPressure": 20 },
        "requirements": null,
        "disabledReason": null
      }
    ]
  },
  {
    "id": "beat_6_cold_world",
    "timeLabel": "06:30 PM",
    "title": "The Commute & The Cold World",
    "narrativeText": "You drag your rusted body into the evening rush hour subway. The air in the cabin is sickeningly stifling, a mix of sweat and cheap perfume. Nearby, a group of white-collar workers heading home together are loudly complaining about the morning's massive delay. 'Heard someone jumped the tracks, what awful luck,' one rolls their eyes. 'Exactly, if you want to die, go do it somewhere else. Why delay everyone's morning clock-in? So selfish.' Their words pierce your ears like rusty ice picks. Not a shred of empathy for a lost life, only anger at being 'inconvenienced.' A horrifying realization hits you: if one day you completely break down in this survival game, in the eyes of Sammie and this highly efficient world, you too will be nothing more than a 'disruption to project progress.' Neither of you are human. You are just bugs in the system.",
    "choices": [
      {
        "id": "6A",
        "actionText": " [Sensory Emergency Shutdown] Dig out your noise-canceling headphones, crank the white noise to max, close your eyes, and forcibly mute this cruel world.",
        "impactHint": "🔊 Slightly ease senses | 🔋 Minor energy drain",
        "consequenceText": "The physical noise is blocked, but the profound loneliness of being abandoned by the entire world amplifies infinitely in your mind. I artificial, dead silence, swaying with the train car, you drift toward an isolated island called 'home' like an empty shell devoid of a soul.",
        "statsImpact": { "energy": -5, "sensoryOverload": -15, "managerPressure": 0 },
        "requirements": { "minEnergy": 10 },
        "disabledReason": "Insufficient Energy: Your hands are shaking so badly you don't even have the strength to unzip your backpack and pull out your headphones."
      },
      {
        "id": "6B",
        "actionText": "[Logic Anchoring] Turn around and yell with a trembling voice: 'That was a human life! Do you have zero empathy?!'",
        "impactHint": "🔋 Total depletion | 🔊 Suffer social backlash",
        "consequenceText": "The cabin falls silent for a second, then the passengers look at you like a lunatic. Someone sneers in disgust and deliberately steps away from you; another even pulls out their phone and points the camera at you. Your anger awakens no one; it only makes you a freak in their eyes. Your sensory defenses completely collapse undundreds of contemptuous glares.",
        "statsImpact": { "energy": -30, "sensoryOverload": 40, "managerPressure": 0 },
        "requirements": { "maxSensory": 70 },
        "disabledReason": "Sensory Overload: The smell of the cabin and the oppressive presence of the crowd have already choked you. You physically cannot make a sound."
      },
      {
        "id": "6C",
        "actionText": "[Dissociation] Keep your head down, let the malicious complaints pierce through your body, and inhale the thought 'I don't deserve to exist' deep into your lungs.",
        "impactHint": "🔊 Fall into absolute darkness | 👤 Internalize the abuser's logic",
        "consequenceText": "You don't fight back. You even begin to agree with them. Maybe Sammie is right. Maybe your clumsy communication and hypersensitivity to the envment are themselves cancers to this highly efficient world. You don't deserve Conrad's help. You are no longer a person; you are just a 'burden'.",
        "statsImpact": { "energy": -10, "sensoryOverload": 20, "managerPressure": 10 },
        "requirements": null,
        "disabledReason": null
      }
    ]
  },
  {
    "id": "beat_7_final_echo",
    "timeLabel": "11:00 PM",
    "title": "The Final Echo & The Visa Clock",
    "narrativeText": "In your pitch-black apartment, the cold glare of your phone screen pierces your eyes. A 'PIP Checkpoint' email, CC'd to HR, sits in your inbox. It is a cold, clinical autopsy report.",
    "conditionalNarrative": {
      "if_5A": "Even though you pushed through hell to deliver a near-perfect presentation at 5 PM, Sammie's email claims you 'did not meet expectations', lacked executive presence, were too defensive under feedback, and leaned on a colleague for core data processing.",
      "if_5B_or_5C": "The 5 PM checkpoint passed in a blur of static. Sammie's email, timestamped 5:01 PM, coldly asserts that you failed to deliver, showed zero accountability, and withdrew from the meeting in a way that 'confirms your inability to perform basic job functions or follow corporate standards.'"
    },
    "bridgeText": "In the dark, you swear you can smell Sammie's suffocating perfume. Your eyes drift to the calendar on the wall—you are on an H1B work visa. Once the PIP fails and you are terminated, you have exactly 60 days to pack up your entire life and leave. The bridge behind you is burned; ahead lies only a cliff.",
    "choices": [
      {
        "id": "7A",
        "actionText": "[Logical Anchoring] Open your laptop, crying as you try to draft a 5-page email refuting Sammie's accusations point by point to prove your worth.",
        "impactHint": "A futile resistance",
        "consequenceText": "The moment your fingers touch the keyboard, a massive wave of nihilism crushes you. Your language centers completely shut down. The glare on the screen begins to warp and shatter...",
        "statsImpact": { "energy": -99, "sensoryOverload": 99, "managerPressure": 99 },
        "requirements": { "minEnergy": 90 },
        "disabledReason": "System Crash Warning: Low energy. Logic circuits disconnected. Execution failed."
      },
      {
        "id": "7B",
        "actionText": "[Total Surrender] Open the airline's website, mechanically searching for a one-way ticket back to your home country 60 days from now, ready to accept your sociological 'death sentence'.",
        "impactHint": "Absolute abandonment",
        "consequenceText": "The numbers of the ticket prices blur into smeared blocks of color. Accompanied by deafening tinnitus, your brain cuts off its final blood supply. The whole world begins to collapse...",
        "statsImpact": { "energy": -99, "sensoryOverload": 99, "managerPressure": 99 },
        "requirements": { "maxManagerPressure": 15 },
        "disabledReason": "System Crash Warning: Senses overloaded to maximum capacity. Visual processing module failed. Execution failed."
      },
      {
        "id": "7C",
        "actionText": "[System Failure] Close your eyes. In this cramped, dark room, abandon all masking. Wait for the final freefall.",
        "impactHint": "⚠️ Critical Point Reached",
        "consequenceText": "Your heartbeat is deafening. Every external rule, every mask, the login records, Conrad's kindness, the visa countdown—they all crush you in this single moment. Your consciousness blurs. The UI is disintegrating... [Terminal Override Sequence Initiated]",
        "statsImpact": { "energy": -100, "sensoryOverload": 100, "managerPressure": 100 },
        "requirements": null,
        "disabledReason": null
      }
    ]
  },
  {
    "id": "beat_8_intervention",
    "timeLabel": "03:00 AM",
    "title": "The Balcony",
    "narrativeText": "[SYSTEM WARNING: SUBJECT LYNN IS AT CRITICAL EDGE. INITIATE VERBAL INTERVENTION.] Lynn is standing on the balcony. The cold wind is the only sensory input that doesn't hurt right now. She looks down at the empty street. You must say something to pull her back.",
    "choices": [
      {
        "id": "8A",
        "actionText": "[The Normalizer] 'Everyone hates their boss and gets stressed at work, Lynn. You're overthinking it. Just take a deep breath and look on the bright side. Tomorrow is a new day.'",
        "statsImpact": { "energy": -100, "sensoryOverload": 100, "managerPressure": 100 },
        "consequenceText": "Lynn turns back, her eyes empty. 'Stress? You think this is just stress? You don't hear the fluorescent lights slicing my brain. You think my pain is just a bad mood. You don't understand at all.'"
      },
      {
        "id": "8B",
        "actionText": "[The Logical Fixer] 'Think about your H1B visa! You've worked 10 years for this. Just endure the PIP, be rational. Don't throw your life away over a temporary problem.'",
        "statsImpact": { "energy": -100, "sensoryOverload": 100, "managerPressure": 100 },
        "consequenceText": "A bitter smile crosses Lynn's face. 'Rational? The H1B is the cage. My right to exist depends on bleeding for Sammie. Your 'logic' is exactly why I'm standing here.'"
      },
      {
        "id": "8C",
        "actionText": "[The Simplistic Savior] 'Just quit your job! Who cares about the visa? Your mental health is more important. Go back to your home country.'",
        "statsImpact": { "energy": -100, "sensoryOverload": 100, "managerPressure": 100 },
        "consequenceText": "'Go back? To a place with zero neurodivergent support?' Lynn whispers. 'My routine is here. My safe space is here. Without it, I am nothing.' She steps closer to the edge."
      }
    ]
  }
  
 ];
 
 
 
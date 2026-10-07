--[[
    Dialogue System - Client LocalScript
    An NPC dialogue UI with typewriter text, speaker portrait, and branching choices.
    Place in: StarterPlayer > StarterPlayerScripts
--]]

local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- ============================================================
-- REMOTE EVENTS
-- ============================================================
local remotes = ReplicatedStorage:WaitForChild("Dialogue_System_Remotes")
local startDialogueEvent = remotes:WaitForChild("StartDialogue")
local advanceDialogueEvent = remotes:WaitForChild("AdvanceDialogue")
local selectChoiceEvent = remotes:WaitForChild("SelectChoice")
local endDialogueEvent = remotes:WaitForChild("EndDialogue")
local requestDialogueEvent = remotes:WaitForChild("RequestDialogue")
local portraitUpdateEvent = remotes:WaitForChild("PortraitUpdate")
local emotionUpdateEvent = remotes:WaitForChild("EmotionUpdate")

-- ============================================================
-- CONFIGURATION
-- ============================================================
local CONFIG = {
    -- Colors - warm cartoon RPG palette
    BG_PRIMARY = Color3.fromRGB(45, 40, 55),
    BG_SECONDARY = Color3.fromRGB(60, 55, 75),
    BG_ACCENT = Color3.fromRGB(80, 75, 100),
    TEXT_WHITE = Color3.fromRGB(255, 250, 240),
    TEXT_GRAY = Color3.fromRGB(180, 175, 170),
    TEXT_YELLOW = Color3.fromRGB(255, 220, 100),
    NAME_TAG_BG = Color3.fromRGB(120, 80, 180),
    CHOICE_BG = Color3.fromRGB(70, 65, 90),
    CHOICE_HOVER = Color3.fromRGB(100, 95, 130),
    CHOICE_SELECTED = Color3.fromRGB(140, 130, 180),
    PORTRAIT_BORDER = Color3.fromRGB(160, 140, 100),
    PORTRAIT_BG = Color3.fromRGB(35, 30, 45),
    CONTINUE_GLOW = Color3.fromRGB(200, 180, 100),
    OVERLAY_COLOR = Color3.fromRGB(0, 0, 0),

    -- Animation
    TWEEN_FAST = TweenInfo.new(0.15, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
    TWEEN_NORMAL = TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
    TWEEN_SLOW = TweenInfo.new(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
    TWEEN_BOUNCE = TweenInfo.new(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
    TYPEWRITER_SPEED = 0.035, -- seconds per character
    CHOICE_STAGGER = 0.08,
    CONTINUE_BLINK_SPEED = 0.6,

    -- Layout
    DIALOGUE_WIDTH = 700,
    DIALOGUE_HEIGHT = 200,
    PORTRAIT_SIZE = 140,
    CHOICE_HEIGHT = 40,
    NAME_TAG_HEIGHT = 32,
}

-- ============================================================
-- STATE
-- ============================================================
local state = {
    isActive = false,
    currentText = "",
    targetText = "",
    typewriterTimer = nil,
    canContinue = false,
    currentSpeaker = "",
    currentEmotion = "neutral",
    choices = {},
    dialogueHistory = {},
    historyOpen = false,
    currentPortraitId = "",
}

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

local function createInstance(className, props)
    local instance = Instance.new(className)
    for key, value in pairs(props) do
        instance[key] = value
    end
    return instance
end

local function createCorner(parent, radius)
    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, radius or 8)
    corner.Parent = parent
    return corner
end

local function createStroke(parent, color, thickness)
    local stroke = Instance.new("UIStroke")
    stroke.Color = color or CONFIG.PORTRAIT_BORDER
    stroke.Thickness = thickness or 2
    stroke.Parent = parent
    return stroke
end

local function createGradient(parent, color1, color2, rotation)
    local gradient = Instance.new("UIGradient")
    gradient.Color = ColorSequence.new({
        ColorSequenceKeypoint.new(0, color1 or CONFIG.BG_PRIMARY),
        ColorSequenceKeypoint.new(1, color2 or CONFIG.BG_SECONDARY),
    })
    gradient.Rotation = rotation or 0
    gradient.Parent = parent
    return gradient
end

-- ============================================================
-- UI CONSTRUCTION
-- ============================================================

local screenGui = createInstance("ScreenGui", {
    Name = "Dialogue_System",
    ResetOnSpawn = false,
    ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
    Parent = playerGui,
})

-- --------------------------------------------------------
-- DARK OVERLAY
-- --------------------------------------------------------
local darkOverlay = createInstance("Frame", {
    Name = "DarkOverlay",
    Size = UDim2.fromScale(1, 1),
    BackgroundColor3 = CONFIG.OVERLAY_COLOR,
    BackgroundTransparency = 1,
    BorderSizePixel = 0,
    ZIndex = 9,
    Parent = screenGui,
    Visible = false,
})

-- --------------------------------------------------------
-- DIALOGUE CONTAINER
-- --------------------------------------------------------
local dialogueContainer = createInstance("Frame", {
    Name = "DialogueContainer",
    Size = UDim2.fromOffset(CONFIG.DIALOGUE_WIDTH, CONFIG.DIALOGUE_HEIGHT),
    Position = UDim2.new(0.5, 0, 1, -60),
    AnchorPoint = Vector2.new(0.5, 1),
    BackgroundTransparency = 1,
    ZIndex = 10,
    Parent = screenGui,
    Visible = false,
})

-- --------------------------------------------------------
-- PORTRAIT CONTAINER
-- --------------------------------------------------------
local portraitContainer = createInstance("Frame", {
    Name = "PortraitContainer",
    Size = UDim2.fromOffset(CONFIG.PORTRAIT_SIZE, CONFIG.PORTRAIT_SIZE),
    Position = UDim2.fromOffset(-20, -30),
    BackgroundTransparency = 1,
    ZIndex = 11,
    Parent = dialogueContainer,
})

local portraitBg = createInstance("Frame", {
    Name = "PortraitBg",
    Size = UDim2.fromScale(1, 1),
    BackgroundColor3 = CONFIG.PORTRAIT_BG,
    BorderSizePixel = 0,
    ZIndex = 11,
    Parent = portraitContainer,
})
createCorner(portraitBg, 16)
createStroke(portraitBg, CONFIG.PORTRAIT_BORDER, 3)

-- Inner glow
local portraitGlow = createInstance("Frame", {
    Name = "PortraitGlow",
    Size = UDim2.new(1, -6, 1, -6),
    Position = UDim2.fromScale(0.5, 0.5),
    AnchorPoint = Vector2.new(0.5, 0.5),
    BackgroundColor3 = CONFIG.BG_SECONDARY,
    BorderSizePixel = 0,
    ZIndex = 12,
    Parent = portraitBg,
})
createCorner(portraitGlow, 13)

local portraitImage = createInstance("ImageLabel", {
    Name = "PortraitImage",
    Size = UDim2.new(1, -12, 1, -12),
    Position = UDim2.fromScale(0.5, 0.5),
    AnchorPoint = Vector2.new(0.5, 0.5),
    BackgroundTransparency = 1,
    Image = "", -- Set dynamically via portrait update
    ZIndex = 13,
    Parent = portraitBg,
})
createCorner(portraitImage, 10)

-- Placeholder when no image
local portraitPlaceholder = createInstance("TextLabel", {
    Name = "PortraitPlaceholder",
    Size = UDim2.fromScale(1, 1),
    BackgroundTransparency = 1,
    Text = "NPC",
    TextColor3 = CONFIG.TEXT_GRAY,
    TextSize = 36,
    Font = Enum.Font.GothamBlack,
    ZIndex = 13,
    Parent = portraitImage,
})

-- Speaker name below portrait
local speakerName = createInstance("TextLabel", {
    Name = "SpeakerName",
    Size = UDim2.new(1, 0, 0, 20),
    Position = UDim2.fromOffset(0, CONFIG.PORTRAIT_SIZE + 4),
    BackgroundTransparency = 1,
    Text = "",
    TextColor3 = CONFIG.TEXT_WHITE,
    TextSize = 12,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Center,
    ZIndex = 11,
    Parent = portraitContainer,
})

-- Emotion indicator
local emotionIndicator = createInstance("Frame", {
    Name = "EmotionIndicator",
    Size = UDim2.fromOffset(24, 24),
    Position = UDim2.new(1, -10, 0, -5),
    AnchorPoint = Vector2.new(1, 0),
    BackgroundColor3 = CONFIG.CONTINUE_GLOW,
    BorderSizePixel = 0,
    ZIndex = 14,
    Parent = portraitContainer,
    Visible = false,
})
createCorner(emotionIndicator, 12)

local emotionText = createInstance("TextLabel", {
    Name = "EmotionText",
    Size = UDim2.fromScale(1, 1),
    BackgroundTransparency = 1,
    Text = "N",
    TextColor3 = CONFIG.BG_PRIMARY,
    TextSize = 14,
    Font = Enum.Font.GothamBlack,
    ZIndex = 15,
    Parent = emotionIndicator,
})

-- Portrait entry animation offset
portraitContainer.Position = UDim2.fromOffset(-200, -30)

-- --------------------------------------------------------
-- DIALOGUE BOX (Text area)
-- --------------------------------------------------------
local dialogueBox = createInstance("Frame", {
    Name = "DialogueBox",
    Size = UDim2.new(1, -CONFIG.PORTRAIT_SIZE + 10, 1, 0),
    Position = UDim2.fromOffset(CONFIG.PORTRAIT_SIZE - 10, 0),
    BackgroundTransparency = 1,
    ZIndex = 10,
    Parent = dialogueContainer,
})

local dialogueBg = createInstance("Frame", {
    Name = "DialogueBg",
    Size = UDim2.fromScale(1, 1),
    BackgroundColor3 = CONFIG.BG_PRIMARY,
    BackgroundTransparency = 0.15,
    BorderSizePixel = 0,
    ZIndex = 10,
    Parent = dialogueBox,
})
createCorner(dialogueBg, 14)
createStroke(dialogueBg, CONFIG.BG_ACCENT, 2)
createGradient(dialogueBg, CONFIG.BG_PRIMARY, CONFIG.BG_SECONDARY, 180)

local dialogueText = createInstance("TextLabel", {
    Name = "DialogueText",
    Size = UDim2.new(1, -32, 1, -50),
    Position = UDim2.fromOffset(16, 16),
    BackgroundTransparency = 1,
    Text = "",
    TextColor3 = CONFIG.TEXT_WHITE,
    TextSize = 18,
    Font = Enum.Font.GothamBold,
    TextWrapped = true,
    TextXAlignment = Enum.TextXAlignment.Left,
    TextYAlignment = Enum.TextYAlignment.Top,
    LineHeight = 1.4,
    ZIndex = 11,
    Parent = dialogueBg,
})

-- Continue hint (blinking)
local continueHint = createInstance("TextLabel", {
    Name = "ContinueHint",
    Size = UDim2.fromOffset(160, 20),
    Position = UDim2.new(1, -170, 1, -28),
    BackgroundTransparency = 1,
    Text = "Click to continue >>",
    TextColor3 = CONFIG.TEXT_GRAY,
    TextSize = 11,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Right,
    ZIndex = 11,
    Parent = dialogueBg,
    Visible = false,
})

-- Typing cursor
local typingCursor = createInstance("Frame", {
    Name = "TypingCursor",
    Size = UDim2.fromOffset(2, 18),
    BackgroundColor3 = CONFIG.TEXT_WHITE,
    BorderSizePixel = 0,
    ZIndex = 12,
    Parent = dialogueBg,
    Visible = false,
})

-- --------------------------------------------------------
-- NAME TAG
-- --------------------------------------------------------
local nameTag = createInstance("Frame", {
    Name = "NameTag",
    Size = UDim2.fromOffset(140, CONFIG.NAME_TAG_HEIGHT),
    Position = UDim2.fromOffset(CONFIG.PORTRAIT_SIZE - 30, -CONFIG.NAME_TAG_HEIGHT + 10),
    BackgroundTransparency = 1,
    ZIndex = 12,
    Parent = dialogueContainer,
})

local nameTagBg = createInstance("Frame", {
    Name = "NameTagBg",
    Size = UDim2.fromScale(1, 1),
    BackgroundColor3 = CONFIG.NAME_TAG_BG,
    BorderSizePixel = 0,
    ZIndex = 12,
    Parent = nameTag,
})
createCorner(nameTagBg, 8)
createGradient(nameTagBg, CONFIG.NAME_TAG_BG, Color3.fromRGB(100, 60, 160), 0)

local nameTagText = createInstance("TextLabel", {
    Name = "NameTagText",
    Size = UDim2.fromScale(1, 1),
    BackgroundTransparency = 1,
    Text = "",
    TextColor3 = CONFIG.TEXT_WHITE,
    TextSize = 14,
    Font = Enum.Font.GothamBlack,
    ZIndex = 13,
    Parent = nameTagBg,
})

-- --------------------------------------------------------
-- CHOICES CONTAINER
-- --------------------------------------------------------
local choicesContainer = createInstance("Frame", {
    Name = "ChoicesContainer",
    Size = UDim2.new(1, -CONFIG.PORTRAIT_SIZE + 10, 0, 0),
    Position = UDim2.fromOffset(CONFIG.PORTRAIT_SIZE - 10, CONFIG.DIALOGUE_HEIGHT + 8),
    BackgroundTransparency = 1,
    ZIndex = 11,
    Parent = dialogueContainer,
    Visible = false,
    AutomaticSize = Enum.AutomaticSize.Y,
})

local choicesLayout = createInstance("UIListLayout", {
    SortOrder = Enum.SortOrder.LayoutOrder,
    VerticalAlignment = Enum.VerticalAlignment.Top,
    HorizontalAlignment = Enum.HorizontalAlignment.Right,
    Padding = UDim.new(0, 6),
    Parent = choicesContainer,
})

-- Choice button template (created dynamically)
local choiceButtonTemplate = createInstance("TextButton", {
    Name = "ChoiceButton",
    Size = UDim2.new(1, 0, 0, CONFIG.CHOICE_HEIGHT),
    BackgroundColor3 = CONFIG.CHOICE_BG,
    Text = "",
    TextColor3 = CONFIG.TEXT_WHITE,
    TextSize = 15,
    Font = Enum.Font.GothamBold,
    BorderSizePixel = 0,
    ZIndex = 11,
    Visible = false,
})
createCorner(choiceButtonTemplate, 8)
createStroke(choiceButtonTemplate, CONFIG.BG_ACCENT, 1)

-- Store template
choiceButtonTemplate.Parent = screenGui

-- --------------------------------------------------------
-- SKIP BUTTON
-- --------------------------------------------------------
local skipButton = createInstance("ImageButton", {
    Name = "SkipButton",
    Size = UDim2.fromOffset(80, 28),
    Position = UDim2.new(1, -10, 0, -36),
    AnchorPoint = Vector2.new(1, 0),
    BackgroundColor3 = CONFIG.BG_SECONDARY,
    BackgroundTransparency = 0.3,
    BorderSizePixel = 0,
    ZIndex = 12,
    Parent = dialogueContainer,
})
createCorner(skipButton, 6)
createStroke(skipButton, CONFIG.BG_ACCENT, 1)

local skipText = createInstance("TextLabel", {
    Name = "SkipText",
    Size = UDim2.fromScale(1, 1),
    BackgroundTransparency = 1,
    Text = "Skip >>",
    TextColor3 = CONFIG.TEXT_GRAY,
    TextSize = 11,
    Font = Enum.Font.GothamBold,
    ZIndex = 13,
    Parent = skipButton,
})

-- Hover effects
skipButton.MouseEnter:Connect(function()
    TweenService:Create(skipButton, CONFIG.TWEEN_FAST, { BackgroundTransparency = 0.1 }):Play()
    TweenService:Create(skipText, CONFIG.TWEEN_FAST, { TextColor3 = CONFIG.TEXT_WHITE }):Play()
end)

skipButton.MouseLeave:Connect(function()
    TweenService:Create(skipButton, CONFIG.TWEEN_FAST, { BackgroundTransparency = 0.3 }):Play()
    TweenService:Create(skipText, CONFIG.TWEEN_FAST, { TextColor3 = CONFIG.TEXT_GRAY }):Play()
end)

-- --------------------------------------------------------
-- DIALOGUE HISTORY
-- --------------------------------------------------------
local historyPanel = createInstance("Frame", {
    Name = "DialogueHistory",
    Size = UDim2.fromOffset(350, 300),
    Position = UDim2.new(1, -370, 0, 20),
    BackgroundColor3 = CONFIG.BG_PRIMARY,
    BackgroundTransparency = 0.1,
    BorderSizePixel = 0,
    ZIndex = 15,
    Parent = dialogueContainer,
    Visible = false,
})
createCorner(historyPanel, 12)
createStroke(historyPanel, CONFIG.BG_ACCENT, 2)

local historyTitle = createInstance("TextLabel", {
    Name = "HistoryTitle",
    Size = UDim2.new(1, 0, 0, 30),
    BackgroundTransparency = 1,
    Text = "Conversation History",
    TextColor3 = CONFIG.TEXT_YELLOW,
    TextSize = 14,
    Font = Enum.Font.GothamBlack,
    ZIndex = 16,
    Parent = historyPanel,
})

local historyScrolling = createInstance("ScrollingFrame", {
    Name = "HistoryScrolling",
    Size = UDim2.new(1, -16, 1, -60),
    Position = UDim2.fromOffset(8, 35),
    BackgroundTransparency = 1,
    ScrollBarThickness = 4,
    ScrollBarImageColor3 = CONFIG.BG_ACCENT,
    ZIndex = 16,
    Parent = historyPanel,
})

local historyLayout = createInstance("UIListLayout", {
    SortOrder = Enum.SortOrder.LayoutOrder,
    Padding = UDim.new(0, 4),
    Parent = historyScrolling,
})

local closeHistoryButton = createInstance("TextButton", {
    Name = "CloseHistory",
    Size = UDim2.fromOffset(60, 24),
    Position = UDim2.new(1, -10, 0, 4),
    AnchorPoint = Vector2.new(1, 0),
    BackgroundColor3 = CONFIG.CHOICE_BG,
    Text = "Close",
    TextColor3 = CONFIG.TEXT_WHITE,
    TextSize = 11,
    Font = Enum.Font.GothamBold,
    BorderSizePixel = 0,
    ZIndex = 17,
    Parent = historyPanel,
})
createCorner(closeHistoryButton, 4)

-- ============================================================
-- TYPEWRITER SYSTEM
-- ============================================================

local typewriterConnection = nil
local continueBlinkConnection = nil

local function startTypewriter(text)
    state.currentText = ""
    state.targetText = text
    state.canContinue = false
    continueHint.Visible = false
    typingCursor.Visible = true
    dialogueText.Text = ""

    -- Cancel existing typewriter
    if typewriterConnection then
        typewriterConnection:Disconnect()
        typewriterConnection = nil
    end

    local charIndex = 0
    local totalChars = #text

    typewriterConnection = game:GetService("RunService").Heartbeat:Connect(function()
        charIndex += 1
        if charIndex > totalChars then
            -- Typewriter complete
            if typewriterConnection then
                typewriterConnection:Disconnect()
                typewriterConnection = nil
            end
            state.currentText = text
            state.canContinue = true
            dialogueText.Text = text
            continueHint.Visible = true
            typingCursor.Visible = false

            -- Pulse the continue hint
            if continueBlinkConnection then
                continueBlinkConnection:Disconnect()
            end
            local visible = true
            continueBlinkConnection = game:GetService("RunService").Heartbeat:Connect(function()
                -- Blink every CONTINUE_BLINK_SPEED seconds
            end)
            -- Use a simpler task-based blink
            task.spawn(function()
                while state.canContinue do
                    task.wait(CONFIG.CONTINUE_BLINK_SPEED)
                    if continueHint and continueHint.Parent then
                        continueHint.TextTransparency = continueHint.TextTransparency == 0 and 0.5 or 0
                    end
                end
            end)
            return
        end

        -- Add next character
        state.currentText = string.sub(text, 1, charIndex)
        dialogueText.Text = state.currentText

        -- Play typewriter sound every few characters
        if charIndex % 2 == 0 then
            -- Sound effect trigger would go here
        end
    end)
end

local function skipTypewriter()
    if typewriterConnection then
        typewriterConnection:Disconnect()
        typewriterConnection = nil
    end
    state.currentText = state.targetText
    state.canContinue = true
    dialogueText.Text = state.targetText
    continueHint.Visible = true
    typingCursor.Visible = false
end

-- ============================================================
-- CHOICE MANAGEMENT
-- ============================================================

local choiceButtons = {}

local function clearChoices()
    for _, btn in ipairs(choiceButtons) do
        btn:Destroy()
    end
    choiceButtons = {}
    choicesContainer.Visible = false
end

local function showChoices(choices)
    clearChoices()
    state.choices = choices
    choicesContainer.Visible = true

    for i, choice in ipairs(choices) do
        local btn = createInstance("TextButton", {
            Name = "ChoiceButton_" .. i,
            Size = UDim2.new(1, 0, 0, CONFIG.CHOICE_HEIGHT),
            BackgroundColor3 = CONFIG.CHOICE_BG,
            Text = choice.text,
            TextColor3 = CONFIG.TEXT_WHITE,
            TextSize = 15,
            Font = Enum.Font.GothamBold,
            BorderSizePixel = 0,
            LayoutOrder = i,
            ZIndex = 11,
            Parent = choicesContainer,
            ClipsDescendants = true,
        })
        createCorner(btn, 8)
        createStroke(btn, CONFIG.BG_ACCENT, 1)

        -- Hover effects
        btn.MouseEnter:Connect(function()
            TweenService:Create(btn, CONFIG.TWEEN_FAST, {
                BackgroundColor3 = CONFIG.CHOICE_HOVER,
                Position = UDim2.new(0, 8, 0, btn.Position.Y.Offset),
            }):Play()
        end)

        btn.MouseLeave:Connect(function()
            TweenService:Create(btn, CONFIG.TWEEN_FAST, {
                BackgroundColor3 = CONFIG.CHOICE_BG,
                Position = UDim2.new(0, 0, 0, btn.Position.Y.Offset),
            }):Play()
        end)

        -- Click handler
        btn.Activated:Connect(function()
            -- Animate selection
            TweenService:Create(btn, CONFIG.TWEEN_FAST, {
                BackgroundColor3 = CONFIG.CHOICE_SELECTED,
                Size = UDim2.new(0.95, 0, 0, CONFIG.CHOICE_HEIGHT + 4),
            }):Play()

            task.delay(0.2, function()
                selectChoiceEvent:FireServer(choice.id)
                clearChoices()
            end)
        end)

        -- Entry animation
        btn.BackgroundTransparency = 1
        btn.TextTransparency = 1
        TweenService:Create(btn, TweenInfo.new(0.2, Enum.EasingStyle.Back, Enum.EasingDirection.Out, 0, false, (i - 1) * CONFIG.CHOICE_STAGGER), {
            BackgroundTransparency = 0,
            TextTransparency = 0,
        }):Play()

        table.insert(choiceButtons, btn)
    end
end

-- ============================================================
-- PORTRAIT MANAGEMENT
-- ============================================================

local function updatePortrait(portraitId, speakerName_text)
    state.currentPortraitId = portraitId
    state.currentSpeaker = speakerName_text

    -- Animate portrait change
    TweenService:Create(portraitImage, CONFIG.TWEEN_FAST, {
        ImageTransparency = 1,
    }):Play()

    task.delay(0.15, function()
        portraitImage.Image = portraitId ~= "" and portraitId or ""
        portraitPlaceholder.Visible = portraitId == ""

        TweenService:Create(portraitImage, CONFIG.TWEEN_FAST, {
            ImageTransparency = 0,
        }):Play()
    end)

    -- Update name
    nameTagText.Text = speakerName_text
    speakerName.Text = speakerName_text

    -- Animate name tag
    nameTagBg.Size = UDim2.fromOffset(20, CONFIG.NAME_TAG_HEIGHT)
    TweenService:Create(nameTagBg, CONFIG.TWEEN_BOUNCE, {
        Size = UDim2.fromOffset(math.max(140, #speakerName_text * 10), CONFIG.NAME_TAG_HEIGHT),
    }):Play()
end

local function updateEmotion(emotion)
    state.currentEmotion = emotion
    emotionIndicator.Visible = emotion ~= "neutral"

    local emojiMap = {
        happy = "H",
        sad = "S",
        angry = "A",
        surprised = "!",
        thinking = "?",
        neutral = "N",
    }

    emotionText.Text = emojiMap[emotion] or "N"

    local colorMap = {
        happy = Color3.fromRGB(255, 220, 80),
        sad = Color3.fromRGB(100, 150, 255),
        angry = Color3.fromRGB(255, 80, 80),
        surprised = Color3.fromRGB(255, 180, 80),
        thinking = Color3.fromRGB(180, 120, 255),
        neutral = CONFIG.CONTINUE_GLOW,
    }

    emotionIndicator.BackgroundColor3 = colorMap[emotion] or CONFIG.CONTINUE_GLOW

    -- Bounce animation
    TweenService:Create(emotionIndicator, CONFIG.TWEEN_BOUNCE, {
        Size = UDim2.fromOffset(28, 28),
    }):Play()
    task.delay(0.2, function()
        TweenService:Create(emotionIndicator, CONFIG.TWEEN_FAST, {
            Size = UDim2.fromOffset(24, 24),
        }):Play()
    end)
end

-- ============================================================
-- DIALOGUE HISTORY
-- ============================================================

local function addToHistory(speaker, text)
    local item = createInstance("TextLabel", {
        Name = "HistoryItem",
        Size = UDim2.new(1, 0, 0, 36),
        BackgroundTransparency = 1,
        Text = string.format("<b>%s:</b> %s", speaker, text),
        TextColor3 = CONFIG.TEXT_WHITE,
        TextSize = 12,
        Font = Enum.Font.GothamBold,
        TextWrapped = true,
        TextXAlignment = Enum.TextXAlignment.Left,
        LineHeight = 1.3,
        ZIndex = 16,
        Parent = historyScrolling,
        RichText = true,
    })

    -- Auto-scroll
    task.delay(0.05, function()
        historyScrolling.CanvasPosition = Vector2.new(0, historyScrolling.AbsoluteCanvasSize.Y)
    end)

    table.insert(state.dialogueHistory, { speaker = speaker, text = text })
end

local function toggleHistory()
    state.historyOpen = not state.historyOpen
    historyPanel.Visible = state.historyOpen

    if state.historyOpen then
        TweenService:Create(historyPanel, CONFIG.TWEEN_NORMAL, {
            BackgroundTransparency = 0.1,
            Size = UDim2.fromOffset(350, 300),
        }):Play()
    end
end

closeHistoryButton.Activated:Connect(toggleHistory)

-- ============================================================
-- DIALOGUE OPEN / CLOSE
-- ============================================================

local function openDialogue(speaker, text, portrait, emotion, choices)
    state.isActive = true

    -- Show overlay
    darkOverlay.Visible = true
    TweenService:Create(darkOverlay, CONFIG.TWEEN_SLOW, {
        BackgroundTransparency = 0.5,
    }):Play()

    -- Show container
    dialogueContainer.Visible = true

    -- Slide in from bottom
    dialogueContainer.Position = UDim2.new(0.5, 0, 1, 100)
    TweenService:Create(dialogueContainer, CONFIG.TWEEN_BOUNCE, {
        Position = UDim2.new(0.5, 0, 1, -60),
    }):Play()

    -- Slide in portrait
    task.delay(0.1, function()
        TweenService:Create(portraitContainer, CONFIG.TWEEN_BOUNCE, {
            Position = UDim2.fromOffset(-20, -30),
        }):Play()
    end)

    -- Update portrait and speaker
    if portrait then
        updatePortrait(portrait, speaker)
    end
    if emotion then
        updateEmotion(emotion)
    end

    -- Start typewriter
    task.delay(0.3, function()
        startTypewriter(text)
    end)

    -- Show choices if provided
    if choices and #choices > 0 then
        task.delay(0.5 + #text * CONFIG.TYPEWRITER_SPEED, function()
            showChoices(choices)
        end)
    end
end

local function closeDialogue()
    state.isActive = false
    state.canContinue = false

    -- Stop typewriter
    if typewriterConnection then
        typewriterConnection:Disconnect()
        typewriterConnection = nil
    end

    -- Hide choices
    clearChoices()

    -- Slide out
    TweenService:Create(dialogueContainer, CONFIG.TWEEN_NORMAL, {
        Position = UDim2.new(0.5, 0, 1, 100),
    }):Play()

    TweenService:Create(portraitContainer, CONFIG.TWEEN_NORMAL, {
        Position = UDim2.fromOffset(-200, -30),
    }):Play()

    TweenService:Create(darkOverlay, CONFIG.TWEEN_SLOW, {
        BackgroundTransparency = 1,
    }):Play()

    task.delay(0.5, function()
        dialogueContainer.Visible = false
        darkOverlay.Visible = false
        historyPanel.Visible = false
    end)
end

local function continueDialogue()
    if not state.canContinue then
        -- Skip typewriter if still typing
        skipTypewriter()
        return
    end

    -- Send continue to server
    advanceDialogueEvent:FireServer()
end

-- ============================================================
-- INPUT HANDLING
-- ============================================================

-- Click on dialogue box to continue
local dialogueClickConnection = nil

local function setupDialogueClick()
    if dialogueClickConnection then return end

    dialogueClickConnection = dialogueBg.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1
            or input.UserInputType == Enum.UserInputType.Touch then
            if state.isActive then
                continueDialogue()
            end
        end
    end)
end

setupDialogueClick()

-- Skip button
skipButton.Activated:Connect(function()
    if state.isActive then
        endDialogueEvent:FireServer()
        closeDialogue()
    end
end)

-- Keyboard shortcuts
UserInputService.InputBegan:Connect(function(input, gameProcessed)
    if gameProcessed then return end

    if not state.isActive then return end

    if input.KeyCode == Enum.KeyCode.Space
        or input.KeyCode == Enum.KeyCode.Return
        or input.KeyCode == Enum.KeyCode.E then
        continueDialogue()
    elseif input.KeyCode == Enum.KeyCode.H then
        toggleHistory()
    elseif input.KeyCode == Enum.KeyCode.Escape then
        endDialogueEvent:FireServer()
        closeDialogue()
    end
end)

-- ============================================================
-- REMOTE EVENT CONNECTIONS
-- ============================================================

startDialogueEvent.OnClientEvent:Connect(function(data)
    -- data: { speaker, text, portrait, emotion, choices }
    openDialogue(
        data.speaker or "NPC",
        data.text or "...",
        data.portrait,
        data.emotion or "neutral",
        data.choices
    )
end)

advanceDialogueEvent.OnClientEvent:Connect(function(data)
    -- Update with next dialogue segment
    if data.speaker then
        updatePortrait(data.portrait or "", data.speaker)
    end
    if data.emotion then
        updateEmotion(data.emotion)
    end
    if data.text then
        addToHistory(data.speaker or state.currentSpeaker, state.currentText)
        startTypewriter(data.text)
    end
    if data.choices and #data.choices > 0 then
        task.delay(0.3, function()
            showChoices(data.choices)
        end)
    else
        clearChoices()
    end
end)

endDialogueEvent.OnClientEvent:Connect(function()
    addToHistory(state.currentSpeaker, state.currentText)
    closeDialogue()
end)

portraitUpdateEvent.OnClientEvent:Connect(function(portraitId, speakerName_text)
    updatePortrait(portraitId, speakerName_text)
end)

emotionUpdateEvent.OnClientEvent:Connect(function(emotion)
    updateEmotion(emotion)
end)

-- ============================================================
-- INITIALIZATION
-- ============================================================

print("[Dialogue System] Initialized successfully")

-- Continue hint blink (global)
task.spawn(function()
    while true do
        task.wait(CONFIG.CONTINUE_BLINK_SPEED)
        if state.canContinue and continueHint and continueHint.Parent then
            continueHint.TextTransparency = continueHint.TextTransparency == 0 and 0.5 or 0
        end
    end
end)

-- Demo sequence after 2 seconds
task.delay(2, function()
    if not state.isActive then
        openDialogue(
            "Elder Wizard",
            "Welcome, traveler! I have been expecting you. The kingdom is in grave danger and only you can help us...",
            "",
            "happy",
            {
                { id = "accept", text = "I will help! Tell me more." },
                { id = "decline", text = "I'm busy right now." },
                { id = "ask", text = "What kind of danger?" },
            }
        )
    end
end)

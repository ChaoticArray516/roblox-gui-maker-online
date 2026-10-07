--[[
    Obby Start Screen - Client LocalScript
    A colorful obby start screen with start button, rules panel, shop, and stats.
    Optimized for mobile layout with cartoon aesthetic.
    Place in: StarterPlayer > StarterPlayerScripts
--]]

local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TeleportService = game:GetService("TeleportService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- ============================================================
-- REMOTE EVENTS
-- ============================================================
local remotes = ReplicatedStorage:WaitForChild("Obby_StartScreen_Remotes")
local requestPlayerDataEvent = remotes:WaitForChild("RequestPlayerData")
local playerDataEvent = remotes:WaitForChild("PlayerData")
local startGameEvent = remotes:WaitForChild("StartGame")
local openShopEvent = remotes:WaitForChild("OpenShop")
local purchaseItemEvent = remotes:WaitForChild("PurchaseItem")
local openRulesEvent = remotes:WaitForChild("OpenRules")
local updateSettingsEvent = remotes:WaitForChild("UpdateSettings")
local inviteFriendEvent = remotes:WaitForChild("InviteFriend")

-- ============================================================
-- CONFIGURATION
-- ============================================================
local CONFIG = {
    -- Colors - vibrant cartoon palette
    BG_GRADIENT_TOP = Color3.fromRGB(100, 180, 255),
    BG_GRADIENT_BOTTOM = Color3.fromRGB(180, 100, 255),
    PRIMARY = Color3.fromRGB(255, 200, 50),
    PRIMARY_LIGHT = Color3.fromRGB(255, 230, 120),
    SUCCESS = Color3.fromRGB(80, 220, 120),
    DANGER = Color3.fromRGB(255, 100, 100),
    INFO = Color3.fromRGB(80, 180, 255),
    CARD_BG = Color3.fromRGB(255, 255, 255),
    CARD_BORDER = Color3.fromRGB(230, 230, 240),
    TEXT_DARK = Color3.fromRGB(50, 55, 70),
    TEXT_GRAY = Color3.fromRGB(130, 140, 160),
    TEXT_WHITE = Color3.fromRGB(255, 255, 255),
    PANEL_BG = Color3.fromRGB(40, 45, 60),
    PANEL_BG_LIGHT = Color3.fromRGB(55, 60, 80),
    BEST_TIME_GOLD = Color3.fromRGB(255, 200, 50),
    LEVEL_BLUE = Color3.fromRGB(80, 160, 255),
    ATTEMPTS_RED = Color3.fromRGB(255, 120, 120),
    SHINE_WHITE = Color3.fromRGB(255, 255, 255),

    -- Animation
    TWEEN_BOUNCE = TweenInfo.new(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
    TWEEN_FAST = TweenInfo.new(0.15, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
    TWEEN_NORMAL = TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
    TWEEN_SLOW = TweenInfo.new(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
    TWEEN_ELASTIC = TweenInfo.new(0.7, Enum.EasingStyle.Elastic, Enum.EasingDirection.Out),
    PANEL_SLIDE_TIME = 0.4,
    BUTTON_PULSE_SPEED = 1.8,
    LOADING_DURATION = 2,

    -- Layout
    START_BUTTON_WIDTH = 220,
    START_BUTTON_HEIGHT = 60,
    BOTTOM_BAR_HEIGHT = 70,
    CARD_CORNER = 16,
    STAT_CARD_WIDTH = 100,
}

-- ============================================================
-- STATE
-- ============================================================
local state = {
    currentPanel = nil, -- "rules", "shop", "leaderboard", "settings", "friends", nil
    bestTime = 0,
    currentLevel = 1,
    totalAttempts = 0,
    isLoading = true,
    musicEnabled = true,
    sfxEnabled = true,
    difficulty = "normal",
    friendsList = {},
    shopItems = {},
    leaderboardData = {},
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
    corner.CornerRadius = UDim.new(0, radius or CONFIG.CARD_CORNER)
    corner.Parent = parent
    return corner
end

local function createStroke(parent, color, thickness)
    local stroke = Instance.new("UIStroke")
    stroke.Color = color or CONFIG.CARD_BORDER
    stroke.Thickness = thickness or 2
    stroke.Parent = parent
    return stroke
end

local function createGradient(parent, color1, color2, rotation)
    local gradient = Instance.new("UIGradient")
    gradient.Color = ColorSequence.new({
        ColorSequenceKeypoint.new(0, color1 or CONFIG.PRIMARY),
        ColorSequenceKeypoint.new(1, color2 or CONFIG.PRIMARY_LIGHT),
    })
    gradient.Rotation = rotation or 0
    gradient.Parent = parent
    return gradient
end

local function formatTime(seconds)
    if seconds <= 0 then
        return "--:--"
    end
    local mins = math.floor(seconds / 60)
    local secs = math.floor(seconds % 60)
    local ms = math.floor((seconds % 1) * 100)
    return string.format("%02d:%02d.%02d", mins, secs, ms)
end

-- ============================================================
-- UI CONSTRUCTION
-- ============================================================

local screenGui = createInstance("ScreenGui", {
    Name = "Obby_StartScreen",
    ResetOnSpawn = false,
    ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
    Parent = playerGui,
})

-- --------------------------------------------------------
-- BACKGROUND
-- --------------------------------------------------------
local background = createInstance("Frame", {
    Name = "Background",
    Size = UDim2.fromScale(1, 1),
    BackgroundColor3 = CONFIG.BG_GRADIENT_TOP,
    BorderSizePixel = 0,
    ZIndex = 1,
    Parent = screenGui,
})

local bgGradient = createGradient(background, CONFIG.BG_GRADIENT_TOP, CONFIG.BG_GRADIENT_BOTTOM, 135)

-- Decorative floating shapes
local shapes = {}
for i = 1, 6 do
    local shape = createInstance("Frame", {
        Name = "Shape_" .. i,
        Size = UDim2.fromOffset(math.random(40, 80), math.random(40, 80)),
        Position = UDim2.new(math.random() * 0.8, 0, math.random() * 0.8, 0),
        BackgroundColor3 = Color3.fromRGB(255, 255, 255),
        BackgroundTransparency = 0.85,
        BorderSizePixel = 0,
        Rotation = math.random(0, 45),
        ZIndex = 2,
        Parent = background,
    })
    createCorner(shape, math.random(8, 40))
    table.insert(shapes, shape)
end

-- Animate shapes
for i, shape in ipairs(shapes) do
    local driftX = math.random(-30, 30)
    local driftY = math.random(-20, 20)
    TweenService:Create(shape, TweenInfo.new(3 + i * 0.5, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true), {
        Position = UDim2.new(shape.Position.X.Scale, driftX, shape.Position.Y.Scale, driftY),
        Rotation = shape.Rotation + 10,
    }):Play()
end

-- --------------------------------------------------------
-- MAIN CONTAINER
-- --------------------------------------------------------
local mainContainer = createInstance("Frame", {
    Name = "MainContainer",
    Size = UDim2.fromScale(1, 1),
    BackgroundTransparency = 1,
    ZIndex = 10,
    Parent = screenGui,
})

-- --------------------------------------------------------
-- TITLE CONTAINER
-- --------------------------------------------------------
local titleContainer = createInstance("Frame", {
    Name = "TitleContainer",
    Size = UDim2.new(1, 0, 0, 100),
    Position = UDim2.fromOffset(0, 40),
    BackgroundTransparency = 1,
    ZIndex = 11,
    Parent = mainContainer,
})

local gameTitle = createInstance("TextLabel", {
    Name = "GameTitle",
    Size = UDim2.new(1, 0, 0, 50),
    Position = UDim2.fromOffset(0, 0),
    BackgroundTransparency = 1,
    Text = "OBBY CHALLENGE",
    TextColor3 = CONFIG.TEXT_WHITE,
    TextSize = 38,
    Font = Enum.Font.GothamBlack,
    ZIndex = 12,
    Parent = titleContainer,
})

local titleShadow = createInstance("TextLabel", {
    Name = "TitleShadow",
    Size = UDim2.new(1, 0, 0, 50),
    Position = UDim2.fromOffset(2, 2),
    BackgroundTransparency = 1,
    Text = "OBBY CHALLENGE",
    TextColor3 = Color3.fromRGB(0, 0, 0),
    TextTransparency = 0.6,
    TextSize = 38,
    Font = Enum.Font.GothamBlack,
    ZIndex = 11,
    Parent = titleContainer,
})

local subtitle = createInstance("TextLabel", {
    Name = "Subtitle",
    Size = UDim2.new(1, 0, 0, 24),
    Position = UDim2.fromOffset(0, 52),
    BackgroundTransparency = 1,
    Text = "Can you beat the tower?",
    TextColor3 = CONFIG.PRIMARY_LIGHT,
    TextSize = 16,
    Font = Enum.Font.GothamBold,
    ZIndex = 12,
    Parent = titleContainer,
})

local titleUnderline = createInstance("Frame", {
    Name = "TitleUnderline",
    Size = UDim2.fromOffset(200, 4),
    Position = UDim2.new(0.5, -100, 0, 82),
    BackgroundColor3 = CONFIG.PRIMARY,
    BorderSizePixel = 0,
    ZIndex = 12,
    Parent = titleContainer,
})
createCorner(titleUnderline, 2)
createGradient(titleUnderline, CONFIG.PRIMARY, CONFIG.PRIMARY_LIGHT, 0)

-- --------------------------------------------------------
-- CHARACTER SHOWCASE
-- --------------------------------------------------------
local characterShowcase = createInstance("Frame", {
    Name = "CharacterShowcase",
    Size = UDim2.fromOffset(140, 160),
    Position = UDim2.new(0.5, 0, 0, 160),
    AnchorPoint = Vector2.new(0.5, 0),
    BackgroundTransparency = 1,
    ZIndex = 11,
    Parent = mainContainer,
})

local characterBg = createInstance("Frame", {
    Name = "CharacterBg",
    Size = UDim2.fromOffset(120, 120),
    Position = UDim2.new(0.5, 0, 0, 0),
    AnchorPoint = Vector2.new(0.5, 0),
    BackgroundColor3 = CONFIG.CARD_BG,
    BackgroundTransparency = 0.3,
    BorderSizePixel = 0,
    ZIndex = 11,
    Parent = characterShowcase,
})
createCorner(characterBg, 20)
createStroke(characterBg, CONFIG.CARD_BORDER, 2)

local characterImage = createInstance("ImageLabel", {
    Name = "CharacterImage",
    Size = UDim2.fromOffset(100, 100),
    Position = UDim2.fromScale(0.5, 0.5),
    AnchorPoint = Vector2.new(0.5, 0.5),
    BackgroundTransparency = 1,
    Image = "",
    ZIndex = 12,
    Parent = characterBg,
})

-- Character placeholder (smiley face)
local characterPlaceholder = createInstance("TextLabel", {
    Name = "CharacterPlaceholder",
    Size = UDim2.fromScale(1, 1),
    BackgroundTransparency = 1,
    Text = ":D",
    TextColor3 = CONFIG.TEXT_DARK,
    TextSize = 48,
    Font = Enum.Font.GothamBlack,
    ZIndex = 13,
    Parent = characterImage,
})

-- Floating animation for character
TweenService:Create(characterBg, TweenInfo.new(2, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true), {
    Position = UDim2.new(0.5, 0, 0, -10),
}):Play()

local characterPlatform = createInstance("Frame", {
    Name = "CharacterPlatform",
    Size = UDim2.fromOffset(100, 12),
    Position = UDim2.new(0.5, 0, 0, 130),
    AnchorPoint = Vector2.new(0.5, 0),
    BackgroundColor3 = CONFIG.PRIMARY,
    BorderSizePixel = 0,
    ZIndex = 10,
    Parent = characterShowcase,
})
createCorner(characterPlatform, 6)

-- --------------------------------------------------------
-- STATS ROW
-- --------------------------------------------------------
local statsRow = createInstance("Frame", {
    Name = "StatsRow",
    Size = UDim2.new(1, -40, 0, 60),
    Position = UDim2.new(0.5, 0, 0, 340),
    AnchorPoint = Vector2.new(0.5, 0),
    BackgroundTransparency = 1,
    ZIndex = 11,
    Parent = mainContainer,
})

local statsLayout = createInstance("UIListLayout", {
    FillDirection = Enum.FillDirection.Horizontal,
    HorizontalAlignment = Enum.HorizontalAlignment.Center,
    VerticalAlignment = Enum.VerticalAlignment.Center,
    Padding = UDim.new(0, 12),
    Parent = statsRow,
})

-- Stat card factory
local function createStatCard(name, label, color, parent)
    local card = createInstance("Frame", {
        Name = name .. "Card",
        Size = UDim2.fromOffset(100, 56),
        BackgroundColor3 = CONFIG.CARD_BG,
        BackgroundTransparency = 0.2,
        BorderSizePixel = 0,
        ZIndex = 11,
        Parent = parent,
    })
    createCorner(card, 12)
    createStroke(card, CONFIG.CARD_BORDER, 1)

    local labelText = createInstance("TextLabel", {
        Name = "Label",
        Size = UDim2.new(1, 0, 0, 16),
        Position = UDim2.fromOffset(0, 4),
        BackgroundTransparency = 1,
        Text = label,
        TextColor3 = CONFIG.TEXT_GRAY,
        TextSize = 9,
        Font = Enum.Font.GothamBold,
        ZIndex = 12,
        Parent = card,
    })

    local valueText = createInstance("TextLabel", {
        Name = "Value",
        Size = UDim2.new(1, 0, 0, 32),
        Position = UDim2.fromOffset(0, 20),
        BackgroundTransparency = 1,
        Text = "--",
        TextColor3 = color,
        TextSize = 22,
        Font = Enum.Font.GothamBlack,
        ZIndex = 12,
        Parent = card,
    })

    return card, valueText
end

local bestTimeCard, bestTimeValue = createStatCard("BestTime", "BEST TIME", CONFIG.BEST_TIME_GOLD, statsRow)
local levelCard, levelValue = createStatCard("Level", "LEVEL", CONFIG.LEVEL_BLUE, statsRow)
local attemptsCard, attemptsValue = createStatCard("Attempts", "ATTEMPTS", CONFIG.ATTEMPTS_RED, statsRow)

-- --------------------------------------------------------
-- START BUTTON
-- --------------------------------------------------------
local startButton = createInstance("TextButton", {
    Name = "StartButton",
    Size = UDim2.fromOffset(CONFIG.START_BUTTON_WIDTH, CONFIG.START_BUTTON_HEIGHT),
    Position = UDim2.new(0.5, 0, 0, 420),
    AnchorPoint = Vector2.new(0.5, 0),
    BackgroundColor3 = CONFIG.SUCCESS,
    Text = "",
    BorderSizePixel = 0,
    ZIndex = 12,
    Parent = mainContainer,
})
createCorner(startButton, 30)
createStroke(startButton, Color3.fromRGB(60, 180, 100), 3)
createGradient(startButton, CONFIG.SUCCESS, Color3.fromRGB(120, 240, 160), 90)

local startButtonText = createInstance("TextLabel", {
    Name = "ButtonText",
    Size = UDim2.fromScale(1, 1),
    BackgroundTransparency = 1,
    Text = "START GAME",
    TextColor3 = CONFIG.TEXT_WHITE,
    TextSize = 22,
    Font = Enum.Font.GothamBlack,
    ZIndex = 13,
    Parent = startButton,
})

-- Button shine effect
local buttonShine = createInstance("Frame", {
    Name = "ButtonShine",
    Size = UDim2.fromOffset(60, CONFIG.START_BUTTON_HEIGHT),
    Position = UDim2.fromOffset(-60, 0),
    BackgroundColor3 = CONFIG.SHINE_WHITE,
    BackgroundTransparency = 0.7,
    BorderSizePixel = 0,
    ZIndex = 13,
    Parent = startButton,
})
createGradient(buttonShine, CONFIG.SHINE_WHITE, Color3.fromRGB(255, 255, 255), 0)

-- Animate shine
local function animateShine()
    while startButton and startButton.Parent do
        buttonShine.Position = UDim2.fromOffset(-60, 0)
        buttonShine.BackgroundTransparency = 0.7
        local shine = TweenService:Create(buttonShine, TweenInfo.new(1.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
            Position = UDim2.fromOffset(CONFIG.START_BUTTON_WIDTH + 20, 0),
            BackgroundTransparency = 1,
        })
        shine:Play()
        shine.Completed:Wait()
        task.wait(2)
    end
end
task.spawn(animateShine)

-- Button hover
startButton.MouseEnter:Connect(function()
    TweenService:Create(startButton, CONFIG.TWEEN_FAST, { Size = UDim2.fromOffset(CONFIG.START_BUTTON_WIDTH + 10, CONFIG.START_BUTTON_HEIGHT + 6) }):Play()
end)

startButton.MouseLeave:Connect(function()
    TweenService:Create(startButton, CONFIG.TWEEN_FAST, { Size = UDim2.fromOffset(CONFIG.START_BUTTON_WIDTH, CONFIG.START_BUTTON_HEIGHT) }):Play()
end)

-- Button click
startButton.Activated:Connect(function()
    -- Press animation
    TweenService:Create(startButton, CONFIG.TWEEN_FAST, { Size = UDim2.fromOffset(CONFIG.START_BUTTON_WIDTH - 10, CONFIG.START_BUTTON_HEIGHT - 6) }):Play()
    task.delay(0.1, function()
        TweenService:Create(startButton, CONFIG.TWEEN_BOUNCE, { Size = UDim2.fromOffset(CONFIG.START_BUTTON_WIDTH, CONFIG.START_BUTTON_HEIGHT) }):Play()
    end)

    -- Start game
    startGameEvent:FireServer()
end)

-- --------------------------------------------------------
-- SECONDARY BUTTONS
-- --------------------------------------------------------
local secondaryButtons = createInstance("Frame", {
    Name = "SecondaryButtons",
    Size = UDim2.new(1, 0, 0, 40),
    Position = UDim2.new(0.5, 0, 0, 492),
    AnchorPoint = Vector2.new(0.5, 0),
    BackgroundTransparency = 1,
    ZIndex = 11,
    Parent = mainContainer,
})

local secondaryLayout = createInstance("UIListLayout", {
    FillDirection = Enum.FillDirection.Horizontal,
    HorizontalAlignment = Enum.HorizontalAlignment.Center,
    VerticalAlignment = Enum.VerticalAlignment.Center,
    Padding = UDim.new(0, 12),
    Parent = secondaryButtons,
})

local continueButton = createInstance("TextButton", {
    Name = "ContinueButton",
    Size = UDim2.fromOffset(130, 36),
    BackgroundColor3 = CONFIG.INFO,
    Text = "Continue",
    TextColor3 = CONFIG.TEXT_WHITE,
    TextSize = 14,
    Font = Enum.Font.GothamBold,
    BorderSizePixel = 0,
    ZIndex = 12,
    Parent = secondaryButtons,
    Visible = false,
})
createCorner(continueButton, 18)

local levelsButton = createInstance("TextButton", {
    Name = "LevelsButton",
    Size = UDim2.fromOffset(130, 36),
    BackgroundColor3 = CONFIG.PANEL_BG_LIGHT,
    Text = "Levels",
    TextColor3 = CONFIG.TEXT_WHITE,
    TextSize = 14,
    Font = Enum.Font.GothamBold,
    BorderSizePixel = 0,
    ZIndex = 12,
    Parent = secondaryButtons,
})
createCorner(levelsButton, 18)

-- --------------------------------------------------------
-- BOTTOM BAR
-- --------------------------------------------------------
local bottomBar = createInstance("Frame", {
    Name = "BottomBar",
    Size = UDim2.new(1, 0, 0, CONFIG.BOTTOM_BAR_HEIGHT),
    Position = UDim2.new(0, 0, 1, 0),
    AnchorPoint = Vector2.new(0, 1),
    BackgroundColor3 = CONFIG.PANEL_BG,
    BackgroundTransparency = 0.1,
    BorderSizePixel = 0,
    ZIndex = 12,
    Parent = mainContainer,
})
createCorner(bottomBar, 20)

local bottomLayout = createInstance("UIListLayout", {
    FillDirection = Enum.FillDirection.Horizontal,
    HorizontalAlignment = Enum.HorizontalAlignment.Center,
    VerticalAlignment = Enum.VerticalAlignment.Center,
    Padding = UDim.new(0, 20),
    Parent = bottomBar,
})

local bottomButtonConfigs = {
    { name = "RulesButton", icon = "RULES", label = "Rules" },
    { name = "ShopButton", icon = "SHOP", label = "Shop" },
    { name = "LeaderboardButton", icon = "RANK", label = "Rank" },
    { name = "SettingsButton", icon = "SET", label = "Settings" },
    { name = "FriendsButton", icon = "FRIENDS", label = "Friends" },
}

local bottomButtons = {}

for _, cfg in ipairs(bottomButtonConfigs) do
    local btn = createInstance("TextButton", {
        Name = cfg.name,
        Size = UDim2.fromOffset(56, 56),
        BackgroundColor3 = CONFIG.PANEL_BG_LIGHT,
        Text = cfg.icon,
        TextColor3 = CONFIG.TEXT_WHITE,
        TextSize = 9,
        Font = Enum.Font.GothamBlack,
        BorderSizePixel = 0,
        ZIndex = 13,
        Parent = bottomBar,
    })
    createCorner(btn, 14)

    local btnLabel = createInstance("TextLabel", {
        Name = "Label",
        Size = UDim2.new(1, 0, 0, 14),
        Position = UDim2.fromOffset(0, 42),
        BackgroundTransparency = 1,
        Text = cfg.label,
        TextColor3 = CONFIG.TEXT_GRAY,
        TextSize = 8,
        Font = Enum.Font.GothamBold,
        ZIndex = 14,
        Parent = btn,
    })

    btn.MouseEnter:Connect(function()
        TweenService:Create(btn, CONFIG.TWEEN_FAST, { BackgroundColor3 = CONFIG.INFO }):Play()
    end)
    btn.MouseLeave:Connect(function()
        TweenService:Create(btn, CONFIG.TWEEN_FAST, { BackgroundColor3 = CONFIG.PANEL_BG_LIGHT }):Play()
    end)

    bottomButtons[cfg.name] = btn
end

-- --------------------------------------------------------
-- PANELS (Rules, Shop, Leaderboard, Settings, Friends)
-- --------------------------------------------------------

local panels = {}

local function createPanel(name, title, width, height)
    local panel = createInstance("Frame", {
        Name = name .. "Panel",
        Size = UDim2.fromOffset(width, height),
        Position = UDim2.new(0.5, 0, 1, 50),
        AnchorPoint = Vector2.new(0.5, 1),
        BackgroundTransparency = 1,
        ZIndex = 20,
        Parent = mainContainer,
        Visible = false,
    })

    local bg = createInstance("Frame", {
        Name = "Bg",
        Size = UDim2.fromScale(1, 1),
        BackgroundColor3 = CONFIG.PANEL_BG,
        BackgroundTransparency = 0.1,
        BorderSizePixel = 0,
        ZIndex = 20,
        Parent = panel,
    })
    createCorner(bg, 20)
    createStroke(bg, CONFIG.PANEL_BG_LIGHT, 2)

    local titleLabel = createInstance("TextLabel", {
        Name = "Title",
        Size = UDim2.new(1, 0, 0, 36),
        Position = UDim2.fromOffset(0, 8),
        BackgroundTransparency = 1,
        Text = title,
        TextColor3 = CONFIG.PRIMARY,
        TextSize = 20,
        Font = Enum.Font.GothamBlack,
        ZIndex = 21,
        Parent = panel,
    })

    local closeBtn = createInstance("TextButton", {
        Name = "Close",
        Size = UDim2.fromOffset(36, 36),
        Position = UDim2.new(1, -42, 0, 8),
        BackgroundColor3 = CONFIG.DANGER,
        Text = "X",
        TextColor3 = CONFIG.TEXT_WHITE,
        TextSize = 16,
        Font = Enum.Font.GothamBlack,
        BorderSizePixel = 0,
        ZIndex = 22,
        Parent = panel,
    })
    createCorner(closeBtn, 10)

    closeBtn.Activated:Connect(function()
        closePanel(name:lower())
    end)

    panels[name:lower()] = panel
    return panel, bg
end

-- Rules Panel
local rulesPanel, rulesBg = createPanel("Rules", "HOW TO PLAY", 340, 420)
local rulesContent = createInstance("ScrollingFrame", {
    Name = "RulesContent",
    Size = UDim2.new(1, -24, 1, -80),
    Position = UDim2.fromOffset(12, 50),
    BackgroundTransparency = 1,
    ScrollBarThickness = 4,
    ScrollBarImageColor3 = CONFIG.PANEL_BG_LIGHT,
    ZIndex = 21,
    Parent = rulesBg,
})

local rulesText = createInstance("TextLabel", {
    Name = "RulesText",
    Size = UDim2.new(1, -8, 0, 600),
    Position = UDim2.fromOffset(4, 0),
    BackgroundTransparency = 1,
    Text = [[
1. Reach the top of the tower!
   Jump across platforms and avoid falling into the void.

2. Don't touch the red blocks!
   Red blocks will send you back to the last checkpoint.

3. Collect stars along the way!
   Stars give you bonus points at the end of each level.

4. Beat the clock!
   Each level has a time limit. Try to beat your best time!

5. Use checkpoints wisely!
   Blue pads are checkpoints. Stand on them to save progress.

6. Watch out for moving platforms!
   Some platforms move or disappear after you step on them.

7. Power-ups help you!
   Look for speed boosts and jump boosts scattered around.

8. Compete with friends!
   Check the leaderboard to see who's the fastest climber.
    ]],
    TextColor3 = CONFIG.TEXT_WHITE,
    TextSize = 13,
    Font = Enum.Font.GothamBold,
    TextWrapped = true,
    TextXAlignment = Enum.TextXAlignment.Left,
    TextYAlignment = Enum.TextYAlignment.Top,
    LineHeight = 1.6,
    ZIndex = 22,
    Parent = rulesContent,
})

-- Shop Panel
local shopPanel, shopBg = createPanel("Shop", "ITEM SHOP", 360, 460)
local shopItemsScrolling = createInstance("ScrollingFrame", {
    Name = "ShopItems",
    Size = UDim2.new(1, -24, 1, -80),
    Position = UDim2.fromOffset(12, 50),
    BackgroundTransparency = 1,
    ScrollBarThickness = 4,
    ScrollBarImageColor3 = CONFIG.PANEL_BG_LIGHT,
    ZIndex = 21,
    Parent = shopBg,
})

local shopGrid = createInstance("UIGridLayout", {
    CellSize = UDim2.fromOffset(100, 130),
    CellPadding = UDim2.fromOffset(10, 10),
    HorizontalAlignment = Enum.HorizontalAlignment.Center,
    VerticalAlignment = Enum.VerticalAlignment.Top,
    Parent = shopItemsScrolling,
})

-- Shop item template
local function createShopItemCard(name, price, color)
    local card = createInstance("Frame", {
        Name = "ShopItem_" .. name,
        Size = UDim2.fromOffset(100, 130),
        BackgroundColor3 = CONFIG.PANEL_BG_LIGHT,
        BorderSizePixel = 0,
        ZIndex = 22,
        Parent = shopItemsScrolling,
    })
    createCorner(card, 12)

    local img = createInstance("Frame", {
        Name = "Image",
        Size = UDim2.new(1, -8, 0, 60),
        Position = UDim2.fromOffset(4, 4),
        BackgroundColor3 = color,
        BorderSizePixel = 0,
        ZIndex = 23,
        Parent = card,
    })
    createCorner(img, 8)

    local nameLabel = createInstance("TextLabel", {
        Name = "Name",
        Size = UDim2.new(1, 0, 0, 20),
        Position = UDim2.fromOffset(0, 68),
        BackgroundTransparency = 1,
        Text = name,
        TextColor3 = CONFIG.TEXT_WHITE,
        TextSize = 11,
        Font = Enum.Font.GothamBold,
        ZIndex = 23,
        Parent = card,
    })

    local priceLabel = createInstance("TextLabel", {
        Name = "Price",
        Size = UDim2.new(1, 0, 0, 16),
        Position = UDim2.fromOffset(0, 88),
        BackgroundTransparency = 1,
        Text = tostring(price) .. " Coins",
        TextColor3 = CONFIG.PRIMARY,
        TextSize = 10,
        Font = Enum.Font.GothamBold,
        ZIndex = 23,
        Parent = card,
    })

    local buyBtn = createInstance("TextButton", {
        Name = "Buy",
        Size = UDim2.new(1, -8, 0, 24),
        Position = UDim2.fromOffset(4, 104),
        BackgroundColor3 = CONFIG.SUCCESS,
        Text = "Buy",
        TextColor3 = CONFIG.TEXT_WHITE,
        TextSize = 11,
        Font = Enum.Font.GothamBlack,
        BorderSizePixel = 0,
        ZIndex = 23,
        Parent = card,
    })
    createCorner(buyBtn, 6)

    buyBtn.Activated:Connect(function()
        purchaseItemEvent:FireServer(name)
    end)

    return card
end

-- Create shop items
local shopItems = {
    { name = "Speed Boost", price = 150, color = Color3.fromRGB(80, 180, 255) },
    { name = "Jump Boost", price = 200, color = Color3.fromRGB(120, 220, 100) },
    { name = "Shield", price = 300, color = Color3.fromRGB(255, 200, 80) },
    { name = "Checkpoint", price = 100, color = Color3.fromRGB(180, 120, 255) },
    { name = "Magnet", price = 250, color = Color3.fromRGB(255, 120, 120) },
    { name = "Gravity", price = 400, color = Color3.fromRGB(120, 200, 200) },
}

for _, item in ipairs(shopItems) do
    createShopItemCard(item.name, item.price, item.color)
end

-- Leaderboard Panel
local leaderboardPanel, lbBg = createPanel("Leaderboard", "LEADERBOARD", 340, 420)
local lbScrolling = createInstance("ScrollingFrame", {
    Name = "LeaderboardList",
    Size = UDim2.new(1, -24, 1, -80),
    Position = UDim2.fromOffset(12, 50),
    BackgroundTransparency = 1,
    ScrollBarThickness = 4,
    ScrollBarImageColor3 = CONFIG.PANEL_BG_LIGHT,
    ZIndex = 21,
    Parent = lbBg,
})

local lbLayout = createInstance("UIListLayout", {
    SortOrder = Enum.SortOrder.LayoutOrder,
    Padding = UDim.new(0, 4),
    Parent = lbScrolling,
})

local function createLeaderboardRow(rank, playerName, time, isPlayer)
    local row = createInstance("Frame", {
        Name = "Row_" .. rank,
        Size = UDim2.new(1, -8, 0, 36),
        BackgroundColor3 = isPlayer and CONFIG.INFO or CONFIG.PANEL_BG_LIGHT,
        BackgroundTransparency = isPlayer and 0.5 or 0,
        BorderSizePixel = 0,
        LayoutOrder = rank,
        ZIndex = 22,
        Parent = lbScrolling,
    })
    createCorner(row, 8)

    local rankColors = {
        [1] = CONFIG.BEST_TIME_GOLD,
        [2] = Color3.fromRGB(200, 200, 200),
        [3] = Color3.fromRGB(200, 150, 100),
    }

    local rankLabel = createInstance("TextLabel", {
        Name = "Rank",
        Size = UDim2.fromOffset(30, 36),
        BackgroundTransparency = 1,
        Text = "#" .. rank,
        TextColor3 = rankColors[rank] or CONFIG.TEXT_GRAY,
        TextSize = 14,
        Font = Enum.Font.GothamBlack,
        ZIndex = 23,
        Parent = row,
    })

    local nameLabel = createInstance("TextLabel", {
        Name = "PlayerName",
        Size = UDim2.new(0, 160, 1, 0),
        Position = UDim2.fromOffset(36, 0),
        BackgroundTransparency = 1,
        Text = playerName,
        TextColor3 = CONFIG.TEXT_WHITE,
        TextSize = 12,
        Font = Enum.Font.GothamBold,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 23,
        Parent = row,
    })

    local timeLabel = createInstance("TextLabel", {
        Name = "Time",
        Size = UDim2.new(0, 80, 1, 0),
        Position = UDim2.new(1, -85, 0, 0),
        BackgroundTransparency = 1,
        Text = formatTime(time),
        TextColor3 = CONFIG.PRIMARY,
        TextSize = 12,
        Font = Enum.Font.GothamBlack,
        TextXAlignment = Enum.TextXAlignment.Right,
        ZIndex = 23,
        Parent = row,
    })

    return row
end

-- Demo leaderboard data
task.delay(1, function()
    createLeaderboardRow(1, "SpeedKing", 42.5, false)
    createLeaderboardRow(2, "JumpMaster", 58.2, false)
    createLeaderboardRow(3, "ClimberPro", 65.0, false)
    createLeaderboardRow(4, "PlayerOne", 72.3, false)
    createLeaderboardRow(5, "You", 89.1, true)
    createLeaderboardRow(6, "Newbie", 120.5, false)
end)

-- Settings Panel
local settingsPanel, settingsBg = createPanel("Settings", "SETTINGS", 320, 360)

local function createToggle(parent, yPos, label, initialValue, onChange)
    local container = createInstance("Frame", {
        Name = label .. "Toggle",
        Size = UDim2.new(1, -24, 0, 40),
        Position = UDim2.fromOffset(12, yPos),
        BackgroundColor3 = CONFIG.PANEL_BG_LIGHT,
        BorderSizePixel = 0,
        ZIndex = 21,
        Parent = settingsBg,
    })
    createCorner(container, 10)

    local labelText = createInstance("TextLabel", {
        Name = "Label",
        Size = UDim2.new(0, 150, 1, 0),
        Position = UDim2.fromOffset(12, 0),
        BackgroundTransparency = 1,
        Text = label,
        TextColor3 = CONFIG.TEXT_WHITE,
        TextSize = 14,
        Font = Enum.Font.GothamBold,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 22,
        Parent = container,
    })

    local toggleBtn = createInstance("TextButton", {
        Name = "Toggle",
        Size = UDim2.fromOffset(50, 26),
        Position = UDim2.new(1, -62, 0.5, -13),
        BackgroundColor3 = initialValue and CONFIG.SUCCESS or CONFIG.DANGER,
        Text = initialValue and "ON" or "OFF",
        TextColor3 = CONFIG.TEXT_WHITE,
        TextSize = 11,
        Font = Enum.Font.GothamBlack,
        BorderSizePixel = 0,
        ZIndex = 22,
        Parent = container,
    })
    createCorner(toggleBtn, 13)

    local isOn = initialValue
    toggleBtn.Activated:Connect(function()
        isOn = not isOn
        TweenService:Create(toggleBtn, CONFIG.TWEEN_FAST, {
            BackgroundColor3 = isOn and CONFIG.SUCCESS or CONFIG.DANGER,
        }):Play()
        toggleBtn.Text = isOn and "ON" or "OFF"
        onChange(isOn)
    end)

    return container
end

createToggle(settingsBg, 52, "Music", state.musicEnabled, function(value)
    state.musicEnabled = value
    updateSettingsEvent:FireServer("music", value)
end)

createToggle(settingsBg, 98, "Sound Effects", state.sfxEnabled, function(value)
    state.sfxEnabled = value
    updateSettingsEvent:FireServer("sfx", value)
end)

-- Difficulty selector
local diffContainer = createInstance("Frame", {
    Name = "DifficultySelector",
    Size = UDim2.new(1, -24, 0, 50),
    Position = UDim2.fromOffset(12, 150),
    BackgroundColor3 = CONFIG.PANEL_BG_LIGHT,
    BorderSizePixel = 0,
    ZIndex = 21,
    Parent = settingsBg,
})
createCorner(diffContainer, 10)

local diffLabel = createInstance("TextLabel", {
    Name = "Label",
    Size = UDim2.new(0, 100, 1, 0),
    Position = UDim2.fromOffset(12, 0),
    BackgroundTransparency = 1,
    Text = "Difficulty",
    TextColor3 = CONFIG.TEXT_WHITE,
    TextSize = 14,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Left,
    ZIndex = 22,
    Parent = diffContainer,
})

local difficulties = {"Easy", "Normal", "Hard"}
local diffColors = {
    Easy = CONFIG.SUCCESS,
    Normal = CONFIG.INFO,
    Hard = CONFIG.DANGER,
}

local diffButtons = {}
for i, diff in ipairs(difficulties) do
    local btn = createInstance("TextButton", {
        Name = "Diff_" .. diff,
        Size = UDim2.fromOffset(60, 28),
        Position = UDim2.fromOffset(110 + (i - 1) * 66, 11),
        BackgroundColor3 = diffColors[diff],
        BackgroundTransparency = diff == state.difficulty and 0 or 0.7,
        Text = diff,
        TextColor3 = CONFIG.TEXT_WHITE,
        TextSize = 11,
        Font = Enum.Font.GothamBold,
        BorderSizePixel = 0,
        ZIndex = 22,
        Parent = diffContainer,
    })
    createCorner(btn, 8)
    table.insert(diffButtons, btn)

    btn.Activated:Connect(function()
        state.difficulty = diff:lower()
        for _, b in ipairs(diffButtons) do
            TweenService:Create(b, CONFIG.TWEEN_FAST, { BackgroundTransparency = 0.7 }):Play()
        end
        TweenService:Create(btn, CONFIG.TWEEN_FAST, { BackgroundTransparency = 0 }):Play()
        updateSettingsEvent:FireServer("difficulty", diff:lower())
    end)
end

-- Friends Panel
local friendsPanel, friendsBg = createPanel("Friends", "FRIENDS", 340, 400)
local friendsScrolling = createInstance("ScrollingFrame", {
    Name = "FriendsList",
    Size = UDim2.new(1, -24, 1, -130),
    Position = UDim2.fromOffset(12, 50),
    BackgroundTransparency = 1,
    ScrollBarThickness = 4,
    ScrollBarImageColor3 = CONFIG.PANEL_BG_LIGHT,
    ZIndex = 21,
    Parent = friendsBg,
})

local friendsLayout = createInstance("UIListLayout", {
    SortOrder = Enum.SortOrder.LayoutOrder,
    Padding = UDim.new(0, 6),
    Parent = friendsScrolling,
})

local inviteBtn = createInstance("TextButton", {
    Name = "InviteButton",
    Size = UDim2.new(1, -24, 0, 40),
    Position = UDim2.fromOffset(12, 350),
    BackgroundColor3 = CONFIG.INFO,
    Text = "Invite Friends",
    TextColor3 = CONFIG.TEXT_WHITE,
    TextSize = 14,
    Font = Enum.Font.GothamBlack,
    BorderSizePixel = 0,
    ZIndex = 21,
    Parent = friendsBg,
})
createCorner(inviteBtn, 10)

inviteBtn.Activated:Connect(function()
    inviteFriendEvent:FireServer()
end)

-- ============================================================
-- PANEL MANAGEMENT
-- ============================================================

local function openPanel(panelName)
    -- Close any open panel
    if state.currentPanel and panels[state.currentPanel] then
        closePanel(state.currentPanel)
        if state.currentPanel == panelName then
            state.currentPanel = nil
            return
        end
    end

    state.currentPanel = panelName
    local panel = panels[panelName]
    if not panel then return end

    panel.Visible = true

    -- Slide up animation
    TweenService:Create(panel, TweenInfo.new(CONFIG.PANEL_SLIDE_TIME, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
        Position = UDim2.new(0.5, 0, 1, -CONFIG.BOTTOM_BAR_HEIGHT - 10),
    }):Play()
end

function closePanel(panelName)
    local panel = panels[panelName]
    if not panel then return end

    TweenService:Create(panel, TweenInfo.new(CONFIG.PANEL_SLIDE_TIME, Enum.EasingStyle.Quad, Enum.EasingDirection.In), {
        Position = UDim2.new(0.5, 0, 1, panel.AbsoluteSize.Y + 50),
    }):Play()

    task.delay(CONFIG.PANEL_SLIDE_TIME, function()
        if state.currentPanel ~= panelName then
            panel.Visible = false
        end
    end)
end

-- Bottom bar button connections
bottomButtons["RulesButton"].Activated:Connect(function() openPanel("rules") end)
bottomButtons["ShopButton"].Activated:Connect(function() openPanel("shop") end)
bottomButtons["LeaderboardButton"].Activated:Connect(function() openPanel("leaderboard") end)
bottomButtons["SettingsButton"].Activated:Connect(function() openPanel("settings") end)
bottomButtons["FriendsButton"].Activated:Connect(function() openPanel("friends") end)

-- --------------------------------------------------------
-- LOADING SCREEN
-- --------------------------------------------------------
local loadingScreen = createInstance("Frame", {
    Name = "LoadingScreen",
    Size = UDim2.fromScale(1, 1),
    BackgroundColor3 = CONFIG.BG_GRADIENT_TOP,
    BorderSizePixel = 0,
    ZIndex = 30,
    Parent = screenGui,
})

local loadingBgGradient = createGradient(loadingScreen, CONFIG.BG_GRADIENT_TOP, CONFIG.BG_GRADIENT_BOTTOM, 135)

local loadingText = createInstance("TextLabel", {
    Name = "LoadingText",
    Size = UDim2.new(1, 0, 0, 40),
    Position = UDim2.fromScale(0, 0.45),
    BackgroundTransparency = 1,
    Text = "Loading...",
    TextColor3 = CONFIG.TEXT_WHITE,
    TextSize = 28,
    Font = Enum.Font.GothamBlack,
    ZIndex = 31,
    Parent = loadingScreen,
})

local loadingBar = createInstance("Frame", {
    Name = "LoadingBar",
    Size = UDim2.fromOffset(200, 8),
    Position = UDim2.new(0.5, -100, 0, 0.55),
    AnchorPoint = Vector2.new(0, 0.5),
    BackgroundColor3 = CONFIG.PANEL_BG,
    BorderSizePixel = 0,
    ZIndex = 31,
    Parent = loadingScreen,
})
createCorner(loadingBar, 4)

local loadingFill = createInstance("Frame", {
    Name = "LoadingFill",
    Size = UDim2.fromScale(0, 1),
    BackgroundColor3 = CONFIG.PRIMARY,
    BorderSizePixel = 0,
    ZIndex = 32,
    Parent = loadingBar,
})
createCorner(loadingFill, 4)
createGradient(loadingFill, CONFIG.PRIMARY, CONFIG.PRIMARY_LIGHT, 0)

-- Loading animation
local function runLoading()
    TweenService:Create(loadingFill, TweenInfo.new(CONFIG.LOADING_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
        Size = UDim2.fromScale(1, 1),
    }):Play()

    task.delay(CONFIG.LOADING_DURATION, function()
        TweenService:Create(loadingScreen, CONFIG.TWEEN_SLOW, {
            BackgroundTransparency = 1,
        }):Play()
        loadingText.Visible = false
        loadingBar.Visible = false

        task.delay(0.5, function()
            loadingScreen.Visible = false
            state.isLoading = false
        end)
    end)
end
runLoading()

-- ============================================================
-- REMOTE EVENT CONNECTIONS
-- ============================================================

playerDataEvent.OnClientEvent:Connect(function(data)
    state.bestTime = data.bestTime or 0
    state.currentLevel = data.currentLevel or 1
    state.totalAttempts = data.totalAttempts or 0
    state.musicEnabled = data.musicEnabled ~= false
    state.sfxEnabled = data.sfxEnabled ~= false
    state.difficulty = data.difficulty or "normal"

    bestTimeValue.Text = formatTime(state.bestTime)
    levelValue.Text = tostring(state.currentLevel)
    attemptsValue.Text = tostring(state.totalAttempts)

    if data.hasContinue then
        continueButton.Visible = true
    end
end)

openShopEvent.OnClientEvent:Connect(function(items)
    state.shopItems = items
    openPanel("shop")
end)

-- ============================================================
-- INITIALIZATION
-- ============================================================

-- Request player data from server
task.delay(CONFIG.LOADING_DURATION + 0.3, function()
    requestPlayerDataEvent:FireServer()
end)

-- Title bounce animation
TweenService:Create(gameTitle, CONFIG.TWEEN_ELASTIC, {
    Position = UDim2.new(0, 0, 0, 0),
}):Play()

print("[Obby Start Screen] Initialized successfully")

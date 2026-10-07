--[[
    Simulator HUD - Client LocalScript
    A bright simulator HUD with click counter, rebirth badge, pet count, and currency.
    Optimized for mobile layout with touch-friendly interactions.
    Place in: StarterPlayer > StarterPlayerScripts
--]]

local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- ============================================================
-- REMOTE EVENTS
-- ============================================================
local remotes = ReplicatedStorage:WaitForChild("Simulator_HUD_Remotes")
local updateCurrencyEvent = remotes:WaitForChild("UpdateCurrency")
local updateClicksEvent = remotes:WaitForChild("UpdateClicks")
local updateRebirthsEvent = remotes:WaitForChild("UpdateRebirths")
local updatePetsEvent = remotes:WaitForChild("UpdatePets")
local updateMultiplierEvent = remotes:WaitForChild("UpdateMultiplier")
local clickEvent = remotes:WaitForChild("Click")
local showNotificationEvent = remotes:WaitForChild("ShowNotification")
local showFloatingTextEvent = remotes:WaitForChild("ShowFloatingText")
local updateLeaderboardEvent = remotes:WaitForChild("UpdateLeaderboard")
local openMenuEvent = remotes:WaitForChild("OpenMenu")

-- ============================================================
-- CONFIGURATION
-- ============================================================
local CONFIG = {
    -- Colors - bright and cheerful simulator palette
    PRIMARY = Color3.fromRGB(255, 200, 50),
    PRIMARY_LIGHT = Color3.fromRGB(255, 230, 120),
    SUCCESS = Color3.fromRGB(50, 220, 100),
    INFO = Color3.fromRGB(50, 170, 255),
    WARNING = Color3.fromRGB(255, 150, 50),
    DANGER = Color3.fromRGB(255, 80, 80),
    COIN_GOLD = Color3.fromRGB(255, 215, 0),
    REBIRTH_PURPLE = Color3.fromRGB(180, 100, 255),
    PET_BLUE = Color3.fromRGB(80, 180, 255),
    BG_WHITE = Color3.fromRGB(255, 255, 255),
    BG_LIGHT = Color3.fromRGB(245, 248, 250),
    BG_CARD = Color3.fromRGB(255, 255, 255),
    TEXT_DARK = Color3.fromRGB(50, 55, 60),
    TEXT_GRAY = Color3.fromRGB(130, 140, 150),
    SHADOW = Color3.fromRGB(200, 210, 220),

    -- Animation
    TWEEN_BOUNCE = TweenInfo.new(0.4, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
    TWEEN_FAST = TweenInfo.new(0.15, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
    TWEEN_NORMAL = TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
    TWEEN_SLOW = TweenInfo.new(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
    FLOAT_DURATION = 1.2,
    NOTIFICATION_DURATION = 3,

    -- Mobile layout sizes
    TOP_BAR_HEIGHT = 55,
    CLICK_BUTTON_SIZE = 140,
    MENU_BUTTON_SIZE = 50,
    STAT_CARD_WIDTH = 100,
    STAT_CARD_HEIGHT = 50,
    NOTIFICATION_MAX = 4,
}

-- ============================================================
-- STATE
-- ============================================================
local state = {
    currency = 0,
    currencyDisplay = "0",
    clicks = 0,
    clicksDisplay = "0",
    rebirths = 0,
    pets = 0,
    petCapacity = 100,
    multiplier = 1.0,
    progressPercent = 0,
    leaderboardData = {},
    notifications = {},
    floatingTexts = {},
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
    stroke.Color = color or CONFIG.SHADOW
    stroke.Thickness = thickness or 1
    stroke.Parent = parent
    return stroke
end

local function createGradient(parent, color1, color2, rotation)
    local gradient = Instance.new("UIGradient")
    gradient.Color = ColorSequence.new({
        ColorSequenceKeypoint.new(0, color1 or Color3.new(1, 1, 1)),
        ColorSequenceKeypoint.new(1, color2 or Color3.new(0.8, 0.8, 0.8)),
    })
    gradient.Rotation = rotation or 0
    gradient.Parent = parent
    return gradient
end

local function createShadow(parent)
    local shadow = Instance.new("ImageLabel")
    shadow.Name = "Shadow"
    shadow.Size = UDim2.new(1, 8, 1, 8)
    shadow.Position = UDim2.fromOffset(-4, -4)
    shadow.BackgroundTransparency = 1
    shadow.Image = "rbxassetid://131296291" -- shadow asset
    shadow.ImageColor3 = CONFIG.SHADOW
    shadow.ImageTransparency = 0.7
    shadow.ScaleType = Enum.ScaleType.Slice
    shadow.SliceCenter = Rect.new(10, 10, 118, 118)
    shadow.ZIndex = parent.ZIndex - 1
    shadow.Parent = parent
    return shadow
end

-- Format large numbers with suffixes (1.5K, 2.3M, etc.)
local function formatNumber(num)
    if num >= 1e15 then
        return string.format("%.1fQa", num / 1e15)
    elseif num >= 1e12 then
        return string.format("%.1fT", num / 1e12)
    elseif num >= 1e9 then
        return string.format("%.1fB", num / 1e9)
    elseif num >= 1e6 then
        return string.format("%.1fM", num / 1e6)
    elseif num >= 1e3 then
        return string.format("%.1fK", num / 1e3)
    else
        return tostring(math.floor(num))
    end
end

-- Format with commas
local function formatCommas(num)
    local formatted = tostring(math.floor(num))
    local k
    while true do
        formatted, k = string.gsub(formatted, "^(-?%d+)(%d%d%d)", "%1,%2")
        if k == 0 then break end
    end
    return formatted
end

-- ============================================================
-- UI CONSTRUCTION
-- ============================================================

local screenGui = createInstance("ScreenGui", {
    Name = "Simulator_HUD",
    ResetOnSpawn = false,
    ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
    Parent = playerGui,
})

-- --------------------------------------------------------
-- TOP BAR (Currency Display)
-- --------------------------------------------------------
local topBar = createInstance("Frame", {
    Name = "TopBar",
    Size = UDim2.new(1, 0, 0, CONFIG.TOP_BAR_HEIGHT),
    Position = UDim2.fromOffset(0, 0),
    BackgroundColor3 = CONFIG.BG_CARD,
    BackgroundTransparency = 0.1,
    BorderSizePixel = 0,
    ZIndex = 5,
    Parent = screenGui,
})
createCorner(topBar, 0)

local topBarGradient = createGradient(topBar, CONFIG.BG_CARD, CONFIG.BG_LIGHT, 90)

-- Currency icon (circle placeholder)
local currencyIcon = createInstance("Frame", {
    Name = "CurrencyIcon",
    Size = UDim2.fromOffset(36, 36),
    Position = UDim2.fromOffset(12, 10),
    BackgroundColor3 = CONFIG.COIN_GOLD,
    BorderSizePixel = 0,
    ZIndex = 6,
    Parent = topBar,
})
createCorner(currencyIcon, 18)

local currencyIconInner = createInstance("Frame", {
    Name = "Inner",
    Size = UDim2.fromOffset(24, 24),
    Position = UDim2.fromScale(0.5, 0.5),
    AnchorPoint = Vector2.new(0.5, 0.5),
    BackgroundColor3 = CONFIG.PRIMARY_LIGHT,
    BorderSizePixel = 0,
    ZIndex = 7,
    Parent = currencyIcon,
})
createCorner(currencyIconInner, 12)

-- Currency value
local currencyValue = createInstance("TextLabel", {
    Name = "CurrencyValue",
    Size = UDim2.new(0, 150, 0, 28),
    Position = UDim2.fromOffset(56, 6),
    BackgroundTransparency = 1,
    Text = "0",
    TextColor3 = CONFIG.TEXT_DARK,
    TextSize = 24,
    Font = Enum.Font.GothamBlack,
    TextXAlignment = Enum.TextXAlignment.Left,
    ZIndex = 6,
    Parent = topBar,
})

-- Currency label
local currencyLabel = createInstance("TextLabel", {
    Name = "CurrencyLabel",
    Size = UDim2.new(0, 80, 0, 16),
    Position = UDim2.fromOffset(56, 34),
    BackgroundTransparency = 1,
    Text = "COINS",
    TextColor3 = CONFIG.TEXT_GRAY,
    TextSize = 10,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Left,
    ZIndex = 6,
    Parent = topBar,
})

-- --------------------------------------------------------
-- CLICK BUTTON (Main interaction)
-- --------------------------------------------------------
local clickButtonContainer = createInstance("Frame", {
    Name = "ClickButtonContainer",
    Size = UDim2.fromOffset(CONFIG.CLICK_BUTTON_SIZE + 40, CONFIG.CLICK_BUTTON_SIZE + 50),
    Position = UDim2.new(0.5, 0, 1, -180),
    AnchorPoint = Vector2.new(0.5, 1),
    BackgroundTransparency = 1,
    ZIndex = 5,
    Parent = screenGui,
})

local clickButton = createInstance("TextButton", {
    Name = "ClickButton",
    Size = UDim2.fromOffset(CONFIG.CLICK_BUTTON_SIZE, CONFIG.CLICK_BUTTON_SIZE),
    Position = UDim2.fromScale(0.5, 0),
    AnchorPoint = Vector2.new(0.5, 0),
    BackgroundColor3 = CONFIG.PRIMARY,
    Text = "TAP!",
    TextColor3 = CONFIG.TEXT_DARK,
    TextSize = 22,
    Font = Enum.Font.GothamBlack,
    BorderSizePixel = 0,
    ZIndex = 6,
    Parent = clickButtonContainer,
})
createCorner(clickButton, CONFIG.CLICK_BUTTON_SIZE / 2)

local clickButtonGradient = createGradient(clickButton, CONFIG.PRIMARY_LIGHT, CONFIG.PRIMARY, 90)

-- Button pulse ring (animated)
local clickPulse = createInstance("Frame", {
    Name = "ClickPulse",
    Size = UDim2.fromOffset(CONFIG.CLICK_BUTTON_SIZE, CONFIG.CLICK_BUTTON_SIZE),
    Position = UDim2.fromScale(0.5, 0),
    AnchorPoint = Vector2.new(0.5, 0),
    BackgroundColor3 = CONFIG.PRIMARY,
    BackgroundTransparency = 0.5,
    BorderSizePixel = 0,
    ZIndex = 5,
    Parent = clickButtonContainer,
})
createCorner(clickPulse, CONFIG.CLICK_BUTTON_SIZE / 2)

local clickHint = createInstance("TextLabel", {
    Name = "ClickHint",
    Size = UDim2.new(1, 0, 0, 20),
    Position = UDim2.fromOffset(0, CONFIG.CLICK_BUTTON_SIZE + 8),
    BackgroundTransparency = 1,
    Text = "TAP TO EARN!",
    TextColor3 = CONFIG.TEXT_GRAY,
    TextSize = 13,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Center,
    ZIndex = 5,
    Parent = clickButtonContainer,
})

-- --------------------------------------------------------
-- STATS CONTAINER (Top Right)
-- --------------------------------------------------------
local statsContainer = createInstance("Frame", {
    Name = "StatsContainer",
    Size = UDim2.fromOffset(110, 170),
    Position = UDim2.new(1, -12, 0, 65),
    AnchorPoint = Vector2.new(1, 0),
    BackgroundTransparency = 1,
    ZIndex = 5,
    Parent = screenGui,
})

local statsLayout = createInstance("UIListLayout", {
    SortOrder = Enum.SortOrder.LayoutOrder,
    VerticalAlignment = Enum.VerticalAlignment.Top,
    HorizontalAlignment = Enum.HorizontalAlignment.Right,
    Padding = UDim.new(0, 6),
    Parent = statsContainer,
})

-- Click Counter Card
local clickCounter = createInstance("Frame", {
    Name = "ClickCounter",
    Size = UDim2.fromOffset(100, 50),
    BackgroundColor3 = CONFIG.BG_CARD,
    BackgroundTransparency = 0.1,
    BorderSizePixel = 0,
    LayoutOrder = 1,
    ZIndex = 5,
    Parent = statsContainer,
})
createCorner(clickCounter, 10)
createStroke(clickCounter, CONFIG.SHADOW, 1)

local clicksLabel = createInstance("TextLabel", {
    Name = "ClicksLabel",
    Size = UDim2.new(1, 0, 0, 14),
    Position = UDim2.fromOffset(0, 4),
    BackgroundTransparency = 1,
    Text = "CLICKS",
    TextColor3 = CONFIG.TEXT_GRAY,
    TextSize = 9,
    Font = Enum.Font.GothamBold,
    ZIndex = 6,
    Parent = clickCounter,
})

local clicksValue = createInstance("TextLabel", {
    Name = "ClicksValue",
    Size = UDim2.new(1, 0, 0, 28),
    Position = UDim2.fromOffset(0, 18),
    BackgroundTransparency = 1,
    Text = "0",
    TextColor3 = CONFIG.TEXT_DARK,
    TextSize = 20,
    Font = Enum.Font.GothamBlack,
    ZIndex = 6,
    Parent = clickCounter,
})

-- Rebirth Badge Card
local rebirthBadge = createInstance("Frame", {
    Name = "RebirthBadge",
    Size = UDim2.fromOffset(100, 50),
    BackgroundColor3 = CONFIG.REBIRTH_PURPLE,
    BackgroundTransparency = 0.9,
    BorderSizePixel = 0,
    LayoutOrder = 2,
    ZIndex = 5,
    Parent = statsContainer,
})
createCorner(rebirthBadge, 10)
createStroke(rebirthBadge, CONFIG.REBIRTH_PURPLE, 1)

local rebirthLabel = createInstance("TextLabel", {
    Name = "RebirthLabel",
    Size = UDim2.new(1, 0, 0, 14),
    Position = UDim2.fromOffset(0, 4),
    BackgroundTransparency = 1,
    Text = "REBIRTHS",
    TextColor3 = CONFIG.REBIRTH_PURPLE,
    TextSize = 9,
    Font = Enum.Font.GothamBold,
    ZIndex = 6,
    Parent = rebirthBadge,
})

local rebirthValue = createInstance("TextLabel", {
    Name = "RebirthValue",
    Size = UDim2.new(1, 0, 0, 28),
    Position = UDim2.fromOffset(0, 18),
    BackgroundTransparency = 1,
    Text = "0",
    TextColor3 = CONFIG.REBIRTH_PURPLE,
    TextSize = 20,
    Font = Enum.Font.GothamBlack,
    ZIndex = 6,
    Parent = rebirthBadge,
})

-- Pet Counter Card
local petCounter = createInstance("Frame", {
    Name = "PetCounter",
    Size = UDim2.fromOffset(100, 50),
    BackgroundColor3 = CONFIG.PET_BLUE,
    BackgroundTransparency = 0.9,
    BorderSizePixel = 0,
    LayoutOrder = 3,
    ZIndex = 5,
    Parent = statsContainer,
})
createCorner(petCounter, 10)
createStroke(petCounter, CONFIG.PET_BLUE, 1)

local petsLabel = createInstance("TextLabel", {
    Name = "PetsLabel",
    Size = UDim2.new(1, 0, 0, 14),
    Position = UDim2.fromOffset(0, 4),
    BackgroundTransparency = 1,
    Text = "PETS",
    TextColor3 = CONFIG.PET_BLUE,
    TextSize = 9,
    Font = Enum.Font.GothamBold,
    ZIndex = 6,
    Parent = petCounter,
})

local petsValue = createInstance("TextLabel", {
    Name = "PetsValue",
    Size = UDim2.new(1, 0, 0, 28),
    Position = UDim2.fromOffset(0, 18),
    BackgroundTransparency = 1,
    Text = "0/100",
    TextColor3 = CONFIG.PET_BLUE,
    TextSize = 16,
    Font = Enum.Font.GothamBlack,
    ZIndex = 6,
    Parent = petCounter,
})

-- --------------------------------------------------------
-- MULTIPLIER BADGE (Top Left)
-- --------------------------------------------------------
local multiplierContainer = createInstance("Frame", {
    Name = "MultiplierContainer",
    Size = UDim2.fromOffset(70, 50),
    Position = UDim2.fromOffset(12, 65),
    BackgroundColor3 = CONFIG.SUCCESS,
    BackgroundTransparency = 0.9,
    BorderSizePixel = 0,
    ZIndex = 5,
    Parent = screenGui,
})
createCorner(multiplierContainer, 10)
createStroke(multiplierContainer, CONFIG.SUCCESS, 1)

local multiplierText = createInstance("TextLabel", {
    Name = "MultiplierText",
    Size = UDim2.new(1, 0, 0, 26),
    Position = UDim2.fromOffset(0, 2),
    BackgroundTransparency = 1,
    Text = "1.0x",
    TextColor3 = CONFIG.SUCCESS,
    TextSize = 22,
    Font = Enum.Font.GothamBlack,
    ZIndex = 6,
    Parent = multiplierContainer,
})

local multiplierLabel = createInstance("TextLabel", {
    Name = "MultiplierLabel",
    Size = UDim2.new(1, 0, 0, 14),
    Position = UDim2.fromOffset(0, 28),
    BackgroundTransparency = 1,
    Text = "BOOST",
    TextColor3 = CONFIG.SUCCESS,
    TextSize = 9,
    Font = Enum.Font.GothamBold,
    ZIndex = 6,
    Parent = multiplierContainer,
})

-- --------------------------------------------------------
-- FLOATING TEXT CONTAINER
-- --------------------------------------------------------
local floatingTextContainer = createInstance("Frame", {
    Name = "FloatingTextContainer",
    Size = UDim2.fromScale(1, 1),
    BackgroundTransparency = 1,
    ZIndex = 15,
    Parent = screenGui,
    ClipsDescendants = false,
})

-- --------------------------------------------------------
-- PROGRESS BAR (Below top bar)
-- --------------------------------------------------------
local progressBarContainer = createInstance("Frame", {
    Name = "ProgressBarContainer",
    Size = UDim2.new(1, -24, 0, 36),
    Position = UDim2.fromOffset(12, CONFIG.TOP_BAR_HEIGHT + 4),
    BackgroundTransparency = 1,
    ZIndex = 5,
    Parent = screenGui,
})

local progressBarBg = createInstance("Frame", {
    Name = "ProgressBarBg",
    Size = UDim2.new(1, 0, 0, 12),
    Position = UDim2.fromOffset(0, 18),
    BackgroundColor3 = CONFIG.BG_LIGHT,
    BorderSizePixel = 0,
    ZIndex = 5,
    Parent = progressBarContainer,
})
createCorner(progressBarBg, 6)

local progressBarFill = createInstance("Frame", {
    Name = "ProgressBarFill",
    Size = UDim2.fromScale(0, 1),
    BackgroundColor3 = CONFIG.REBIRTH_PURPLE,
    BorderSizePixel = 0,
    ZIndex = 6,
    Parent = progressBarBg,
})
createCorner(progressBarFill, 6)
createGradient(progressBarFill, CONFIG.REBIRTH_PURPLE, CONFIG.INFO, 0)

local progressLabel = createInstance("TextLabel", {
    Name = "ProgressLabel",
    Size = UDim2.new(1, 0, 0, 16),
    Position = UDim2.fromOffset(0, 0),
    BackgroundTransparency = 1,
    Text = "Next Rebirth: 0%",
    TextColor3 = CONFIG.TEXT_GRAY,
    TextSize = 10,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Left,
    ZIndex = 5,
    Parent = progressBarContainer,
})

-- --------------------------------------------------------
-- NOTIFICATION CONTAINER
-- --------------------------------------------------------
local notificationContainer = createInstance("Frame", {
    Name = "NotificationContainer",
    Size = UDim2.new(1, 0, 0, 200),
    Position = UDim2.fromOffset(0, CONFIG.TOP_BAR_HEIGHT + 56),
    BackgroundTransparency = 1,
    ZIndex = 20,
    Parent = screenGui,
})

local notificationLayout = createInstance("UIListLayout", {
    SortOrder = Enum.SortOrder.LayoutOrder,
    VerticalAlignment = Enum.VerticalAlignment.Top,
    HorizontalAlignment = Enum.HorizontalAlignment.Center,
    Padding = UDim.new(0, 6),
    Parent = notificationContainer,
})

-- --------------------------------------------------------
-- MENU BUTTONS (Bottom Left)
-- --------------------------------------------------------
local menuButtons = createInstance("Frame", {
    Name = "MenuButtons",
    Size = UDim2.fromOffset(56, 230),
    Position = UDim2.fromOffset(8, 1),
    AnchorPoint = Vector2.new(0, 1),
    BackgroundTransparency = 1,
    ZIndex = 5,
    Parent = screenGui,
})

local menuLayout = createInstance("UIListLayout", {
    SortOrder = Enum.SortOrder.LayoutOrder,
    VerticalAlignment = Enum.VerticalAlignment.Bottom,
    HorizontalAlignment = Enum.HorizontalAlignment.Center,
    Padding = UDim.new(0, 8),
    Parent = menuButtons,
})

local menuButtonConfigs = {
    { name = "InventoryButton", icon = "INV", label = "Inv", color = CONFIG.TEXT_DARK },
    { name = "ShopButton", icon = "SHOP", label = "Shop", color = CONFIG.COIN_GOLD },
    { name = "PetsButton", icon = "PETS", label = "Pets", color = CONFIG.PET_BLUE },
    { name = "SettingsButton", icon = "SET", label = "Set", color = CONFIG.TEXT_GRAY },
}

for i, cfg in ipairs(menuButtonConfigs) do
    local btn = createInstance("TextButton", {
        Name = cfg.name,
        Size = UDim2.fromOffset(CONFIG.MENU_BUTTON_SIZE, CONFIG.MENU_BUTTON_SIZE),
        BackgroundColor3 = CONFIG.BG_CARD,
        Text = cfg.icon,
        TextColor3 = cfg.color,
        TextSize = 10,
        Font = Enum.Font.GothamBlack,
        BorderSizePixel = 0,
        LayoutOrder = i,
        ZIndex = 6,
        Parent = menuButtons,
    })
    createCorner(btn, 14)
    createStroke(btn, CONFIG.SHADOW, 1)

    -- Add icon circle background
    local iconBg = createInstance("Frame", {
        Name = "IconBg",
        Size = UDim2.fromOffset(30, 30),
        Position = UDim2.fromScale(0.5, 0.35),
        AnchorPoint = Vector2.new(0.5, 0.5),
        BackgroundColor3 = cfg.color,
        BackgroundTransparency = 0.85,
        BorderSizePixel = 0,
        ZIndex = 5,
        Parent = btn,
    })
    createCorner(iconBg, 15)
end

-- ============================================================
-- UPDATE FUNCTIONS
-- ============================================================

local function updateCurrency(amount)
    state.currency = amount
    state.currencyDisplay = formatNumber(amount)

    -- Bounce animation
    currencyValue.Text = state.currencyDisplay
    local bounceUp = TweenService:Create(currencyValue, CONFIG.TWEEN_BOUNCE, {
        TextSize = 28,
    })
    local bounceDown = TweenService:Create(currencyValue, CONFIG.TWEEN_FAST, {
        TextSize = 24,
    })
    bounceUp:Play()
    bounceUp.Completed:Connect(function()
        bounceDown:Play()
    end)

    -- Flash icon
    TweenService:Create(currencyIcon, CONFIG.TWEEN_FAST, {
        Size = UDim2.fromOffset(40, 40),
        Position = UDim2.fromOffset(10, 8),
    }):Play()
    task.delay(0.1, function()
        TweenService:Create(currencyIcon, CONFIG.TWEEN_FAST, {
            Size = UDim2.fromOffset(36, 36),
            Position = UDim2.fromOffset(12, 10),
        }):Play()
    end)
end

local function updateClicks(amount)
    state.clicks = amount
    state.clicksDisplay = formatCommas(amount)
    clicksValue.Text = state.clicksDisplay

    -- Pop animation
    local popUp = TweenService:Create(clicksValue, TweenInfo.new(0.1), { TextSize = 24 })
    local popDown = TweenService:Create(clicksValue, CONFIG.TWEEN_FAST, { TextSize = 20 })
    popUp:Play()
    popUp.Completed:Connect(function() popDown:Play() end)
end

local function updateRebirths(amount)
    state.rebirths = amount
    rebirthValue.Text = tostring(amount)

    -- Celebration animation
    TweenService:Create(rebirthBadge, CONFIG.TWEEN_BOUNCE, {
        BackgroundTransparency = 0.5,
    }):Play()
    task.delay(0.3, function()
        TweenService:Create(rebirthBadge, CONFIG.TWEEN_SLOW, {
            BackgroundTransparency = 0.9,
        }):Play()
    end)
end

local function updatePets(equipped, capacity)
    state.pets = equipped
    state.petCapacity = capacity
    petsValue.Text = string.format("%d/%d", equipped, capacity)

    -- Flash if near capacity
    local ratio = equipped / capacity
    if ratio >= 0.9 then
        TweenService:Create(petsValue, TweenInfo.new(0.3, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, 3, true), {
            TextColor3 = CONFIG.DANGER,
        }):Play()
    else
        petsValue.TextColor3 = CONFIG.PET_BLUE
    end
end

local function updateMultiplier(value)
    state.multiplier = value
    multiplierText.Text = string.format("%.1fx", value)

    -- Scale animation
    local scaleUp = TweenService:Create(multiplierContainer, CONFIG.TWEEN_BOUNCE, {
        Size = UDim2.fromOffset(76, 54),
    })
    local scaleDown = TweenService:Create(multiplierContainer, CONFIG.TWEEN_FAST, {
        Size = UDim2.fromOffset(70, 50),
    })
    scaleUp:Play()
    scaleUp.Completed:Connect(function() scaleDown:Play() end)
end

local function updateProgress(percent)
    state.progressPercent = percent
    progressLabel.Text = string.format("Next Rebirth: %d%%", math.floor(percent * 100))
    TweenService:Create(progressBarFill, CONFIG.TWEEN_NORMAL, {
        Size = UDim2.fromScale(percent, 1),
    }):Play()
end

-- ============================================================
-- FLOATING TEXT SYSTEM
-- ============================================================

local floatingTextId = 0

local function spawnFloatingText(text, position, color)
    floatingTextId += 1
    local id = floatingTextId

    local label = createInstance("TextLabel", {
        Name = "FloatingText_" .. id,
        Size = UDim2.fromOffset(120, 30),
        Position = UDim2.fromOffset(position.X - 60, position.Y - 15),
        BackgroundTransparency = 1,
        Text = text,
        TextColor3 = color or CONFIG.COIN_GOLD,
        TextSize = 20,
        Font = Enum.Font.GothamBlack,
        TextStrokeTransparency = 0.5,
        TextStrokeColor3 = Color3.new(0, 0, 0),
        ZIndex = 15,
        Parent = floatingTextContainer,
    })

    -- Animate upward and fade
    local riseUp = TweenService:Create(label, TweenInfo.new(CONFIG.FLOAT_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
        Position = UDim2.fromOffset(position.X - 60, position.Y - 80),
        TextTransparency = 1,
        TextStrokeTransparency = 1,
    })
    riseUp:Play()

    riseUp.Completed:Connect(function()
        if label and label.Parent then
            label:Destroy()
        end
    end)

    -- Also spawn smaller "+1" clicks
    if text:find("+") then
        local miniLabel = createInstance("TextLabel", {
            Name = "MiniFloat_" .. id,
            Size = UDim2.fromOffset(60, 20),
            Position = UDim2.fromOffset(position.X + 20, position.Y),
            BackgroundTransparency = 1,
            Text = "+1",
            TextColor3 = CONFIG.TEXT_DARK,
            TextSize = 14,
            Font = Enum.Font.GothamBold,
            ZIndex = 15,
            Parent = floatingTextContainer,
        })

        local miniRise = TweenService:Create(miniLabel, TweenInfo.new(0.8, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
            Position = UDim2.fromOffset(position.X + 30 + math.random(-20, 20), position.Y - 60),
            TextTransparency = 1,
        })
        miniRise:Play()
        miniRise.Completed:Connect(function()
            if miniLabel and miniLabel.Parent then
                miniLabel:Destroy()
            end
        end)
    end
end

-- ============================================================
-- NOTIFICATION SYSTEM
-- ============================================================

local notificationId = 0

local function showNotification(message, notifType)
    notificationId += 1
    local id = notificationId

    local color = CONFIG.INFO
    if notifType == "success" then
        color = CONFIG.SUCCESS
    elseif notifType == "warning" then
        color = CONFIG.WARNING
    elseif notifType == "error" then
        color = CONFIG.DANGER
    elseif notifType == "rebirth" then
        color = CONFIG.REBIRTH_PURPLE
    end

    local notif = createInstance("Frame", {
        Name = "Notification_" .. id,
        Size = UDim2.new(0, 280, 0, 44),
        BackgroundColor3 = CONFIG.BG_CARD,
        BackgroundTransparency = 0.05,
        BorderSizePixel = 0,
        LayoutOrder = -id,
        ZIndex = 20,
        Parent = notificationContainer,
    })
    createCorner(notif, 10)
    createStroke(notif, color, 2)

    local icon = createInstance("Frame", {
        Name = "Icon",
        Size = UDim2.fromOffset(8, 8),
        Position = UDim2.fromOffset(12, 18),
        BackgroundColor3 = color,
        BorderSizePixel = 0,
        ZIndex = 21,
        Parent = notif,
    })
    createCorner(icon, 4)

    local textLabel = createInstance("TextLabel", {
        Name = "Text",
        Size = UDim2.new(1, -36, 1, 0),
        Position = UDim2.fromOffset(28, 0),
        BackgroundTransparency = 1,
        Text = message,
        TextColor3 = CONFIG.TEXT_DARK,
        TextSize = 13,
        Font = Enum.Font.GothamBold,
        TextWrapped = true,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 21,
        Parent = notif,
    })

    -- Entry animation
    notif.BackgroundTransparency = 1
    textLabel.TextTransparency = 1
    icon.BackgroundTransparency = 1
    TweenService:Create(notif, CONFIG.TWEEN_FAST, { BackgroundTransparency = 0.05 }):Play()
    TweenService:Create(textLabel, CONFIG.TWEEN_FAST, { TextTransparency = 0 }):Play()
    TweenService:Create(icon, CONFIG.TWEEN_FAST, { BackgroundTransparency = 0 }):Play()

    -- Exit after duration
    task.delay(CONFIG.NOTIFICATION_DURATION, function()
        local exit = TweenService:Create(notif, CONFIG.TWEEN_NORMAL, {
            BackgroundTransparency = 1,
            Size = UDim2.new(0, 260, 0, 44),
        })
        local textExit = TweenService:Create(textLabel, CONFIG.TWEEN_NORMAL, { TextTransparency = 1 })
        local iconExit = TweenService:Create(icon, CONFIG.TWEEN_NORMAL, { BackgroundTransparency = 1 })
        exit:Play()
        textExit:Play()
        iconExit:Play()
        exit.Completed:Wait()
        if notif and notif.Parent then
            notif:Destroy()
        end
    end)
end

-- ============================================================
-- CLICK BUTTON INTERACTION
-- ============================================================

local function animateClickButton()
    -- Button press animation
    TweenService:Create(clickButton, CONFIG.TWEEN_FAST, {
        Size = UDim2.fromOffset(CONFIG.CLICK_BUTTON_SIZE - 10, CONFIG.CLICK_BUTTON_SIZE - 10),
    }):Play()
    task.delay(0.1, function()
        TweenService:Create(clickButton, CONFIG.TWEEN_BOUNCE, {
            Size = UDim2.fromOffset(CONFIG.CLICK_BUTTON_SIZE, CONFIG.CLICK_BUTTON_SIZE),
        }):Play()
    end)

    -- Pulse ring animation
    clickPulse.Size = UDim2.fromOffset(CONFIG.CLICK_BUTTON_SIZE, CONFIG.CLICK_BUTTON_SIZE)
    clickPulse.BackgroundTransparency = 0.3
    TweenService:Create(clickPulse, TweenInfo.new(0.6, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
        Size = UDim2.fromOffset(CONFIG.CLICK_BUTTON_SIZE + 40, CONFIG.CLICK_BUTTON_SIZE + 40),
        Position = UDim2.new(0.5, -(CONFIG.CLICK_BUTTON_SIZE + 40) / 2, 0, -20),
        BackgroundTransparency = 1,
    }):Play()
end

local function onClickButtonActivated()
    -- Send click to server
    clickEvent:FireServer()

    -- Local visual feedback
    animateClickButton()

    -- Spawn floating text at random position near button
    local offsetX = math.random(-40, 40)
    local offsetY = math.random(-30, 10)
    local screenPos = Vector2.new(
        clickButton.AbsolutePosition.X + clickButton.AbsoluteSize.X / 2 + offsetX,
        clickButton.AbsolutePosition.Y + clickY + offsetY
    )

    local earned = math.floor(state.multiplier)
    spawnFloatingText("+" .. formatNumber(earned) .. " Coins", screenPos, CONFIG.COIN_GOLD)
end

clickButton.Activated:Connect(onClickButtonActivated)

-- Touch support for mobile
clickButton.TouchTap:Connect(function()
    onClickButtonActivated()
end)

-- ============================================================
-- PULSE ANIMATION (Idle state)
-- ============================================================

local pulseRunning = true

local function runIdlePulse()
    while pulseRunning do
        local pulseGoal = TweenService:Create(clickPulse, TweenInfo.new(1.5, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {
            Size = UDim2.fromOffset(CONFIG.CLICK_BUTTON_SIZE + 20, CONFIG.CLICK_BUTTON_SIZE + 20),
            Position = UDim2.new(0.5, -(CONFIG.CLICK_BUTTON_SIZE + 20) / 2, 0, -10),
            BackgroundTransparency = 0.6,
        })
        pulseGoal:Play()
        pulseGoal.Completed:Wait()

        if not pulseRunning then break end

        local pulseReturn = TweenService:Create(clickPulse, TweenInfo.new(1.5, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {
            Size = UDim2.fromOffset(CONFIG.CLICK_BUTTON_SIZE, CONFIG.CLICK_BUTTON_SIZE),
            Position = UDim2.new(0.5, -CONFIG.CLICK_BUTTON_SIZE / 2, 0, 0),
            BackgroundTransparency = 0.8,
        })
        pulseReturn:Play()
        pulseReturn.Completed:Wait()
    end
end

task.spawn(runIdlePulse)

-- ============================================================
-- REMOTE EVENT CONNECTIONS
-- ============================================================

updateCurrencyEvent.OnClientEvent:Connect(function(amount)
    updateCurrency(amount)
end)

updateClicksEvent.OnClientEvent:Connect(function(amount)
    updateClicks(amount)
end)

updateRebirthsEvent.OnClientEvent:Connect(function(amount)
    updateRebirths(amount)
end)

updatePetsEvent.OnClientEvent:Connect(function(equipped, capacity)
    updatePets(equipped, capacity)
end)

updateMultiplierEvent.OnClientEvent:Connect(function(value)
    updateMultiplier(value)
end)

showNotificationEvent.OnClientEvent:Connect(function(message, notifType)
    showNotification(message, notifType)
end)

showFloatingTextEvent.OnClientEvent:Connect(function(text, position, color)
    spawnFloatingText(text, position, color)
end)

-- ============================================================
-- KEYBOARD SHORTCUTS
-- ============================================================

UserInputService.InputBegan:Connect(function(input, gameProcessed)
    if gameProcessed then return end

    -- Spacebar also triggers click
    if input.KeyCode == Enum.KeyCode.Space then
        onClickButtonActivated()
    end
end)

-- ============================================================
-- MENU BUTTON CONNECTIONS
-- ============================================================

for _, cfg in ipairs(menuButtonConfigs) do
    local btn = menuButtons:FindFirstChild(cfg.name)
    if btn then
        btn.Activated:Connect(function()
            -- Button press feedback
            TweenService:Create(btn, CONFIG.TWEEN_FAST, { Size = UDim2.fromOffset(46, 46) }):Play()
            task.delay(0.1, function()
                TweenService:Create(btn, CONFIG.TWEEN_BOUNCE, {
                    Size = UDim2.fromOffset(CONFIG.MENU_BUTTON_SIZE, CONFIG.MENU_BUTTON_SIZE),
                }):Play()
            end)

            -- Fire to server to open menu
            openMenuEvent:FireServer(cfg.name)
            showNotification("Opening " .. cfg.label .. "...", "info")
        end)
    end
end

-- ============================================================
-- INITIALIZATION
-- ============================================================

print("[Simulator HUD] Initialized successfully")

-- Intro animation
task.spawn(function()
    local elements = { topBar, clickButtonContainer, statsContainer, multiplierContainer, menuButtons }
    for _, element in ipairs(elements) do
        element.BackgroundTransparency = 1
    end

    -- Slide in animations
    TweenService:Create(topBar, CONFIG.TWEEN_SLOW, { BackgroundTransparency = 0.1 }):Play()
    task.wait(0.1)

    TweenService:Create(clickButtonContainer, CONFIG.TWEEN_BOUNCE, {
        Position = UDim2.new(0.5, 0, 1, -180),
    }):Play()
    task.wait(0.1)

    TweenService:Create(statsContainer, CONFIG.TWEEN_SLOW, { BackgroundTransparency = 1 }):Play()
    TweenService:Create(multiplierContainer, CONFIG.TWEEN_SLOW, { BackgroundTransparency = 0.9 }):Play()
    TweenService:Create(menuButtons, CONFIG.TWEEN_SLOW, { BackgroundTransparency = 1 }):Play()

    task.wait(0.5)
    showNotification("Welcome! Tap the button to start earning!", "success")
end)

-- Demo: Simulate incoming data
task.delay(2, function()
    updateCurrency(1500)
    updateClicks(42)
    updateRebirths(1)
    updatePets(5, 100)
    updateMultiplier(2.5)
    updateProgress(0.35)
end)

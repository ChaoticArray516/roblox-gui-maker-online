--[[
    FPS HUD - Client LocalScript
    A tactical FPS HUD with ammo counter, health bar, crosshair, and kill feed.
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
-- REMOTE EVENTS (Created by Server Script)
-- ============================================================
local remotes = ReplicatedStorage:WaitForChild("FPS_HUD_Remotes")
local updateHealthEvent = remotes:WaitForChild("UpdateHealth")
local updateAmmoEvent = remotes:WaitForChild("UpdateAmmo")
local updateScoreEvent = remotes:WaitForChild("UpdateScore")
local killFeedEvent = remotes:WaitForChild("KillFeed")
local hitMarkerEvent = remotes:WaitForChild("HitMarker")
local damageIndicatorEvent = remotes:WaitForChild("DamageIndicator")
local reloadEvent = remotes:WaitForChild("Reload")
local weaponSwitchEvent = remotes:WaitForChild("WeaponSwitch")

-- ============================================================
-- CONFIGURATION
-- ============================================================
local CONFIG = {
    -- Colors
    CROSSHAIR_COLOR = Color3.fromRGB(0, 255, 100),
    CROSSHAIR_HIT_COLOR = Color3.fromRGB(255, 50, 50),
    HEALTH_HIGH = Color3.fromRGB(0, 255, 100),
    HEALTH_MID = Color3.fromRGB(255, 200, 50),
    HEALTH_LOW = Color3.fromRGB(255, 50, 50),
    AMMO_COLOR = Color3.fromRGB(255, 255, 255),
    AMMO_LOW_COLOR = Color3.fromRGB(255, 100, 100),
    BG_DARK = Color3.fromRGB(20, 20, 20),
    BG_TRANSPARENT = Color3.fromRGB(0, 0, 0),
    TEXT_WHITE = Color3.fromRGB(240, 240, 240),
    TEXT_GRAY = Color3.fromRGB(150, 150, 150),
    HITMARKER_COLOR = Color3.fromRGB(255, 255, 255),
    DAMAGE_COLOR = Color3.fromRGB(255, 0, 0),

    -- Sizes
    CROSSHAIR_SIZE = 12,
    CROSSHAIR_THICKNESS = 2,
    CROSSHAIR_GAP = 6,
    CROSSHAIR_DOT_SIZE = 2,

    -- Animation
    TWEEN_INFO_FAST = TweenInfo.new(0.15, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
    TWEEN_INFO_NORMAL = TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
    TWEEN_INFO_SLOW = TweenInfo.new(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
    HITMARKER_DURATION = 0.2,
    DAMAGE_INDICATOR_DURATION = 0.6,
    KILL_FEED_DURATION = 6,

    -- Health thresholds
    HEALTH_MID_THRESHOLD = 0.6,
    HEALTH_LOW_THRESHOLD = 0.25,
    AMMO_LOW_THRESHOLD = 0.25,
}

-- ============================================================
-- STATE
-- ============================================================
local state = {
    health = 100,
    maxHealth = 100,
    ammoCurrent = 30,
    ammoReserve = 120,
    ammoMax = 30,
    score = 0,
    kills = 0,
    deaths = 0,
    isReloading = false,
    currentWeapon = "Assault Rifle",
    crosshairVisible = true,
    hitMarkerTimer = nil,
    damageIndicators = {},
    killFeedItems = {},
}

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

local function createInstance(className, props)
    local instance = Instance.new(className)
    for key, value in pairs(props) do
n        instance[key] = value
    end
    return instance
end

local function createCorner(parent, radius)
    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, radius or 4)
    corner.Parent = parent
    return corner
end

local function createGradient(parent, color1, color2, rotation)
    local gradient = Instance.new("UIGradient")
    gradient.Color = ColorSequence.new({
        ColorSequenceKeypoint.new(0, color1 or Color3.new(1, 1, 1)),
        ColorSequenceKeypoint.new(1, color2 or Color3.new(0.5, 0.5, 0.5)),
    })
    gradient.Rotation = rotation or 0
    gradient.Parent = parent
    return gradient
end

local function lerpColor(a, b, t)
    return Color3.new(
        a.R + (b.R - a.R) * t,
        a.G + (b.G - a.G) * t,
        a.B + (b.B - a.B) * t
    )
end

local function getHealthColor(ratio)
    if ratio > CONFIG.HEALTH_MID_THRESHOLD then
        local t = (ratio - CONFIG.HEALTH_MID_THRESHOLD) / (1 - CONFIG.HEALTH_MID_THRESHOLD)
        return lerpColor(CONFIG.HEALTH_MID, CONFIG.HEALTH_HIGH, t)
    elseif ratio > CONFIG.HEALTH_LOW_THRESHOLD then
        local t = (ratio - CONFIG.HEALTH_LOW_THRESHOLD) / (CONFIG.HEALTH_MID_THRESHOLD - CONFIG.HEALTH_LOW_THRESHOLD)
        return lerpColor(CONFIG.HEALTH_LOW, CONFIG.HEALTH_MID, t)
    else
        return CONFIG.HEALTH_LOW
    end
end

-- ============================================================
-- UI CONSTRUCTION
-- ============================================================

-- Main ScreenGui
local screenGui = createInstance("ScreenGui", {
    Name = "FPS_HUD",
    ResetOnSpawn = false,
    ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
    Parent = playerGui,
})

-- --------------------------------------------------------
-- CROSSHAIR
-- --------------------------------------------------------
local crosshairContainer = createInstance("Frame", {
    Name = "CrosshairContainer",
    Size = UDim2.fromOffset(40, 40),
    Position = UDim2.fromScale(0.5, 0.5),
    AnchorPoint = Vector2.new(0.5, 0.5),
    BackgroundTransparency = 1,
    ZIndex = 10,
    Parent = screenGui,
})

local crosshairParts = {}

-- Top line
local chTop = createInstance("Frame", {
    Name = "Crosshair_Top",
    Size = UDim2.fromOffset(CONFIG.CROSSHAIR_THICKNESS, CONFIG.CROSSHAIR_SIZE),
    Position = UDim2.fromScale(0.5, 0),
    AnchorPoint = Vector2.new(0.5, 1),
    BackgroundColor3 = CONFIG.CROSSHAIR_COLOR,
    BorderSizePixel = 0,
    ZIndex = 10,
    Parent = crosshairContainer,
})
crosshairParts.Top = chTop

-- Bottom line
local chBottom = createInstance("Frame", {
    Name = "Crosshair_Bottom",
    Size = UDim2.fromOffset(CONFIG.CROSSHAIR_THICKNESS, CONFIG.CROSSHAIR_SIZE),
    Position = UDim2.fromScale(0.5, 1),
    AnchorPoint = Vector2.new(0.5, 0),
    BackgroundColor3 = CONFIG.CROSSHAIR_COLOR,
    BorderSizePixel = 0,
    ZIndex = 10,
    Parent = crosshairContainer,
})
crosshairParts.Bottom = chBottom

-- Left line
local chLeft = createInstance("Frame", {
    Name = "Crosshair_Left",
    Size = UDim2.fromOffset(CONFIG.CROSSHAIR_SIZE, CONFIG.CROSSHAIR_THICKNESS),
    Position = UDim2.fromScale(0, 0.5),
    AnchorPoint = Vector2.new(1, 0.5),
    BackgroundColor3 = CONFIG.CROSSHAIR_COLOR,
    BorderSizePixel = 0,
    ZIndex = 10,
    Parent = crosshairContainer,
})
crosshairParts.Left = chLeft

-- Right line
local chRight = createInstance("Frame", {
    Name = "Crosshair_Right",
    Size = UDim2.fromOffset(CONFIG.CROSSHAIR_SIZE, CONFIG.CROSSHAIR_THICKNESS),
    Position = UDim2.fromScale(1, 0.5),
    AnchorPoint = Vector2.new(0, 0.5),
    BackgroundColor3 = CONFIG.CROSSHAIR_COLOR,
    BorderSizePixel = 0,
    ZIndex = 10,
    Parent = crosshairContainer,
})
crosshairParts.Right = chRight

-- Center dot
local chDot = createInstance("Frame", {
    Name = "Crosshair_Dot",
    Size = UDim2.fromOffset(CONFIG.CROSSHAIR_DOT_SIZE, CONFIG.CROSSHAIR_DOT_SIZE),
    Position = UDim2.fromScale(0.5, 0.5),
    AnchorPoint = Vector2.new(0.5, 0.5),
    BackgroundColor3 = CONFIG.CROSSHAIR_COLOR,
    BorderSizePixel = 0,
    ZIndex = 10,
    Parent = crosshairContainer,
})
crosshairParts.Dot = chDot

-- --------------------------------------------------------
-- HEALTH BAR
-- --------------------------------------------------------
local healthContainer = createInstance("Frame", {
    Name = "HealthBarContainer",
    Size = UDim2.fromOffset(220, 60),
    Position = UDim2.new(0, 20, 1, -80),
    AnchorPoint = Vector2.new(0, 1),
    BackgroundTransparency = 1,
    ZIndex = 5,
    Parent = screenGui,
})

local healthLabel = createInstance("TextLabel", {
    Name = "HealthLabel",
    Size = UDim2.fromOffset(40, 20),
    Position = UDim2.fromOffset(0, 0),
    BackgroundTransparency = 1,
    Text = "HP",
    TextColor3 = CONFIG.TEXT_GRAY,
    TextSize = 14,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Left,
    ZIndex = 5,
    Parent = healthContainer,
})

local healthBarBg = createInstance("Frame", {
    Name = "HealthBarBg",
    Size = UDim2.new(1, 0, 0, 24),
    Position = UDim2.fromOffset(0, 22),
    BackgroundColor3 = CONFIG.BG_DARK,
    BackgroundTransparency = 0.3,
    BorderSizePixel = 0,
    ZIndex = 5,
    Parent = healthContainer,
})
createCorner(healthBarBg, 6)

local healthBarFill = createInstance("Frame", {
    Name = "HealthBarFill",
    Size = UDim2.fromScale(1, 1),
    BackgroundColor3 = CONFIG.HEALTH_HIGH,
    BorderSizePixel = 0,
    ZIndex = 6,
    Parent = healthBarBg,
})
createCorner(healthBarFill, 6)

local healthValue = createInstance("TextLabel", {
    Name = "HealthValue",
    Size = UDim2.new(1, 0, 0, 24),
    Position = UDim2.fromOffset(0, 22),
    BackgroundTransparency = 1,
    Text = "100 / 100",
    TextColor3 = CONFIG.TEXT_WHITE,
    TextSize = 14,
    Font = Enum.Font.GothamBold,
    ZIndex = 7,
    Parent = healthContainer,
})

-- --------------------------------------------------------
-- AMMO COUNTER
-- --------------------------------------------------------
local ammoContainer = createInstance("Frame", {
    Name = "AmmoContainer",
    Size = UDim2.fromOffset(180, 70),
    Position = UDim2.new(1, -20, 1, -90),
    AnchorPoint = Vector2.new(1, 1),
    BackgroundTransparency = 1,
    ZIndex = 5,
    Parent = screenGui,
})

local ammoCurrent = createInstance("TextLabel", {
    Name = "AmmoCurrent",
    Size = UDim2.fromOffset(70, 50),
    Position = UDim2.new(1, -160, 0, 0),
    BackgroundTransparency = 1,
    Text = tostring(state.ammoCurrent),
    TextColor3 = CONFIG.AMMO_COLOR,
    TextSize = 42,
    Font = Enum.Font.GothamBlack,
    TextXAlignment = Enum.TextXAlignment.Right,
    ZIndex = 5,
    Parent = ammoContainer,
})

local ammoDivider = createInstance("TextLabel", {
    Name = "AmmoDivider",
    Size = UDim2.fromOffset(20, 40),
    Position = UDim2.new(1, -90, 0, 5),
    BackgroundTransparency = 1,
    Text = "/",
    TextColor3 = CONFIG.TEXT_GRAY,
    TextSize = 28,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Center,
    ZIndex = 5,
    Parent = ammoContainer,
})

local ammoReserve = createInstance("TextLabel", {
    Name = "AmmoReserve",
    Size = UDim2.fromOffset(70, 40),
    Position = UDim2.new(1, -20, 0, 10),
    AnchorPoint = Vector2.new(1, 0),
    BackgroundTransparency = 1,
    Text = tostring(state.ammoReserve),
    TextColor3 = CONFIG.TEXT_GRAY,
    TextSize = 24,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Left,
    ZIndex = 5,
    Parent = ammoContainer,
})

local weaponName = createInstance("TextLabel", {
    Name = "WeaponName",
    Size = UDim2.new(1, 0, 0, 18),
    Position = UDim2.fromOffset(0, 52),
    BackgroundTransparency = 1,
    Text = string.upper(state.currentWeapon),
    TextColor3 = CONFIG.TEXT_GRAY,
    TextSize = 11,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Right,
    ZIndex = 5,
    Parent = ammoContainer,
})

-- --------------------------------------------------------
-- KILL FEED
-- --------------------------------------------------------
local killFeedContainer = createInstance("Frame", {
    Name = "KillFeedContainer",
    Size = UDim2.fromOffset(280, 200),
    Position = UDim2.new(1, -20, 0, 20),
    AnchorPoint = Vector2.new(1, 0),
    BackgroundTransparency = 1,
    ZIndex = 5,
    Parent = screenGui,
})

local killFeedLayout = createInstance("UIListLayout", {
    SortOrder = Enum.SortOrder.LayoutOrder,
    VerticalAlignment = Enum.VerticalAlignment.Top,
    HorizontalAlignment = Enum.HorizontalAlignment.Right,
    Padding = UDim.new(0, 4),
    Parent = killFeedContainer,
})

-- --------------------------------------------------------
-- SCORE DISPLAY
-- --------------------------------------------------------
local scoreContainer = createInstance("Frame", {
    Name = "ScoreContainer",
    Size = UDim2.fromOffset(120, 80),
    Position = UDim2.fromOffset(20, 20),
    BackgroundTransparency = 1,
    ZIndex = 5,
    Parent = screenGui,
})

local scoreLabel = createInstance("TextLabel", {
    Name = "ScoreLabel",
    Size = UDim2.fromOffset(60, 16),
    Position = UDim2.fromOffset(0, 0),
    BackgroundTransparency = 1,
    Text = "SCORE",
    TextColor3 = CONFIG.TEXT_GRAY,
    TextSize = 10,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Left,
    ZIndex = 5,
    Parent = scoreContainer,
})

local scoreValue = createInstance("TextLabel", {
    Name = "ScoreValue",
    Size = UDim2.fromOffset(60, 26),
    Position = UDim2.fromOffset(0, 16),
    BackgroundTransparency = 1,
    Text = "0",
    TextColor3 = CONFIG.TEXT_WHITE,
    TextSize = 22,
    Font = Enum.Font.GothamBlack,
    TextXAlignment = Enum.TextXAlignment.Left,
    ZIndex = 5,
    Parent = scoreContainer,
})

local killsLabel = createInstance("TextLabel", {
    Name = "KillsLabel",
    Size = UDim2.fromOffset(50, 16),
    Position = UDim2.fromOffset(0, 44),
    BackgroundTransparency = 1,
    Text = "KILLS",
    TextColor3 = CONFIG.TEXT_GRAY,
    TextSize = 10,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Left,
    ZIndex = 5,
    Parent = scoreContainer,
})

local killsValue = createInstance("TextLabel", {
    Name = "KillsValue",
    Size = UDim2.fromOffset(50, 20),
    Position = UDim2.fromOffset(50, 44),
    BackgroundTransparency = 1,
    Text = "0",
    TextColor3 = CONFIG.TEXT_WHITE,
    TextSize = 14,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Left,
    ZIndex = 5,
    Parent = scoreContainer,
})

local deathsLabel = createInstance("TextLabel", {
    Name = "DeathsLabel",
    Size = UDim2.fromOffset(50, 16),
    Position = UDim2.fromOffset(0, 62),
    BackgroundTransparency = 1,
    Text = "DEATHS",
    TextColor3 = CONFIG.TEXT_GRAY,
    TextSize = 10,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Left,
    ZIndex = 5,
    Parent = scoreContainer,
})

local deathsValue = createInstance("TextLabel", {
    Name = "DeathsValue",
    Size = UDim2.fromOffset(50, 20),
    Position = UDim2.fromOffset(50, 62),
    BackgroundTransparency = 1,
    Text = "0",
    TextColor3 = CONFIG.TEXT_WHITE,
    TextSize = 14,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Left,
    ZIndex = 5,
    Parent = scoreContainer,
})

-- --------------------------------------------------------
-- HIT MARKER
-- --------------------------------------------------------
local hitMarker = createInstance("Frame", {
    Name = "HitMarker",
    Size = UDim2.fromOffset(24, 24),
    Position = UDim2.fromScale(0.5, 0.5),
    AnchorPoint = Vector2.new(0.5, 0.5),
    BackgroundTransparency = 1,
    ZIndex = 15,
    Parent = screenGui,
    Visible = false,
})

local hitParts = {}
local hitConfigs = {
    { name = "Hit_TL", pos = UDim2.fromScale(0, 0), anchor = Vector2.new(1, 1), size = UDim2.fromOffset(6, 2), rot = -45 },
    { name = "Hit_TR", pos = UDim2.fromScale(1, 0), anchor = Vector2.new(0, 1), size = UDim2.fromOffset(6, 2), rot = 45 },
    { name = "Hit_BL", pos = UDim2.fromScale(0, 1), anchor = Vector2.new(1, 0), size = UDim2.fromOffset(6, 2), rot = 45 },
    { name = "Hit_BR", pos = UDim2.fromScale(1, 1), anchor = Vector2.new(0, 0), size = UDim2.fromOffset(6, 2), rot = -45 },
}

for _, cfg in ipairs(hitConfigs) do
    local part = createInstance("Frame", {
        Name = cfg.name,
        Size = cfg.size,
        Position = cfg.pos,
        AnchorPoint = cfg.anchor,
        BackgroundColor3 = CONFIG.HITMARKER_COLOR,
        BorderSizePixel = 0,
        Rotation = cfg.rot,
        ZIndex = 15,
        Parent = hitMarker,
    })
    table.insert(hitParts, part)
end

-- --------------------------------------------------------
-- DAMAGE INDICATOR (Directional blood overlay)
-- --------------------------------------------------------
local damageIndicator = createInstance("Frame", {
    Name = "DamageIndicator",
    Size = UDim2.fromScale(1, 1),
    Position = UDim2.fromScale(0.5, 0.5),
    AnchorPoint = Vector2.new(0.5, 0.5),
    BackgroundTransparency = 1,
    ZIndex = 8,
    Parent = screenGui,
    Visible = false,
})

local damageParts = {}
local damageConfigs = {
    { name = "Damage_Top",    pos = UDim2.new(0.35, 0, 0, 0),     size = UDim2.new(0.3, 0, 0, 80), anchor = Vector2.new(0, 0) },
    { name = "Damage_Bottom", pos = UDim2.new(0.35, 0, 1, 0),     size = UDim2.new(0.3, 0, 0, 80), anchor = Vector2.new(0, 1) },
    { name = "Damage_Left",   pos = UDim2.new(0, 0, 0.35, 0),     size = UDim2.new(0, 80, 0.3, 0), anchor = Vector2.new(0, 0) },
    { name = "Damage_Right",  pos = UDim2.new(1, 0, 0.35, 0),     size = UDim2.new(0, 80, 0.3, 0), anchor = Vector2.new(1, 0) },
}

for _, cfg in ipairs(damageConfigs) do
    local part = createInstance("Frame", {
        Name = cfg.name,
        Size = cfg.size,
        Position = cfg.pos,
        AnchorPoint = cfg.anchor,
        BackgroundColor3 = CONFIG.DAMAGE_COLOR,
        BackgroundTransparency = 1,
        BorderSizePixel = 0,
        ZIndex = 8,
        Parent = damageIndicator,
    })
    local grad = createGradient(part, CONFIG.DAMAGE_COLOR, Color3.new(0, 0, 0), 90)
    table.insert(damageParts, { frame = part, gradient = grad })
end

-- --------------------------------------------------------
-- RELOAD BAR
-- --------------------------------------------------------
local reloadContainer = createInstance("Frame", {
    Name = "ReloadBarContainer",
    Size = UDim2.fromOffset(200, 30),
    Position = UDim2.new(0.5, 0, 1, -130),
    AnchorPoint = Vector2.new(0.5, 1),
    BackgroundTransparency = 1,
    ZIndex = 6,
    Parent = screenGui,
    Visible = false,
})

local reloadBarBg = createInstance("Frame", {
    Name = "ReloadBarBg",
    Size = UDim2.new(1, 0, 0, 8),
    Position = UDim2.fromScale(0.5, 0.5),
    AnchorPoint = Vector2.new(0.5, 0.5),
    BackgroundColor3 = CONFIG.BG_DARK,
    BackgroundTransparency = 0.5,
    BorderSizePixel = 0,
    ZIndex = 6,
    Parent = reloadContainer,
})
createCorner(reloadBarBg, 4)

local reloadBarFill = createInstance("Frame", {
    Name = "ReloadBarFill",
    Size = UDim2.fromScale(0, 1),
    BackgroundColor3 = CONFIG.HEALTH_HIGH,
    BorderSizePixel = 0,
    ZIndex = 7,
    Parent = reloadBarBg,
})
createCorner(reloadBarFill, 4)

local reloadLabel = createInstance("TextLabel", {
    Name = "ReloadLabel",
    Size = UDim2.new(1, 0, 0, 20),
    Position = UDim2.fromOffset(0, -12),
    BackgroundTransparency = 1,
    Text = "RELOADING...",
    TextColor3 = CONFIG.TEXT_GRAY,
    TextSize = 10,
    Font = Enum.Font.GothamBold,
    ZIndex = 7,
    Parent = reloadContainer,
})

-- --------------------------------------------------------
-- WEAPON SLOTS
-- --------------------------------------------------------
local weaponSlots = createInstance("Frame", {
    Name = "WeaponSlots",
    Size = UDim2.fromOffset(200, 30),
    Position = UDim2.new(0.5, 0, 1, -40),
    AnchorPoint = Vector2.new(0.5, 1),
    BackgroundTransparency = 1,
    ZIndex = 5,
    Parent = screenGui,
})

local slotLayout = createInstance("UIListLayout", {
    FillDirection = Enum.FillDirection.Horizontal,
    HorizontalAlignment = Enum.HorizontalAlignment.Center,
    VerticalAlignment = Enum.VerticalAlignment.Center,
    Padding = UDim.new(0, 8),
    Parent = weaponSlots,
})

local slot1 = createInstance("TextButton", {
    Name = "Slot1",
    Size = UDim2.fromOffset(90, 28),
    BackgroundColor3 = CONFIG.BG_DARK,
    BackgroundTransparency = 0.3,
    Text = "1  RIFLE",
    TextColor3 = CONFIG.TEXT_WHITE,
    TextSize = 11,
    Font = Enum.Font.GothamBold,
    BorderSizePixel = 0,
    ZIndex = 5,
    Parent = weaponSlots,
})
createCorner(slot1, 4)

local slot2 = createInstance("TextButton", {
    Name = "Slot2",
    Size = UDim2.fromOffset(90, 28),
    BackgroundColor3 = CONFIG.BG_DARK,
    BackgroundTransparency = 0.7,
    Text = "2  PISTOL",
    TextColor3 = CONFIG.TEXT_GRAY,
    TextSize = 11,
    Font = Enum.Font.GothamBold,
    BorderSizePixel = 0,
    ZIndex = 5,
    Parent = weaponSlots,
})
createCorner(slot2, 4)

-- ============================================================
-- UPDATE FUNCTIONS
-- ============================================================

local function updateHealth(current, max)
    state.health = current
    state.maxHealth = max
    local ratio = math.clamp(current / max, 0, 1)

    -- Update fill width
    local tween = TweenService:Create(healthBarFill, CONFIG.TWEEN_INFO_NORMAL, {
        Size = UDim2.fromScale(ratio, 1),
    })
    tween:Play()

    -- Update color based on health level
    local targetColor = getHealthColor(ratio)
    local colorTween = TweenService:Create(healthBarFill, CONFIG.TWEEN_INFO_NORMAL, {
        BackgroundColor3 = targetColor,
    })
    colorTween:Play()

    -- Update text
    healthValue.Text = string.format("%d / %d", current, max)

    -- Pulse animation on low health
    if ratio <= CONFIG.HEALTH_LOW_THRESHOLD then
        local pulseTween = TweenService:Create(healthBarFill, TweenInfo.new(0.5, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true), {
            BackgroundColor3 = CONFIG.HEALTH_LOW,
        })
        pulseTween:Play()
    end
end

local function updateAmmo(current, reserve)
    state.ammoCurrent = current
    state.ammoReserve = reserve

    -- Animate current ammo change
    local currentTween = TweenService:Create(ammoCurrent, CONFIG.TWEEN_INFO_FAST, {
        TextTransparency = 0,
    })
    currentTween:Play()
    ammoCurrent.Text = tostring(current)

    -- Change color when low on ammo
    local ammoRatio = current / state.ammoMax
    if ammoRatio <= CONFIG.AMMO_LOW_THRESHOLD then
        ammoCurrent.TextColor3 = CONFIG.AMMO_LOW_COLOR
    else
        ammoCurrent.TextColor3 = CONFIG.AMMO_COLOR
    end

    ammoReserve.Text = tostring(reserve)
end

local function updateScore(score, kills, deaths)
    state.score = score
    state.kills = kills
    state.deaths = deaths

    scoreValue.Text = tostring(score)
    killsValue.Text = tostring(kills)
    deathsValue.Text = tostring(deaths)

    -- Pop animation for score
    local popIn = TweenService:Create(scoreValue, TweenInfo.new(0.1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
        TextSize = 26,
    })
    local popOut = TweenService:Create(scoreValue, TweenInfo.new(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
        TextSize = 22,
    })
    popIn:Play()
    popIn.Completed:Connect(function()
        popOut:Play()
    end)
end

local function addKillFeedItem(killer, victim, weapon)
    local item = createInstance("Frame", {
        Name = "KillFeedItem",
        Size = UDim2.fromOffset(260, 22),
        BackgroundColor3 = CONFIG.BG_DARK,
        BackgroundTransparency = 0.4,
        BorderSizePixel = 0,
        LayoutOrder = -(#state.killFeedItems),
        ZIndex = 5,
        Parent = killFeedContainer,
    })
    createCorner(item, 3)

    local text = createInstance("TextLabel", {
        Name = "KillFeedText",
        Size = UDim2.new(1, -8, 1, 0),
        Position = UDim2.fromOffset(4, 0),
        BackgroundTransparency = 1,
        Text = string.format("%s  [X]  %s", killer, victim),
        TextColor3 = CONFIG.TEXT_WHITE,
        TextSize = 12,
        Font = Enum.Font.GothamBold,
        TextXAlignment = Enum.TextXAlignment.Right,
        ZIndex = 5,
        Parent = item,
    })

    -- Entry animation
    item.BackgroundTransparency = 1
    text.TextTransparency = 1
    local fadeIn = TweenService:Create(item, CONFIG.TWEEN_INFO_FAST, { BackgroundTransparency = 0.4 })
    local textIn = TweenService:Create(text, CONFIG.TWEEN_INFO_FAST, { TextTransparency = 0 })
    fadeIn:Play()
    textIn:Play()

    table.insert(state.killFeedItems, 1, item)

    -- Remove after duration
    task.delay(CONFIG.KILL_FEED_DURATION, function()
        local fadeOut = TweenService:Create(item, CONFIG.TWEEN_INFO_NORMAL, {
            BackgroundTransparency = 1,
        })
        local textOut = TweenService:Create(text, CONFIG.TWEEN_INFO_NORMAL, {
            TextTransparency = 1,
        })
        fadeOut:Play()
        textOut:Play()
        fadeOut.Completed:Wait()
        if item and item.Parent then
            item:Destroy()
        end
        -- Remove from table
        for i, v in ipairs(state.killFeedItems) do
            if v == item then
                table.remove(state.killFeedItems, i)
                break
            end
        end
    end)

    -- Limit to 5 items
    if #state.killFeedItems > 5 then
        local old = table.remove(state.killFeedItems, 6)
        if old and old.Parent then
            old:Destroy()
        end
    end
end

local function showHitMarker()
    hitMarker.Visible = true
    for _, part in ipairs(hitParts) do
        part.BackgroundTransparency = 0
    end

    -- Cancel existing timer
    if state.hitMarkerTimer then
        state.hitMarkerTimer:Disconnect()
    end

    -- Flash animation
    for _, part in ipairs(hitParts) do
        TweenService:Create(part, TweenInfo.new(0.05), {
            BackgroundColor3 = CONFIG.CROSSHAIR_HIT_COLOR,
        }):Play()
    end

    task.delay(0.05, function()
        for _, part in ipairs(hitParts) do
            TweenService:Create(part, TweenInfo.new(CONFIG.HITMARKER_DURATION), {
                BackgroundColor3 = CONFIG.HITMARKER_COLOR,
                BackgroundTransparency = 1,
            }):Play()
        end
    end)

    state.hitMarkerTimer = task.delay(CONFIG.HITMARKER_DURATION + 0.05, function()
        hitMarker.Visible = false
        state.hitMarkerTimer = nil
    end)
end

local function showDamageIndicator(direction)
    damageIndicator.Visible = true

    local dirMap = { Top = 1, Bottom = 2, Left = 3, Right = 4 }
    local index = dirMap[direction] or 1
    local partData = damageParts[index]

    if partData then
        -- Flash the directional indicator
        TweenService:Create(partData.frame, TweenInfo.new(0.1), {
            BackgroundTransparency = 0.3,
        }):Play()

        task.delay(CONFIG.DAMAGE_INDICATOR_DURATION, function()
            TweenService:Create(partData.frame, TweenInfo.new(0.3), {
                BackgroundTransparency = 1,
            }):Play()
        end)
    end

    -- Hide container after all fade out
    task.delay(CONFIG.DAMAGE_INDICATOR_DURATION + 0.4, function()
        damageIndicator.Visible = false
    end)
end

local function startReload(duration)
    state.isReloading = true
    reloadContainer.Visible = true
    reloadBarFill.Size = UDim2.fromScale(0, 1)

    local tween = TweenService:Create(reloadBarFill, TweenInfo.new(duration, Enum.EasingStyle.Linear), {
        Size = UDim2.fromScale(1, 1),
    })
    tween:Play()

    tween.Completed:Connect(function()
        state.isReloading = false
        reloadContainer.Visible = false
    end)
end

local function switchWeapon(slot, weaponName)
    state.currentWeapon = weaponName
    weaponNameLabel.Text = string.upper(weaponName)

    if slot == 1 then
        TweenService:Create(slot1, CONFIG.TWEEN_INFO_FAST, {
            BackgroundTransparency = 0.3,
            TextColor3 = CONFIG.TEXT_WHITE,
        }):Play()
        TweenService:Create(slot2, CONFIG.TWEEN_INFO_FAST, {
            BackgroundTransparency = 0.7,
            TextColor3 = CONFIG.TEXT_GRAY,
        }):Play()
    elseif slot == 2 then
        TweenService:Create(slot1, CONFIG.TWEEN_INFO_FAST, {
            BackgroundTransparency = 0.7,
            TextColor3 = CONFIG.TEXT_GRAY,
        }):Play()
        TweenService:Create(slot2, CONFIG.TWEEN_INFO_FAST, {
            BackgroundTransparency = 0.3,
            TextColor3 = CONFIG.TEXT_WHITE,
        }):Play()
    end
end

-- ============================================================
-- CROSSHAIR DYNAMICS (Weapon sway and spread simulation)
-- ============================================================

local lastMousePos = Vector2.new(0, 0)
local crosshairVelocity = Vector2.new(0, 0)
local spreadScale = 0

RunService.RenderStepped:Connect(function(deltaTime)
    local mousePos = UserInputService:GetMouseLocation()
    local delta = mousePos - lastMousePos
    crosshairVelocity = crosshairVelocity:Lerp(delta, 0.3)
    lastMousePos = mousePos

    -- Increase crosshair gap based on movement speed
    local speed = crosshairVelocity.Magnitude
    local targetSpread = math.clamp(speed * 0.15, 0, 10)
    spreadScale = spreadScale + (targetSpread - spreadScale) * 0.1

    local gap = CONFIG.CROSSHAIR_GAP + spreadScale
    local size = CONFIG.CROSSHAIR_SIZE

    -- Update crosshair positions
    chTop.Size = UDim2.fromOffset(CONFIG.CROSSHAIR_THICKNESS, size)
    chTop.Position = UDim2.new(0.5, 0, 0, -gap)
    chTop.AnchorPoint = Vector2.new(0.5, 1)

    chBottom.Size = UDim2.fromOffset(CONFIG.CROSSHAIR_THICKNESS, size)
    chBottom.Position = UDim2.new(0.5, 0, 1, gap)
    chBottom.AnchorPoint = Vector2.new(0.5, 0)

    chLeft.Size = UDim2.fromOffset(size, CONFIG.CROSSHAIR_THICKNESS)
    chLeft.Position = UDim2.new(0, -gap, 0.5, 0)
    chLeft.AnchorPoint = Vector2.new(1, 0.5)

    chRight.Size = UDim2.fromOffset(size, CONFIG.CROSSHAIR_THICKNESS)
    chRight.Position = UDim2.new(1, gap, 0.5, 0)
    chRight.AnchorPoint = Vector2.new(0, 0.5)
end)

-- ============================================================
-- REMOTE EVENT CONNECTIONS
-- ============================================================

updateHealthEvent.OnClientEvent:Connect(function(current, max)
    updateHealth(current, max)
end)

updateAmmoEvent.OnClientEvent:Connect(function(current, reserve)
    updateAmmo(current, reserve)
end)

updateScoreEvent.OnClientEvent:Connect(function(score, kills, deaths)
    updateScore(score, kills, deaths)
end)

killFeedEvent.OnClientEvent:Connect(function(killer, victim, weapon)
    addKillFeedItem(killer, victim, weapon)
end)

hitMarkerEvent.OnClientEvent:Connect(function()
    showHitMarker()
end)

damageIndicatorEvent.OnClientEvent:Connect(function(direction)
    showDamageIndicator(direction)
end)

reloadEvent.OnClientEvent:Connect(function(duration)
    startReload(duration)
end)

weaponSwitchEvent.OnClientEvent:Connect(function(slot, weaponName)
    switchWeapon(slot, weaponName)
end)

-- ============================================================
-- KEYBOARD INPUT (Weapon switching)
-- ============================================================

UserInputService.InputBegan:Connect(function(input, gameProcessed)
    if gameProcessed then return end

    if input.KeyCode == Enum.KeyCode.One then
        -- Fire to server to request weapon switch
        local weaponRemote = remotes:WaitForChild("RequestWeaponSwitch")
        weaponRemote:FireServer(1)
    elseif input.KeyCode == Enum.KeyCode.Two then
        local weaponRemote = remotes:WaitForChild("RequestWeaponSwitch")
        weaponRemote:FireServer(2)
    elseif input.KeyCode == Enum.KeyCode.R then
        local reloadRemote = remotes:WaitForChild("RequestReload")
        reloadRemote:FireServer()
    end
end)

-- ============================================================
-- INITIALIZATION - Demo sequence
-- ============================================================

print("[FPS HUD] Initialized successfully")

-- Show intro animation
task.spawn(function()
    -- Fade in all containers
    local containers = { healthContainer, ammoContainer, scoreContainer, weaponSlots }
    for _, container in ipairs(containers) do
        container.BackgroundTransparency = 1
    end
    for _, container in ipairs(containers) do
        TweenService:Create(container, CONFIG.TWEEN_INFO_SLOW, {
            BackgroundTransparency = 1,
        }):Play()
        task.wait(0.05)
    end
end)

-- Demo: Simulate some kill feed entries after 2 seconds
task.delay(2, function()
    addKillFeedItem("PlayerOne", "Enemy_Soldier", "Rifle")
    task.wait(1.5)
    addKillFeedItem("SniperPro", "Enemy_Guard", "Sniper")
    task.wait(2)
    addKillFeedItem("You", "Enemy_Boss", "Rifle")
end)
